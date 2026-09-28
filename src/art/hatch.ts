/**
 * Kurşun kalem gölgelendirmesi (tarama / hatching) geometrisi.
 *
 * Bir şeklin içini, kalemin gerçekte yaptığı gibi ileri-geri zikzak çizgilerle doldurur:
 *  - parlak noktalar (göz parlaklığı gibi şeklin içindeki başka şekiller) boş bırakılır,
 *  - "hilal" modu yalnızca sağ-alt kenar boyunca tarar (ışık sol üstten gelir → hacim gölgesi).
 * Sonuç, animasyonla çizilebilen tek bir SVG path'idir.
 */
import { flattenPath, samplePath, type Pt } from '../engine/pathSampler';
import type { Shape } from '../lessons/types';

type Poly = Pt[];

function polysOf(d: string, dx = 0, dy = 0): Poly[] {
  return flattenPath(d).map((p) => {
    const q = p.map(([x, y]) => [x + dx, y + dy] as Pt);
    const a = q[0], b = q[q.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) q.push(a); // açık path'ler dolgu gibi kapanır
    return q;
  });
}

const rot = ([x, y]: Pt, c: number, s: number): Pt => [x * c - y * s, x * s + y * c];

/** Yatay y doğrusunun çokgenlerle kesişim aralıkları (çift-tek kuralı). */
function intervals(polys: Poly[], y: number): [number, number][] {
  const xs: number[] = [];
  for (const p of polys)
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
    }
  xs.sort((a, b) => a - b);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}

function subtract(a: [number, number][], b: [number, number][]): [number, number][] {
  let res = a;
  for (const [b0, b1] of b) {
    const next: [number, number][] = [];
    for (const [a0, a1] of res) {
      if (b1 <= a0 || b0 >= a1) next.push([a0, a1]);
      else {
        if (b0 > a0) next.push([a0, b0]);
        if (b1 < a1) next.push([b1, a1]);
      }
    }
    res = next;
  }
  return res;
}

export function pointInPolys(polys: Poly[], [x, y]: Pt): boolean {
  let inside = false;
  for (const p of polys)
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i];
      if (y0 > y !== y1 > y && x < x0 + ((y - y0) / (y1 - y0)) * (x1 - x0)) inside = !inside;
    }
  return inside;
}

export interface HatchOptions {
  /** Tarama açısı (derece). */
  angle?: number;
  /** Çizgi aralığı (400'lük birim). */
  spacing?: number;
  /** Boş bırakılacak iç şekiller (parlaklıklar, üstte çizilecek parçalar). */
  holes?: Shape[];
  /** Yalnızca sağ-alt hilal bölgesini tara (hacim gölgesi). */
  crescent?: boolean;
}

/** Şekli dolduran zikzak tarama path'i ("" dönerse taranacak yer yok). */
export function hatchPath(target: Shape, opts: HatchOptions = {}): string {
  const angle = ((opts.angle ?? 38) * Math.PI) / 180;
  const spacing = opts.spacing ?? 6;
  const c = Math.cos(-angle), s = Math.sin(-angle);
  const toLocal = (polys: Poly[]) => polys.map((p) => p.map((q) => rot(q, c, s)));
  const shape = toLocal(polysOf(target.d));
  const holes = (opts.holes ?? []).map((h) => toLocal(polysOf(h.d)));
  const shifted = opts.crescent ? toLocal(polysOf(target.d, -11, -14)) : null;

  let y0 = Infinity, y1 = -Infinity;
  for (const p of shape) for (const [, y] of p) (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
  const back = (x: number, y: number) => rot([x, y], Math.cos(angle), Math.sin(angle));

  let d = '';
  let last: Pt | null = null;
  let flip = false;
  for (let y = y0 + spacing / 2; y < y1; y += spacing) {
    let iv = intervals(shape, y);
    for (const h of holes) iv = subtract(iv, intervals(h, y));
    if (shifted) iv = subtract(iv, intervals(shifted, y));
    iv = iv.filter(([a, b]) => b - a > 1.5).map(([a, b]) => [a + 0.8, b - 0.8] as [number, number]);
    if (!iv.length) continue;
    if (flip) iv = iv.reverse().map(([a, b]) => [b, a] as [number, number]);
    flip = !flip;
    for (const [a, b] of iv) {
      const p0 = back(a, y), p1 = back(b, y);
      // Kalem kaldırmadan devam: kısa geçişlerde çizgiyi bağla, uzakta (delik üstünden) kaldır.
      const jump = !last || Math.hypot(p0[0] - last[0], p0[1] - last[1]) > spacing * 2.2;
      d += `${jump ? 'M' : 'L'}${p0[0].toFixed(1)},${p0[1].toFixed(1)} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} `;
      last = p1;
    }
  }
  return d.trim();
}

/** Hedef şeklin içinde kalan (tamamen içerilen) sonraki şekiller: taramada boş bırakılır. */
export function innerShapes(target: Shape, later: Shape[]): Shape[] {
  const polys = polysOf(target.d);
  return later.filter((s) => {
    if (s.guide || !s.fill) return false;
    const pts = samplePath(s.d, 8).points;
    return pts.length > 0 && pts.every((p) => pointInPolys(polys, p));
  });
}
