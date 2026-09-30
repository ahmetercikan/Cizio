/**
 * Çocuğun kendi çizimlerini Giydir'de "dost" yapmak: galerideki resmin arka planı (beyaz kâğıt, ekrandaki
 * kâğıt dokusu ya da fotoğraftaki kâğıt tonu) kenarlardan tahmin edilip saydamlaştırılır, çizim kırpılır ve
 * küçültülür. Sonuç (PNG veri adresi) bellekte ve IndexedDB'de önbelleğe alınır; her resim bir kez işlenir.
 *
 * Doll'da dost kimliği "art:<çizim kimliği>" biçimindedir.
 */
import { createStore, get, set } from 'idb-keyval';
import { useEffect, useSyncExternalStore } from 'react';
import { getArtwork } from '../lib/gallery';

const cacheStore = createStore('cizio-artpets', 'pets');
/** Önbellek sürümü: işleme yöntemi değişirse eski sonuçlar kullanılmasın. */
const VERSION = 'v1';

const mem = new Map<string, string | null>();
const pending = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const ART_PREFIX = 'art:';
export const isArtPet = (pet?: string) => !!pet && pet.startsWith(ART_PREFIX);
export const artIdOf = (pet: string) => pet.slice(ART_PREFIX.length);

async function loadBitmap(blob: Blob): Promise<CanvasImageSource & { width: number; height: number }> {
  if ('createImageBitmap' in window) return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Arka planı saydamlaştırıp çizimi kırpar; çizim bulunamazsa null. */
export async function cutOut(blob: Blob, maxSide = 240): Promise<string | null> {
  const bmp = await loadBitmap(blob);
  const k = Math.min(1, 420 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k));
  const h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0, w, h);
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;

  // Arka plan rengi: kenar piksellerinin ortancası (saydam kenarlar sayılmaz)
  const rs: number[] = [], gs: number[] = [], bs: number[] = [];
  const sample = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if (d[i + 3] < 128) return;
    rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]);
  };
  for (let x = 0; x < w; x += 3) { sample(x, 0); sample(x, h - 1); sample(x, Math.min(h - 1, 6)); sample(x, Math.max(0, h - 7)); }
  for (let y = 0; y < h; y += 3) { sample(0, y); sample(w - 1, y); sample(Math.min(w - 1, 6), y); sample(Math.max(0, w - 7), y); }
  const med = (a: number[]) => (a.length ? a.sort((p, q) => p - q)[Math.floor(a.length / 2)] : 255);
  const br = med(rs), bgc = med(gs), bb = med(bs);

  // Arka plana yakın pikseller saydam, geçişte yumuşak
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 10) { d[i + 3] = 0; continue; }
      const dist = Math.abs(d[i] - br) + Math.abs(d[i + 1] - bgc) + Math.abs(d[i + 2] - bb);
      if (dist < 55) d[i + 3] = 0;
      else if (dist < 95) d[i + 3] = Math.round((d[i + 3] * (dist - 55)) / 40);
      if (d[i + 3] > 60) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || (maxX - minX) * (maxY - minY) < 200) return null;
  g.putImageData(img, 0, 0);
  const pad = 6;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const s = Math.min(1, maxSide / Math.max(cw, ch));
  const out = document.createElement('canvas');
  out.width = Math.round(cw * s);
  out.height = Math.round(ch * s);
  out.getContext('2d')!.drawImage(c, minX, minY, cw, ch, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

async function load(id: string) {
  if (pending.has(id) || mem.has(id)) return;
  pending.add(id);
  try {
    const key = `${VERSION}:${id}`;
    let url = (await get<string | null>(key, cacheStore)) ?? undefined;
    if (url === undefined) {
      const art = await getArtwork(id);
      url = art ? await cutOut(art.blob) ?? undefined : undefined;
      await set(key, url ?? null, cacheStore);
    }
    mem.set(id, url ?? null);
  } catch {
    mem.set(id, null);
  } finally {
    pending.delete(id);
    emit();
  }
}

/** Çizimin kesilmiş hâli (veri adresi); hazırlanırken undefined, çizim yoksa null. */
export function useArtPet(artId?: string): string | null | undefined {
  const v = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => (artId ? mem.get(artId) : null),
  );
  useEffect(() => {
    if (artId && !mem.has(artId)) void load(artId);
  }, [artId]);
  return v;
}

/** Karakterin yanında (yerde) duran kendi çizimi. */
export function ArtPet({ id }: { id: string }) {
  const url = useArtPet(id);
  if (!url) return null;
  return (
    <g>
      <ellipse cx="66" cy="410" rx="50" ry="7" fill="#3a2b27" opacity="0.12" />
      <image href={url} x="6" y="286" width="124" height="126" preserveAspectRatio="xMidYMax meet" />
    </g>
  );
}
