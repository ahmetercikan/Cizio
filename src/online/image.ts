/** Arkadaşa gidecek çizim resmi: 320 px WebP data adresi (~20–40 KB; Firestore belgesine sığar). */
import type { DrawingDoc } from '../engine/drawingDoc';

const SIZE = 320;

export async function smallImage(doc: DrawingDoc): Promise<string> {
  const blob = await doc.toBlob();
  const bmp = typeof createImageBitmap === 'function' ? await createImageBitmap(blob) : await loadImage(blob);
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, SIZE, SIZE);
  g.drawImage(bmp, 0, 0, SIZE, SIZE);
  for (const q of [0.75, 0.6, 0.45]) {
    const url = c.toDataURL('image/webp', q);
    // WebP desteklemeyen eski WebView PNG döndürür; JPEG'e düş
    const out = url.startsWith('data:image/webp') ? url : c.toDataURL('image/jpeg', q);
    if (out.length < 120_000) return out;
  }
  return c.toDataURL('image/jpeg', 0.4);
}

function loadImage(b: Blob): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = URL.createObjectURL(b);
  return img.decode().then(() => img);
}
