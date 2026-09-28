/**
 * Ders rehber katmanı (SVG): adımların çizim animasyonu, iz sürme çizgileri, noktalar ve boyalı örnek.
 * Çizim tuvalinin altında durur; 400x400 ders koordinatlarını kullanır.
 */
import { memo, useMemo } from 'react';
import { samplePath, type Pt } from '../engine/pathSampler';
import type { Lesson, Shape } from '../lessons/types';

export type GuideView =
  | 'trace' // önceki adımlar soluk, bu adım renkli ve animasyonlu: üstünden geç
  | 'dots' // bu adım bir kez gösterilir, sonra yalnızca noktalar kalır
  | 'paper' // "video" görünümü: önceki adımlar koyu, bu adım turuncu çizilir
  | 'outline' // tüm çizim soluk (boyama için yardım)
  | 'final' // boyalı örnek
  | 'none';

const INK = '#2b2250';
const ORANGE = '#ff7a2f';

const durOf = (s: Shape) => Math.min(1.8, Math.max(0.5, samplePath(s.d).length / 260));

function Animated({ shapes, width, color, fadeAfter }: { shapes: Shape[]; width: number; color: string; fadeAfter?: boolean }) {
  let t = 0.25;
  const timed = shapes.map((s) => {
    const dur = durOf(s);
    const item = { s, delay: t, dur };
    t += dur + 0.15;
    return item;
  });
  const total = t;
  return (
    <g style={fadeAfter ? { animation: `g-fade 0.6s ease ${total + 0.6}s forwards` } : undefined}>
      {timed.map(({ s, delay, dur }, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          className="g-anim"
          style={{ ['--delay' as string]: `${delay}s`, ['--dur' as string]: `${dur}s` }}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeDasharray={s.guide ? undefined : '1 1'}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={s.guide ? 0.5 : 1}
        />
      ))}
      {/* kalem ucu: çizginin üzerinde ilerleyen nokta */}
      {timed.map(({ s, delay, dur }, i) =>
        s.guide ? null : (
          <circle key={`p${i}`} r={9} fill={color} stroke="#fff" strokeWidth={3} opacity={0}>
            <set attributeName="opacity" to="1" begin={`${delay}s`} />
            <animateMotion path={s.d} dur={`${dur}s`} begin={`${delay}s`} fill="freeze" />
            <set attributeName="opacity" to="0" begin={`${delay + dur + 0.1}s`} />
          </circle>
        ),
      )}
    </g>
  );
}

function startPoint(d: string): Pt | undefined {
  return samplePath(d, 6).points[0];
}

export const GuideLayer = memo(function GuideLayer({
  lesson,
  step,
  view,
  replay = 0,
  missed,
}: {
  lesson: Lesson;
  step: number;
  view: GuideView;
  replay?: number;
  missed?: Pt[];
}) {
  const prev = useMemo(() => lesson.steps.slice(0, Math.max(0, step)).flatMap((s) => s.shapes), [lesson, step]);
  const cur = lesson.steps[step]?.shapes ?? [];
  const all = useMemo(() => lesson.steps.flatMap((s) => s.shapes), [lesson]);
  const dots = useMemo(
    () => (view === 'dots' ? cur.filter((s) => !s.guide).flatMap((s) => samplePath(s.d, 26).points) : []),
    [view, cur],
  );

  return (
    <svg key={`${step}-${replay}-${view}`} className="guide" viewBox="0 0 400 400" aria-hidden="true">
      {view === 'final' && <FinalDrawing shapes={all} />}

      {view === 'outline' &&
        all.map((s, i) => <path key={i} d={s.d} fill="none" stroke="#d9d2ea" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />)}

      {(view === 'trace' || view === 'dots') &&
        prev.map((s, i) => (
          <path key={i} d={s.d} fill="none" stroke={view === 'trace' ? '#d6cfe6' : '#ebe6f4'} strokeWidth={5}
            strokeDasharray={s.guide ? '6 8' : undefined} strokeLinecap="round" strokeLinejoin="round" />
        ))}

      {view === 'trace' && (
        <>
          {cur.map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke={ORANGE} strokeOpacity={s.guide ? 0.3 : 0.28} strokeWidth={s.guide ? 3 : 14}
              strokeDasharray={s.guide ? '6 8' : undefined} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <Animated shapes={cur} width={4} color={ORANGE} />
          {cur.map((s, i) => {
            if (s.guide) return null;
            const p = startPoint(s.d);
            return p ? <circle key={`s${i}`} cx={p[0]} cy={p[1]} r={7} fill="#22b566" stroke="#fff" strokeWidth={2.5} /> : null;
          })}
        </>
      )}

      {view === 'dots' && (
        <>
          <Animated shapes={cur} width={6} color={ORANGE} fadeAfter />
          <g className="g-dots">
            {dots.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={4.5} fill={ORANGE} opacity={0.75} />
            ))}
            {cur.map((s, i) => {
              if (s.guide) return null;
              const p = startPoint(s.d);
              return p ? <circle key={`s${i}`} cx={p[0]} cy={p[1]} r={7} fill="#22b566" stroke="#fff" strokeWidth={2.5} /> : null;
            })}
          </g>
        </>
      )}

      {view === 'paper' && (
        <>
          {prev.map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke={s.guide ? '#b9b2cc' : INK} strokeWidth={s.guide ? 3 : 6}
              strokeDasharray={s.guide ? '6 8' : undefined} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <Animated shapes={cur} width={7} color={ORANGE} />
        </>
      )}

      {missed && missed.length > 0 && (
        <g className="g-missed">
          {missed.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={6} fill={ORANGE} stroke="#fff" strokeWidth={2} />
          ))}
        </g>
      )}
    </svg>
  );
});

export function FinalDrawing({ shapes, stroke = INK, width = 6 }: { shapes: Shape[]; stroke?: string; width?: number }) {
  return (
    <>
      {shapes.map((s, i) => {
        if (s.guide) return null;
        // Göz parlaklığı gibi minik dolu şekiller kontursuz çizilir, yoksa kalın çizgi onları kapatır.
        const tiny = s.fill && samplePath(s.d).length < 40;
        return (
          <path key={i} d={s.d} fill={s.fill ?? 'none'} stroke={tiny ? 'none' : stroke} strokeWidth={width}
            strokeLinecap="round" strokeLinejoin="round" />
        );
      })}
    </>
  );
}

/** Küçük, statik ders önizlemesi (boyalı). */
export const LessonThumb = memo(function LessonThumb({ lesson, size = 96, upto }: { lesson: Lesson; size?: number; upto?: number }) {
  const shapes = lesson.steps.slice(0, upto === undefined ? undefined : upto + 1).flatMap((s) => s.shapes);
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" aria-hidden="true" style={{ display: 'block' }}>
      <FinalDrawing shapes={shapes} width={8} />
    </svg>
  );
});
