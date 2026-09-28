/**
 * Ders "videosu"nun zaman çizelgesi: her şeklin ne zaman çizileceği ve kalemin nerede olacağı.
 * Gerçek video yerine vektör çizim + kalem animasyonu kullanılır; böylece ileri/geri sarma,
 * hız ayarı ve adım duraklamaları kusursuz çalışır ve dosya boyutu sıfıra yakındır.
 */
import { samplePath, type Pt } from '../engine/pathSampler';
import type { HatchPass, Lesson, Shape } from '../lessons/types';

export interface ShapeSeg {
  step: number;
  shape: Shape;
  /** Gölgelendirme taraması ise tarama bilgisi (shape.d = zikzak path). */
  hatch?: HatchPass;
  start: number;
  end: number;
  points: Pt[];
}

export interface StepSeg {
  step: number;
  start: number;
  /** Çizimin bittiği an (adım sonu duraklaması burada). */
  end: number;
}

export interface Timeline {
  shapes: ShapeSeg[];
  steps: StepSeg[];
  total: number;
}

const LEAD = 0.9; // adım başında anlatım için kısa bekleme
const GAP = 0.35; // şekiller arası kalem kaldırma
const TAIL = 0.4;

export function shapeDuration(s: Shape): number {
  const len = samplePath(s.d).length;
  if (s.guide) return Math.min(1, Math.max(0.4, len / 500));
  return Math.min(2.6, Math.max(0.55, len / 190));
}

/** Tarama hızlı, ileri-geri bir harekettir: uzun path'ler de birkaç saniyede biter. */
export function hatchDuration(h: HatchPass): number {
  const len = samplePath(h.d, 4).length;
  return Math.min(4.5, Math.max(1, len / 1500));
}

export function buildTimeline(lesson: Lesson): Timeline {
  const shapes: ShapeSeg[] = [];
  const steps: StepSeg[] = [];
  let t = 0;
  lesson.steps.forEach((st, i) => {
    const start = t;
    t += LEAD;
    st.shapes.forEach((sh, k) => {
      const dur = shapeDuration(sh);
      shapes.push({ step: i, shape: sh, start: t, end: t + dur, points: samplePath(sh.d, 2).points });
      t += dur + (k < st.shapes.length - 1 ? GAP : 0);
    });
    (st.hatch ?? []).forEach((h, k) => {
      const dur = hatchDuration(h);
      shapes.push({ step: i, shape: { d: h.d }, hatch: h, start: t, end: t + dur, points: samplePath(h.d, 2).points });
      t += dur + (k < (st.hatch?.length ?? 0) - 1 ? GAP * 0.6 : 0);
    });
    t += TAIL;
    steps.push({ step: i, start, end: t });
  });
  return { shapes, steps, total: t };
}

export const stepAt = (tl: Timeline, t: number) => {
  for (const s of tl.steps) if (t < s.end - 1e-6) return s.step;
  return tl.steps.length - 1;
};

/** 0..1 arası ilerlemede şeklin üzerindeki nokta. */
export function pointAt(points: Pt[], p: number): Pt {
  if (points.length === 0) return [200, 200];
  const f = Math.min(1, Math.max(0, p)) * (points.length - 1);
  const i = Math.floor(f);
  const a = points[i], b = points[Math.min(points.length - 1, i + 1)];
  const k = f - i;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

export interface PencilState {
  x: number;
  y: number;
  lifted: boolean;
  visible: boolean;
}

/** Zamanın t anında her şeklin ilerlemesi (0..1) ve kalemin konumu. */
export function frameAt(tl: Timeline, t: number): { progress: number[]; pencil: PencilState } {
  const progress = tl.shapes.map((s) => (t <= s.start ? 0 : t >= s.end ? 1 : (t - s.start) / (s.end - s.start)));
  let pencil: PencilState = { x: 300, y: 330, lifted: true, visible: false };
  const active = tl.shapes.findIndex((s) => t > s.start && t < s.end);
  if (active >= 0) {
    const s = tl.shapes[active];
    const [x, y] = pointAt(s.points, progress[active]);
    pencil = { x, y, lifted: false, visible: true };
  } else {
    // şekiller arasında: bir öncekinin sonundan sonrakinin başına havada git
    const next = tl.shapes.findIndex((s) => s.start >= t);
    const prev = next === -1 ? tl.shapes.length - 1 : next - 1;
    const step = stepAt(tl, t);
    const inStep = (i: number) => i >= 0 && i < tl.shapes.length && tl.shapes[i].step === step;
    if (inStep(prev) && inStep(next)) {
      const a = tl.shapes[prev].points.at(-1)!, b = tl.shapes[next].points[0];
      const k = (t - tl.shapes[prev].end) / Math.max(0.01, tl.shapes[next].start - tl.shapes[prev].end);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      pencil = { x: a[0] + (b[0] - a[0]) * e, y: a[1] + (b[1] - a[1]) * e, lifted: true, visible: true };
    } else if (inStep(next)) {
      const b = tl.shapes[next].points[0];
      pencil = { x: b[0], y: b[1], lifted: true, visible: true };
    } else if (inStep(prev)) {
      const a = tl.shapes[prev].points.at(-1)!;
      pencil = { x: a[0] + 10, y: a[1] + 14, lifted: true, visible: true };
    }
  }
  return { progress, pencil };
}

export const fmtTime = (s: number) => {
  const v = Math.max(0, Math.round(s));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};
