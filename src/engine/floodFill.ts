/**
 * Boya kovası: çizgi katmanındaki kapalı alanı bulur.
 *
 * İki bölge hesaplanır:
 *  - gerçek bölge: yalnızca çizgilere göre (boşluk kapatmadan) dokunulan yerin bölgesi;
 *  - korunan bölge: çizgiler `gap` piksel kalınlaştırılarak (çocuk çizimlerinde tam kapanmayan küçük boşluklar
 *    kapanır) bulunan bölge, sonra aynı miktar geri büyütülür.
 * Çizgi gerçekten kapalıysa (gerçek bölge dışarı taşmıyorsa) gerçek bölgenin tamamı boyanır: sivri köşeler, dar
 * yerler ve çizginin altı dahil, hiç beyaz yer kalmaz. Çizgide boşluk varsa korunan bölge boyanır ve onun
 * kenarındaki küçük cepler (sivri köşeler) de doldurulur; boya boşluktan dışarı taşmaz.
 * Çok dar bir yere dokunulduysa boşluk kapatma kendiliğinden küçülür. Boya ayrı bir katmana, çizgilerin altına çizilir.
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

/** Dokunulan noktaya en yakın boş piksel (yoksa -1). */
function seedNear(blocked: Uint8Array, w: number, h: number, sx: number, sy: number, reach: number) {
  for (let r = 0; r <= reach; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = sx + dx, y = sy + dy;
        if (x >= 0 && y >= 0 && x < w && y < h && !blocked[y * w + x]) return y * w + x;
      }
  return -1;
}

/** Tarama çizgisi (scanline) taşma doldurma. */
function flood(blocked: Uint8Array, w: number, h: number, seed: number): Uint8Array {
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
  return region;
}

const count = (m: Uint8Array) => {
  let n = 0;
  for (let i = 0; i < m.length; i++) n += m[i];
  return n;
};
function touchesBorder(m: Uint8Array, w: number, h: number) {
  for (let x = 0; x < w; x++) if (m[x] || m[(h - 1) * w + x]) return true;
  for (let y = 0; y < h; y++) if (m[y * w] || m[y * w + w - 1]) return true;
  return false;
}

/**
 * @param lineAlpha çizgi katmanının RGBA verisi
 * @returns doldurulacak piksellerin maskesi, ya da tohum bir çizginin üstündeyse null
 */
export function fillRegion(lineAlpha: Uint8ClampedArray, w: number, h: number, sx: number, sy: number, gap = 8): Uint8Array | null {
  const n = w * h;
  const wall = new Uint8Array(n);
  for (let i = 0; i < n; i++) wall[i] = lineAlpha[i * 4 + 3] > 40 ? 1 : 0;
  sx = Math.round(sx);
  sy = Math.round(sy);

  // gerçek bölge (çizgilere göre)
  const s0 = seedNear(wall, w, h, sx, sy, 8);
  if (s0 < 0) return null;
  const truth = flood(wall, w, h, s0);

  // korunan bölge: dar bir yere dokunulduysa boşluk kapatma küçülür
  let g = gap, region: Uint8Array | null = null;
  for (const cand of [gap, Math.round(gap / 2), 2]) {
    const blocked = dilate(wall, w, h, cand);
    const s = seedNear(blocked, w, h, sx, sy, 8);
    if (s < 0 || !truth[s]) continue;
    g = cand;
    region = flood(blocked, w, h, s);
    break;
  }
  if (!region) return dilate(truth, w, h, 2); // çok dar, kapalı bir yer: olduğu gibi boya
  const grown = dilate(region, w, h, g + 1);

  // gerçek bölge dışarı taşmıyorsa tamamını boya (köşeler ve çizgi altı dahil)
  const leaked = count(truth) > count(grown) * 1.25 + 400 || (touchesBorder(truth, w, h) && !touchesBorder(region, w, h));
  const out = new Uint8Array(n);
  if (!leaked) {
    // çizginin yumuşak kenarının altı da boyansın (beyaz hale kalmasın)
    const t2 = dilate(truth, w, h, 2);
    for (let i = 0; i < n; i++) out[i] = t2[i] | grown[i];
    return out;
  }

  // çizgide boşluk var: korunan bölge + kenarındaki küçük cepler (bölgeye yakın, dışarıya bağlanmayan)
  const near = dilate(region, w, h, 2 * g + 2);
  const left = new Uint8Array(n);
  for (let i = 0; i < n; i++) left[i] = truth[i] && !grown[i] ? 1 : 0;
  const seen = new Uint8Array(n);
  const comp: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!left[i] || seen[i]) continue;
    comp.length = 0;
    let inside = true;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop()!;
      comp.push(j);
      if (!near[j]) inside = false;
      const x = j % w;
      for (const k of [j - w, j + w, x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1]) {
        if (k >= 0 && k < n && left[k] && !seen[k]) {
          seen[k] = 1;
          stack.push(k);
        }
      }
    }
    if (inside) for (const j of comp) out[j] = 1;
  }
  for (let i = 0; i < n; i++) out[i] |= grown[i];
  return out;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
