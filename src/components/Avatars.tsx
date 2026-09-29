/**
 * Resimli avatarlar — ders çizimlerinden türetilir,
 * böylece uygulamanın tüm görselleri tek bir çizim dilini paylaşır.
 */
import { getLesson } from '../lessons';
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
