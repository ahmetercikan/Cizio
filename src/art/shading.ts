/**
 * Gölgelendirme adımları: çizgiler bittikten sonra kalemin gölgeyi nasıl verdiğini gösterir.
 *   1) Yumuşak gölge: büyük parçalar hafifçe taranır, sağ-alt kenarlar koyulaştırılır (hacim).
 *   2) Koyu yerler: gözler, burun, koyu lekeler sık taranır; parlak beyaz noktalar boş bırakılır.
 * Kâğıt modunda derse otomatik eklenir (ders dosyalarına yazılmaz).
 */
import { samplePath } from '../engine/pathSampler';
import type { HatchPass, Lesson, Shape, Step } from '../lessons/types';
import { hatchPath, innerShapes } from './hatch';
import { lightness } from './sketch';

export const SOFT_SAY = 'Şimdi gölgelendirme zamanı! Kalemi hafifçe tutarak büyük parçaları tara. Kenarlarda biraz daha bastır.';
export const DARK_SAY = 'Şimdi koyu yerleri kalemle sık sık tara. Parlak beyaz noktaları boş bırak!';

const cache = new Map<string, Lesson>();

export function withShading(lesson: Lesson): Lesson {
  const hit = cache.get(lesson.id);
  if (hit) return hit;
  const all: Shape[] = lesson.steps.flatMap((s) => s.shapes);
  const soft: HatchPass[] = [];
  const dark: HatchPass[] = [];
  all.forEach((shape, i) => {
    if (shape.guide || !shape.fill) return;
    if (samplePath(shape.d).length < 40) return; // parlaklık gibi minik şekiller
    const L = lightness(shape.fill);
    const holes = innerShapes(shape, all.slice(i + 1));
    const add = (list: HatchPass[], d: string, width: number, opacity: number) => d && list.push({ target: shape, d, width, opacity });
    if (L < 0.45) {
      add(dark, hatchPath(shape, { spacing: 3.4, angle: 38, holes }), 2.8, 0.85);
      if (L < 0.25) add(dark, hatchPath(shape, { spacing: 4.2, angle: -42, holes }), 2.2, 0.6);
    } else {
      if (L < 0.97) add(soft, hatchPath(shape, { spacing: 7, angle: 38, holes }), 1.6, 0.2 + (1 - L) * 0.55);
      add(soft, hatchPath(shape, { spacing: 3.6, angle: 38, holes, crescent: true }), 2, L < 0.97 ? 0.45 : 0.3);
    }
  });
  const extra: Step[] = [];
  if (soft.length) extra.push({ say: SOFT_SAY, shapes: [], hatch: soft });
  if (dark.length) extra.push({ say: DARK_SAY, shapes: [], hatch: dark });
  const out = { ...lesson, steps: [...lesson.steps, ...extra] };
  cache.set(lesson.id, out);
  return out;
}
