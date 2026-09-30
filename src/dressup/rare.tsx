/**
 * Giydirme: sırt eşyaları (çanta, pelerin, kanatlar, jetpack) ve hazine sandığından çıkan nadir eşyalar.
 * Koordinatlar Doll.tsx ile aynı (300×440).
 */
import type { ReactNode } from 'react';
import { BODICE, INK, o, SW } from './ink';

const line = { fill: 'none', stroke: INK, strokeWidth: SW, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Sırt eşyasının vücudun arkasında kalan kısmı (saçtan da önce çizilir). */
export function backLayer(id?: string): ReactNode {
  switch (id) {
    case 'canta':
      return <rect x="102" y="186" width="96" height="104" rx="22" fill="#ff6b4a" {...o} />;
    case 'pelerin':
      return (
        <g>
          <path d="M118,184 L84,400 C124,414 176,414 216,400 L182,184 Z" fill="#e63946" {...o} />
          <path d="M92,390 C130,402 170,402 208,390" fill="none" stroke="#ffc83d" strokeWidth="5" />
        </g>
      );
    case 'kanat':
      return (
        <g opacity="0.95">
          <path d="M134,206 C96,150 30,140 22,176 C16,206 60,230 118,232 Z" fill="#e7d6ff" {...o} />
          <path d="M134,224 C90,236 44,262 54,292 C64,316 106,296 128,250 Z" fill="#ffd6ec" {...o} />
          <path d="M166,206 C204,150 270,140 278,176 C284,206 240,230 182,232 Z" fill="#e7d6ff" {...o} />
          <path d="M166,224 C210,236 256,262 246,292 C236,316 194,296 172,250 Z" fill="#ffd6ec" {...o} />
          <path d="M120,214 C90,188 60,176 40,180 M180,214 C210,188 240,176 260,180" fill="none" stroke="#b79cf0" strokeWidth="2.5" />
          {[[46, 170], [252, 170], [70, 280], [230, 280]].map(([x, y]) => (
            <path key={`${x}`} d={`M${x},${y - 6} l2,4 l4,2 l-4,2 l-2,4 l-2,-4 l-4,-2 l4,-2 Z`} fill="#ffc83d" />
          ))}
        </g>
      );
    case 'jetpack':
      return (
        <g>
          <path d="M118,300 C114,322 126,336 132,350 C138,334 146,322 142,300 Z M158,300 C154,322 166,336 172,350 C178,334 186,322 182,300 Z" fill="#ffc83d" {...o} strokeWidth={2.5} />
          <path d="M124,300 C122,314 128,322 132,330 C136,322 140,314 138,300 Z M164,300 C162,314 168,322 172,330 C176,322 180,314 178,300 Z" fill="#ff6b4a" />
          <rect x="108" y="196" width="46" height="110" rx="20" fill="#b9c6cc" {...o} />
          <rect x="146" y="196" width="46" height="110" rx="20" fill="#b9c6cc" {...o} />
          <path d="M116,220 H146 M154,220 H184" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case 'ejderhakanat':
      return (
        <g>
          <path d="M136,210 C100,150 44,132 18,160 C40,168 34,184 50,190 C44,204 58,212 70,212 C66,228 84,236 98,230 C104,240 120,240 130,236 Z" fill="#9b6bff" {...o} />
          <path d="M164,210 C200,150 256,132 282,160 C260,168 266,184 250,190 C256,204 242,212 230,212 C234,228 216,236 202,230 C196,240 180,240 170,236 Z" fill="#9b6bff" {...o} />
          <path d="M132,212 L60,176 M130,222 L76,214 M168,212 L240,176 M170,222 L224,214" fill="none" stroke="#6d45d6" strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}

/** Sırt eşyasının önde görünen kısmı (çanta askıları), üst giysiden sonra çizilir. */
export function backFront(id?: string): ReactNode {
  if (id === 'canta')
    return (
      <g>
        <path d="M124,182 C120,220 118,250 116,284 M176,182 C180,220 182,250 184,284" fill="none" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d="M124,182 C120,220 118,250 116,284 M176,182 C180,220 182,250 184,284" fill="none" stroke="#ff6b4a" strokeWidth="6" strokeLinecap="round" />
      </g>
    );
  if (id === 'jetpack')
    return <path d="M124,184 L120,288 M176,184 L180,288 M118,244 H182" fill="none" stroke="#6b7478" strokeWidth="6" strokeLinecap="round" />;
  return null;
}

/** Gökkuşağı elbise. */
export function rareDress(id: string): ReactNode {
  if (id !== 'gokkusagi') return null;
  const bands = ['#ff6b4a', '#ffc83d', '#2bb673', '#5b8def', '#9b6bff'];
  return (
    <g>
      <defs>
        <clipPath id="rainbow-skirt"><path d="M112,280 H188 L224,388 C196,402 104,402 76,388 Z" /></clipPath>
      </defs>
      <g clipPath="url(#rainbow-skirt)">
        {bands.map((c, i) => <rect key={c} x="60" y={280 + i * 24} width="180" height="25" fill={c} />)}
      </g>
      <path d="M112,280 H188 L224,388 C196,402 104,402 76,388 Z" fill="none" {...o} />
      <path d={BODICE} fill="#fff" {...o} />
      <path d="M134,200 l4,8 l9,1 l-6,6 l1,9 l-8,-4 l-8,4 l1,-9 l-6,-6 l9,-1 Z" fill="#ffc83d" transform="translate(12 20)" />
      {[[100, 300], [200, 330], [140, 360]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#fff" opacity="0.9" />)}
    </g>
  );
}

export function rareHat(id: string): ReactNode {
  if (id !== 'yildiztac') return null;
  return (
    <g>
      <path d="M106,72 L100,30 L124,50 L136,14 L150,40 L164,14 L176,50 L200,30 L194,72 Z" fill="#ffd966" {...o} />
      <path d="M150,26 l4,8 l9,1 l-7,6 l2,9 l-8,-5 l-8,5 l2,-9 l-7,-6 l9,-1 Z" fill="#ff8fb1" stroke={INK} strokeWidth="2" />
      <circle cx="122" cy="62" r="4" fill="#5b8def" />
      <circle cx="178" cy="62" r="4" fill="#2bb673" />
      <path d="M84,40 l3,-7 M92,24 l6,2 M216,40 l-3,-7 M208,24 l-6,2" stroke="#ffc83d" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function rareShoe(id: string): ReactNode {
  if (id !== 'isikli') return null;
  return (
    <g>
      <path d="M112,398 C112,389 120,386 128,386 H136 C142,386 146,390 146,396 V404 C146,408 143,410 139,410 H116 C112,410 110,406 112,398 Z" fill="#fff" {...o} />
      <rect x="110" y="403" width="38" height="8" rx="4" fill="#9be7de" {...o} strokeWidth={2} />
      {[['#ff6b4a', 116], ['#ffc83d', 124], ['#2bb673', 132], ['#9b6bff', 140]].map(([c, x]) => <circle key={x as number} cx={x as number} cy="407" r="2.4" fill={c as string} />)}
      <path d="M104,404 l-6,-2 M104,410 l-6,2 M128,382 l0,-6" stroke="#ffc83d" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function rarePet(id?: string): ReactNode {
  switch (id) {
    case 'ejderha':
      return (
        <g>
          <path d="M34,370 C18,350 22,336 36,340 C38,352 44,360 50,364 Z" fill="#c9b8f0" {...o} strokeWidth={2.5} />
          <path d="M26,404 C18,384 30,368 48,370 H70 C74,352 80,338 94,338 C106,338 110,350 104,358 C98,366 88,364 86,372 L88,404 Z" fill="#9b6bff" {...o} />
          <path d="M84,340 l-2,-12 l8,8 M96,338 l2,-12 l4,10" fill="#ffc83d" {...o} strokeWidth={2} />
          <ellipse cx="58" cy="392" rx="14" ry="10" fill="#e7d6ff" />
          <circle cx="96" cy="348" r="3" fill={INK} />
          <path d="M100,356 Q104,358 106,354" {...line} strokeWidth={2} />
          <path d="M46,404 v8 M76,404 v8" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        </g>
      );
    case 'unicorn':
      return (
        <g>
          <path d="M26,404 V376 C26,364 36,360 48,360 H74 C80,360 84,352 84,344 C84,334 92,328 102,332 C110,336 110,350 104,356 L96,362 V404" fill="#fff" {...o} />
          <path d="M98,330 L106,308 L104,334 Z" fill="#ffd966" {...o} strokeWidth={2} />
          <path d="M86,334 C74,330 70,346 78,356 C70,360 68,372 76,378" fill="none" stroke="#ff8fb1" strokeWidth="7" strokeLinecap="round" />
          <path d="M26,376 C14,380 12,396 20,404" fill="none" stroke="#9b6bff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="98" cy="344" r="2.6" fill={INK} />
          <path d="M36,404 v8 M52,404 v8 M72,404 v8 M88,404 v8" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'panda':
      return (
        <g>
          <ellipse cx="62" cy="388" rx="27" ry="23" fill="#fff" {...o} />
          <path d="M38,384 C36,404 44,410 52,406 M86,384 C88,404 80,410 72,406" fill="none" stroke={INK} strokeWidth="12" strokeLinecap="round" />
          <circle cx="44" cy="334" r="8" fill={INK} />
          <circle cx="80" cy="334" r="8" fill={INK} />
          <circle cx="62" cy="350" r="21" fill="#fff" {...o} />
          <ellipse cx="54" cy="348" rx="5" ry="7" fill={INK} transform="rotate(-20 54 348)" />
          <ellipse cx="70" cy="348" rx="5" ry="7" fill={INK} transform="rotate(20 70 348)" />
          <circle cx="55" cy="346" r="1.8" fill="#fff" />
          <circle cx="71" cy="346" r="1.8" fill="#fff" />
          <ellipse cx="62" cy="358" rx="3.5" ry="2.5" fill={INK} />
        </g>
      );
    default:
      return null;
  }
}

export function rareBg(id: string): ReactNode {
  if (id !== 'gokkusagi') return null;
  const arcs = ['#ff6b4a', '#ffc83d', '#2bb673', '#5b8def', '#9b6bff'];
  return (
    <g>
      <rect width="300" height="440" fill="#ffeef7" />
      {arcs.map((c, i) => (
        <path key={c} d={`M${-10 + i * 14},330 A${160 - i * 14},${160 - i * 14} 0 0,1 ${310 - i * 14},330`} fill="none" stroke={c} strokeWidth="14" opacity="0.85" />
      ))}
      {[[40, 90], [250, 70]].map(([x, y]) => (
        <path key={x} d={`M${x},${y} a16,16 0 0,1 28,-8 a14,14 0 0,1 24,6 a10,10 0 0,1 -4,18 H${x + 4} a10,10 0 0,1 -4,-16 Z`} fill="#fff" />
      ))}
      {[[70, 150], [230, 140], [150, 60], [40, 230], [260, 220]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x},${y - 7} l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2 Z`} fill="#ffc83d" />
      ))}
      <path d="M0,350 C90,332 210,336 300,350 V440 H0 Z" fill="#c9f2d6" />
      {[[40, 390, '#ff8fb1'], [110, 410, '#ffc83d'], [200, 396, '#9b6bff'], [260, 414, '#ff6b4a']].map(([x, y, c]) => (
        <g key={x as number}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={(x as number) + 5 * Math.cos((a * Math.PI) / 180)} cy={(y as number) + 5 * Math.sin((a * Math.PI) / 180)} r="4" fill={c as string} />)}
          <circle cx={x as number} cy={y as number} r="2.6" fill="#fff" />
        </g>
      ))}
    </g>
  );
}
