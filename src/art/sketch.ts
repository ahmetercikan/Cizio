/**
 * Kalem eskizi görünümü: ders şekillerini kâğıt üzerinde grafit (ya da kuru boya) çizimi gibi gösterir.
 *
 * - Çizgiler: hafif titreyen (feDisplacementMap), grenli (gürültü maskesi) ve çift geçişli kalem izi.
 * - Gölge: dolgu renginin açıklığına göre yumuşak grafit tonu + çapraz tarama (hatching).
 * - Renkli mod: aynı doku ile kuru boya görünümü.
 *
 * Saf metin üretir (DOM yok); böylece <img src="data:image/svg+xml,..."> olarak tarayıcıda bir kez
 * rasterleştirilir ve listelerde hızlı kalır. Canlı animasyon için aynı parçalar React tarafında kullanılır.
 */
import type { Lesson, Shape } from '../lessons/types';
import { samplePath } from '../engine/pathSampler';

export type SketchMode = 'graphite' | 'color';

export interface SketchOptions {
  mode?: SketchMode;
  /** Kâğıt zemini çiz (false ise şeffaf). */
  paper?: boolean;
  /** Yalnızca bu adıma kadar (dahil). */
  upto?: number;
  /** Tohum: aynı çizim hep aynı titreşimle görünsün. */
  seed?: number;
  /** Kenarlarda boşluk (viewBox'ı genişletir). */
  pad?: number;
}

export const GRAPHITE = '#2f2f36';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 0 (siyah) .. 1 (beyaz) algısal açıklık. */
export function lightness(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');

/** Filtre ve desen tanımları; `id` önekiyle çakışma olmaz. */
export function sketchDefs(id: string, seed = 7): string {
  return `
  <filter id="${id}-pencil" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="${seed + 3}" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.1" result="grainMask"/>
    <feComposite in="wobble" in2="grainMask" operator="in"/>
  </filter>
  <filter id="${id}-shade" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="${seed + 11}" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.2" result="grainMask"/>
    <feComposite in="wobble" in2="grainMask" operator="in"/>
  </filter>
  <pattern id="${id}-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
    <line x1="0" y1="0" x2="0" y2="5" stroke="${GRAPHITE}" stroke-width="1.1"/>
  </pattern>
  <pattern id="${id}-cross" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-42)">
    <line x1="0" y1="0" x2="0" y2="5" stroke="${GRAPHITE}" stroke-width="1"/>
  </pattern>
  <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="${id}-paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.96  0 0 0 0 0.955  0 0 0 0 0.94  0 0 0 -0.25 0.28"/>
    <feComposite in2="SourceGraphic" operator="over"/>
  </filter>`;
}

const tinyLen = (s: Shape) => samplePath(s.d).length < 40;

/** Dolgu (gölge) katmanı. */
export function shadeMarkup(id: string, shapes: Shape[], mode: SketchMode): string {
  let out = '';
  for (const s of shapes) {
    if (s.guide || !s.fill) continue;
    const d = esc(s.d);
    const L = lightness(s.fill);
    if (mode === 'color') {
      out += `<path d="${d}" fill="${s.fill}" fill-opacity="0.9" filter="url(#${id}-shade)"/>`;
      if (L < 0.85) out += `<path d="${d}" fill="url(#${id}-hatch)" opacity="${(0.08 + (1 - L) * 0.12).toFixed(2)}"/>`;
      continue;
    }
    // Grafit: açık renkler neredeyse beyaz kalır, koyular yoğun tarama alır.
    const dark = 1 - L;
    if (L > 0.97 && !tinyLen(s)) {
      // beyaz dolgular (göz parlaklığı dahil) altındakini örter
      out += `<path d="${d}" fill="#faf9f6"/>`;
      continue;
    }
    if (L > 0.97) {
      out += `<path d="${d}" fill="#fbfaf7"/>`;
      continue;
    }
    out += `<path d="${d}" fill="#faf9f6"/>`;
    out += `<path d="${d}" fill="${GRAPHITE}" fill-opacity="${(0.03 + dark * 0.36).toFixed(2)}" filter="url(#${id}-shade)"/>`;
    if (dark > 0.2) out += `<path d="${d}" fill="url(#${id}-hatch)" opacity="${Math.min(0.85, dark * 0.75).toFixed(2)}" filter="url(#${id}-shade)"/>`;
    if (dark > 0.62) out += `<path d="${d}" fill="url(#${id}-cross)" opacity="${Math.min(0.9, (dark - 0.45) * 1.3).toFixed(2)}" filter="url(#${id}-shade)"/>`;
    if (!tinyLen(s)) out += formShade(id, s, `${i++}`, 0.16 + dark * 0.22);
  }
  return out;
}

let i = 0;

/**
 * Hacim gölgesi: şeklin içinde, sağ-alt kenar boyunca koyulaşan yumuşak grafit (ışık sol üstten).
 * Şeklin konturu kaydırılıp kalın çizilir ve şekle kırpılır.
 */
function formShade(id: string, s: Shape, key: string, strength: number): string {
  const mid = `${id}-m${key}`;
  const d = esc(s.d);
  // maske: şekil (beyaz) eksi sol-üste kaydırılmış şekil (siyah, yumuşak) = sağ-alt hilal
  return `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="500" height="500"><path d="${d}" fill="#fff"/>` +
    `<path d="${d}" fill="#000" transform="translate(-11 -13)" filter="url(#${id}-soft)"/></mask>` +
    `<g mask="url(#${mid})" filter="url(#${id}-shade)"><rect x="-50" y="-50" width="500" height="500" fill="${GRAPHITE}" opacity="${strength.toFixed(2)}"/>` +
    `<rect x="-50" y="-50" width="500" height="500" fill="url(#${id}-hatch)" opacity="${Math.min(1, strength * 2.2).toFixed(2)}"/></g>`;
}

/** Çizgi katmanı: kalın ana iz + hafif kaydırılmış ince ikinci iz. */
export function lineMarkup(id: string, shapes: Shape[], color = GRAPHITE, width = 2.8): string {
  let out = '';
  for (const s of shapes) {
    const d = esc(s.d);
    if (s.guide) {
      out += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.22" stroke-width="1.4" stroke-dasharray="3 6" stroke-linecap="round"/>`;
      continue;
    }
    if (s.fill && tinyLen(s)) continue; // minik dolu şekiller (parlaklık) kontursuz
    out += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-pencil)"/>`;
    out += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="${(width * 0.45).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0.9 0.7)" filter="url(#${id}-pencil)"/>`;
  }
  return out;
}

export function lessonShapes(lesson: Lesson, upto?: number): Shape[] {
  return lesson.steps.slice(0, upto === undefined ? undefined : upto + 1).flatMap((s) => s.shapes);
}

let uid = 0;

/** Bağımsız bir SVG belgesi üretir. */
export function sketchSvg(shapes: Shape[], opts: SketchOptions = {}): string {
  const id = `sk${(uid++).toString(36)}`;
  const mode = opts.mode ?? 'graphite';
  const pad = opts.pad ?? 0;
  const vb = `${-pad} ${-pad} ${400 + pad * 2} ${400 + pad * 2}`;
  const paper = opts.paper
    ? `<rect x="${-pad}" y="${-pad}" width="${400 + pad * 2}" height="${400 + pad * 2}" fill="#f7f6f2" filter="url(#${id}-paper)"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${sketchDefs(id, opts.seed)}</defs>${paper}${shadeMarkup(id, shapes, mode)}${lineMarkup(id, shapes)}</svg>`;
}

const urlCache = new Map<string, string>();

/** Derse ait eskizin data URL'si (önbellekli). */
export function lessonSketchUrl(lesson: Lesson, opts: SketchOptions = {}): string {
  const key = `${lesson.id}|${opts.mode ?? 'graphite'}|${opts.paper ? 1 : 0}|${opts.upto ?? 'all'}|${opts.pad ?? 0}`;
  let u = urlCache.get(key);
  if (!u) {
    u = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sketchSvg(lessonShapes(lesson, opts.upto), opts))}`;
    urlCache.set(key, u);
  }
  return u;
}
