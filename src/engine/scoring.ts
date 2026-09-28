/**
 * Çizim puanlama: çocuğun darbeleri ile dersteki hedef şekiller arasındaki yakınlığı ölçer.
 *
 * - kapsama (coverage): hedef çizginin ne kadarının çocuğun çizgileriyle örtüldüğü
 * - isabet (precision): çocuğun çizgilerinin ne kadarının herhangi bir hedef çizgiye yakın olduğu
 *
 * Sonuç yıldıza (0-3) ve parça bazlı Türkçe geri bildirime çevrilir. Sayısal puan çocuğa gösterilmez.
 */
import type { Shape } from '../lessons/types';
import { dist, resample, samplePath, type Pt } from './pathSampler';
import type { StrokeAction } from './types';

class Grid {
  private cells = new Map<string, Pt[]>();
  constructor(private size: number, pts: Pt[] = []) {
    for (const p of pts) this.add(p);
  }
  private key(x: number, y: number) {
    return `${Math.floor(x / this.size)},${Math.floor(y / this.size)}`;
  }
  add(p: Pt) {
    const k = this.key(p[0], p[1]);
    const c = this.cells.get(k);
    if (c) c.push(p);
    else this.cells.set(k, [p]);
  }
  /** `r` yarıçapında (r <= size) bir nokta var mı? */
  near(p: Pt, r: number): boolean {
    const cx = Math.floor(p[0] / this.size), cy = Math.floor(p[1] / this.size);
    const reach = Math.ceil(r / this.size);
    for (let dx = -reach; dx <= reach; dx++)
      for (let dy = -reach; dy <= reach; dy++) {
        const c = this.cells.get(`${cx + dx},${cy + dy}`);
        if (c) for (const q of c) if (dist(p, q) <= r) return true;
      }
    return false;
  }
}

export interface PartResult {
  part: string;
  coverage: number;
  length: number;
}

export interface ScoreResult {
  coverage: number;
  precision: number;
  score: number;
  stars: 0 | 1 | 2 | 3;
  parts: PartResult[];
  /** Kaçırılan hedef noktaları (ekranda turuncu gösterilir). */
  missed: Pt[];
}

export function strokePoints(strokes: StrokeAction[], spacing = 3): Pt[] {
  const out: Pt[] = [];
  for (const s of strokes) {
    if (s.tool === 'eraser') continue;
    const poly = s.points.map((p) => [p[0], p[1]] as Pt);
    if (poly.length === 1) out.push(poly[0]);
    else out.push(...resample(poly, spacing));
  }
  return out;
}

function starsFor(score: number, t: [number, number, number]): 0 | 1 | 2 | 3 {
  return score >= t[2] ? 3 : score >= t[1] ? 2 : score >= t[0] ? 1 : 0;
}

function partsOf(shapes: Shape[], test: (p: Pt, shapeLen: number) => boolean): PartResult[] {
  const byPart = new Map<string, { hit: number; n: number; length: number }>();
  for (const s of shapes) {
    const { points, length } = samplePath(s.d, 4);
    const key = s.part ?? '';
    const acc = byPart.get(key) ?? { hit: 0, n: 0, length: 0 };
    for (const p of points) {
      acc.n++;
      if (test(p, length)) acc.hit++;
    }
    acc.length += length;
    byPart.set(key, acc);
  }
  return [...byPart].map(([part, a]) => ({ part, coverage: a.n ? a.hit / a.n : 1, length: a.length }));
}

function thin(pts: Pt[], min: number): Pt[] {
  const out: Pt[] = [];
  for (const p of pts) if (!out.length || dist(out[out.length - 1], p) >= min) out.push(p);
  return out;
}

/**
 * Tek adım puanı (iz sürme / noktalar modu): mutlak koordinatlarda karşılaştırılır.
 * @param targets bu adımın şekilleri
 * @param context şimdiye kadarki tüm şekiller (isabet hesabında önceki çizgilere dokunmak cezalandırılmasın diye)
 */
export function scoreStep(targets: Shape[], context: Shape[], strokes: StrokeAction[], tol = 16): ScoreResult {
  const user = strokePoints(strokes);
  const scored = targets.filter((s) => !s.guide);
  if (scored.length === 0) return { coverage: 1, precision: 1, score: 1, stars: 3, parts: [], missed: [] };
  if (user.length === 0) {
    const missed = scored.flatMap((s) => samplePath(s.d, 12).points);
    return { coverage: 0, precision: 0, score: 0, stars: 0, parts: partsOf(scored, () => false), missed };
  }
  const ug = new Grid(tol, user);
  let total = 0, covered = 0;
  const missed: Pt[] = [];
  const parts = partsOf(scored, (p, shapeLen) => {
    // Kısa şekillerde (göz parlaklığı, nokta) daha toleranslı ol.
    const ok = ug.near(p, shapeLen < 60 ? tol * 1.4 : tol);
    total++;
    if (ok) covered++;
    else missed.push(p);
    return ok;
  });
  const ctx = context.filter((s) => !s.guide).flatMap((s) => samplePath(s.d, 4).points);
  const cg = new Grid(tol * 1.5, ctx);
  let inside = 0;
  for (const p of user) if (cg.near(p, tol * 1.5)) inside++;
  const coverage = covered / total;
  const precision = inside / user.length;
  const score = 0.7 * coverage + 0.3 * precision;
  let stars = starsFor(score, [0.35, 0.6, 0.8]);
  // Belirgin bir parça (ör. bir kulak) neredeyse hiç çizilmediyse en fazla 1 yıldız.
  if (parts.some((p) => p.length >= 30 && p.coverage < 0.3)) stars = Math.min(stars, 1) as 0 | 1;
  return { coverage, precision, score, stars, parts, missed: thin(missed, 10) };
}

function normalize(pts: Pt[], size = 300): Pt[] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  const s = size / Math.max(x1 - x0, y1 - y0, 1);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return pts.map(([x, y]) => [200 + (x - cx) * s, 200 + (y - cy) * s]);
}

/**
 * "Kendin çiz" modu: çocuk örneğe bakarak serbest çizer. Konum ve boyut farkı,
 * iki çizim de sınır kutusuna göre normalleştirilerek yok sayılır; oran ve biçim ölçülür.
 */
export function scoreFreehand(shapes: Shape[], strokes: StrokeAction[], tol = 24): ScoreResult {
  const target = shapes.filter((s) => !s.guide).flatMap((s) => samplePath(s.d, 4).points);
  const user = strokePoints(strokes);
  if (user.length < 5 || target.length === 0) return { coverage: 0, precision: 0, score: 0, stars: 1, parts: [], missed: [] };
  const nt = normalize(target), nu = normalize(user);
  const ug = new Grid(tol, nu), tg = new Grid(tol, nt);
  const coverage = nt.filter((p) => ug.near(p, tol)).length / nt.length;
  const precision = nu.filter((p) => tg.near(p, tol)).length / nu.length;
  const score = 0.6 * coverage + 0.4 * precision;
  // Serbest çizimde emek her zaman en az 1 yıldız kazanır.
  const stars = Math.max(1, starsFor(score, [0.3, 0.5, 0.7])) as 1 | 2 | 3;
  return { coverage, precision, score, stars, parts: [], missed: [] };
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

/** Geri bildirim cümleleri (feedbackText ve allFeedbackTexts aynı kalıpları kullanır). */
const FEEDBACK = {
  perfect: ['Harika!', 'Süpersin!', 'Muhteşem çizgiler!', 'Tam isabet!', 'Bayıldım!'],
  goodWeak: (part: string) => `Çok iyi! ${cap(part)} biraz eksik kaldı.`,
  goodSpill: 'Çok iyi! Çizgilerin biraz taşmış, yavaşça çizmeyi dene.',
  good: 'Çok iyi! Çizgiye biraz daha yakın kalabilirsin.',
  tryWeak: (part: string) => `Güzel deneme! ${cap(part)} kısmına bir daha bak.`,
  tryAgain: 'Güzel deneme! Turuncu noktaları takip etmeyi dene.',
  retry: 'Hadi bir daha deneyelim! Turuncu noktaları takip et.',
} as const;

/** Yıldız ve parça sonuçlarından çocuğa uygun, cesaretlendirici bir cümle üretir. */
export function feedbackText(r: ScoreResult): string {
  const weak = r.parts
    .filter((p) => p.part && p.length >= 30 && p.coverage < 0.6)
    .sort((a, b) => a.coverage - b.coverage)[0];
  if (r.stars === 3) return pick(FEEDBACK.perfect);
  if (r.stars === 2) {
    if (weak) return FEEDBACK.goodWeak(weak.part);
    if (r.precision < 0.6) return FEEDBACK.goodSpill;
    return FEEDBACK.good;
  }
  if (r.stars === 1) {
    if (weak) return FEEDBACK.tryWeak(weak.part);
    return FEEDBACK.tryAgain;
  }
  return FEEDBACK.retry;
}

/** Verilen parça adlarıyla feedbackText'in döndürebileceği tüm cümleler (seslendirme üretimi için). */
export function allFeedbackTexts(parts: string[]): string[] {
  const out: string[] = [...FEEDBACK.perfect, FEEDBACK.goodSpill, FEEDBACK.good, FEEDBACK.tryAgain, FEEDBACK.retry];
  for (const part of new Set(parts)) {
    if (!part) continue;
    out.push(FEEDBACK.goodWeak(part), FEEDBACK.tryWeak(part));
  }
  return [...new Set(out)];
}
