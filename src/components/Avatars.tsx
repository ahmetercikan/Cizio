/**
 * Resimli avatarlar ve karşılama illüstrasyonları — ders çizimlerinden türetilir,
 * böylece uygulamanın tüm görselleri tek bir çizim dilini paylaşır.
 */
import { getLesson } from '../lessons';
import { lightness } from '../art/sketch';
import { FlatArt } from './Sketch';

export interface AvatarDef {
  id: string;
  lesson: string;
  bg: string;
  label: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 'kedi', lesson: 'kedi', bg: '#ff5a7a', label: 'Kedi' },
  { id: 'tavsan', lesson: 'tavsan', bg: '#2ecf8a', label: 'Tavşan' },
  { id: 'panda', lesson: 'panda', bg: '#3ec6f0', label: 'Panda' },
  { id: 'baykus', lesson: 'baykus', bg: '#ffd43b', label: 'Baykuş' },
  { id: 'balik', lesson: 'balik', bg: '#7c3cff', label: 'Balık' },
  { id: 'kaplumbaga', lesson: 'kaplumbaga', bg: '#ff8a3d', label: 'Kaplumbağa' },
  { id: 'canavar', lesson: 'canavar', bg: '#ff4dc4', label: 'Canavar' },
  { id: 'robot', lesson: 'robot', bg: '#ffb13b', label: 'Robot' },
  { id: 'uzayli', lesson: 'uzayli', bg: '#22b5a0', label: 'Uzaylı' },
  { id: 'peri', lesson: 'peri', bg: '#b58bff', label: 'Peri' },
  { id: 'dondurma', lesson: 'dondurma', bg: '#5ad1ff', label: 'Dondurma' },
  { id: 'mantar', lesson: 'mantar', bg: '#9be15d', label: 'Mantar' },
];

export function AvatarArt({ id, size = 96, ring = false }: { id: string; size?: number; ring?: boolean }) {
  const a = AVATARS.find((x) => x.id === id);
  const lesson = a ? getLesson(a.lesson) : undefined;
  if (!a || !lesson) {
    // Eski sürümden kalan emoji avatarlar
    return (
      <span className="avatar-emoji" style={{ width: size, height: size, fontSize: size * 0.55 }}>
        {id}
      </span>
    );
  }
  const shapes = lesson.steps.flatMap((s) => s.shapes);
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" className="avatar-art" role="img" aria-label={a.label}>
      <circle cx="200" cy="200" r={ring ? 188 : 200} fill={a.bg} />
      {ring && <circle cx="200" cy="200" r="194" fill="none" stroke="#fff" strokeWidth="12" />}
      <g transform="translate(46 50) scale(0.77)">
        <FlatArt shapes={shapes} width={9} />
      </g>
    </svg>
  );
}

/** Mor tonlu panda illüstrasyonu (yetişkin sorusu). */
function purple(fill: string) {
  const L = lightness(fill);
  if (L < 0.35) return '#8b4dff';
  if (L > 0.9) return '#fff6e0';
  if (fill.toLowerCase() === '#ff9eb5') return '#c9a7ff';
  return fill;
}

function Panda({ x, y, s }: { x: number; y: number; s: number }) {
  const panda = getLesson('panda');
  if (!panda) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <FlatArt shapes={panda.steps.flatMap((st) => st.shapes)} stroke="#2a1b8c" width={6} recolor={purple} />
    </g>
  );
}

function Desk() {
  return (
    <>
      <line x1="40" y1="330" x2="560" y2="330" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <g transform="translate(330 205) rotate(-8)">
        <rect width="120" height="118" rx="4" fill="#ffd9e4" />
        <rect x="8" y="8" width="104" height="102" rx="3" fill="#fff6e0" />
        <circle cx="60" cy="58" r="26" fill="none" stroke="#8b4dff" strokeWidth="4" />
        <circle cx="50" cy="52" r="4" fill="#8b4dff" />
        <circle cx="70" cy="52" r="4" fill="#8b4dff" />
      </g>
      <g transform="translate(470 170) rotate(24)">
        <rect width="70" height="7" rx="3" fill="#35e0d0" />
        <path d="M70,0 L82,3.5 L70,7 Z" fill="#fff6e0" />
      </g>
      <g transform="translate(470 190) rotate(18)">
        <rect width="60" height="7" rx="3" fill="#b58bff" />
        <path d="M60,0 L72,3.5 L60,7 Z" fill="#fff6e0" />
      </g>
    </>
  );
}

export function AdultIllustration({ withAdult }: { withAdult: boolean }) {
  return (
    <svg viewBox="0 0 600 360" className="illus" aria-hidden="true">
      <Desk />
      {withAdult ? (
        <>
          <Panda x={40} y={40} s={0.78} />
          <Panda x={200} y={130} s={0.5} />
        </>
      ) : (
        <Panda x={150} y={110} s={0.55} />
      )}
    </svg>
  );
}
