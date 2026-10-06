/**
 * Çocuğun çizimini canlandırılabilir bir "iskelete" çevirir.
 *
 * Ekranda çizilen ders resimlerinde her kalem darbesi hangi ders adımında çizildiğini bilir. Darbeler, o adımın
 * şekillerinden en yakın olana atanır; hareketli parçalara (göz, tekerlek, kuyruk, kanat, kol, kulak…) ait
 * darbeler ve o parçanın içindeki boya ayrı bir katmana alınır. Gövde (taban) katmanında parçanın yeri,
 * çevresindeki renkle doldurulur (göz kırpınca arkada yüz rengi görünsün diye).
 *
 * Kâğıt fotoğrafı ya da darbe kaydı olmayan eski resimlerde parça yoktur: arka plan saydamlaştırılır ve resim
 * bir bütün olarak hareket eder.
 */
import { DrawingDoc, paintStamp, paintStroke, RES } from '../engine/drawingDoc';
import { samplePath, type Pt } from '../engine/pathSampler';
import type { DrawAction, StrokeAction } from '../engine/types';
import type { Lesson } from '../lessons/types';
import { partGroup, partMotion, type PartMotion } from './motion';

/** İskelet çözünürlüğü (kare). */
export const RIG = 512;
const S = RIG / 400;

export interface Piece {
  canvas: HTMLCanvasElement;
  motion: PartMotion;
  /** Döndürme noktası ve merkez (iskelet pikseli). */
  pivot: Pt;
  center: Pt;
  /** Gövdenin sağında +1, solunda -1 (kanat/kol simetrik çırpsın diye). */
  side: number;
  phase: number;
}

export interface Rig {
  base: HTMLCanvasElement;
  pieces: Piece[];
  /** Çizimin dolu kısmının sınırları (iskelet pikseli). */
  box: { x: number; y: number; w: number; h: number };
}

function canvas(size = RIG) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return { c, ctx: c.getContext('2d', { willReadFrequently: true })! };
}

const meanDist = (pts: Pt[], target: Pt[]) => {
  let sum = 0;
  for (const p of pts) {
    let best = Infinity;
    for (const q of target) {
      const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
      if (d < best) best = d;
    }
    sum += Math.sqrt(best);
  }
  return sum / Math.max(1, pts.length);
};

interface ShapeInfo { d: string; step: number; group?: string; pts: Pt[] }

/** Ders çiziminin (eylemler) iskeleti: taban + hareketli parçalar. */
export function rigFromActions(actions: DrawAction[], lesson?: Lesson): Rig {
  const doc = new DrawingDoc();
  doc.setActions(actions);
  const { fill } = doc.layers;

  // Ders şekilleri ve hareketli gruplar
  const shapes: ShapeInfo[] = [];
  const motions = new Map<string, PartMotion>();
  lesson?.steps.forEach((st, i) =>
    st.shapes.forEach((sh) => {
      if (sh.guide || !sh.d) return;
      const g = sh.part ? partGroup(sh.part) : undefined;
      const m = g ? partMotion(g, lesson) : undefined;
      if (g && m) motions.set(g, m);
      shapes.push({ d: sh.d, step: i, group: m ? g : undefined, pts: samplePath(sh.d, 5).points });
    }),
  );

  // Darbeleri en yakın şekle ata
  const assign = new Map<StrokeAction, string>();
  if (motions.size) {
    for (const a of actions) {
      if (a.kind !== 'stroke' || a.tool === 'eraser') continue;
      const pts = a.points.filter((_, i) => i % 3 === 0).map((p) => [p[0], p[1]] as Pt);
      if (!pts.length) continue;
      const cands = shapes.filter((s) => s.step === a.step);
      let best: ShapeInfo | undefined, bd = Infinity;
      for (const s of cands.length ? cands : shapes) {
        const d = meanDist(pts, s.pts);
        if (d < bd) [bd, best] = [d, s];
      }
      if (best?.group && bd < 20) assign.set(a, best.group);
    }
  }
  const groups = [...motions.keys()].filter((g) => [...assign.values()].includes(g));

  // Çizgi katmanları: her katman için darbeleri yeniden çiz (silgi hepsine uygulanır)
  const scratch = canvas(RES);
  const lineOf = (layer: string | null) => {
    scratch.ctx.clearRect(0, 0, RES, RES);
    for (const a of actions) {
      if (a.kind === 'stamp') { if (layer === null) paintStamp(scratch.ctx, a); continue; }
      if (a.kind !== 'stroke') continue;
      if (a.tool === 'eraser' || (assign.get(a) ?? null) === layer) paintStroke(scratch.ctx, a);
    }
    const out = canvas();
    out.ctx.drawImage(scratch.c, 0, 0, RIG, RIG);
    return out;
  };

  // Boya: tabandan parçaların yeri çıkarılır, parçalar kendi boyasını alır
  const fill512 = canvas();
  fill512.ctx.drawImage(fill, 0, 0, RIG, RIG);
  const fillData = fill512.ctx.getImageData(0, 0, RIG, RIG).data;
  const baseFill = canvas();
  baseFill.ctx.drawImage(fill512.c, 0, 0);

  const all = shapes.flatMap((s) => s.pts);
  const C: Pt = all.length ? [all.reduce((a, p) => a + p[0], 0) / all.length, all.reduce((a, p) => a + p[1], 0) / all.length] : [200, 200];

  const pieces: Piece[] = [];
  groups.forEach((g, gi) => {
    const own = shapes.filter((s) => s.group === g);
    const pts = own.flatMap((s) => s.pts);
    const path = new Path2D();
    for (const s of own) path.addPath(new Path2D(s.d));
    const scaled = new Path2D();
    scaled.addPath(path, new DOMMatrix().scale(S, S));
    const paintMask = (ctx: CanvasRenderingContext2D, grow = 9) => {
      ctx.fill(scaled);
      ctx.lineWidth = grow * S;
      ctx.lineJoin = 'round';
      ctx.stroke(scaled);
    };

    // Parçanın çevresindeki renk (yarıdan fazlası boyalıysa tabanda parçanın yeri bu renkle doldurulur)
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const gc: Pt = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    const counts = new Map<string, number>();
    let opaque = 0;
    for (const p of pts) {
      const dx = p[0] - gc[0], dy = p[1] - gc[1], l = Math.hypot(dx, dy) || 1;
      const x = Math.round((p[0] + (dx / l) * 10) * S), y = Math.round((p[1] + (dy / l) * 10) * S);
      if (x < 0 || y < 0 || x >= RIG || y >= RIG) continue;
      const k = (y * RIG + x) * 4;
      if (fillData[k + 3] < 200) continue;
      opaque++;
      const key = `${fillData[k] >> 3},${fillData[k + 1] >> 3},${fillData[k + 2] >> 3}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    baseFill.ctx.save();
    baseFill.ctx.globalCompositeOperation = 'destination-out';
    baseFill.ctx.fillStyle = baseFill.ctx.strokeStyle = '#000';
    // Tabandan yalnızca parçanın kendi alanı çıkarılır: parça oynarken kenarında boşluk (arka plan) görünmesin
    paintMask(baseFill.ctx, 2);
    baseFill.ctx.restore();
    if (opaque > pts.length * 0.55) {
      const [r, gg, b] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map((n) => (Number(n) << 3) + 4);
      baseFill.ctx.fillStyle = baseFill.ctx.strokeStyle = `rgb(${r},${gg},${b})`;
      paintMask(baseFill.ctx);
    }

    const piece = canvas();
    piece.ctx.drawImage(fill512.c, 0, 0);
    piece.ctx.globalCompositeOperation = 'destination-in';
    piece.ctx.fillStyle = piece.ctx.strokeStyle = '#000';
    paintMask(piece.ctx);
    piece.ctx.globalCompositeOperation = 'source-over';
    piece.ctx.drawImage(lineOf(g).c, 0, 0);

    const motion = motions.get(g)!;
    let pivot = gc;
    if (motion !== 'blink' && motion !== 'spin') {
      let bd = Infinity;
      for (const p of pts) {
        const d = (p[0] - C[0]) ** 2 + (p[1] - C[1]) ** 2;
        if (d < bd) [bd, pivot] = [d, p];
      }
    }
    pieces.push({
      canvas: piece.c,
      motion,
      pivot: [pivot[0] * S, pivot[1] * S],
      center: [gc[0] * S, gc[1] * S],
      side: gc[0] >= C[0] ? 1 : -1,
      phase: gi * 0.9,
    });
  });

  const base = canvas();
  base.ctx.drawImage(baseFill.c, 0, 0);
  base.ctx.drawImage(lineOf(null).c, 0, 0);
  return { base: base.c, pieces, box: contentBox([base.c, ...pieces.map((p) => p.canvas)]) };
}

/** Fotoğraf/eski resim: kenarlardan başlayarak zemin rengini saydamlaştırır. */
export async function rigFromBlob(blob: Blob): Promise<Rig> {
  const bmp = await createImageBitmap(blob);
  const { c, ctx } = canvas();
  const k = Math.min(RIG / bmp.width, RIG / bmp.height);
  const w = bmp.width * k, h = bmp.height * k;
  ctx.drawImage(bmp, (RIG - w) / 2, (RIG - h) / 2, w, h);
  bmp.close?.();
  const img = ctx.getImageData(0, 0, RIG, RIG);
  knockOut(img.data, RIG, (RIG - w) / 2, (RIG - h) / 2, w, h);
  ctx.putImageData(img, 0, 0);
  return { base: c, pieces: [], box: contentBox([c]) };
}

/** Kenara bağlı, zemine benzeyen pikselleri saydam yapar (taşma dolgusu). */
export function knockOut(d: Uint8ClampedArray, n: number, x0: number, y0: number, w: number, h: number) {
  const X0 = Math.ceil(x0), Y0 = Math.ceil(y0), X1 = Math.floor(x0 + w) - 1, Y1 = Math.floor(y0 + h) - 1;
  // Zemin rengi: kenar piksellerinin ortancası
  const border: number[][] = [];
  for (let x = X0; x <= X1; x += 4) border.push(px(d, n, x, Y0), px(d, n, x, Y1));
  for (let y = Y0; y <= Y1; y += 4) border.push(px(d, n, X0, y), px(d, n, X1, y));
  const med = [0, 1, 2].map((i) => border.map((b) => b[i]).sort((a, b) => a - b)[border.length >> 1]);
  const close = (i: number) => Math.abs(d[i] - med[0]) + Math.abs(d[i + 1] - med[1]) + Math.abs(d[i + 2] - med[2]) < 90;
  const seen = new Uint8Array(n * n);
  const stack: number[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (x < X0 || x > X1 || y < Y0 || y > Y1) { seen[y * n + x] = 1; d[(y * n + x) * 4 + 3] = 0; }
  }
  const push = (x: number, y: number) => { const i = y * n + x; if (!seen[i]) { seen[i] = 1; stack.push(i); } };
  for (let x = X0; x <= X1; x++) { push(x, Y0); push(x, Y1); }
  for (let y = Y0; y <= Y1; y++) { push(X0, y); push(X1, y); }
  while (stack.length) {
    const i = stack.pop()!;
    if (!close(i * 4)) continue;
    d[i * 4 + 3] = 0;
    const x = i % n, y = (i / n) | 0;
    if (x > X0) push(x - 1, y);
    if (x < X1) push(x + 1, y);
    if (y > Y0) push(x, y - 1);
    if (y < Y1) push(x, y + 1);
  }
}
const px = (d: Uint8ClampedArray, n: number, x: number, y: number) => { const i = (y * n + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };

function contentBox(layers: HTMLCanvasElement[]) {
  const { c, ctx } = canvas();
  for (const l of layers) ctx.drawImage(l, 0, 0);
  const d = ctx.getImageData(0, 0, RIG, RIG).data;
  let x0 = RIG, y0 = RIG, x1 = -1, y1 = -1;
  for (let y = 0; y < RIG; y += 2) for (let x = 0; x < RIG; x += 2) {
    if (d[(y * RIG + x) * 4 + 3] > 24) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  void c;
  if (x1 < 0) return { x: 0, y: 0, w: RIG, h: RIG };
  return { x: x0, y: y0, w: x1 - x0 + 2, h: y1 - y0 + 2 };
}

/** Bir parçanın t anındaki dönüşümü. */
function pieceTransform(p: Piece, t: number, speed: number): DOMMatrix {
  const m = new DOMMatrix();
  const rot = (a: number) => m.translate(p.pivot[0], p.pivot[1]).rotate((a * 180) / Math.PI).translate(-p.pivot[0], -p.pivot[1]);
  switch (p.motion) {
    case 'blink': {
      const u = (t % 3.4) / 0.2;
      const k = u < 1 ? 1 - 0.88 * Math.sin(Math.PI * u) : 1;
      return m.translate(p.center[0], p.center[1]).scale(1, k).translate(-p.center[0], -p.center[1]);
    }
    case 'spin':
      return m.translate(p.center[0], p.center[1]).rotate(((t * speed * 300) % 360)).translate(-p.center[0], -p.center[1]);
    case 'wag': return rot(0.26 * Math.sin(t * 6 + p.phase));
    case 'flap': return rot(0.38 * Math.sin(t * 10) * p.side);
    case 'wave': return rot(0.28 * Math.sin(t * 4 + p.phase) * p.side);
    case 'twitch': {
      const u = (t + p.phase) % 2.8;
      return rot(u < 0.4 ? 0.14 * Math.sin(u * Math.PI * 5) * p.side : 0);
    }
    case 'bob': return rot(0.1 * Math.sin(t * 3 + p.phase) * p.side);
  }
}

/**
 * İskeleti çizer: çizimin dolu kısmı (box) hedefte `size` yüksekliğe sığacak şekilde, merkezi (cx, cy) olacak
 * biçimde. `spin` tekerlek hızı (sürüşte artar).
 */
export function drawRig(ctx: CanvasRenderingContext2D, rig: Rig, t: number, cx: number, cy: number, size: number, opts: { flip?: boolean; spin?: number; parts?: boolean } = {}) {
  const { box } = rig;
  const k = size / Math.max(box.w, box.h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(opts.flip ? -k : k, k);
  ctx.translate(-(box.x + box.w / 2), -(box.y + box.h / 2));
  ctx.drawImage(rig.base, 0, 0);
  for (const p of rig.pieces) {
    ctx.save();
    if (opts.parts !== false) {
      const m = pieceTransform(p, t, opts.spin ?? 1);
      ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }
    ctx.drawImage(p.canvas, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/** Galerideki bir resmin iskeleti: darbe kaydı varsa parçalarla, yoksa fotoğraftan. */
export async function rigOf(art: { blob: Blob; actions?: DrawAction[] }, lesson?: Lesson): Promise<Rig> {
  if (art.actions?.length) return rigFromActions(art.actions, lesson);
  return rigFromBlob(art.blob);
}
