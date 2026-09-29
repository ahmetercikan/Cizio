/**
 * Mini meydan okuma kartlarının illüstrasyonları: uygulamanın mürekkep + düz renk çizim diliyle
 * (koyu kontur, yuvarlak uçlar, palet renkleri). Emoji yerine her oyunun ne olduğunu anlatır.
 */
import type { ChallengeKind } from '../lib/daily';

const INK = '#3a2b27';
const line = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

function Stopwatch() {
  return (
    <>
      {/* hız çizgileri */}
      <path d="M14,52 H30 M10,64 H26 M16,76 H30" {...line} stroke="#de4d2d" strokeWidth={2.6} />
      <rect x="55" y="16" width="18" height="9" rx="3" fill="#ff6b4a" stroke={INK} strokeWidth={3} />
      <path d="M86,32 L93,25" {...line} />
      <circle cx="64" cy="64" r="32" fill="#fff" stroke={INK} strokeWidth={3.2} />
      <path d="M64,64 m-32,0 a32,32 0 0,1 32,-32 L64,64 Z" fill="#fff1c7" />
      <circle cx="64" cy="64" r="32" {...line} />
      <path d="M64,38 V43 M90,64 H85 M64,90 V85 M38,64 H43" {...line} strokeWidth={2.6} />
      <path d="M64,64 L78,50" {...line} stroke="#de4d2d" />
      <circle cx="64" cy="64" r="4" fill={INK} />
    </>
  );
}

function Memory() {
  return (
    <>
      {/* arkadaki kart: çizim (yıldız) */}
      <g transform="rotate(-8 50 62)">
        <rect x="24" y="28" width="50" height="64" rx="7" fill="#fff" stroke={INK} strokeWidth={3} />
        <path d="M49,44 L53,55 L64,55 L55,62 L58,73 L49,66 L40,73 L43,62 L34,55 L45,55 Z" fill="#ffc83d" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      </g>
      {/* öndeki kart: kapanıyor */}
      <g transform="rotate(9 80 66)">
        <rect x="56" y="34" width="50" height="64" rx="7" fill="#e9487d" stroke={INK} strokeWidth={3} />
        <path d="M72,56 Q72,48 81,48 Q90,48 90,56 Q90,62 81,65 V70" {...line} stroke="#fff" strokeWidth={3.6} />
        <circle cx="81" cy="79" r="2.6" fill="#fff" />
      </g>
      {/* göz */}
      <path d="M18,24 Q30,14 42,24 Q30,34 18,24 Z" fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
      <circle cx="30" cy="24" r="3.6" fill={INK} />
    </>
  );
}

function OneLine() {
  return (
    <>
      {/* tek hamlede çizilmiş kedi başı: kalem hiç kalkmadan */}
      <path
        d="M16,92 C30,92 30,78 36,74 L32,40 L50,56 C58,52 70,52 78,56 L96,40 L92,74 C102,92 86,108 64,108 C42,108 26,92 36,74"
        {...line}
        stroke="#0d8074"
        strokeWidth={3.4}
      />
      <circle cx="54" cy="78" r="3.4" fill={INK} />
      <circle cx="74" cy="78" r="3.4" fill={INK} />
      <path d="M60,88 Q64,92 68,88" {...line} strokeWidth={2.6} />
      {/* başlangıç noktası ve kalem */}
      <circle cx="16" cy="92" r="4.5" fill="#14a89a" stroke={INK} strokeWidth={2} />
      <g transform="translate(36 74) rotate(35)">
        <path d="M0,0 L-3,-8 L3,-8 Z" fill={INK} />
        <path d="M-3,-8 L-7,-18 H7 L3,-8 Z" fill="#f6d7a7" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <rect x="-7" y="-52" width="14" height="34" fill="#ffc531" stroke={INK} strokeWidth={2} />
        <rect x="-7" y="-62" width="14" height="10" rx="4" fill="#ff8fb1" stroke={INK} strokeWidth={2} />
      </g>
    </>
  );
}

export function ChallengeArt({ kind }: { kind: ChallengeKind }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      {kind === 'speed' ? <Stopwatch /> : kind === 'memory' ? <Memory /> : <OneLine />}
    </svg>
  );
}
