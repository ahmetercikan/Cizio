/**
 * İlerleme eşitlemesi: ebeveyn hesabı açıkken bütün profiller (ad, avatar, dersler, yıldızlar, giydir, ada, English Club)
 * ve ayarlar hesaba yedeklenir; başka telefonda giriş yapınca geri gelir. Çizimler (galeri) şimdilik cihazda kalır.
 *
 * - Firestore: hesaplar/{uid} (profil listesi, ayarlar, silinenler) ve hesaplar/{uid}/profiller/{pid} (profilin ilerlemesi,
 *   gzip + base64; tarayıcı sıkıştıramıyorsa düz JSON). Kurallar: firestore.rules → hesaplar.
 * - Girişte buluttaki durum cihazdakiyle birleştirilir (merge.ts), sonra değişiklikler birkaç saniye içinde, uygulama
 *   arka plana geçerken de hemen yazılır. Yalnızca değişen profil yazılır.
 */
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { create } from 'zustand';
import { EMU, USE_EMULATOR } from '../online/config';
import { useApp } from '../store/useApp';
import { hashOf, merge, type Cloud, type Snapshot, type SyncMeta } from './merge';

type FS = typeof import('firebase/firestore');

interface SyncState {
  status: 'off' | 'syncing' | 'ok' | 'error';
  /** En son başarılı eşitleme (ms). */
  last?: number;
}
export const useSync = create<SyncState>(() => ({ status: 'off' }));

const META_KEY = 'cizio-esitleme';
const DEBOUNCE_MS = 8000;
const device = () => (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : '');

const readMeta = (uid: string): SyncMeta | null => {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY) ?? 'null') as SyncMeta | null;
    return m?.uid === uid ? m : null;
  } catch {
    return null;
  }
};
const writeMeta = (m: SyncMeta) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    /* yok say */
  }
};

// ---------------------------------------------------------------------------------------------
// Sıkıştırma (profil belgesi 1 MB sınırının çok altında kalsın)
// ---------------------------------------------------------------------------------------------
const canZip = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

async function pack(v: unknown): Promise<{ z: string } | { j: string }> {
  const json = JSON.stringify(v);
  if (!canZip()) return { j: json };
  const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { z: btoa(bin) };
}

async function unpack(d: { z?: string; j?: string }): Promise<unknown> {
  if (d.j) return JSON.parse(d.j);
  const bytes = Uint8Array.from(atob(d.z ?? ''), (c) => c.charCodeAt(0));
  return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}

// ---------------------------------------------------------------------------------------------
let fs: FS;
let db: Firestore | null = null;
let uid: string | null = null;
let unsub: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<void> | null = null;
let again = false;

const snapshot = (): Snapshot => {
  const s = useApp.getState();
  return { profiles: s.profiles, data: s.data, settings: s.settings, activeId: s.activeId };
};

async function readCloud(u: string): Promise<Cloud | null> {
  const main = await fs.getDoc(fs.doc(db!, 'hesaplar', u));
  if (!main.exists()) return null;
  const m = main.data() as { profiles?: Cloud['profiles']; settings?: Cloud['settings']; activeId?: string | null; deleted?: string[] };
  const docs = await fs.getDocs(fs.collection(db!, 'hesaplar', u, 'profiller'));
  const data: Cloud['data'] = {};
  const at: Cloud['at'] = {};
  for (const d of docs.docs) {
    const v = d.data() as { z?: string; j?: string; updatedAt?: number };
    try {
      data[d.id] = (await unpack(v)) as Cloud['data'][string];
      at[d.id] = v.updatedAt ?? 0;
    } catch {
      /* bozuk belge: yok sayılır, cihazdaki kalır */
    }
  }
  return { profiles: m.profiles ?? [], data, at, settings: m.settings ?? snapshot().settings, activeId: m.activeId ?? undefined, deleted: m.deleted ?? [] };
}

/** Değişen profilleri ve profil listesini hesaba yazar. */
async function push(u: string, meta: SyncMeta, only?: string[]) {
  const s = snapshot();
  const now = Date.now();
  const batch = fs.writeBatch(db!);
  for (const p of s.profiles) {
    const h = hashOf(s.data[p.id]);
    if (only ? !only.includes(p.id) : meta.hash[p.id] === h) continue;
    batch.set(fs.doc(db!, 'hesaplar', u, 'profiller', p.id), { ...(await pack(s.data[p.id])), updatedAt: now, device: device() });
    meta.hash[p.id] = h;
    meta.at[p.id] = now;
  }
  // cihazda silinen profiller
  const gone = meta.ids.filter((id) => !s.profiles.some((p) => p.id === id));
  for (const id of gone) {
    batch.delete(fs.doc(db!, 'hesaplar', u, 'profiller', id));
    delete meta.hash[id];
    delete meta.at[id];
  }
  meta.deleted = [...new Set([...meta.deleted, ...gone])].slice(-200);
  meta.ids = s.profiles.map((p) => p.id);
  batch.set(fs.doc(db!, 'hesaplar', u), {
    v: 1,
    profiles: s.profiles,
    settings: s.settings,
    activeId: s.activeId ?? null,
    deleted: meta.deleted,
    updatedAt: now,
    device: device(),
  });
  await batch.commit();
  writeMeta(meta);
}

/** Girişte: hesaptakiyle birleştir, cihaza uygula, eksikleri hesaba yaz. */
async function initial(u: string) {
  const cloud = await readCloud(u);
  const meta: SyncMeta = readMeta(u) ?? { uid: u, hash: {}, at: {}, ids: [], deleted: [] };
  if (!cloud) {
    await push(u, meta, snapshot().profiles.map((p) => p.id));
    return;
  }
  const r = merge(snapshot(), cloud, readMeta(u));
  if (hashOf(r.state) !== hashOf(snapshot())) useApp.getState().replaceAll(r.state);
  // cihaza uygulanan son durumla özetleri tazele (replaceAll eksik alanları tamamlar)
  const now = snapshot();
  meta.deleted = r.deleted;
  for (const id of r.pulled) {
    meta.hash[id] = hashOf(now.data[id]);
    meta.at[id] = cloud.at[id] ?? Date.now();
  }
  for (const p of now.profiles) if (!r.push.includes(p.id) && !r.pulled.includes(p.id) && cloud.data[p.id]) {
    meta.hash[p.id] = hashOf(now.data[p.id]);
    meta.at[p.id] = Math.max(meta.at[p.id] ?? 0, cloud.at[p.id] ?? 0);
  }
  meta.ids = now.profiles.map((p) => p.id);
  await push(u, meta, r.push);
}

function run(task: () => Promise<void>) {
  if (running) {
    again = true;
    return running;
  }
  useSync.setState({ status: 'syncing' });
  running = (async () => {
    try {
      await task();
      useSync.setState({ status: 'ok', last: Date.now() });
    } catch (e) {
      if (import.meta.env.DEV) console.warn('eşitleme hatası', e);
      useSync.setState({ status: 'error' });
    }
    running = null;
    if (again && uid) {
      again = false;
      void flush();
    }
  })();
  return running;
}

/** Bekleyen değişiklikleri hemen yazar. */
export function flush(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  const u = uid;
  if (!u || !db) return Promise.resolve();
  return run(() => push(u, readMeta(u) ?? { uid: u, hash: {}, at: {}, ids: [], deleted: [] }));
}

const onHide = () => {
  if (document.visibilityState === 'hidden') void flush();
};

/** Hesaba girildi: eşitlemeyi başlatır (auth.ts çağırır). */
export async function startSync(app: FirebaseApp, accountUid: string) {
  if (uid === accountUid) return;
  stopSync();
  fs = await import('firebase/firestore');
  if (!db) {
    db = fs.initializeFirestore(app, { experimentalAutoDetectLongPolling: true, ignoreUndefinedProperties: true });
    if (USE_EMULATOR) fs.connectFirestoreEmulator(db, '127.0.0.1', EMU.firestore);
  }
  uid = accountUid;
  await run(() => initial(accountUid));
  unsub = useApp.subscribe((s, prev) => {
    if (s.profiles === prev.profiles && s.data === prev.data && s.settings === prev.settings) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), DEBOUNCE_MS);
  });
  document.addEventListener('visibilitychange', onHide);
}

/** Hesaptan çıkıldı: cihazdaki ilerleme yerinde kalır, yalnızca eşitleme durur. */
export function stopSync() {
  unsub?.();
  unsub = null;
  if (timer) clearTimeout(timer);
  timer = null;
  uid = null;
  document.removeEventListener('visibilitychange', onHide);
  useSync.setState({ status: 'off' });
}

/** Hesap silinirken hesaptaki bütün yedek de silinir. */
export async function deleteCloud(app: FirebaseApp, accountUid: string) {
  fs = fs ?? (await import('firebase/firestore'));
  db = db ?? fs.initializeFirestore(app, { experimentalAutoDetectLongPolling: true, ignoreUndefinedProperties: true });
  stopSync();
  const docs = await fs.getDocs(fs.collection(db, 'hesaplar', accountUid, 'profiller'));
  const batch = fs.writeBatch(db);
  docs.forEach((d) => batch.delete(d.ref));
  batch.delete(fs.doc(db, 'hesaplar', accountUid));
  await batch.commit();
  try {
    localStorage.removeItem(META_KEY);
  } catch {
    /* yok say */
  }
}
