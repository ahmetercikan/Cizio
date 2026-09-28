/**
 * Kalem eskizi bileşenleri.
 *  - SketchImg: statik eskiz (kartlar, önizlemeler) — tek seferde rasterleşen <img>.
 *  - LiveSketch: zaman çizelgesine göre çizilen "video" — tamamlanan şekiller eskiz olarak,
 *    çizilmekte olan şekil ilerleyen kalem iziyle, üstünde gerçekçi kalem.
 */
import { memo, useMemo } from 'react';
import { GRAPHITE, lessonSketchUrl, lineMarkup, sketchDefs, type SketchMode } from '../art/sketch';
import { frameAt, type ShapeSeg, type Timeline } from '../art/timeline';
import type { Lesson, Shape } from '../lessons/types';
import { PencilDefs, PencilSprite, StumpSprite } from './Pencil';

export const SketchImg = memo(function SketchImg({ lesson, mode = 'graphite', paper = false, pad = 16, upto, className, style }: {
  lesson: Lesson; mode?: SketchMode; paper?: boolean; pad?: number; upto?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <img
      className={className}
      style={style}
      src={lessonSketchUrl(lesson, { mode, paper, pad, upto })}
      alt={lesson.title}
      draggable={false}
      loading="lazy"
    />
  );
});

/** Düz renkli, konturlu çizim (avatarlar ve illüstrasyonlar için). */
export function FlatArt({ shapes, stroke = '#1d1740', width = 7, recolor }: {
  shapes: Shape[]; stroke?: string; width?: number; recolor?: (fill: string) => string;
}) {
  return (
    <>
      {shapes.map((s, i) =>
        s.guide ? null : (
          <path key={i} d={s.d} fill={s.fill ? (recolor ? recolor(s.fill) : s.fill) : 'none'} stroke={stroke} strokeWidth={width}
            strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </>
  );
}

const esc = (d: string) => d.replace(/"/g, '&quot;');

/** Tamamlanmış çizgiler (yalnızca kontur; gölgeyi kalem gölgelendirme adımlarında kendisi yapar). */
const Lines = memo(function Lines({ id, shapes, faint }: { id: string; shapes: Shape[]; faint: boolean }) {
  const html = useMemo(() => lineMarkup(id, shapes), [id, shapes]);
  return <g opacity={faint ? 0.16 : 1} dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Tarama ya da dağıtma katmanının SVG'si (progress: dağıtmada ne kadar yoğunlaştığı). */
function segMarkup(id: string, seg: ShapeSeg, i: number, progress = 1): string {
  if (seg.hatch) {
    const h = seg.hatch;
    const mask = h.axis ? ` mask="url(#${id}-hm${i})"` : '';
    return `<g clip-path="url(#${id}-hc${i})"${mask}><path d="${esc(h.d)}" fill="none" stroke="${GRAPHITE}" stroke-width="${h.width}" stroke-opacity="${h.opacity}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-hatchf)"/></g>`;
  }
  const b = seg.blend!;
  return `<g clip-path="url(#${id}-hc${i})" mask="url(#${id}-hm${i})"><path d="${esc(b.target.d)}" fill="${GRAPHITE}" fill-opacity="${(b.opacity * progress).toFixed(3)}" filter="url(#${id}-smudge)"/></g>`;
}

/** Tamamlanmış taramalar ve dağıtmalar (gölgelendirme). */
const Hatches = memo(function Hatches({ id, segs }: { id: string; segs: { seg: ShapeSeg; i: number }[] }) {
  const html = useMemo(() => segs.map(({ seg, i }) => segMarkup(id, seg, i)).join(''), [id, segs]);
  return <g dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Işık yönünde ton geçişi maskesi: ışıklı uçta az, gölgeli uçta çok görünür. */
function gradMask(id: string, i: number, axis: [number, number, number, number], from: number, to: number): string {
  const g = (v: number) => {
    const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
    return `rgb(${c},${c},${c})`;
  };
  return (
    `<linearGradient id="${id}-hg${i}" gradientUnits="userSpaceOnUse" x1="${axis[0]}" y1="${axis[1]}" x2="${axis[2]}" y2="${axis[3]}">` +
    `<stop offset="0" stop-color="${g(from)}"/><stop offset="0.55" stop-color="${g(from + (to - from) * 0.6)}"/><stop offset="1" stop-color="${g(to)}"/></linearGradient>` +
    `<mask id="${id}-hm${i}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="500" height="500"><rect x="-50" y="-50" width="500" height="500" fill="url(#${id}-hg${i})"/></mask>`
  );
}

/** El yapımı tarama (daha dalgalı) ve dağıtılmış grafit (bulanık, grenli) filtreleri. */
function extraFilters(id: string): string {
  return (
    `<filter id="${id}-hatchf" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="11" result="w"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" result="g"/>` +
    `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.1" result="gm"/>` +
    `<feComposite in="d" in2="gm" operator="in"/></filter>` +
    `<filter id="${id}-smudge" x="-15%" y="-15%" width="130%" height="130%">` +
    `<feGaussianBlur stdDeviation="7" result="b"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="g"/>` +
    `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.4" result="gm"/>` +
    `<feComposite in="b" in2="gm" operator="in"/></filter>`
  );
}

/**
 * Canlı eskiz ("video"). `t` saniye cinsinden zaman.
 * `faintBefore` verilirse o adımdan önceki çizgiler soluk gösterilir (ekranda çizim modunda çocuğun
 * kendi çizgileri öne çıksın diye).
 */
export function LiveSketch({ lesson, tl, t, faintBefore, showPencil = true }: {
  lesson: Lesson;
  tl: Timeline;
  t: number;
  faintBefore?: number;
  showPencil?: boolean;
}) {
  const { progress, pencil } = frameAt(tl, t);
  const id = `live-${lesson.id}`;
  const doneCount = progress.filter((p) => p >= 1).length;
  const activeIdx = progress.findIndex((p) => p > 0 && p < 1);
  const active = activeIdx >= 0 ? tl.shapes[activeIdx] : undefined;

  // Statik katmanları yalnızca tamamlanan şekil sayısı değişince yeniden kur.
  const layers = useMemo(() => {
    const done = tl.shapes.map((seg, i) => ({ seg, i })).filter(({ i }) => progress[i] >= 1);
    const lines = done.filter(({ seg }) => !seg.hatch && !seg.blend);
    const isFaint = (seg: ShapeSeg) => faintBefore !== undefined && seg.step < faintBefore;
    return {
      faint: lines.filter(({ seg }) => isFaint(seg)).map(({ seg }) => seg.shape),
      solid: lines.filter(({ seg }) => !isFaint(seg)).map(({ seg }) => seg.shape),
      hatches: done.filter(({ seg }) => seg.hatch || seg.blend),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount, faintBefore, tl]);

  const defs = useMemo(
    () =>
      sketchDefs(id) +
      extraFilters(id) +
      tl.shapes
        .map((seg, i) => {
          const target = seg.hatch?.target ?? seg.blend?.target;
          if (!target) return '';
          const clip = `<clipPath id="${id}-hc${i}"><path d="${esc(target.d)}"/></clipPath>`;
          if (seg.hatch?.axis) return clip + gradMask(id, i, seg.hatch.axis, seg.hatch.from ?? 0.2, seg.hatch.to ?? 1);
          if (seg.blend) return clip + gradMask(id, i, seg.blend.axis, 0.25, 1);
          return clip;
        })
        .join(''),
    [id, tl],
  );

  return (
    <svg viewBox="0 0 400 400" className="live-sketch" aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: defs }} />
      <defs>
        <PencilDefs />
      </defs>
      <Hatches id={id} segs={layers.hatches} />
      {active?.blend && <g dangerouslySetInnerHTML={{ __html: segMarkup(id, active, activeIdx, progress[activeIdx]) }} />}
      {active?.hatch && (
        <g clipPath={`url(#${id}-hc${activeIdx})`} mask={active.hatch.axis ? `url(#${id}-hm${activeIdx})` : undefined}>
          <path
            d={active.hatch.d}
            pathLength={1}
            fill="none"
            stroke={GRAPHITE}
            strokeWidth={active.hatch.width}
            strokeOpacity={active.hatch.opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - progress[activeIdx]}
            filter={`url(#${id}-hatchf)`}
          />
        </g>
      )}
      {layers.faint.length > 0 && <Lines id={id} shapes={layers.faint} faint />}
      <Lines id={id} shapes={layers.solid} faint={false} />
      {active && !active.hatch && !active.blend && (
        <path
          d={active.shape.d}
          pathLength={1}
          fill="none"
          stroke={GRAPHITE}
          strokeOpacity={active.shape.guide ? 0.25 : 1}
          strokeWidth={active.shape.guide ? 1.4 : 2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={active.shape.guide ? undefined : '1 1'}
          strokeDashoffset={active.shape.guide ? undefined : 1 - progress[activeIdx]}
          filter={`url(#${id}-pencil)`}
        />
      )}
      {showPencil && pencil.visible &&
        (pencil.tool === 'stump' ? (
          <StumpSprite x={pencil.x} y={pencil.y} lifted={pencil.lifted} scale={0.95} />
        ) : (
          <PencilSprite x={pencil.x} y={pencil.y} lifted={pencil.lifted} scale={0.95} />
        ))}
    </svg>
  );
}
