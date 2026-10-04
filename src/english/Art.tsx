/**
 * English Club resimleri: ders çizimleri (çocuğun çizdiği resimlerin aynısı), renk lekeleri, sayı yıldızları,
 * şekiller, duygu yüzleri, vücut bölümleri (giydirme karakteri üzerinde), kıyafetler ve hareket eden Çizio.
 * Hepsi aynı mürekkep çizgisiyle — ikon/emoji yok.
 */
import { memo, useMemo } from 'react';
import { Mascot } from '../components/Mascot';
import { PRESETS, type DollState } from '../dressup/catalog';
import { Doll, REGIONS } from '../dressup/Doll';
import { INK } from '../dressup/ink';
import { samplePath } from '../engine/pathSampler';
import { getLesson } from '../lessons';
import type { Shape } from '../lessons/types';
import type { ActId, Art, BodyId, FeelId, ShapeId } from './data';

const sw = { stroke: INK, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

// ------------------------------------------------------------------------------------------------
// Ders çizimi (kendi sınırına kırpılmış)
// ------------------------------------------------------------------------------------------------
interface Cut {
  shapes: Shape[];
  box: string;
}
const cuts = new Map<string, Cut>();

export function lessonCut(id: string, parts?: string[]): Cut {
  const key = `${id}|${parts?.join(',') ?? ''}`;
  const hit = cuts.get(key);
  if (hit) return hit;
  const lesson = getLesson(id);
  const shapes = (lesson?.steps.flatMap((s) => s.shapes) ?? []).filter((s) => !s.guide && (!parts || parts.includes(s.part ?? '')));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of shapes) {
    for (const [x, y] of samplePath(s.d, 6).points) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  if (!shapes.length) [x0, y0, x1, y1] = [0, 0, 400, 400];
  // Kare kutu: resim kartın ortasında, kenarlarda çizgi kalınlığı kadar pay
  const size = Math.max(x1 - x0, y1 - y0) + 24;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const cut = { shapes, box: `${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}` };
  cuts.set(key, cut);
  return cut;
}

export const LessonArt = memo(function LessonArt({ id, parts, bare, fill, className }: {
  id: string; parts?: string[]; bare?: boolean; fill?: (s: Shape, i: number) => string | undefined; className?: string;
}) {
  const { shapes, box } = useMemo(() => lessonCut(id, parts), [id, parts]);
  return (
    <svg viewBox={box} className={className} aria-hidden="true">
      {shapes.map((s, i) => (
        <path key={i} d={s.d} fill={s.fill ? (fill?.(s, i) ?? (bare ? '#fff' : s.fill)) : 'none'} {...sw} />
      ))}
    </svg>
  );
});

// ------------------------------------------------------------------------------------------------
// Renk, sayı, şekil
// ------------------------------------------------------------------------------------------------
const BLOB = 'M100,28 C138,26 170,50 168,90 C167,116 184,136 168,158 C150,182 118,170 98,176 C74,184 38,176 30,146 C22,118 40,104 36,80 C32,48 62,30 100,28 Z';

function ColorArt({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <path d={BLOB} fill={c} {...sw} strokeWidth={6} />
      <circle cx="176" cy="44" r="10" fill={c} {...sw} strokeWidth={5} />
      <circle cx="30" cy="186" r="7" fill={c} {...sw} strokeWidth={4} />
      <path d="M70,60 Q84,50 100,52" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity={c === '#ffffff' ? 0 : 0.55} />
    </svg>
  );
}

const STAR = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
};
const HEART = (cx: number, cy: number, r: number) =>
  `M${cx},${cy + r * 0.9} C${cx - r * 1.6},${cy - r * 0.1} ${cx - r * 0.7},${cy - r * 1.3} ${cx},${cy - r * 0.45} C${cx + r * 0.7},${cy - r * 1.3} ${cx + r * 1.6},${cy - r * 0.1} ${cx},${cy + r * 0.9} Z`;

export function shapePath(s: ShapeId, cx = 100, cy = 100, r = 62): string {
  switch (s) {
    case 'circle': return `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
    case 'square': return `M${cx - r * 0.85},${cy - r * 0.85} H${cx + r * 0.85} V${cy + r * 0.85} H${cx - r * 0.85} Z`;
    case 'triangle': return `M${cx},${cy - r} L${cx + r * 1.05},${cy + r * 0.8} H${cx - r * 1.05} Z`;
    case 'rectangle': return `M${cx - r * 1.25},${cy - r * 0.62} H${cx + r * 1.25} V${cy + r * 0.62} H${cx - r * 1.25} Z`;
    case 'star': return STAR(cx, cy + r * 0.08, r * 1.1);
    case 'heart': return HEART(cx, cy + r * 0.1, r * 0.95);
  }
}

function ShapeArt({ s, c }: { s: ShapeId; c: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <path d={shapePath(s)} fill={c} {...sw} strokeWidth={6} />
    </svg>
  );
}

function NumArt({ n }: { n: number }) {
  const per = n <= 3 ? n : n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5;
  const rows = Math.ceil(n / per);
  const cell = Math.min(180 / per, 150 / rows);
  const r = cell * 0.42;
  const stars: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / per);
    const inRow = Math.min(per, n - row * per);
    const x = 100 + (i % per - (inRow - 1) / 2) * cell;
    const y = 100 + (row - (rows - 1) / 2) * cell;
    stars.push([x, y]);
  }
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      {stars.map(([x, y], i) => <path key={i} d={STAR(x, y + r * 0.08, r)} fill="#ffc83d" {...sw} strokeWidth={Math.max(3, r * 0.16)} />)}
    </svg>
  );
}

// ------------------------------------------------------------------------------------------------
// Duygu yüzleri
// ------------------------------------------------------------------------------------------------
export function FeelArt({ f }: { f: FeelId }) {
  const face = f === 'angry' ? '#ff9f6b' : f === 'scared' ? '#e6e0ff' : f === 'sad' ? '#bfe0ff' : '#ffd866';
  const eye = (x: number, r = 9) => <circle cx={x} cy="88" r={r} fill={INK} />;
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="104" r="80" fill={face} {...sw} />
      {f !== 'sleepy' && f !== 'angry' && f !== 'scared' && (
        <>
          <ellipse cx="58" cy="126" rx="13" ry="8" fill="#ff8fb1" opacity="0.75" />
          <ellipse cx="142" cy="126" rx="13" ry="8" fill="#ff8fb1" opacity="0.75" />
        </>
      )}
      {f === 'happy' && (
        <>
          {eye(72)}{eye(128)}
          <circle cx="75" cy="85" r="3" fill="#fff" /><circle cx="131" cy="85" r="3" fill="#fff" />
          <path d="M62,118 Q100,162 138,118 Q100,134 62,118 Z" fill={INK} {...sw} strokeWidth={5} />
        </>
      )}
      {f === 'sad' && (
        <>
          <path d="M56,68 L84,78 M144,68 L116,78" {...sw} strokeWidth={6} fill="none" />
          {eye(72, 8)}{eye(128, 8)}
          <path d="M70,146 Q100,120 130,146" {...sw} fill="none" />
          <path d="M132,100 C126,112 124,120 132,124 C140,120 138,112 132,100 Z" fill="#5b8def" stroke={INK} strokeWidth={3} />
        </>
      )}
      {f === 'angry' && (
        <>
          <path d="M54,66 L88,84 M146,66 L112,84" {...sw} strokeWidth={8} fill="none" />
          {eye(74, 8)}{eye(126, 8)}
          <path d="M72,142 Q100,126 128,142" {...sw} fill="none" />
          <path d="M150,40 l8,-12 M164,50 l14,-6 M160,64 l14,2" {...sw} strokeWidth={5} stroke="#ef4b4b" fill="none" />
        </>
      )}
      {f === 'surprised' && (
        <>
          <path d="M54,58 Q72,46 88,56 M112,56 Q128,46 146,58" {...sw} strokeWidth={6} fill="none" />
          <circle cx="72" cy="88" r="15" fill="#fff" {...sw} strokeWidth={5} /><circle cx="72" cy="90" r="7" fill={INK} />
          <circle cx="128" cy="88" r="15" fill="#fff" {...sw} strokeWidth={5} /><circle cx="128" cy="90" r="7" fill={INK} />
          <ellipse cx="100" cy="140" rx="15" ry="19" fill={INK} />
        </>
      )}
      {f === 'sleepy' && (
        <>
          <path d="M58,90 Q72,100 86,90 M114,90 Q128,100 142,90" {...sw} fill="none" />
          <ellipse cx="100" cy="138" rx="10" ry="12" fill={INK} />
          <text x="146" y="54" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="30" fill="#5b8def" stroke={INK} strokeWidth="1.5">z</text>
          <text x="166" y="30" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="22" fill="#5b8def" stroke={INK} strokeWidth="1.2">z</text>
        </>
      )}
      {f === 'scared' && (
        <>
          <path d="M58,62 Q72,56 86,64 M114,64 Q128,56 142,62" {...sw} strokeWidth={6} fill="none" />
          <circle cx="72" cy="90" r="14" fill="#fff" {...sw} strokeWidth={5} /><circle cx="72" cy="90" r="4" fill={INK} />
          <circle cx="128" cy="90" r="14" fill="#fff" {...sw} strokeWidth={5} /><circle cx="128" cy="90" r="4" fill={INK} />
          <path d="M66,144 q8,-10 17,0 t17,0 t17,0 t17,0" {...sw} strokeWidth={6} fill="none" />
          <path d="M36,70 C32,82 32,90 38,94 C44,90 42,82 36,70 Z" fill="#9be7de" stroke={INK} strokeWidth={3} />
        </>
      )}
    </svg>
  );
}

// ------------------------------------------------------------------------------------------------
// Vücut ve kıyafetler (giydirme karakteri)
// ------------------------------------------------------------------------------------------------
const BODY_DOLL: DollState = { ...PRESETS[1], hat: '', glasses: '', pet: '', back: '', hand: '', top: 'tisort', topColor: '#ffc83d', bottom: 'sort', bottomColor: '#5b8def' };
// Kıyafet kartlarında öğrenilen parça dışındaki giysiler sade (beyaz tişört, gri pantolon) — karışmasın.
const CLOTH_BASE: DollState = {
  ...PRESETS[1], hat: '', glasses: '', pet: '', back: '', hand: '', dress: '',
  top: 'tisort', topColor: '#ffffff', topPattern: '', bottom: 'pantolon', bottomColor: '#b9c6cc', bottomPattern: '', shoes: 'spor', shoesColor: '#ffffff',
};

const SPOTS: Record<BodyId, { x: number; y: number; rx: number; ry: number; rot?: number }[]> = {
  head: [{ x: 150, y: 112, rx: 80, ry: 78 }],
  hair: [{ x: 150, y: 72, rx: 76, ry: 34 }],
  eyes: [{ x: 128, y: 124, rx: 16, ry: 16 }, { x: 172, y: 124, rx: 16, ry: 16 }],
  ears: [{ x: 88, y: 124, rx: 18, ry: 22 }, { x: 212, y: 124, rx: 18, ry: 22 }],
  nose: [{ x: 150, y: 140, rx: 14, ry: 13 }],
  mouth: [{ x: 150, y: 156, rx: 22, ry: 14 }],
  arms: [{ x: 103, y: 245, rx: 18, ry: 58, rot: 13 }, { x: 197, y: 245, rx: 18, ry: 58, rot: -13 }],
  hands: [{ x: 90, y: 300, rx: 20, ry: 20 }, { x: 210, y: 300, rx: 20, ry: 20 }],
  tummy: [{ x: 150, y: 260, rx: 36, ry: 30 }],
  legs: [{ x: 132, y: 350, rx: 18, ry: 44 }, { x: 168, y: 350, rx: 18, ry: 44 }],
  feet: [{ x: 126, y: 400, rx: 26, ry: 18 }, { x: 174, y: 400, rx: 26, ry: 18 }],
};

/** Her vücut bölümü için yakınlaştırılmış görünüm (vurgu net görünsün). */
const BODY_VIEW: Record<BodyId, string> = {
  head: '50 20 200 200', hair: '50 10 200 200', eyes: '70 50 160 160', ears: '60 50 180 180', nose: '80 70 140 140', mouth: '80 80 140 140',
  arms: '30 160 240 200', hands: '40 190 220 200', tummy: '50 150 200 200', legs: '50 270 200 170', feet: '60 300 180 140',
};

export function BodyArt({ p }: { p: BodyId }) {
  const view = BODY_VIEW[p];
  return (
    <div className="en-stack">
      <Doll d={BODY_DOLL} bg={false} viewBox={view} />
      <svg viewBox={view} aria-hidden="true">
        {SPOTS[p].map((s, i) => (
          <ellipse key={i} className="en-spot" cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} transform={s.rot ? `rotate(${s.rot} ${s.x} ${s.y})` : undefined}
            fill="rgba(255,107,74,0.18)" stroke="#ff6b4a" strokeWidth="5" strokeDasharray="10 7" />
        ))}
      </svg>
    </div>
  );
}

function ClothArt({ patch, region }: { patch: Partial<DollState>; region: string }) {
  return <Doll d={{ ...CLOTH_BASE, ...patch }} bg={false} viewBox={REGIONS[region] ?? REGIONS.full} />;
}

// ------------------------------------------------------------------------------------------------
// Hareket eden Çizio ve hareket eden hayvanlar
// ------------------------------------------------------------------------------------------------
function ActOverlay({ a }: { a: ActId }) {
  switch (a) {
    case 'swim':
      return <path d="M10,170 q20,-14 40,0 t40,0 t40,0 t40,0 t40,0" {...sw} strokeWidth={6} stroke="#3f7fe0" fill="none" />;
    case 'fly':
      return <path d="M24,60 q16,-16 34,-4 q14,-14 30,-2 M130,40 q14,-12 28,-2 q12,-10 24,0" {...sw} strokeWidth={5} fill="none" />;
    case 'sleep':
    case 'sit':
      return a === 'sleep' ? (
        <g fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#5b8def" stroke={INK} strokeWidth="1.5">
          <text x="150" y="60" fontSize="30" className="en-z">z</text>
          <text x="170" y="34" fontSize="22" className="en-z en-z--2">z</text>
        </g>
      ) : null;
    case 'dance':
      return (
        <g fill={INK}>
          <path className="en-note" d="M30,40 v34 a10,8 0 1,1 -6,-6 v-30 l22,-6 v8 z" />
          <path className="en-note en-note--2" d="M168,30 v30 a9,7 0 1,1 -6,-5 v-25 z" />
        </g>
      );
    case 'run':
    case 'stomp':
      return <path d="M14,90 h26 M8,116 h34 M18,142 h22" {...sw} strokeWidth={5} fill="none" opacity="0.6" />;
    case 'roar':
      return <path d="M166,70 l20,-10 M170,92 h24 M166,114 l20,10" {...sw} strokeWidth={5} fill="none" />;
    case 'clap':
      return <path d="M80,30 l-8,-14 M100,24 v-16 M120,30 l8,-14" {...sw} strokeWidth={5} fill="none" />;
    default:
      return null;
  }
}

function MascotAct({ a }: { a: ActId }) {
  const mood = a === 'jump' || a === 'dance' || a === 'clap' || a === 'stand' ? 'cheer' : a === 'roar' ? 'wow' : a === 'sleep' || a === 'sit' ? 'think' : 'happy';
  return (
    <div className="en-stack">
      <div className={`en-act en-act--${a}`}><Mascot size={120} mood={mood} outfit="none" /></div>
      <svg viewBox="0 0 200 200" aria-hidden="true"><ActOverlay a={a} /></svg>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tek giriş noktası
// ------------------------------------------------------------------------------------------------
export function WordArt({ art, className = '' }: { art: Art; className?: string }) {
  let inner: React.ReactNode;
  switch (art.k) {
    case 'lesson':
      inner = art.anim ? (
        <div className="en-stack">
          <div className={`en-act en-act--${art.anim}`}><LessonArt id={art.id} parts={art.parts} /></div>
          <svg viewBox="0 0 200 200" aria-hidden="true"><ActOverlay a={art.anim} /></svg>
        </div>
      ) : <LessonArt id={art.id} parts={art.parts} />;
      break;
    case 'color': inner = <ColorArt c={art.c} />; break;
    case 'num': inner = <NumArt n={art.n} />; break;
    case 'shape': inner = <ShapeArt s={art.s} c={art.c} />; break;
    case 'feel': inner = <FeelArt f={art.f} />; break;
    case 'body': inner = <BodyArt p={art.p} />; break;
    case 'cloth': inner = <ClothArt patch={art.patch} region={art.region} />; break;
    case 'act': inner = <MascotAct a={art.a} />; break;
  }
  return <div className={`en-art ${className}`}>{inner}</div>;
}
