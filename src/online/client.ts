/**
 * Firebase istemcisi (yalnızca çevrimiçi özellik açıkken dinamik olarak yüklenir: src/online/index.ts).
 * Her cihaz anonim bir hesap; her çocuk profili bir oyuncu (players/{pid}) ve 6 haneli arkadaş kodu.
 * Kurallar: firestore.rules (testler: rules-tests/).
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { browserLocalPersistence, connectAuthEmulator, indexedDBLocalPersistence, initializeAuth, onAuthStateChanged, signInAnonymously, type Auth } from 'firebase/auth';
import {
  addDoc, collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs, initializeFirestore, onSnapshot, query, runTransaction,
  setDoc, updateDoc, where, type Firestore, type Unsubscribe,
} from 'firebase/firestore';
import type { ChallengeKind } from '../lib/daily';
import { FIREBASE_CONFIG, USE_EMULATOR } from './config';
import {
  COOP_MOVES_PER_TURN, pairOf, type Challenge, type Coop, type CoopMove, type Duel, type Friendship, type OnlineIdentity, type PlayerInfo,
  type PlayResult, type Reaction,
} from './types';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let ready: Promise<string> | null = null;

function init() {
  if (app) return;
  app = initializeApp(USE_EMULATOR ? { projectId: 'demo-cizio', apiKey: 'demo-key', authDomain: 'localhost' } : FIREBASE_CONFIG!);
  // Açılır pencere/yönlendirme çözücüsü yok: anonim giriş için gerekmez, Android WebView'de sorun çıkarır.
  auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  if (USE_EMULATOR) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8085);
  }
}

/** Anonim oturum (cihaz başına bir kez; sonra hatırlanır). Döner: cihazın uid'i. */
export function signIn(): Promise<string> {
  init();
  if (!ready) {
    ready = new Promise<string>((resolve, reject) => {
      const off = onAuthStateChanged(auth, (u) => {
        if (u) {
          off();
          resolve(u.uid);
        }
      });
      if (!auth.currentUser) signInAnonymously(auth).catch((e) => { off(); ready = null; reject(e); });
    });
  }
  return ready;
}

// ------------------------------------------------------------------------------------------------
// Oyuncu ve arkadaş kodu
// ------------------------------------------------------------------------------------------------
const ALPHABET = 'ABCDEFGHJKLMNPRSTUVYZ23456789'; // karışan harfler yok (O/0, I/1, Q, W, X)
const randomCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
const clean = (s: string) => s.trim().slice(0, 20);

export async function register(name: string, avatar: string): Promise<OnlineIdentity> {
  const uid = await signIn();
  const ref = doc(collection(db, 'players'));
  for (let tries = 0; tries < 6; tries++) {
    const code = randomCode();
    const ok = await runTransaction(db, async (tx) => {
      if ((await tx.get(doc(db, 'codes', code))).exists()) return false;
      tx.set(ref, { owner: uid, name: clean(name), avatar, code, createdAt: Date.now(), lastSeen: Date.now() });
      tx.set(doc(db, 'codes', code), { pid: ref.id, owner: uid });
      return true;
    });
    if (ok) return { pid: ref.id, code };
  }
  throw new Error('Kod üretilemedi');
}

/** Kayıtlı kimlik hâlâ bu cihaza mı ait? (Uygulama silinip kurulduysa yeni anonim hesap: yeniden kayıt gerekir.) */
export async function stillMine(id: OnlineIdentity): Promise<boolean> {
  const uid = await signIn();
  // Kayıttan hemen sonra okuma bazen henüz yazılmamış görür: "yok" demeden önce bir kez daha bakılır.
  for (let i = 0; ; i++) {
    const s = await getDoc(doc(db, 'players', id.pid));
    if (s.exists()) return s.data().owner === uid;
    if (i >= 1) return false;
    await new Promise((r) => setTimeout(r, 1500));
  }
}

export async function updateMe(pid: string, name: string, avatar: string) {
  await signIn();
  await updateDoc(doc(db, 'players', pid), { name: clean(name), avatar, lastSeen: Date.now() });
}

export async function heartbeat(pid: string) {
  await signIn();
  await updateDoc(doc(db, 'players', pid), { lastSeen: Date.now() });
}

export async function getPlayer(pid: string): Promise<PlayerInfo | null> {
  await signIn();
  const s = await getDoc(doc(db, 'players', pid));
  if (!s.exists()) return null;
  const d = s.data();
  return { pid, name: d.name, avatar: d.avatar, lastSeen: d.lastSeen };
}

export async function lookupCode(code: string): Promise<PlayerInfo | null> {
  await signIn();
  const c = await getDoc(doc(db, 'codes', code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')));
  return c.exists() ? getPlayer(c.data().pid) : null;
}

/** Çevrimiçiyi kapat: arkadaşlıklar, kod ve oyuncu silinir. */
export async function unregister(id: OnlineIdentity) {
  for (const col of ['friendships', ...SHARED] as const)
    for (const d of await mine(col)) if ((d.data().members as string[]).includes(id.pid)) await deleteDoc(d.ref).catch(() => {});
  await deleteDoc(doc(db, 'codes', id.code)).catch(() => {});
  await deleteDoc(doc(db, 'players', id.pid)).catch(() => {});
}

const SHARED = ['challenges', 'duels', 'coops'] as const;
const DAY = 86_400_000;
const KEEP: Record<(typeof SHARED)[number], number> = { challenges: 30 * DAY, duels: DAY, coops: 30 * DAY };

/** Bu cihazın taraf olduğu kayıtlar. */
async function mine(col: 'friendships' | (typeof SHARED)[number]) {
  const uid = await signIn();
  return (await getDocs(query(collection(db, col), where('owners', 'array-contains', uid)))).docs;
}

/** Eski oyun kayıtlarını siler (düellolar 1 gün, meydan okumalar ve ortak boyamalar 30 gün sonra). */
export async function prune() {
  const now = Date.now();
  for (const col of SHARED)
    for (const d of await mine(col)) {
      const t = d.data().updatedAt ?? d.data().createdAt ?? 0;
      if (now - t > KEEP[col]) await deleteDoc(d.ref).catch(() => {});
    }
}

// ------------------------------------------------------------------------------------------------
// Arkadaşlık (ebeveyn bölümünden)
// ------------------------------------------------------------------------------------------------
export async function requestFriend(me: string, other: string): Promise<'sent' | 'accepted' | 'exists'> {
  await signIn();
  if (me === other) throw new Error('self');
  const id = pairOf(me, other);
  const ref = doc(db, 'friendships', id);
  const cur = await getDoc(ref).catch(() => null);
  if (cur?.exists()) {
    const f = cur.data() as Friendship;
    if (f.status === 'pending' && f.requestedBy === other) {
      await updateDoc(ref, { status: 'accepted' });
      return 'accepted';
    }
    return 'exists';
  }
  const members = [me, other].sort() as [string, string];
  const owners = await Promise.all(members.map(async (p) => (await getDoc(doc(db, 'players', p))).data()?.owner as string));
  await setDoc(ref, { members, owners, requestedBy: me, status: 'pending', createdAt: Date.now() });
  return 'sent';
}

export async function acceptFriend(id: string) {
  await signIn();
  await updateDoc(doc(db, 'friendships', id), { status: 'accepted' });
}

/** Arkadaşlığı (ya da bekleyen isteği) siler; o ikilinin oyun kayıtları da silinir. */
export async function removeFriendship(id: string) {
  for (const col of SHARED) for (const d of await mine(col)) if (d.data().pair === id) await deleteDoc(d.ref).catch(() => {});
  await deleteDoc(doc(db, 'friendships', id));
}

// ------------------------------------------------------------------------------------------------
// Canlı izleme: bu cihazın bütün arkadaşlıkları ve paylaşılan kayıtları
// ------------------------------------------------------------------------------------------------
export interface Snapshot {
  friendships: Friendship[];
  challenges: Challenge[];
  duels: Duel[];
  coops: Coop[];
}

export async function watchAll(cb: (s: Snapshot) => void): Promise<Unsubscribe> {
  const uid = await signIn();
  const state: Snapshot = { friendships: [], challenges: [], duels: [], coops: [] };
  const seen = new Set<keyof Snapshot>();
  const offs = (['friendships', 'challenges', 'duels', 'coops'] as const).map((name) =>
    onSnapshot(
      query(collection(db, name), where('owners', 'array-contains', uid)),
      (s) => {
        (state as unknown as Record<string, unknown[]>)[name] = s.docs.map((d) => ({ id: d.id, ...d.data() }));
        seen.add(name);
        if (seen.size === 4) cb({ ...state });
      },
      () => {
        seen.add(name);
        if (seen.size === 4) cb({ ...state });
      },
    ),
  );
  return () => offs.forEach((o) => o());
}

async function shared(me: string, friend: string) {
  await signIn();
  const pair = pairOf(me, friend);
  const f = await getDoc(doc(db, 'friendships', pair));
  if (!f.exists() || f.data().status !== 'accepted') throw new Error('not-friends');
  const now = Date.now();
  return { pair, members: f.data().members, owners: f.data().owners, from: me, createdAt: now, updatedAt: now };
}

// ------------------------------------------------------------------------------------------------
// Sırayla meydan okuma
// ------------------------------------------------------------------------------------------------
export async function sendChallenge(me: string, friend: string, kind: ChallengeKind, lessonId: string, result: PlayResult): Promise<string> {
  const base = await shared(me, friend);
  const ref = await addDoc(collection(db, 'challenges'), { ...base, kind, lessonId, results: { [me]: result }, reactions: {} });
  return ref.id;
}

export async function answerChallenge(id: string, me: string, result: PlayResult) {
  await signIn();
  await updateDoc(doc(db, 'challenges', id), { [`results.${me}`]: result, updatedAt: Date.now() });
}

export async function react(col: 'challenges', id: string, me: string, r: Reaction) {
  await signIn();
  await updateDoc(doc(db, col, id), { [`reactions.${me}`]: r, updatedAt: Date.now() });
}

// ------------------------------------------------------------------------------------------------
// Canlı düello
// ------------------------------------------------------------------------------------------------
export async function inviteDuel(me: string, friend: string, lessonId: string, mode: 'look' | 'memory'): Promise<string> {
  const base = await shared(me, friend);
  const ref = await addDoc(collection(db, 'duels'), { ...base, lessonId, mode, state: 'invited', startAt: null, results: {} });
  return ref.id;
}

export async function setDuelState(id: string, state: Duel['state']) {
  await signIn();
  await updateDoc(doc(db, 'duels', id), { state, ...(state === 'countdown' ? { startAt: Date.now() } : {}), updatedAt: Date.now() });
}

export async function submitDuel(id: string, me: string, result: PlayResult) {
  await signIn();
  await updateDoc(doc(db, 'duels', id), { [`results.${me}`]: result, updatedAt: Date.now() });
}

// ------------------------------------------------------------------------------------------------
// Birlikte boyama (sırayla)
// ------------------------------------------------------------------------------------------------
export async function inviteCoop(me: string, friend: string, lessonId: string): Promise<string> {
  const base = await shared(me, friend);
  const ref = await addDoc(collection(db, 'coops'), { ...base, lessonId, state: 'invited', turnOf: me, moves: [] });
  return ref.id;
}

/** Hamle ekler; sırasının boyama hakkı dolunca sıra arkadaşa geçer. */
export async function coopMove(id: string, me: string, move: CoopMove) {
  await signIn();
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'coops', id);
    const s = await tx.get(ref);
    if (!s.exists()) throw new Error('missing');
    const c = s.data() as Coop;
    if (c.turnOf !== me || c.state === 'done') throw new Error('not-your-turn');
    const moves = [...c.moves, move];
    let mine = 0;
    for (let i = moves.length - 1; i >= 0 && moves[i].by === me; i--) mine++;
    const other = c.members[0] === me ? c.members[1] : c.members[0];
    tx.update(ref, { moves, turnOf: mine >= COOP_MOVES_PER_TURN ? other : me, state: 'playing', updatedAt: Date.now() });
  });
}

export async function setCoopState(id: string, state: Coop['state'], turnOf?: string) {
  await signIn();
  await updateDoc(doc(db, 'coops', id), { state, ...(turnOf ? { turnOf } : {}), updatedAt: Date.now() });
}

// ------------------------------------------------------------------------------------------------
// Ortak
// ------------------------------------------------------------------------------------------------
export function watchDoc<T>(col: 'challenges' | 'duels' | 'coops', id: string, cb: (d: T | null) => void): Unsubscribe {
  init();
  return onSnapshot(doc(db, col, id), (s) => cb(s.exists() ? ({ id: s.id, ...s.data() } as T) : null), () => cb(null));
}

export async function remove(col: 'challenges' | 'duels' | 'coops', id: string) {
  await signIn();
  await deleteDoc(doc(db, col, id)).catch(() => {});
}
