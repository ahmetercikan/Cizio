/**
 * Kâğıt modu sonu: çocuk çizimini fotoğraflar, uygulama ders çizimini fotoğrafın üstüne
 * otomatik hizalayarak bindirir; çocuk kendi çizimiyle örneği karşılaştırır ve kendini değerlendirir.
 * Fotoğraf cihazdan çıkmaz.
 */
import { Camera, ImagePlus, Minus, Move, Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { samplePath } from '../engine/pathSampler';
import type { Lesson } from '../lessons/types';
import { FinalDrawing } from './GuideLayer';

const SQ = 1024;

export interface Align {
  x: number;
  y: number;
  s: number;
}

/** Fotoğrafı beyaz zeminli kareye sığdırır. */
async function toSquare(file: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const c = document.createElement('canvas');
  c.width = SQ;
  c.height = SQ;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, SQ, SQ);
  const k = Math.min(SQ / bmp.width, SQ / bmp.height);
  const w = bmp.width * k, h = bmp.height * k;
  ctx.drawImage(bmp, (SQ - w) / 2, (SQ - h) / 2, w, h);
  bmp.close?.();
  return c;
}

/**
 * Kâğıttaki kalem izlerinin sınır kutusunu bulur (400'lük alanda).
 * Yerel ortalamadan belirgin koyu pikseller "çizgi" sayılır; bu, gölge ve ışık farklarına dayanıklıdır.
 */
export function detectInkBox(c: HTMLCanvasElement): [number, number, number, number] | null {
  const N = 200;
  const small = document.createElement('canvas');
  small.width = N;
  small.height = N;
  const sctx = small.getContext('2d', { willReadFrequently: true })!;
  sctx.drawImage(c, 0, 0, N, N);
  const d = sctx.getImageData(0, 0, N, N).data;
  const g = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) g[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2];
  // integral görüntü ile yerel ortalama
  const I = new Float64Array((N + 1) * (N + 1));
  for (let y = 0; y < N; y++) {
    let row = 0;
    for (let x = 0; x < N; x++) {
      row += g[y * N + x];
      I[(y + 1) * (N + 1) + x + 1] = I[y * (N + 1) + x + 1] + row;
    }
  }
  const R = 8, margin = 6;
  const xs: number[] = [], ys: number[] = [];
  for (let y = margin; y < N - margin; y++)
    for (let x = margin; x < N - margin; x++) {
      const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(N, x + R + 1), y1 = Math.min(N, y + R + 1);
      const sum = I[y1 * (N + 1) + x1] - I[y0 * (N + 1) + x1] - I[y1 * (N + 1) + x0] + I[y0 * (N + 1) + x0];
      const mean = sum / ((x1 - x0) * (y1 - y0));
      if (g[y * N + x] < mean - 22) {
        xs.push(x);
        ys.push(y);
      }
    }
  if (xs.length < 30) return null;
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  const q = (arr: number[], p: number) => arr[Math.floor(p * (arr.length - 1))];
  const k = 400 / N;
  return [q(xs, 0.02) * k, q(ys, 0.02) * k, q(xs, 0.98) * k, q(ys, 0.98) * k];
}

function lessonBox(lesson: Lesson): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const st of lesson.steps)
    for (const s of st.shapes) {
      if (s.guide) continue;
      for (const [x, y] of samplePath(s.d, 8).points) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }
  return [x0, y0, x1, y1];
}

export function autoAlign(lesson: Lesson, ink: [number, number, number, number] | null): Align {
  if (!ink) return { x: 0, y: 0, s: 1 };
  const [lx0, ly0, lx1, ly1] = lessonBox(lesson);
  const [ix0, iy0, ix1, iy1] = ink;
  const s = Math.max(0.3, Math.min(3, Math.max(ix1 - ix0, iy1 - iy0) / Math.max(lx1 - lx0, ly1 - ly0)));
  const lcx = (lx0 + lx1) / 2, lcy = (ly0 + ly1) / 2;
  return { x: (ix0 + ix1) / 2 - lcx * s, y: (iy0 + iy1) / 2 - lcy * s, s };
}

export function PhotoStage({ lesson, photo, align, setAlign, opacity }: {
  lesson: Lesson; photo: string; align: Align; setAlign: (a: Align) => void; opacity: number;
}) {
  const drag = useRef<{ id: number; x: number; y: number; a: Align } | null>(null);
  const shapes = useMemo(() => lesson.steps.flatMap((s) => s.shapes), [lesson]);
  return (
    <>
      <img src={photo} alt="Çizimin" style={{ objectFit: 'contain' }} draggable={false} />
      <svg
        viewBox="0 0 400 400"
        style={{ touchAction: 'none', cursor: 'move' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, a: align };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const r = e.currentTarget.getBoundingClientRect();
          const k = 400 / r.width;
          setAlign({ ...d.a, x: d.a.x + (e.clientX - d.x) * k, y: d.a.y + (e.clientY - d.y) * k });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <g transform={`translate(${align.x},${align.y}) scale(${align.s})`} opacity={opacity}>
          <FinalDrawing shapes={shapes.map((s) => ({ ...s, fill: undefined }))} stroke="#ff7a2f" width={5 / align.s} />
        </g>
      </svg>
    </>
  );
}

export function usePhoto(lesson: Lesson) {
  const [photo, setPhoto] = useState<string>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [align, setAlign] = useState<Align>({ x: 0, y: 0, s: 1 });
  const [busy, setBusy] = useState(false);
  const load = async (file?: Blob) => {
    if (!file) return;
    setBusy(true);
    try {
      const c = await toSquare(file);
      setCanvas(c);
      setPhoto(c.toDataURL('image/jpeg', 0.85));
      setAlign(autoAlign(lesson, detectInkBox(c)));
    } finally {
      setBusy(false);
    }
  };
  const toBlob = () =>
    new Promise<Blob | undefined>((res) => (canvas ? canvas.toBlob((b) => res(b ?? undefined), 'image/jpeg', 0.85) : res(undefined)));
  return { photo, align, setAlign, busy, load, toBlob };
}

export function PhotoControls({ p, opacity, setOpacity }: {
  p: ReturnType<typeof usePhoto>; opacity: number; setOpacity: (n: number) => void;
}) {
  const cam = useRef<HTMLInputElement>(null);
  const pick = useRef<HTMLInputElement>(null);
  // Sahne ortasına göre ölçekle.
  const zoom = (f: number) =>
    p.setAlign({ s: p.align.s * f, x: 200 - (200 - p.align.x) * f, y: 200 - (200 - p.align.y) * f });
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    void p.load(e.target.files?.[0]);
    e.target.value = '';
  };
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={pick} type="file" accept="image/*" hidden onChange={onFile} />
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn--accent" style={{ flex: 1 }} onClick={() => cam.current?.click()} disabled={p.busy}>
          <Camera size={24} /> {p.photo ? 'Yeniden çek' : 'Fotoğraf çek'}
        </button>
        <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => pick.current?.click()} disabled={p.busy}>
          <ImagePlus size={24} /> Galeriden
        </button>
      </div>
      {p.photo && (
        <>
          <p className="muted" style={{ fontWeight: 700 }}>
            <Move size={16} style={{ verticalAlign: -2 }} /> Turuncu çizgiler örnek çizim. Sürükleyerek kendi çiziminin üstüne getir.
          </p>
          <div className="row">
            <button className="icon-btn" aria-label="Küçült" onClick={() => zoom(1 / 1.08)}>
              <Minus />
            </button>
            <button className="icon-btn" aria-label="Büyüt" onClick={() => zoom(1.08)}>
              <Plus />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              aria-label="Örneğin görünürlüğü"
              onChange={(e) => setOpacity(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
          </div>
        </>
      )}
    </div>
  );
}
