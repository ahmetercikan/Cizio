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
import { PencilDefs, PencilSprite } from './Pencil';

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

/** Tamamlanmış taramalar (gölgelendirme). */
const Hatches = memo(function Hatches({ id, segs }: { id: string; segs: { seg: ShapeSeg; i: number }[] }) {
  const html = useMemo(
    () =>
      segs
        .map(({ seg, i }) =>
          `<path d="${esc(seg.hatch!.d)}" fill="none" stroke="${GRAPHITE}" stroke-width="${seg.hatch!.width}" stroke-opacity="${seg.hatch!.opacity}" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#${id}-hc${i})" filter="url(#${id}-pencil)"/>`,
        )
        .join(''),
    [id, segs],
  );
  return <g dangerouslySetInnerHTML={{ __html: html }} />;
});

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
    const lines = done.filter(({ seg }) => !seg.hatch);
    const isFaint = (seg: ShapeSeg) => faintBefore !== undefined && seg.step < faintBefore;
    return {
      faint: lines.filter(({ seg }) => isFaint(seg)).map(({ seg }) => seg.shape),
      solid: lines.filter(({ seg }) => !isFaint(seg)).map(({ seg }) => seg.shape),
      hatches: done.filter(({ seg }) => seg.hatch),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount, faintBefore, tl]);

  const defs = useMemo(
    () =>
      sketchDefs(id) +
      tl.shapes.map((seg, i) => (seg.hatch ? `<clipPath id="${id}-hc${i}"><path d="${esc(seg.hatch.target.d)}"/></clipPath>` : '')).join(''),
    [id, tl],
  );

  return (
    <svg viewBox="0 0 400 400" className="live-sketch" aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: defs }} />
      <defs>
        <PencilDefs />
      </defs>
      <Hatches id={id} segs={layers.hatches} />
      {active?.hatch && (
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
          clipPath={`url(#${id}-hc${activeIdx})`}
          filter={`url(#${id}-pencil)`}
        />
      )}
      {layers.faint.length > 0 && <Lines id={id} shapes={layers.faint} faint />}
      <Lines id={id} shapes={layers.solid} faint={false} />
      {active && !active.hatch && (
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
      {showPencil && pencil.visible && <PencilSprite x={pencil.x} y={pencil.y} lifted={pencil.lifted} scale={0.95} />}
    </svg>
  );
}
