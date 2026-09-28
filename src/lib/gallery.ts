/** Çizim galerisi: resimler IndexedDB'de (cihazda) saklanır. */
import { createStore, del, get, set, values } from 'idb-keyval';

const store = createStore('ciziktir-db', 'art');

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
  await set(a.id, a, store);
}

export async function listArtworks(profileId?: string): Promise<Artwork[]> {
  const all = await values<Artwork>(store);
  return all.filter((a) => !profileId || a.profileId === profileId).sort((a, b) => b.createdAt - a.createdAt);
}

export const getArtwork = (id: string) => get<Artwork>(id, store);
export const deleteArtwork = (id: string) => del(id, store);

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
