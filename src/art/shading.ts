/**
 * Gölgelendirme adımları: çizgiler bittikten sonra kalemin gölgeyi bir ressam gibi nasıl verdiğini gösterir.
 *
 * Işık sol üstten gelir. Her dolu parça için:
 *   1) Yumuşak gölge: tüm parça hafifçe taranır; tarama ışık tarafında neredeyse görünmez, gölge tarafına
 *      doğru koyulaşır (ton geçişi). Sağ-alt kenarda sık tarama + çapraz tarama "gölge çekirdeğini" oluşturur.
 *   2) Koyu yerler: gözler, burun, koyu lekeler sık ve çapraz taranır; parlak beyaz noktalar boş bırakılır.
 *   3) Dağıtma: kâğıt kalem (ya da parmak / mendil) ile taramalar yumuşak bir tona dönüştürülür.
 * Kâğıt modunda derse otomatik eklenir (ders dosyalarına yazılmaz).
 */
import { samplePath } from '../engine/pathSampler';
import type { BlendPass, HatchPass, Lesson, LightAxis, Shape, Step } from '../lessons/types';
import { hatchPath, innerShapes } from './hatch';
import { lightness } from './sketch';

export const SOFT_SAY = 'Şimdi gölgelendirme zamanı! Kalemi hafifçe tutarak büyük parçaları tara. Kenarlarda biraz daha bastır.';
export const DARK_SAY = 'Şimdi koyu yerleri kalemle sık sık tara. Parlak beyaz noktaları boş bırak!';
export const BLEND_SAY = 'Şimdi parmağınla ya da bir kâğıt mendille gölgeleri hafifçe dağıt. Yumuşacık olsun!';

const cache = new Map<string, Lesson>();

/** Parçanın ışık ekseni: sınır kutusunun sol üst köşesinden sağ alt köşesine. */
function axisOf(s: Shape): LightAxis {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of samplePath(s.d, 8).points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}

export function withShading(lesson: Lesson): Lesson {
  const hit = cache.get(lesson.id);
  if (hit) return hit;
  const all: Shape[] = lesson.steps.flatMap((s) => s.shapes);
  const soft: HatchPass[] = [];
  const dark: HatchPass[] = [];
  const blend: BlendPass[] = [];
  all.forEach((shape, i) => {
    if (shape.guide || !shape.fill) return;
    if (samplePath(shape.d).length < 40) return; // parlaklık gibi minik şekiller
    const L = lightness(shape.fill);
    const holes = innerShapes(shape, all.slice(i + 1));
    const axis = axisOf(shape);
    const add = (list: HatchPass[], d: string, p: Omit<HatchPass, 'target' | 'd'>) => d && list.push({ target: shape, d, ...p });
    if (L < 0.45) {
      add(dark, hatchPath(shape, { spacing: 3.2, angle: 38, holes }), { width: 2.6, opacity: 0.85, axis, from: 0.6, to: 1 });
      if (L < 0.25) add(dark, hatchPath(shape, { spacing: 3.8, angle: -42, holes }), { width: 2.1, opacity: 0.65, axis, from: 0.3, to: 1 });
      blend.push({ target: shape, opacity: 0.55, axis });
    } else {
      if (L < 0.97)
        add(soft, hatchPath(shape, { spacing: 5.5, angle: 38, holes }), { width: 1.7, opacity: 0.18 + (1 - L) * 0.6, axis, from: 0.12, to: 1 });
      add(soft, hatchPath(shape, { spacing: 3.4, angle: 38, holes, crescent: true }), {
        width: 1.9, opacity: L < 0.97 ? 0.5 : 0.32, axis, from: 0.4, to: 1,
      });
      if (L < 0.85)
        add(soft, hatchPath(shape, { spacing: 4.2, angle: -40, holes, crescent: true }), { width: 1.6, opacity: 0.35, axis, from: 0.3, to: 1 });
      blend.push({ target: shape, opacity: L < 0.97 ? 0.12 + (1 - L) * 0.35 : 0.1, axis });
    }
  });
  const extra: Step[] = [];
  if (soft.length) extra.push({ say: SOFT_SAY, shapes: [], hatch: soft });
  if (dark.length) extra.push({ say: DARK_SAY, shapes: [], hatch: dark });
  if (blend.length) extra.push({ say: BLEND_SAY, shapes: [], blend });
  const out = { ...lesson, steps: [...lesson.steps, ...extra] };
  cache.set(lesson.id, out);
  return out;
}
