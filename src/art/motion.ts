/**
 * Canlanan çizim ve "Çizdiğinle oyna" için her dersin hareket profili:
 *   body  — bütün resmin hareketi (zıplar, yüzer, sürer, uçar…)
 *   scene — arka plan sahnesi
 *   game  — oyun türü: koş (zıplayarak engel aş), sür (araçla), uç, yüz
 * ve parça adlarına göre parça hareketleri (göz kırpma, tekerlek dönmesi, kuyruk sallama…).
 */
import { samplePath } from '../engine/pathSampler';
import type { Lesson, PathId } from '../lessons/types';

export type Body = 'bounce' | 'swim' | 'drive' | 'fly' | 'rocket' | 'float' | 'boat' | 'sway' | 'wobble';
export type Scene = 'meadow' | 'sea' | 'road' | 'sky' | 'space' | 'party' | 'snow' | 'garden';
export type GameKind = 'run' | 'drive' | 'fly' | 'swim';

export interface MotionProfile {
  body: Body;
  scene: Scene;
  game: GameKind;
}

const BY_PATH: Record<PathId, MotionProfile> = {
  temeller: { body: 'bounce', scene: 'meadow', game: 'run' },
  hayvanlar: { body: 'bounce', scene: 'meadow', game: 'run' },
  nesneler: { body: 'wobble', scene: 'party', game: 'run' },
  doga: { body: 'sway', scene: 'garden', game: 'run' },
  karakterler: { body: 'bounce', scene: 'meadow', game: 'run' },
  deniz: { body: 'swim', scene: 'sea', game: 'swim' },
  dinozor: { body: 'bounce', scene: 'meadow', game: 'run' },
  tasitlar: { body: 'drive', scene: 'road', game: 'drive' },
  ismakineleri: { body: 'drive', scene: 'road', game: 'drive' },
  ozel: { body: 'wobble', scene: 'party', game: 'run' },
};

const BY_LESSON: Record<string, Partial<MotionProfile>> = {
  // uçanlar
  roket: { body: 'rocket', scene: 'space', game: 'fly' },
  uzayli: { body: 'float', scene: 'space', game: 'fly' },
  ucak: { body: 'fly', scene: 'sky', game: 'fly' },
  helikopter: { body: 'fly', scene: 'sky', game: 'fly' },
  'hava-balonu': { body: 'float', scene: 'sky', game: 'fly' },
  balon: { body: 'float', scene: 'sky', game: 'fly' },
  ucurtma: { body: 'fly', scene: 'sky', game: 'fly' },
  kelebek: { body: 'fly', scene: 'garden', game: 'fly' },
  ari: { body: 'fly', scene: 'garden', game: 'fly' },
  baykus: { body: 'bounce', scene: 'meadow', game: 'fly' },
  ejderha: { body: 'fly', scene: 'sky', game: 'fly' },
  'ucan-dinozor': { body: 'fly', scene: 'sky', game: 'fly' },
  hayalet: { body: 'float', scene: 'space', game: 'fly' },
  peri: { body: 'float', scene: 'garden', game: 'fly' },
  kahraman: { body: 'fly', scene: 'sky', game: 'fly' },
  'gunes-bulut': { body: 'float', scene: 'sky', game: 'fly' },
  gokkusagi: { body: 'float', scene: 'sky', game: 'fly' },
  yildiz: { body: 'float', scene: 'space', game: 'fly' },
  // su
  balik: { body: 'swim', scene: 'sea', game: 'swim' },
  denizalti: { body: 'swim', scene: 'sea', game: 'swim' },
  yelkenli: { body: 'boat', scene: 'sea', game: 'swim' },
  denizanasi: { body: 'float', scene: 'sea', game: 'swim' },
  'kumdan-kale': { body: 'wobble', scene: 'sea', game: 'run' },
  'deniz-kabugu': { body: 'wobble', scene: 'sea', game: 'swim' },
  yengec: { body: 'bounce', scene: 'sea', game: 'run' },
  penguen: { body: 'bounce', scene: 'snow', game: 'run' },
  kurbaga: { body: 'bounce', scene: 'garden', game: 'run' },
  // kara taşıtları
  araba: { body: 'drive', scene: 'road', game: 'drive' },
  bisiklet: { body: 'drive', scene: 'road', game: 'drive' },
  otobus: { body: 'drive', scene: 'road', game: 'drive' },
  tren: { body: 'drive', scene: 'road', game: 'drive' },
  vinc: { body: 'sway', scene: 'road', game: 'run' },
  // kış
  'kardan-adam': { body: 'wobble', scene: 'snow', game: 'run' },
  'yilbasi-agaci': { body: 'sway', scene: 'snow', game: 'run' },
  // bitkiler ve yerinde duranlar
  agac: { body: 'sway', scene: 'garden', game: 'run' },
  ev: { body: 'wobble', scene: 'meadow', game: 'run' },
  volkan: { body: 'wobble', scene: 'meadow', game: 'run' },
  'dino-yumurta': { body: 'wobble', scene: 'meadow', game: 'run' },
  'turk-bayragi': { body: 'sway', scene: 'sky', game: 'fly' },
};

export function motionOf(lesson?: Lesson): MotionProfile {
  if (!lesson) return { body: 'bounce', scene: 'party', game: 'run' };
  return { ...BY_PATH[lesson.path], ...BY_LESSON[lesson.id] };
}

// ------------------------------------------------------------------------------------------------
// Parça hareketleri
// ------------------------------------------------------------------------------------------------
export type PartMotion = 'blink' | 'spin' | 'wag' | 'flap' | 'wave' | 'twitch' | 'bob';

/** Bir parça adının ait olduğu grup (ör. "sol göz parıltısı" → "sol göz"); grup birlikte hareket eder. */
export function partGroup(part: string): string {
  return part.replace(/\s+(parıltısı|içi|topu|ucu|püskülü|benekleri|deseni)$/u, '').trim();
}

const RULES: [RegExp, PartMotion][] = [
  [/(^|\s)göz$|gözbebeği/u, 'blink'],
  [/tekerle|jant|lastik|pervane/u, 'spin'],
  [/kuyruk/u, 'wag'],
  [/kanat|yüzgeç/u, 'flap'],
  [/(^|\s)kol$|pati|dokunaç/u, 'wave'],
  [/kulak/u, 'twitch'],
  [/anten|boynuz|fiyonk/u, 'bob'],
];

/** Grup adına göre parça hareketi (yoksa parça yerinde kalır). Tekerlek yalnızca taşıtlarda döner. */
export function partMotion(group: string, lesson: Lesson): PartMotion | undefined {
  for (const [re, m] of RULES) {
    if (!re.test(group)) continue;
    if (m === 'spin' && /tekerle|jant|lastik/u.test(group) && motionOf(lesson).body !== 'drive') return undefined;
    return m;
  }
  return undefined;
}

/**
 * Çizimin baktığı yön (+1 sağa, -1 sola): ön/arka tekerlek, far/burun/gaga ya da gözlerin gövdeye göre yeri.
 * Yüzerken ve uçarken resim geri geri gitmesin diye.
 */
export function facingOf(lesson?: Lesson): number {
  if (!lesson) return 1;
  const shapes = lesson.steps.flatMap((s) => s.shapes).filter((s) => !s.guide && s.d);
  const cx = (re: RegExp) => {
    const xs = shapes.filter((s) => s.part && re.test(s.part)).flatMap((s) => samplePath(s.d, 8).points.map((p) => p[0]));
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;
  };
  const all = shapes.flatMap((s) => samplePath(s.d, 8).points.map((p) => p[0]));
  const C = all.reduce((a, b) => a + b, 0) / Math.max(1, all.length);
  const front = cx(/^ön /u), back = cx(/^arka /u);
  if (front !== undefined && back !== undefined && Math.abs(front - back) > 10) return Math.sign(front - back);
  for (const re of [/far|ön cam|burun|gaga|hortum/u, /(^|\s)göz$/u]) {
    const x = cx(re);
    if (x !== undefined && Math.abs(x - C) > 8) return Math.sign(x - C);
  }
  return 1;
}
