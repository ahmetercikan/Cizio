/**
 * Çizim belgesi: eylem geçmişi (geri al / yinele) ve iki raster katman.
 *   - boya katmanı (fillLayer): boya kovası sonuçları, altta
 *   - çizgi katmanı (lineLayer): kalem/fırça darbeleri, üstte
 * Tüm eylemler 400x400 ders koordinatlarında saklanır; katmanlar RES x RES çözünürlüktedir.
 */
import { paintStamp, paintStroke, patternHit, RES, UNIT } from './brushes';
import { fillRegion, hexToRgb } from './floodFill';
import type { DrawAction, FillAction, StampAction, StrokeAction } from './types';

export { hasRealPressure, paintStamp, paintStroke, RES, strokePath, UNIT } from './brushes';

type Canvas2D = HTMLCanvasElement;

function makeLayer(): { canvas: Canvas2D; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = RES;
  canvas.height = RES;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return { canvas, ctx };
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
    if (a.kind === 'stamp') this.applyStamp(a);
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
    this.apply(a);
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
    for (const a of this.actions) this.apply(a);
    this.emit();
  }

  private apply(a: DrawAction) {
    if (a.kind === 'fill') this.applyFill(a);
    else if (a.kind === 'stamp') this.applyStamp(a);
    else this.applyStroke(a);
  }

  private applyStamp(a: StampAction) {
    paintStamp(this.line.ctx, a);
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
    // Desenli boyada zemin, rengin açık tonudur.
    const [lr, lg, lb] = [r, g, b].map((c) => Math.round(c + (255 - c) * 0.72));
    const pattern = a.pattern ?? 'solid';
    const out = this.fill.ctx.getImageData(0, 0, RES, RES);
    const d = out.data;
    for (let i = 0; i < region.length; i++) {
      if (!region[i]) continue;
      const k = i * 4;
      const motif = pattern === 'solid' || patternHit(pattern, i % RES, (i / RES) | 0);
      d[k] = motif ? r : lr;
      d[k + 1] = motif ? g : lg;
      d[k + 2] = motif ? b : lb;
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
    return !this.actions.some((a) => a.kind !== 'stroke' || a.tool !== 'eraser');
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
