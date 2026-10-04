/**
 * Çizio'nun kıyafetleri (maceralarda duraklar bitince açılır). Maskotun 140×170 koordinatlarında çizilir:
 * silgi x 44–96 / y 8–38, metal bilezik y 34–50, gövde y 50–122, yüz 50,64 40×42.
 * Şapkalar silginin üstüne oturur ve yukarı taşabilir (maskot SVG'si overflow: visible).
 */
import type { ReactNode } from 'react';

const INK = '#2b2250';
const s = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export interface Outfit {
  id: string;
  title: string;
  art: ReactNode;
}

export const OUTFITS: Outfit[] = [
  {
    id: 'bere',
    title: 'Ressam beresi',
    art: (
      <g>
        <path d="M40,20 C38,4 62,-4 84,0 C104,4 108,16 98,22 C84,28 52,28 40,20 Z" fill="#e63946" {...s} />
        <path d="M70,-2 L72,-9" {...s} />
      </g>
    ),
  },
  {
    id: 'kulak',
    title: 'Kedi kulakları',
    art: (
      <g>
        <path d="M44,18 C50,4 66,4 72,10 C78,4 92,4 96,18" fill="none" {...s} stroke="#8c766e" strokeWidth={5} />
        <path d="M46,16 L50,-10 L66,8 Z" fill="#ff9f43" {...s} />
        <path d="M51,6 L53,-2 L59,6 Z" fill="#ffb3c6" />
        <path d="M94,16 L90,-10 L74,8 Z" fill="#ff9f43" {...s} />
        <path d="M89,6 L87,-2 L81,6 Z" fill="#ffb3c6" />
      </g>
    ),
  },
  {
    id: 'papyon',
    title: 'Papyon',
    art: (
      <g>
        <path d="M70,58 L52,49 L52,67 Z" fill="#14a89a" {...s} />
        <path d="M70,58 L88,49 L88,67 Z" fill="#14a89a" {...s} />
        <circle cx="70" cy="58" r="5" fill="#0d8074" {...s} strokeWidth={3} />
      </g>
    ),
  },
  {
    id: 'cicek',
    title: 'Çiçek tacı',
    art: (
      <g>
        <path d="M42,14 C58,4 82,4 98,14" fill="none" stroke="#2bb673" strokeWidth={4} strokeLinecap="round" />
        {[
          [46, 12, '#ff6b9a'],
          [58, 6, '#ffc83d'],
          [70, 4, '#ff6b4a'],
          [82, 6, '#b388ff'],
          [94, 12, '#ff6b9a'],
        ].map(([x, y, c]) => (
          <g key={x as number}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={(x as number) + 5 * Math.cos((a * Math.PI) / 180)} cy={(y as number) + 5 * Math.sin((a * Math.PI) / 180)} r="4" fill={c as string} stroke={INK} strokeWidth={1.6} />
            ))}
            <circle cx={x as number} cy={y as number} r="3" fill="#fff1c7" stroke={INK} strokeWidth={1.6} />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'sihirbaz',
    title: 'Sihirbaz şapkası',
    art: (
      <g>
        <path d="M48,16 L66,-44 C68,-50 74,-50 76,-44 L92,16 Z" fill="#7a5cff" {...s} />
        <path d="M60,-6 l3,6 l6,1 l-5,4 l1,6 l-5,-3 l-5,3 l1,-6 l-5,-4 l6,-1 Z" fill="#ffc83d" stroke={INK} strokeWidth={1.6} />
        <circle cx="78" cy="-20" r="3" fill="#ffc83d" />
        <ellipse cx="70" cy="17" rx="36" ry="7" fill="#5b3fd6" {...s} />
      </g>
    ),
  },
  {
    id: 'kaptan',
    title: 'Kaptan şapkası',
    art: (
      <g>
        <path d="M46,14 C44,-4 96,-4 94,14 Z" fill="#fff" {...s} />
        <path d="M44,12 H96 V20 H44 Z" fill="#1d3557" {...s} />
        <path d="M40,22 C54,30 86,30 100,22" fill="none" {...s} strokeWidth={5} />
        <path d="M70,1 V9 M66,5 H74 M66,9 C66,12 74,12 74,9" fill="none" stroke="#e8a200" strokeWidth={2.4} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'kasif',
    title: 'Kaşif şapkası',
    art: (
      <g>
        <ellipse cx="70" cy="16" rx="42" ry="8" fill="#d9b77a" {...s} />
        <path d="M50,14 C50,-8 90,-8 90,14 Z" fill="#e8c98d" {...s} />
        <path d="M51,9 C62,12 78,12 89,9" fill="none" stroke="#8c5a2b" strokeWidth={4} />
      </g>
    ),
  },
  {
    id: 'gozluk',
    title: 'Pilot gözlüğü',
    art: (
      <g>
        <path d="M40,40 H100" {...s} stroke="#8c5a2b" strokeWidth={5} />
        <circle cx="58" cy="40" r="10" fill="#9be7de" {...s} />
        <circle cx="82" cy="40" r="10" fill="#9be7de" {...s} />
        <path d="M53,36 L57,33 M77,36 L81,33" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'tac',
    title: 'Altın taç',
    art: (
      <g>
        <path d="M46,18 L46,-4 L58,8 L70,-10 L82,8 L94,-4 L94,18 Z" fill="#ffc83d" {...s} />
        <circle cx="70" cy="9" r="3.6" fill="#e9487d" />
        <circle cx="56" cy="12" r="2.6" fill="#14a89a" />
        <circle cx="84" cy="12" r="2.6" fill="#14a89a" />
      </g>
    ),
  },
];

export const getOutfit = (id?: string) => OUTFITS.find((o) => o.id === id);
