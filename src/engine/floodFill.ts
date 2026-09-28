/**
 * Boya kovası: çizgi katmanındaki kapalı alanı bulur.
 *
 * Çocuk çizimlerinde çizgiler çoğu zaman tam kapanmaz. Bu yüzden sınır maskesi önce `gap` piksel
 * genişletilir (küçük boşluklar kapanır), bölge bulunur, sonra bölge aynı miktar geri büyütülür ki
 * boya çizginin altına kadar uzansın. Boya ayrı bir katmana, çizgilerin altına çizilir.
 */

function dilate(src: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r <= 0) return src;
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  // yatay geçiş
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let last = -Infinity;
    for (let x = 0; x < w; x++) {
      if (src[row + x]) last = x;
      if (x - last <= r) tmp[row + x] = 1;
    }
    last = Infinity;
    for (let x = w - 1; x >= 0; x--) {
      if (src[row + x]) last = x;
      if (last - x <= r) tmp[row + x] = 1;
    }
  }
  // dikey geçiş
  for (let x = 0; x < w; x++) {
    let last = -Infinity;
    for (let y = 0; y < h; y++) {
      if (tmp[y * w + x]) last = y;
      if (y - last <= r) out[y * w + x] = 1;
    }
    last = Infinity;
    for (let y = h - 1; y >= 0; y--) {
      if (tmp[y * w + x]) last = y;
      if (last - y <= r) out[y * w + x] = 1;
    }
  }
  return out;
}

/**
 * @param lineAlpha çizgi katmanının RGBA verisi
 * @returns doldurulacak piksellerin maskesi, ya da tohum bir çizginin üstündeyse null
 */
export function fillRegion(lineAlpha: Uint8ClampedArray, w: number, h: number, sx: number, sy: number, gap = 8): Uint8Array | null {
  const wall = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) wall[i] = lineAlpha[i * 4 + 3] > 40 ? 1 : 0;
  const blocked = dilate(wall, w, h, gap);

  // Tohum çizgi üstündeyse yakındaki boş pikseli ara.
  let seed = -1;
  sx = Math.round(sx);
  sy = Math.round(sy);
  for (let r = 0; r <= 8 && seed < 0; r++)
    for (let dy = -r; dy <= r && seed < 0; dy++)
      for (let dx = -r; dx <= r && seed < 0; dx++) {
        const x = sx + dx, y = sy + dy;
        if (x >= 0 && y >= 0 && x < w && y < h && !blocked[y * w + x]) seed = y * w + x;
      }
  if (seed < 0) return null;

  // Tarama çizgisi (scanline) taşma doldurma.
  const region = new Uint8Array(w * h);
  const stack = [seed];
  while (stack.length) {
    const i = stack.pop()!;
    const y = (i / w) | 0;
    let x = i - y * w;
    while (x > 0 && !blocked[y * w + x - 1] && !region[y * w + x - 1]) x--;
    let up = false, down = false;
    for (; x < w; x++) {
      const j = y * w + x;
      if (blocked[j] || region[j]) break;
      region[j] = 1;
      if (y > 0) {
        const u = j - w;
        const free = !blocked[u] && !region[u];
        if (free && !up) stack.push(u);
        up = free;
      }
      if (y < h - 1) {
        const d = j + w;
        const free = !blocked[d] && !region[d];
        if (free && !down) stack.push(d);
        down = free;
      }
    }
  }
  return dilate(region, w, h, gap + 1);
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
