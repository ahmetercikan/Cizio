/// <reference lib="webworker" />
/**
 * Ders eskizi birleştirme işçisi: hazır eskizi (WebP) ve kâğıt dokusunu kenar boşluğuyla bir tuvalde birleştirip
 * WebP olarak kodlar. Çözme, çizme ve kodlama ana iş parçacığının dışında olur — sayfa geçişleri donmaz.
 */
declare const self: DedicatedWorkerGlobalScope;

export interface ComposeRequest {
  id: number;
  art: string;
  paper: string | null;
  pad: number;
  size: number;
}

const bitmaps = new Map<string, Promise<ImageBitmap>>();
function bitmap(url: string): Promise<ImageBitmap> {
  let p = bitmaps.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`thumb ${r.status}`);
        return r.blob();
      })
      .then((b) => createImageBitmap(b));
    p.catch(() => bitmaps.delete(url));
    bitmaps.set(url, p);
  }
  return p;
}

self.onmessage = async (e: MessageEvent<ComposeRequest>) => {
  const { id, art, paper, pad, size } = e.data;
  try {
    const [a, bg] = await Promise.all([bitmap(art), paper ? bitmap(paper) : null]);
    const c = new OffscreenCanvas(size, size);
    const g = c.getContext('2d')!;
    if (bg) g.drawImage(bg, 0, 0, size, size);
    const k = size / (400 + pad * 2);
    g.drawImage(a, pad * k, pad * k, 400 * k, 400 * k);
    const blob = await c.convertToBlob({ type: 'image/webp', quality: 0.9 });
    self.postMessage({ id, blob });
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
};
