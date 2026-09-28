/**
 * Çizim belgesi: eylem geçmişi (geri al / yinele) ve iki raster katman.
 *   - boya katmanı (fillLayer): boya kovası sonuçları, altta
 *   - çizgi katmanı (lineLayer): kalem/fırça darbeleri, üstte
 * Tüm eylemler 400x400 ders koordinatlarında saklanır; katmanlar RES x RES çözünürlüktedir.
 */
import { getStroke } from 'perfect-freehand';
import { fillRegion, hexToRgb } from './floodFill';
import type { DrawAction, FillAction, StrokeAction } from './types';

export const RES = 1536;
export const UNIT = RES / 400;

type Canvas2D = HTMLCanvasElement;

function makeLayer(): { canvas: Canvas2D; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = RES;
  canvas.height = RES;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return { canvas, ctx };
}

const TOOL_OPTS = {
  pencil: { thinning: 0.55, smoothing: 0.5, streamline: 0.45 },
  marker: { thinning: 0, smoothing: 0.6, streamline: 0.5 },
  brush: { thinning: 0.75, smoothing: 0.7, streamline: 0.5, start: { taper: 12 }, end: { taper: 18 } },
  eraser: { thinning: 0, smoothing: 0.5, streamline: 0.4 },
} as const;

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

export function paintStroke(ctx: CanvasRenderingContext2D, s: StrokeAction) {
  ctx.save();
  if (s.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
  if (s.tool === 'marker') ctx.globalAlpha = 0.85;
  ctx.fillStyle = s.color;
  ctx.fill(strokePath(s, hasRealPressure(s)));
  ctx.restore();
}

export class DrawingDoc {
  actions: DrawAction[] = [];
  private redoStack: DrawAction[] = [];
  private line = makeLayer();
  private fill = makeLayer();
  private listeners = new Set<() => void>();

  onChange(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((f) => f());
  }

  get canUndo() {
    return this.actions.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }

  commit(a: DrawAction) {
    if (a.kind === 'fill' && !this.applyFill(a)) return;
    if (a.kind === 'stroke') this.applyStroke(a);
    this.actions.push(a);
    this.redoStack = [];
    this.emit();
  }

  undo() {
    const a = this.actions.pop();
    if (!a) return;
    this.redoStack.push(a);
    this.rebuild();
  }

  redo() {
    const a = this.redoStack.pop();
    if (!a) return;
    this.actions.push(a);
    if (a.kind === 'fill') this.applyFill(a);
    else this.applyStroke(a);
    this.emit();
  }

  clear() {
    this.actions = [];
    this.redoStack = [];
    this.rebuild();
  }

  /** Belirli eylemleri kaldırır (ör. bir adımı "tekrar dene"). */
  removeWhere(pred: (a: DrawAction) => boolean) {
    this.actions = this.actions.filter((a) => !pred(a));
    this.redoStack = [];
    this.rebuild();
  }

  setActions(actions: DrawAction[]) {
    this.actions = [...actions];
    this.redoStack = [];
    this.rebuild();
  }

  strokes(pred?: (s: StrokeAction) => boolean): StrokeAction[] {
    return this.actions.filter((a): a is StrokeAction => a.kind === 'stroke' && (!pred || pred(a)));
  }

  private rebuild() {
    this.line.ctx.clearRect(0, 0, RES, RES);
    this.fill.ctx.clearRect(0, 0, RES, RES);
    for (const a of this.actions) {
      if (a.kind === 'fill') this.applyFill(a);
      else this.applyStroke(a);
    }
    this.emit();
  }

  private applyStroke(s: StrokeAction) {
    paintStroke(this.line.ctx, s);
    if (s.tool === 'eraser') paintStroke(this.fill.ctx, s);
  }

  private applyFill(a: FillAction): boolean {
    const img = this.line.ctx.getImageData(0, 0, RES, RES);
    const region = fillRegion(img.data, RES, RES, a.at[0] * UNIT, a.at[1] * UNIT);
    if (!region) return false;
    const [r, g, b] = hexToRgb(a.color);
    const out = this.fill.ctx.getImageData(0, 0, RES, RES);
    const d = out.data;
    for (let i = 0; i < region.length; i++) {
      if (!region[i]) continue;
      const k = i * 4;
      d[k] = r;
      d[k + 1] = g;
      d[k + 2] = b;
      d[k + 3] = 255;
    }
    this.fill.ctx.putImageData(out, 0, 0);
    return true;
  }

  /** Katmanları hedef tuvale çizer (önce boya, sonra çizgi). */
  compose(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.fill.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.line.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  isEmpty() {
    return !this.actions.some((a) => a.kind === 'fill' || a.tool !== 'eraser');
  }

  /** Beyaz zeminli PNG olarak dışa aktarır. `under` verilirse (ör. rehber çizgiler) altına çizilir. */
  async toBlob(under?: CanvasImageSource): Promise<Blob> {
    const { canvas, ctx } = makeLayer();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, RES, RES);
    if (under) ctx.drawImage(under, 0, 0, RES, RES);
    this.compose(ctx);
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
  }
}
