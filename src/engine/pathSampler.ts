/**
 * SVG path verisini (M, L, H, V, Q, T, C, S, A, Z — mutlak ve göreli) nokta dizilerine çevirir.
 * DOM'a ihtiyaç duymaz; böylece puanlama tarayıcıda, testlerde ve ileride mobilde aynı çalışır.
 */
export type Pt = [number, number];

const TOKEN = /([MmLlHhVvQqTtCcSsAaZz])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;

function tokenize(d: string): (string | number)[] {
  const out: (string | number)[] = [];
  for (const m of d.matchAll(TOKEN)) out.push(m[1] ?? parseFloat(m[2]));
  return out;
}

const PARAMS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, q: 4, t: 2, c: 6, s: 4, a: 7, z: 0 };

function quad(p0: Pt, p1: Pt, p2: Pt, n: number, out: Pt[]) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
}

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number, out: Pt[]) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1]]);
  }
}

const vecAngle = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);

/** SVG eliptik yayı (spec F.6.5) — uç nokta parametrelerinden merkez parametrelerine. */
function arc(p0: Pt, rx: number, ry: number, rotDeg: number, large: number, sweep: number, p1: Pt, out: Pt[]) {
  if (rx === 0 || ry === 0 || (p0[0] === p1[0] && p0[1] === p1[1])) {
    out.push(p1);
    return;
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phi = (rotDeg * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2, dy = (p0[1] - p1[1]) / 2;
  const x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy;
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const coef = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1) / ry, cyp = (-coef * ry * x1) / rx;
  const cx = cos * cxp - sin * cyp + (p0[0] + p1[0]) / 2;
  const cy = sin * cxp + cos * cyp + (p0[1] + p1[1]) / 2;
  const th1 = vecAngle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dth = vecAngle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && dth > 0) dth -= 2 * Math.PI;
  if (sweep && dth < 0) dth += 2 * Math.PI;
  const n = Math.max(8, Math.ceil((Math.abs(dth) * Math.max(rx, ry)) / 4));
  for (let i = 1; i <= n; i++) {
    const th = th1 + (dth * i) / n;
    out.push([cx + rx * Math.cos(th) * cos - ry * Math.sin(th) * sin, cy + rx * Math.cos(th) * sin + ry * Math.sin(th) * cos]);
  }
}

/** Path'i alt yollara (subpath) ayrılmış ince poligonlara çevirir. */
export function flattenPath(d: string): Pt[][] {
  const tk = tokenize(d);
  const subpaths: Pt[][] = [];
  let cur: Pt = [0, 0], start: Pt = [0, 0];
  let lastCtrl: Pt | null = null, lastCmd = '';
  let poly: Pt[] = [];
  let i = 0, cmd = '';
  const num = () => tk[i++] as number;

  while (i < tk.length) {
    if (typeof tk[i] === 'string') cmd = tk[i++] as string;
    else if (!cmd) { i++; continue; }
    const lc = cmd.toLowerCase();
    const rel = cmd !== cmd.toUpperCase();
    if (lc === 'z') {
      poly.push([...start]);
      cur = [...start];
      subpaths.push(poly);
      poly = [];
      lastCtrl = null; lastCmd = 'z';
      cmd = '';
      continue;
    }
    if (i + PARAMS[lc] > tk.length) break;
    const ox = rel ? cur[0] : 0, oy = rel ? cur[1] : 0;
    if (lc !== 'm' && poly.length === 0) poly.push([...cur]);
    switch (lc) {
      case 'm': {
        if (poly.length > 1) subpaths.push(poly);
        cur = [num() + ox, num() + oy];
        start = [...cur];
        poly = [[...cur]];
        cmd = rel ? 'l' : 'L'; // ardışık koordinatlar lineto sayılır
        lastCtrl = null;
        break;
      }
      case 'l': cur = [num() + ox, num() + oy]; poly.push(cur); lastCtrl = null; break;
      case 'h': cur = [num() + ox, cur[1]]; poly.push(cur); lastCtrl = null; break;
      case 'v': cur = [cur[0], num() + oy]; poly.push(cur); lastCtrl = null; break;
      case 'q': case 't': {
        let c: Pt;
        if (lc === 'q') c = [num() + ox, num() + oy];
        else c = lastCtrl && /[qt]/.test(lastCmd) ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : [...cur];
        const p: Pt = [num() + ox, num() + oy];
        quad(cur, c, p, 24, poly);
        lastCtrl = c; cur = p;
        break;
      }
      case 'c': case 's': {
        let c1: Pt;
        if (lc === 'c') c1 = [num() + ox, num() + oy];
        else c1 = lastCtrl && /[cs]/.test(lastCmd) ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : [...cur];
        const c2: Pt = [num() + ox, num() + oy];
        const p: Pt = [num() + ox, num() + oy];
        cubic(cur, c1, c2, p, 32, poly);
        lastCtrl = c2; cur = p;
        break;
      }
      case 'a': {
        const rx = num(), ry = num(), rot = num(), large = num(), sweep = num();
        const p: Pt = [num() + ox, num() + oy];
        arc(cur, rx, ry, rot, large, sweep, p, poly);
        cur = p; lastCtrl = null;
        break;
      }
    }
    lastCmd = lc;
  }
  if (poly.length > 1) subpaths.push(poly);
  return subpaths;
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polylineLength(poly: Pt[]): number {
  let len = 0;
  for (let i = 1; i < poly.length; i++) len += dist(poly[i - 1], poly[i]);
  return len;
}

/** Poligonu eşit aralıklı noktalara yeniden örnekler. */
export function resample(poly: Pt[], spacing: number): Pt[] {
  if (poly.length === 0) return [];
  const out: Pt[] = [poly[0]];
  let carry = 0;
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1], b = poly[i];
    const seg = dist(a, b);
    if (seg === 0) continue;
    let t = spacing - carry;
    while (t <= seg) {
      out.push([a[0] + ((b[0] - a[0]) * t) / seg, a[1] + ((b[1] - a[1]) * t) / seg]);
      t += spacing;
    }
    carry = seg - (t - spacing);
  }
  const last = poly[poly.length - 1];
  if (dist(out[out.length - 1], last) > spacing * 0.3) out.push(last);
  return out;
}

const cache = new Map<string, { points: Pt[]; length: number }>();

/** Bir path'i `spacing` aralıklı noktalarla örnekler (önbellekli). */
export function samplePath(d: string, spacing = 4): { points: Pt[]; length: number } {
  const key = `${spacing}|${d}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const subs = flattenPath(d);
  const points: Pt[] = [];
  let length = 0;
  for (const s of subs) {
    points.push(...resample(s, spacing));
    length += polylineLength(s);
  }
  const res = { points, length };
  cache.set(key, res);
  return res;
}
