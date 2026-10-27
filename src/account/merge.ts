/**
 * İlerleme eşitlemesinde cihaz ile hesaptaki (bulut) durumu birleştirir. Saf hesap: sync.ts çağırır, testler doğrudan.
 *
 * Kurallar (hiçbir çocuğun ilerlemesi sessizce silinmesin):
 * - Profiller birleşir: yalnız cihazda olan da, yalnız hesapta olan da kalır.
 * - Aynı profil iki yerde de varsa: hesaptaki son eşitlemeden beri değişmediyse cihazınki; cihazdaki değişmediyse
 *   hesaptaki; ikisi de değiştiyse (iki cihazda aynı anda oynandı) ilerlemesi çok olan.
 * - Silinen profiller (mezar taşı listesi) iki taraftan da kaldırılır.
 * - Ayarlar cihaza özeldir (yazı büyüklüğü, ses): cihazda profil varsa cihazınki kalır.
 */
import type { AppState, Profile, ProfileData } from '../store/useApp';
import { xpOf } from '../lib/rewards';

export type Snapshot = Pick<AppState, 'profiles' | 'data' | 'settings' | 'activeId'>;

export interface Cloud {
  profiles: Profile[];
  /** Profil → ilerleme (hesapta). */
  data: Record<string, ProfileData>;
  /** Profil → hesaba en son yazıldığı an. */
  at: Record<string, number>;
  settings: Snapshot['settings'];
  activeId?: string;
  deleted: string[];
}

/** Bu cihazın en son eşitlemede gördüğü durum (localStorage). */
export interface SyncMeta {
  uid: string;
  /** Profil → en son eşitlenen ilerlemenin özeti. */
  hash: Record<string, string>;
  /** Profil → hesapta o özetin yazıldığı an. */
  at: Record<string, number>;
  /** En son eşitlemedeki profil kimlikleri (silineni anlamak için). */
  ids: string[];
  deleted: string[];
}

/** Kısa ve hızlı özet (FNV-1a): ilerleme değişti mi? */
export function hashOf(v: unknown): string {
  const s = JSON.stringify(v) ?? '';
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + s.length.toString(36);
}

/** Ne kadar ilerleme var (iki taraf da değiştiyse hangisinin kalacağı için). */
export function progressScore(d: ProfileData | undefined): number {
  if (!d) return -1;
  return Object.keys(d.lessons ?? {}).length * 10 + xpOf(d) + Object.keys(d.days ?? {}).length * 3;
}

export interface MergeResult {
  state: Snapshot;
  deleted: string[];
  /** Hesaptan gelip cihazda değişen profiller. */
  pulled: string[];
  /** Cihazdan hesaba yazılması gerekenler. */
  push: string[];
}

export function merge(local: Snapshot, cloud: Cloud, meta: SyncMeta | null): MergeResult {
  const sameAccount = meta && meta.uid ? meta : null;
  // Cihazda, en son eşitlemeden sonra silinen profiller
  const goneHere = sameAccount ? sameAccount.ids.filter((id) => !local.profiles.some((p) => p.id === id)) : [];
  const deleted = [...new Set([...cloud.deleted, ...(sameAccount?.deleted ?? []), ...goneHere])];
  const dead = new Set(deleted);

  const order = [...local.profiles.map((p) => p.id), ...cloud.profiles.map((p) => p.id)];
  const ids = [...new Set(order)].filter((id) => !dead.has(id));
  const profiles: Profile[] = [];
  const data: Record<string, ProfileData> = {};
  const pulled: string[] = [];
  const push: string[] = [];

  for (const id of ids) {
    const lp = local.profiles.find((p) => p.id === id);
    const cp = cloud.profiles.find((p) => p.id === id);
    const ld = local.data[id];
    const cd = cloud.data[id];
    let useCloud: boolean;
    if (!lp || !ld) useCloud = true;
    else if (!cp || !cd) useCloud = false;
    else {
      const cloudNewer = (cloud.at[id] ?? 0) > (sameAccount?.at[id] ?? 0);
      const localDirty = !sameAccount || hashOf(ld) !== sameAccount.hash[id];
      if (!cloudNewer) useCloud = false;
      else if (!localDirty) useCloud = true;
      else useCloud = progressScore(cd) > progressScore(ld);
    }
    if (useCloud) {
      profiles.push(cp!);
      data[id] = cd!;
      if (!lp || hashOf(ld) !== hashOf(cd)) pulled.push(id);
    } else {
      profiles.push(lp!);
      data[id] = ld!;
      if (!cd || hashOf(ld) !== hashOf(cd) || JSON.stringify(lp) !== JSON.stringify(cp)) push.push(id);
    }
  }

  const settings = local.profiles.length ? local.settings : { ...local.settings, ...cloud.settings };
  const activeId = profiles.some((p) => p.id === local.activeId)
    ? local.activeId
    : profiles.some((p) => p.id === cloud.activeId)
      ? cloud.activeId
      : profiles[0]?.id;
  return { state: { profiles, data, settings, activeId }, deleted, pulled, push };
}
