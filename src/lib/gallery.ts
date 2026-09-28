/** Çizim galerisi: resimler IndexedDB'de (cihazda) saklanır. */
import { createStore, del, entries, get, set, setMany, values } from 'idb-keyval';
import { DB, DB_MIGRATED_FLAG, OLD_DB } from './legacy';

const store = createStore(DB, 'art');

/** Eski adla kaydedilmiş çizimleri (önceki sürüm) yeni veritabanına bir kez kopyalar. */
async function migrateLegacy(): Promise<void> {
  try {
    if (localStorage.getItem(DB_MIGRATED_FLAG)) return;
    const known = await indexedDB.databases?.().catch(() => undefined);
    if (!known || known.some((d) => d.name === OLD_DB)) {
      const items = await entries(createStore(OLD_DB, 'art'));
      if (items.length) await setMany(items, store);
    }
    localStorage.setItem(DB_MIGRATED_FLAG, '1');
  } catch {
    /* taşıma başarısızsa bir sonraki açılışta yeniden denenir */
  }
}
const ready = migrateLegacy();

export type ArtKind = 'screen' | 'paper' | 'free';

export interface Artwork {
  id: string;
  profileId: string;
  lessonId?: string;
  kind: ArtKind;
  stars?: number;
  createdAt: number;
  blob: Blob;
}

export async function saveArtwork(a: Artwork) {
  await ready;
  await set(a.id, a, store);
}

export async function listArtworks(profileId?: string): Promise<Artwork[]> {
  await ready;
  const all = await values<Artwork>(store);
  return all.filter((a) => !profileId || a.profileId === profileId).sort((a, b) => b.createdAt - a.createdAt);
}

export const getArtwork = async (id: string) => (await ready, get<Artwork>(id, store));
export const deleteArtwork = async (id: string) => (await ready, del(id, store));

export async function deleteArtworksOf(profileId: string) {
  for (const a of await listArtworks(profileId)) await del(a.id, store);
}

export function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}

export async function dataUrlToBlob(u: string): Promise<Blob> {
  return (await fetch(u)).blob();
}
