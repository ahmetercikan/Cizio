/**
 * Kalem eskizi bileşenleri.
 *  - SketchImg: statik eskiz (kartlar, önizlemeler) — tek seferde rasterleşen <img>.
 *  - LiveSketch: zaman çizelgesine göre çizilen "video" — tamamlanan şekiller eskiz olarak,
 *    çizilmekte olan şekil ilerleyen kalem iziyle, üstünde gerçekçi kalem.
 */
import { memo, useMemo } from 'react';
import { GRAPHITE, lessonSketchUrl, lineMarkup, shadeMarkup, sketchDefs, type SketchMode } from '../art/sketch';
import { frameAt, type Timeline } from '../art/timeline';
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

const Static = memo(function Static({ id, shapes, mode, faint }: { id: string; shapes: Shape[]; mode: SketchMode; faint: boolean }) {
  const html = useMemo(() => (faint ? '' : shadeMarkup(id, shapes, mode)) + lineMarkup(id, shapes), [id, shapes, mode, faint]);
  return <g opacity={faint ? 0.16 : 1} dangerouslySetInnerHTML={{ __html: html }} />;
});

/**
 * Canlı eskiz. `t` saniye cinsinden zaman; `faintBefore` verilirse o adımdan önceki çizgiler soluk gösterilir
 * (ekranda çizim modunda çocuğun kendi çizgileri öne çıksın diye).
 */
export function LiveSketch({ lesson, tl, t, mode = 'graphite', faintBefore, hideUntilStep, showPencil = true }: {
  lesson: Lesson;
  tl: Timeline;
  t: number;
  mode?: SketchMode;
  faintBefore?: number;
  /** Bu adımdan önceki şekilleri hiç çizme. */
  hideUntilStep?: number;
  showPencil?: boolean;
}) {
  const { progress, pencil } = frameAt(tl, t);
  const id = `live-${lesson.id}`;
  const done = tl.shapes.filter((s, i) => progress[i] >= 1 && (hideUntilStep === undefined || s.step >= hideUntilStep));
  const faint = faintBefore === undefined ? [] : done.filter((s) => s.step < faintBefore).map((s) => s.shape);
  const solid = done.filter((s) => faintBefore === undefined || s.step >= faintBefore).map((s) => s.shape);
  const activeIdx = progress.findIndex((p) => p > 0 && p < 1);
  const active = activeIdx >= 0 ? tl.shapes[activeIdx] : undefined;
  // Statik grupları yalnızca tamamlanan şekil sayısı değişince yeniden kur.
  const solidKey = solid.length;
  const faintKey = faint.length;
  const solidShapes = useMemo(() => solid, [solidKey, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const faintShapes = useMemo(() => faint, [faintKey, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg viewBox="0 0 400 400" className="live-sketch" aria-hidden="true">
      <defs dangerouslySetInnerHTML={{ __html: sketchDefs(id) }} />
      <defs>
        <PencilDefs />
      </defs>
      {faintShapes.length > 0 && <Static id={id} shapes={faintShapes} mode={mode} faint />}
      <Static id={id} shapes={solidShapes} mode={mode} faint={false} />
      {active && (
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
