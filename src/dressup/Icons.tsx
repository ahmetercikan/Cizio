/**
 * Giydir ekranının el çizimi ikonları (emoji yerine): kategori sekmeleri ve stil görevi temaları.
 * Meydan okuma kartlarıyla aynı dil: koyu mürekkep kontur, yuvarlak uçlar, palet renkleri.
 */
import type { ReactNode } from 'react';

const INK = '#3a2b27';
const s = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const ln = { ...s, fill: 'none' };

/** 48×48 kategori ikonları. */
const CATS: Record<string, ReactNode> = {
  yuz: (
    <>
      <circle cx="24" cy="25" r="16" fill="#f6c9a0" {...s} />
      <circle cx="18" cy="23" r="2.2" fill={INK} />
      <circle cx="30" cy="23" r="2.2" fill={INK} />
      <path d="M18,30 Q24,35 30,30" {...ln} />
      <ellipse cx="14" cy="29" rx="3" ry="2" fill="#ff8fb1" opacity="0.7" />
      <ellipse cx="34" cy="29" rx="3" ry="2" fill="#ff8fb1" opacity="0.7" />
    </>
  ),
  sac: (
    <>
      <path d="M9,26 C6,8 42,8 39,26 L41,42 C30,46 18,46 7,42 Z" fill="#9a6234" {...s} />
      <circle cx="24" cy="26" r="11" fill="#f6c9a0" {...s} />
      <path d="M12,24 C14,12 34,12 36,24 C30,18 22,16 12,24 Z" fill="#9a6234" {...s} />
    </>
  ),
  ust: (
    <path d="M16,8 L8,14 L4,24 L11,27 L13,22 V42 H35 V22 L37,27 L44,24 L40,14 L32,8 C30,12 18,12 16,8 Z" fill="#ff6b4a" {...s} />
  ),
  alt: (
    <>
      <path d="M12,6 H36 L40,42 H28 L24,20 L20,42 H8 Z" fill="#5b8def" {...s} />
      <path d="M12,12 H36" {...ln} />
    </>
  ),
  elbise: (
    <>
      <path d="M18,6 L16,16 C12,22 8,34 6,42 H42 C40,34 36,22 32,16 L30,6 C27,9 21,9 18,6 Z" fill="#ff8fb1" {...s} />
      <path d="M15,18 H33" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  ayakkabi: (
    <>
      <path d="M6,34 C6,28 10,26 14,26 L18,16 H26 L28,24 C34,26 42,28 42,34 V38 H6 Z" fill="#14a89a" {...s} />
      <path d="M6,38 H42" stroke="#fff" strokeWidth="3" />
      <path d="M20,22 L24,24 M19,26 L23,28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  sapka: (
    <>
      <path d="M10,30 C10,12 38,12 38,30 Z" fill="#ffc83d" {...s} />
      <path d="M24,30 C32,26 44,28 46,32 C42,36 32,34 24,34 Z" fill="#e8a200" {...s} />
      <circle cx="24" cy="12" r="3" fill="#ffc83d" {...s} />
    </>
  ),
  gozluk: (
    <>
      <circle cx="14" cy="26" r="9" fill="#9be7de" {...s} />
      <circle cx="34" cy="26" r="9" fill="#9be7de" {...s} />
      <path d="M23,24 Q24,21 25,24 M5,24 L2,20 M43,24 L46,20" {...ln} />
      <path d="M10,22 L13,25 M30,22 L33,25" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  elde: (
    <>
      <path d="M24,30 C26,36 22,40 24,46" {...ln} strokeWidth={1.8} />
      <ellipse cx="24" cy="18" rx="11" ry="13" fill="#e9487d" {...s} />
      <path d="M22,31 l2,-2 l2,2 Z" fill="#e9487d" {...s} strokeWidth={1.6} />
      <path d="M18,12 q2,-4 6,-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.8" />
    </>
  ),
  sirt: (
    <>
      <path d="M16,14 C16,6 32,6 32,14" {...ln} strokeWidth={3} />
      <rect x="9" y="12" width="30" height="32" rx="9" fill="#ff6b4a" {...s} />
      <rect x="15" y="28" width="18" height="12" rx="4" fill="#ffc83d" {...s} />
      <path d="M9,24 C18,28 30,28 39,24" {...ln} />
    </>
  ),
  dost: (
    <>
      <path d="M12,18 L10,6 L20,13 Z M36,18 L38,6 L28,13 Z" fill="#ff9f43" {...s} />
      <circle cx="24" cy="26" r="15" fill="#ff9f43" {...s} />
      <circle cx="18" cy="24" r="2.2" fill={INK} />
      <circle cx="30" cy="24" r="2.2" fill={INK} />
      <path d="M21,30 Q24,33 27,30 M4,28 H13 M35,28 H44" {...ln} strokeWidth={1.8} />
    </>
  ),
  fon: (
    <>
      <rect x="4" y="8" width="40" height="32" rx="5" fill="#c9ecff" {...s} />
      <circle cx="33" cy="17" r="4.5" fill="#ffc83d" />
      <path d="M5,34 L16,22 L25,31 L31,26 L43,36 V36 C43,38 42,39 40,39 H8 C6,39 5,38 5,36 Z" fill="#7cc576" />
      <rect x="4" y="8" width="40" height="32" rx="5" fill="none" {...s} />
    </>
  ),
};

export function CatIcon({ id, size = 26 }: { id: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" overflow="visible">
      {CATS[id]}
    </svg>
  );
}

/** 120×120 stil görevi tema illüstrasyonları. */
const THEMES: Record<string, ReactNode> = {
  plaj: (
    <>
      <circle cx="84" cy="32" r="16" fill="#ffc83d" {...s} />
      <path d="M60,96 V40" {...ln} strokeWidth={4} />
      <path d="M22,46 C26,18 94,18 98,46 C90,40 80,40 72,46 C64,40 56,40 48,46 C40,40 30,40 22,46 Z" fill="#ff6b4a" {...s} />
      <path d="M48,46 C50,30 56,24 60,22 C64,24 70,30 72,46" fill="#fff" {...s} />
      <path d="M10,98 q12,-8 24,0 t24,0 t24,0 t24,0" fill="none" stroke="#14a89a" strokeWidth="4" strokeLinecap="round" />
      <path d="M8,108 H112" stroke="#e8c98d" strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  kis: (
    <>
      <circle cx="60" cy="84" r="24" fill="#fff" {...s} />
      <circle cx="60" cy="46" r="17" fill="#fff" {...s} />
      <path d="M44,38 H76 V32 C76,20 44,20 44,32 Z" fill="#5b8def" {...s} />
      <path d="M40,38 H80" stroke="#1d3557" strokeWidth="6" strokeLinecap="round" />
      <circle cx="54" cy="46" r="2.4" fill={INK} />
      <circle cx="66" cy="46" r="2.4" fill={INK} />
      <path d="M60,50 L72,53 L60,55 Z" fill="#ff8a3d" {...s} strokeWidth={1.6} />
      <path d="M36,78 L20,66 M84,78 L100,66" {...ln} stroke="#8c5a2b" strokeWidth={4} />
      <circle cx="60" cy="78" r="2.6" fill={INK} />
      <circle cx="60" cy="90" r="2.6" fill={INK} />
      {[[18, 24], [100, 30], [24, 50], [104, 96]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#9ec3ff" />)}
    </>
  ),
  parti: (
    <>
      <path d="M78,62 C82,90 72,100 84,112" {...ln} strokeWidth={2} />
      <ellipse cx="80" cy="40" rx="18" ry="22" fill="#9b6bff" {...s} />
      <path d="M32,98 L54,30 L76,98 Z" fill="#ffc83d" {...s} transform="rotate(-10 54 64)" />
      <circle cx="50" cy="26" r="7" fill="#ff6b4a" {...s} transform="rotate(-10 54 64)" />
      <circle cx="46" cy="70" r="4" fill="#ff6b4a" />
      <circle cx="58" cy="54" r="4" fill="#14a89a" />
      <circle cx="62" cy="80" r="4" fill="#e9487d" />
      <path d="M12,40 l6,4 M20,20 l2,7 M104,80 l6,-4" stroke="#e9487d" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  spor: (
    <>
      <circle cx="56" cy="60" r="34" fill="#fff" {...s} />
      <path d="M56,44 l14,10 l-5,16 h-18 l-5,-16 Z" fill={INK} />
      <path d="M56,44 V26 M70,54 L88,48 M65,70 L76,86 M47,70 L36,86 M42,54 L24,48" {...ln} />
      <path d="M96,26 l6,-6 M100,40 l10,-2 M92,14 l2,-8" stroke="#ff6b4a" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  okul: (
    <>
      <path d="M44,28 C44,14 76,14 76,28" {...ln} strokeWidth={5} />
      <rect x="28" y="28" width="64" height="76" rx="16" fill="#ff6b4a" {...s} />
      <rect x="40" y="62" width="40" height="28" rx="8" fill="#ffc83d" {...s} />
      <path d="M28,50 C44,56 76,56 92,50" {...ln} />
      <path d="M52,62 V70 M68,62 V70" {...ln} />
    </>
  ),
  uzay: (
    <>
      <path d="M60,10 C76,24 80,46 76,74 H44 C40,46 44,24 60,10 Z" fill="#fff" {...s} />
      <circle cx="60" cy="42" r="9" fill="#5b8def" {...s} />
      <path d="M44,60 L30,80 L44,78 Z M76,60 L90,80 L76,78 Z" fill="#ff6b4a" {...s} />
      <path d="M50,76 L60,102 L70,76 Z" fill="#ffc83d" {...s} />
      {[[18, 22], [100, 30], [22, 92], [98, 96]].map(([x, y]) => <path key={x} d={`M${x},${y - 6} l2,4 l4,2 l-4,2 l-2,4 l-2,-4 l-4,-2 l4,-2 Z`} fill="#ffc83d" />)}
    </>
  ),
  masal: (
    <>
      <rect x="22" y="48" width="20" height="58" fill="#c9b8f0" {...s} />
      <rect x="78" y="48" width="20" height="58" fill="#c9b8f0" {...s} />
      <path d="M18,50 L32,22 L46,50 Z M74,50 L88,22 L102,50 Z" fill="#9b6bff" {...s} />
      <rect x="40" y="64" width="40" height="42" fill="#d8cbf5" {...s} />
      <path d="M52,106 V88 C52,80 68,80 68,88 V106 Z" fill="#8c5a2b" {...s} />
      <path d="M32,22 V10 L42,14 L32,18 M88,22 V10 L98,14 L88,18" fill="#ff6b4a" {...s} strokeWidth={2} />
    </>
  ),
  kamp: (
    <>
      <path d="M14,100 L50,34 L86,100 Z" fill="#ffc83d" {...s} />
      <path d="M50,34 L40,100 H60 Z" fill="#e8a200" {...s} />
      <path d="M92,100 L104,58 L116,100 Z" fill="#2bb673" {...s} transform="translate(-8 0)" />
      <path d="M100,52 L110,78 L90,78 Z" fill="#2bb673" {...s} transform="translate(-8 0)" />
      <path d="M8,104 H112" stroke="#7cc576" strokeWidth="6" strokeLinecap="round" />
      <circle cx="96" cy="22" r="10" fill="#fff1c7" {...s} />
    </>
  ),
};

export function ThemeArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      {THEMES[id]}
    </svg>
  );
}
