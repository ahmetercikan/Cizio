/**
 * Fırça ve kalem türlerinin çizimi.
 *   pencil / marker / brush — perfect-freehand dış hattı, düz dolgu
 *   crayon     — pastel boya: renkli, grenli doku (kâğıdın boşlukları görünür)
 *   watercolor — sulu boya: saydam, üst üste bindikçe koyulaşır (multiply), kenarı hafif belirgin
 *   rainbow    — gökkuşağı: çizgi boyunca renk değişir
 *   glitter    — simli: renkli çizgi üstünde parıltılar
 *   eraser     — silgi
 * Ayrıca damga (emoji) ve desenli boya kovası desenleri.
 */
import { getStroke } from 'perfect-freehand';
import { resample } from './pathSampler';
import type { FillPattern, StampAction, StrokeAction } from './types';

export const RES = 1536;
export const UNIT = RES / 400;

const TOOL_OPTS: Record<string, object> = {
  pencil: { thinning: 0.55, smoothing: 0.5, streamline: 0.45 },
  crayon: { thinning: 0.35, smoothing: 0.5, streamline: 0.45 },
  marker: { thinning: 0, smoothing: 0.6, streamline: 0.5 },
  brush: { thinning: 0.75, smoothing: 0.7, streamline: 0.5, start: { taper: 12 }, end: { taper: 18 } },
  watercolor: { thinning: 0.6, smoothing: 0.8, streamline: 0.55, start: { taper: 20 }, end: { taper: 20 } },
  glitter: { thinning: 0.2, smoothing: 0.6, streamline: 0.5 },
  rainbow: { thinning: 0, smoothing: 0.6, streamline: 0.5 },
  eraser: { thinning: 0, smoothing: 0.5, streamline: 0.4 },
};

/** perfect-freehand dış hattını bir Path2D'ye çevirir. */
export function strokePath(s: StrokeAction, hasPressure: boolean): Path2D {
  const outline = getStroke(s.points, {
    size: s.size,
    simulatePressure: !hasPressure,
    last: true,
    ...TOOL_OPTS[s.tool],
  } as Parameters<typeof getStroke>[1]).map(([x, y]) => [x * UNIT, y * UNIT]);
  const p = new Path2D();
  if (outline.length === 0) return p;
  if (s.points.length === 1 || outline.length < 4) {
    const [x, y] = s.points[0];
    p.arc(x * UNIT, y * UNIT, (s.size * UNIT) / 2, 0, Math.PI * 2);
    return p;
  }
  p.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length - 1; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[i + 1];
    p.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  p.closePath();
  return p;
}

/** Noktalardan gerçek basınç bilgisi var mı (kalem)? Fare/parmakta p sabit 0.5 gelir. */
export const hasRealPressure = (s: StrokeAction) => s.points.some((p) => p[2] !== 0.5);

/** Belirleyici rastgele sayı üreteci: aynı darbe her yeniden çizimde aynı görünsün. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s: StrokeAction) => Math.floor(s.points[0][0] * 7919 + s.points[0][1] * 104729 + s.points.length * 31);

// --- Pastel boya dokusu ------------------------------------------------------------------------
const crayonCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern>>();
function crayonPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern | string {
  let byColor = crayonCache.get(ctx);
  if (!byColor) crayonCache.set(ctx, (byColor = new Map()));
  const hit = byColor.get(color);
  if (hit) return hit;
  const N = 96;
  const c = document.createElement('canvas');
  c.width = N;
  c.height = N;
  const cx = c.getContext('2d');
  if (!cx) return color;
  cx.fillStyle = color;
  cx.fillRect(0, 0, N, N);
  const img = cx.getImageData(0, 0, N, N);
  const r = rng(1234);
  // Kâğıt dokusu: yatay hafif lifler + rastgele boşluklar
  const rowBias = Array.from({ length: N }, () => 0.75 + r() * 0.25);
  for (let i = 0; i < N * N; i++) {
    const y = Math.floor(i / N);
    const v = r();
    const a = v < 0.18 ? 0.08 : v < 0.35 ? 0.55 : 0.95;
    img.data[i * 4 + 3] = Math.round(255 * a * rowBias[y]);
  }
  cx.putImageData(img, 0, 0);
  const pat = ctx.createPattern(c, 'repeat');
  if (!pat) return color;
  byColor.set(color, pat);
  return pat;
}

// --- Darbe çizimi ------------------------------------------------------------------------------
export function paintStroke(ctx: CanvasRenderingContext2D, s: StrokeAction) {
  ctx.save();
  switch (s.tool) {
    case 'eraser':
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';
      ctx.fill(strokePath(s, hasRealPressure(s)));
      break;
    case 'marker':
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = s.color;
      ctx.fill(strokePath(s, hasRealPressure(s)));
      break;
    case 'crayon':
      ctx.fillStyle = crayonPattern(ctx, s.color);
      ctx.fill(strokePath(s, hasRealPressure(s)));
      break;
    case 'watercolor': {
      const path = strokePath(s, hasRealPressure(s));
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.38;
      ctx.fillStyle = s.color;
      if ('filter' in ctx) ctx.filter = `blur(${(UNIT * 0.6).toFixed(1)}px)`;
      ctx.fill(path);
      ctx.filter = 'none';
      // Sulu boyada kuruyan kenar biraz koyu kalır.
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = UNIT * 0.9;
      ctx.stroke(path);
      break;
    }
    case 'rainbow': {
      const pts = s.points.length > 1 ? resample(s.points.map((p) => [p[0], p[1]] as [number, number]), 1.2) : [[s.points[0][0], s.points[0][1]] as [number, number]];
      const r = (s.size * UNIT) / 2;
      const hue0 = seedOf(s) % 360;
      pts.forEach(([x, y], i) => {
        ctx.fillStyle = `hsl(${(hue0 + i * 2.2) % 360} 88% 58%)`;
        ctx.beginPath();
        ctx.arc(x * UNIT, y * UNIT, r, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'glitter': {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = s.color;
      ctx.fill(strokePath(s, hasRealPressure(s)));
      ctx.globalAlpha = 1;
      const r = rng(seedOf(s));
      const pts = s.points.length > 1 ? resample(s.points.map((p) => [p[0], p[1]] as [number, number]), 2.2) : [[s.points[0][0], s.points[0][1]] as [number, number]];
      for (const [x, y] of pts) {
        for (let k = 0; k < 2; k++) {
          const ang = r() * Math.PI * 2;
          const dist = r() * s.size * 0.45;
          const px = (x + Math.cos(ang) * dist) * UNIT, py = (y + Math.sin(ang) * dist) * UNIT;
          const sz = (0.5 + r() * 1.4) * UNIT;
          ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.95)' : 'rgba(255,236,150,0.95)';
          // dört köşeli parıltı
          ctx.beginPath();
          ctx.moveTo(px, py - sz * 1.6);
          ctx.lineTo(px + sz * 0.35, py - sz * 0.35);
          ctx.lineTo(px + sz * 1.6, py);
          ctx.lineTo(px + sz * 0.35, py + sz * 0.35);
          ctx.lineTo(px, py + sz * 1.6);
          ctx.lineTo(px - sz * 0.35, py + sz * 0.35);
          ctx.lineTo(px - sz * 1.6, py);
          ctx.lineTo(px - sz * 0.35, py - sz * 0.35);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }
    default:
      ctx.fillStyle = s.color;
      ctx.fill(strokePath(s, hasRealPressure(s)));
  }
  ctx.restore();
}

// --- Damga -------------------------------------------------------------------------------------
export const STAMPS = ['⭐', '❤️', '🌸', '🦋', '🌈', '☀️', '🎈', '🍭', '🐞', '🍀', '✨', '🎀', '🐾', '🌙', '🍓', '🐟'];

export function paintStamp(ctx: CanvasRenderingContext2D, a: StampAction) {
  ctx.save();
  ctx.translate(a.at[0] * UNIT, a.at[1] * UNIT);
  ctx.rotate((a.rot * Math.PI) / 180);
  ctx.font = `${Math.round(a.size * UNIT)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(a.stamp, 0, 0);
  ctx.restore();
}

// --- Desenli boya kovası -----------------------------------------------------------------------
/**
 * (x, y) pikselinde desenin "motif" mi yoksa "zemin" mi olduğunu söyler.
 * Zemin rengin açık tonu, motif rengin kendisidir.
 */
export function patternHit(p: FillPattern, x: number, y: number): boolean {
  switch (p) {
    case 'dots': {
      const s = 44, row = Math.floor(y / s);
      const ox = row % 2 ? s / 2 : 0;
      const dx = ((x + ox) % s) - s / 2, dy = (y % s) - s / 2;
      return dx * dx + dy * dy < 12 * 12;
    }
    case 'stripes':
      return (x + y) % 40 < 16;
    case 'checks':
      return (Math.floor(x / 34) + Math.floor(y / 34)) % 2 === 0;
    case 'hearts': {
      const s = 56, row = Math.floor(y / s);
      const ox = row % 2 ? s / 2 : 0;
      const u = (((x + ox) % s) - s / 2) / 15, v = -(((y % s) - s / 2) / 15) + 0.25;
      const q = u * u + v * v - 1;
      return q * q * q - u * u * v * v * v < 0;
    }
    default:
      return true;
  }
}
