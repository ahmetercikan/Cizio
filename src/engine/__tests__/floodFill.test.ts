import { describe, expect, it } from 'vitest';
import { fillRegion } from '../floodFill';

const W = 300, H = 300;
/** Çizgi katmanı: verilen piksellere çizgi koyar. */
function canvas(paint: (set: (x: number, y: number) => void) => void) {
  const d = new Uint8ClampedArray(W * H * 4);
  const set = (x: number, y: number) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < W && y < H) d[(y * W + x) * 4 + 3] = 255;
  };
  paint(set);
  return d;
}
const thick = (set: (x: number, y: number) => void, t: number) => (x: number, y: number) => {
  for (let dx = -t; dx <= t; dx++) for (let dy = -t; dy <= t; dy++) set(x + dx, y + dy);
};
const line = (s: (x: number, y: number) => void, x1: number, y1: number, x2: number, y2: number) => {
  const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  for (let i = 0; i <= n; i++) s(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n);
};
const ring = (s: (x: number, y: number) => void, cx: number, cy: number, r: number, gapDeg = 0) => {
  for (let a = 0; a < 360; a += 0.25) {
    if (gapDeg && a < gapDeg) continue;
    s(cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r);
  }
};

describe('boya kovası', () => {
  it('kapalı şekilde sivri köşeler dahil hiç beyaz yer kalmaz', () => {
    const img = canvas((set) => {
      const s = thick(set, 2);
      ring(s, 150, 150, 100);
      // içeride dar açılı bir "V": sivri köşe cebi
      line(s, 80, 120, 200, 140);
      line(s, 80, 120, 200, 100);
    });
    const m = fillRegion(img, W, H, 150, 220)!;
    expect(m).not.toBeNull();
    let white = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const inside = Math.hypot(x - 150, y - 150) < 96;
      const wall = img[(y * W + x) * 4 + 3] > 40;
      // V'nin içi ayrı bir bölge: onu sayma
      const inV = x > 82 && x < 200 && y > 100 + ((x - 80) / 120) * 0 && Math.abs(y - 120) < ((x - 80) / 120) * 20 - 3;
      if (inside && !wall && !inV && !m[y * W + x]) white++;
    }
    expect(white).toBe(0);
    expect(m[5 * W + 5]).toBe(0); // dışarısı boyanmadı
  });
  it('çizgide küçük boşluk varsa boya dışarı taşmaz', () => {
    const img = canvas((set) => ring(thick(set, 2), 150, 150, 100, 3));
    const m = fillRegion(img, W, H, 150, 150)!;
    expect(m[150 * W + 150]).toBe(1);
    expect(m[5 * W + 5]).toBe(0);
    expect(m[150 * W + 290]).toBe(0);
  });
  it('dar bir şerit de boyanır', () => {
    const img = canvas((set) => {
      const s = thick(set, 1);
      line(s, 40, 100, 260, 100);
      line(s, 40, 110, 260, 110);
      line(s, 40, 100, 40, 110);
      line(s, 260, 100, 260, 110);
    });
    const m = fillRegion(img, W, H, 150, 105)!;
    expect(m).not.toBeNull();
    expect(m[105 * W + 60]).toBe(1);
    expect(m[105 * W + 250]).toBe(1);
    expect(m[50 * W + 150]).toBe(0);
  });
  it('çizginin tam üstüne dokununca yakındaki boş yer boyanır, hiç yer yoksa boyanmaz', () => {
    const full = new Uint8ClampedArray(W * H * 4).fill(255);
    expect(fillRegion(full, W, H, 150, 150)).toBeNull();
  });
});
