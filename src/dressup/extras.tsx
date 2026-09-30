/**
 * Giydirme: sonradan eklenen parçaların çizimleri (saçlar, ifadeler, gözlükler, giysiler, ayakkabılar,
 * şapkalar, eldeki eşyalar, evcil dostlar, arka planlar ve desenler). Doll.tsx bilmediği kimlikleri
 * buraya sorar; bir parça burada da yoksa null döner.
 * Koordinatlar Doll.tsx ile aynı (300×440): baş (150,118) r≈60, sağ el (210,300), ayaklar y 386–410.
 */
import type { ReactNode } from 'react';
import { BODICE, INK, Limb, o, shade, SW, TOP } from './ink';

const fill = (c: string) => ({ fill: c, ...o });
const line = { fill: 'none', stroke: INK, strokeWidth: SW, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Rengin açıklığı (0 koyu – 1 açık). */
export function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

// ------------------------------------------------------------------------------------------------
// Desenler
// ------------------------------------------------------------------------------------------------
export function PatternDef({ id, kind, color }: { id: string; kind: string; color: string }) {
  const ink = lum(color) > 0.62 ? 'rgba(58,43,39,0.3)' : 'rgba(255,255,255,0.62)';
  const P = (w: number, h: number, children: ReactNode) => (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">{children}</pattern>
  );
  switch (kind) {
    case 'cizgili':
      return P(24, 16, <rect width="24" height="5" fill={ink} />);
    case 'puantiye':
      return P(24, 24, <><circle cx="6" cy="6" r="3.4" fill={ink} /><circle cx="18" cy="18" r="3.4" fill={ink} /></>);
    case 'kareli':
      return P(28, 28, <><rect y="11" width="28" height="6" fill={ink} /><rect x="11" width="6" height="28" fill={ink} /></>);
    case 'yildiz':
      return P(30, 30, <path d="M15,7 l2.4,5 l5.4,0.6 l-4,3.7 l1.1,5.4 l-4.9,-2.7 l-4.9,2.7 l1.1,-5.4 l-4,-3.7 l5.4,-0.6 Z" fill={ink} />);
    case 'kalp':
      return P(28, 28, <path d="M14,21 C6,15 6,8 11,8 C13,8 14,10 14,11 C14,10 15,8 17,8 C22,8 22,15 14,21 Z" fill={ink} />);
    case 'cicek':
      return P(30, 30, (
        <>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={15 + 4.5 * Math.cos((a * Math.PI) / 180)} cy={15 + 4.5 * Math.sin((a * Math.PI) / 180)} r="3" fill={ink} />)}
          <circle cx="15" cy="15" r="2.2" fill={lum(color) > 0.62 ? 'rgba(232,162,0,0.6)' : 'rgba(255,200,61,0.9)'} />
        </>
      ));
    default:
      return null;
  }
}

/** Desen geçişi: aynı şeklin desenle doldurulmuş kopyası (kontursuz). */
export const Pat = ({ d, p }: { d: string; p?: string }) => (p ? <path d={d} fill={p} /> : null);
export const PatLimb = ({ d, w, p, dash }: { d: string; w: number; p?: string; dash?: number }) =>
  p ? <path d={d} fill="none" stroke={p} strokeWidth={w} strokeDasharray={dash ? `${dash} 999` : undefined} strokeLinecap={dash ? 'butt' : 'round'} /> : null;

// ------------------------------------------------------------------------------------------------
// Saçlar
// ------------------------------------------------------------------------------------------------
const FRONT_PART = 'M86,126 C82,58 118,44 150,48 C182,44 218,58 214,126 C206,96 176,80 150,72 C124,80 94,96 86,126 Z';
const FRONT_BACK = 'M86,124 C80,58 116,44 150,46 C184,44 220,58 214,124 C206,96 184,82 150,80 C116,82 94,96 86,124 Z';

export function hairBack2(style: string, c: string): ReactNode {
  const f = fill(c);
  switch (style) {
    case 'dalgali':
      return <path d="M84,112 C78,50 222,50 216,112 C226,150 208,170 224,200 C236,226 214,250 228,274 C200,288 100,288 72,274 C86,250 64,226 76,200 C92,170 74,150 84,112 Z" {...f} />;
    case 'uzunkivircik': {
      const pts = [[92, 80], [112, 58], [138, 46], [162, 46], [188, 58], [208, 80], [222, 108], [78, 108], [226, 140], [74, 140], [228, 172], [72, 172], [224, 204], [76, 204], [216, 234], [84, 234], [198, 256], [102, 256], [174, 266], [126, 266], [150, 270]];
      return (
        <g>
          <path d="M80,110 C76,50 224,50 220,110 L226,240 C200,272 100,272 74,240 Z" fill={c} />
          {pts.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="21" {...f} />)}
          <path d="M80,110 C76,50 224,50 220,110 L226,240 C200,272 100,272 74,240 Z" fill={c} opacity="0.001" />
        </g>
      );
    }
    case 'ikikuyruk':
      return (
        <g>
          {[false, true].map((m) => (
            <g key={String(m)} transform={m ? 'translate(300 0) scale(-1 1)' : undefined}>
              <path d="M98,130 C64,140 56,196 70,244 C78,256 94,250 90,236 C84,204 92,170 108,146 Z" {...f} />
              <circle cx="100" cy="140" r="7.5" fill="#ff6b4a" {...o} strokeWidth={2.5} />
            </g>
          ))}
        </g>
      );
    case 'tepetopuz':
      return (
        <g>
          <circle cx="150" cy="36" r="26" {...f} />
          <path d="M126,58 C140,64 160,64 174,58" stroke="#ff6b4a" strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'kakul':
      return <path d="M86,112 C80,56 220,56 214,112 L214,152 C200,160 100,160 86,152 Z" {...f} />;
    case 'yanorgu':
      return <path d="M84,112 C78,52 222,52 216,112 L218,150 C200,160 100,160 82,150 Z" {...f} />;
    default:
      return null;
  }
}

export function hairFront2(style: string, c: string): ReactNode {
  const f = fill(c);
  switch (style) {
    case 'dalgali':
    case 'ikikuyruk':
      return <path d={FRONT_PART} {...f} />;
    case 'uzunkivircik':
      return (
        <g>
          {[[94, 104], [102, 80], [120, 62], [142, 54], [164, 56], [184, 64], [200, 82], [208, 106]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="16" {...f} />)}
          <path d="M86,124 C80,62 116,46 150,46 C184,46 220,62 214,124 C206,98 186,84 150,86 C114,84 94,98 86,124 Z" fill={c} />
          <path d="M86,124 C94,98 114,84 150,86 C186,84 206,98 214,124" {...line} />
        </g>
      );
    case 'tepetopuz':
      return <path d={FRONT_BACK} {...f} />;
    case 'kakul':
      return <path d="M86,122 C80,56 220,56 214,122 L208,100 L196,106 L184,98 L170,106 L157,98 L143,106 L130,98 L116,106 L102,98 L92,104 Z" {...f} />;
    case 'kazima':
      return (
        <g>
          <path d="M88,118 C84,66 118,54 150,54 C182,54 216,66 212,118 C204,100 184,92 150,92 C116,92 96,100 88,118 Z" {...f} />
          {[[112, 74], [132, 66], [152, 64], [172, 66], [192, 74], [122, 82], [162, 76]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill={shade(c === '#ffffff' ? '#dddddd' : c, 0.6)} />)}
        </g>
      );
    case 'yanorgu':
      return (
        <g>
          <path d="M86,126 C82,58 116,44 152,46 C194,48 220,70 214,128 C206,96 186,80 160,80 C140,94 112,104 86,126 Z" {...f} />
          <path d="M210,120 C214,140 212,156 204,170" stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
          <path d="M210,120 C214,140 212,156 204,170" stroke={c} strokeWidth="15" strokeLinecap="round" fill="none" />
          {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={i % 2 ? 206 : 200} cy={182 + i * 18} rx="12" ry="12" {...f} strokeWidth={3} />)}
          <path d="M192,272 l10,-6 l10,6 l-10,6 Z" fill="#ff6b4a" {...o} strokeWidth={2.5} />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Yüz ifadeleri ve gözlükler
// ------------------------------------------------------------------------------------------------
const heart = (x: number, y: number, s = 1) =>
  `M${x},${y + 8 * s} C${x - 12 * s},${y} ${x - 10 * s},${y - 12 * s} ${x},${y - 6 * s} C${x + 10 * s},${y - 12 * s} ${x + 12 * s},${y} ${x},${y + 8 * s} Z`;

/** Yeni ifadelerin gözleri ve ağzı (kaşlar Doll.tsx'te; `kararli` kaşları burada). */
export function face2(face: string, eye: (x: number) => ReactNode): ReactNode {
  switch (face) {
    case 'utangac':
      return (
        <g>
          <path d="M120,126 Q128,133 136,126 M164,126 Q172,133 180,126" {...line} />
          <ellipse cx="114" cy="146" rx="12" ry="7" fill="#ff6b9a" opacity="0.45" />
          <ellipse cx="186" cy="146" rx="12" ry="7" fill="#ff6b9a" opacity="0.45" />
          <path d="M143,152 Q150,157 157,152" {...line} />
        </g>
      );
    case 'dil':
      return (
        <g>
          {eye(128)}
          {eye(172)}
          <path d="M146,155 C146,168 158,168 158,155" fill="#ff8fb1" {...o} strokeWidth={2.8} />
          <path d="M136,150 Q150,160 164,150" {...line} />
        </g>
      );
    case 'asik':
      return (
        <g>
          <path d={heart(128, 126)} fill="#e63946" {...o} strokeWidth={2.5} />
          <path d={heart(172, 126)} fill="#e63946" {...o} strokeWidth={2.5} />
          <path d="M136,148 Q150,164 164,148" {...line} />
        </g>
      );
    case 'kararli':
      return (
        <g>
          {eye(128)}
          {eye(172)}
          <path d="M140,153 Q150,157 160,153" {...line} />
        </g>
      );
    case 'uykulu':
      return (
        <g>
          <path d="M120,128 Q128,132 136,128 M164,128 Q172,132 180,128" {...line} />
          <path d="M122,132 L120,136 M134,132 L136,136 M166,132 L164,136 M178,132 L180,136" {...line} strokeWidth={2} />
          <ellipse cx="150" cy="156" rx="5" ry="6" fill={INK} />
          <text x="214" y="70" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="22" fill="#5b8def" stroke={INK} strokeWidth="1">z</text>
          <text x="228" y="52" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="16" fill="#5b8def" stroke={INK} strokeWidth="1">z</text>
        </g>
      );
    default:
      return null;
  }
}

export const hasFace2 = (face: string) => ['utangac', 'dil', 'asik', 'kararli', 'uykulu'].includes(face);

export function glasses2(id: string): ReactNode {
  switch (id) {
    case 'kare':
      return (
        <g fill="rgba(255,255,255,0.18)" {...o} strokeWidth={3.2}>
          <rect x="112" y="115" width="32" height="26" rx="5" />
          <rect x="156" y="115" width="32" height="26" rx="5" />
          <path d="M144,124 H156 M112,122 L90,120 M188,122 L210,120" fill="none" />
        </g>
      );
    case 'kalp':
      return (
        <g fill="rgba(255,111,145,0.35)" stroke="#e63946" strokeWidth={3.2} strokeLinejoin="round">
          <path d={heart(128, 127, 1.3)} />
          <path d={heart(172, 127, 1.3)} />
          <path d="M142,122 Q150,117 158,122" fill="none" />
        </g>
      );
    case 'kayak':
      return (
        <g>
          <path d="M86,124 H214" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <path d="M86,124 H214" stroke="#9b6bff" strokeWidth="6" strokeLinecap="round" />
          <rect x="106" y="108" width="88" height="36" rx="17" fill="#ffb347" {...o} />
          <path d="M118,116 L130,132 M136,116 L144,126" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Üstler
// ------------------------------------------------------------------------------------------------
export const ATLET = 'M120,182 C124,180 128,180 131,183 C136,196 164,196 169,183 C172,180 176,180 180,182 L192,302 C192,308 186,312 180,312 H120 C114,312 108,308 108,302 Z';

/** Yeni üstler. Kol uzunluğu ve rengi: sleeve2. */
export function top2(id: string, c: string, pat?: string): ReactNode {
  const f = fill(c);
  const dark = shade(c, 0.8);
  switch (id) {
    case 'atlet':
      return (
        <g>
          <path d={ATLET} {...f} />
          <Pat d={ATLET} p={pat} />
          <path d={ATLET} fill="none" {...o} />
        </g>
      );
    case 'kalpli':
      return (
        <g>
          <path d={TOP} {...f} />
          <Pat d={TOP} p={pat} />
          <path d="M150,266 C122,248 122,222 138,218 C145,216 150,222 150,227 C150,222 155,216 162,218 C178,222 178,248 150,266 Z" fill={c.toLowerCase() === '#e9487d' || c.toLowerCase() === '#ff8fb1' ? '#fff' : '#e9487d'} {...o} strokeWidth={2.8} />
          <path d="M136,180 Q150,194 164,180" fill="none" stroke={dark} strokeWidth="3" />
        </g>
      );
    case 'hawaii':
      return (
        <g>
          <path d={TOP} {...f} />
          <Pat d={TOP} p={pat} />
          {[[126, 222], [170, 214], [140, 262], [180, 270], [120, 292], [160, 296]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 5 * Math.cos((a * Math.PI) / 180)} cy={y + 5 * Math.sin((a * Math.PI) / 180)} r="4" fill="#fff" opacity="0.9" />)}
              <circle cx={x} cy={y} r="2.6" fill="#ffc83d" />
            </g>
          ))}
          <path d="M150,198 V310" stroke={dark} strokeWidth="3" />
          <path d="M134,179 L150,198 L140,206 L126,186 Z M166,179 L150,198 L160,206 L174,186 Z" fill={dark} {...o} strokeWidth={2.8} />
        </g>
      );
    case 'ceket':
      return (
        <g>
          <path d={TOP} fill="#ffffff" {...o} />
          <path d="M110,196 C110,184 121,178 134,178 L141,181 L145,312 H118 C112,312 106,308 106,302 Z" {...f} />
          <path d="M190,196 C190,184 179,178 166,178 L159,181 L155,312 H182 C188,312 194,308 194,302 Z" {...f} />
          <Pat d="M110,196 C110,184 121,178 134,178 L141,181 L145,312 H118 C112,312 106,308 106,302 Z" p={pat} />
          <Pat d="M190,196 C190,184 179,178 166,178 L159,181 L155,312 H182 C188,312 194,308 194,302 Z" p={pat} />
          <path d="M134,179 L146,206 L136,212 L124,186 Z M166,179 L154,206 L164,212 L176,186 Z" fill={dark} {...o} strokeWidth={2.8} />
          <rect x="116" y="226" width="20" height="16" rx="3" fill="none" stroke={dark} strokeWidth="3" />
          <rect x="164" y="226" width="20" height="16" rx="3" fill="none" stroke={dark} strokeWidth="3" />
          <path d="M112,292 H144 M156,292 H188" stroke="#ffc83d" strokeWidth="2" strokeDasharray="4 4" />
        </g>
      );
    case 'yelek':
      return (
        <g>
          <path d={TOP} fill="#ffffff" {...o} />
          <path d="M134,179 L150,198 L140,206 L126,186 Z M166,179 L150,198 L160,206 L174,186 Z" fill="#fff" {...o} strokeWidth={2.8} />
          <path d="M112,198 C112,190 118,184 126,184 L150,248 L174,184 C182,184 188,190 188,198 L192,300 C192,306 186,310 180,310 H120 C114,310 108,306 108,300 Z" {...f} />
          <Pat d="M112,198 C112,190 118,184 126,184 L150,248 L174,184 C182,184 188,190 188,198 L192,300 C192,306 186,310 180,310 H120 C114,310 108,306 108,300 Z" p={pat} />
          <path d="M120,294 H180 M122,302 H178" stroke={dark} strokeWidth="3" />
          {[262, 282].map((y) => <circle key={y} cx="150" cy={y} r="3" fill={INK} />)}
        </g>
      );
    case 'balikci':
      return (
        <g>
          <path d={TOP} {...f} />
          <Pat d={TOP} p={pat} />
          <path d="M132,162 H168 V190 C160,195 140,195 132,190 Z" fill={dark} {...o} />
          <path d="M140,164 V190 M150,164 V192 M160,164 V190" stroke={shade(c, 0.65)} strokeWidth="2.5" />
        </g>
      );
    default:
      return null;
  }
}

export const SLEEVE2: Record<string, [number, string?]> = {
  atlet: [0],
  kalpli: [38],
  hawaii: [38],
  ceket: [94],
  yelek: [94, '#ffffff'],
  balikci: [94],
};

// ------------------------------------------------------------------------------------------------
// Altlar
// ------------------------------------------------------------------------------------------------
const HIP = 'M110,284 H190 L193,318 C170,322 130,322 107,318 Z';
const LEG2_L = 'M134,298 L130,390';
const LEG2_R = 'M166,298 L170,390';

function Pants({ c, w = 27, dash, pat }: { c: string; w?: number; dash?: number; pat?: string }) {
  return (
    <>
      <Limb d={LEG2_L} c={c} w={w} dash={dash} />
      <Limb d={LEG2_R} c={c} w={w} dash={dash} />
      <PatLimb d={LEG2_L} w={w} p={pat} dash={dash} />
      <PatLimb d={LEG2_R} w={w} p={pat} dash={dash} />
      <path d={HIP} {...fill(c)} />
      <Pat d={HIP} p={pat} />
    </>
  );
}

export function bottom2(id: string, c: string, pat?: string): ReactNode {
  const dark = shade(c, 0.78);
  switch (id) {
    case 'kot':
      return (
        <g>
          <Pants c={c} pat={pat} />
          <path d="M114,292 Q124,302 132,292 M186,292 Q176,302 168,292" fill="none" stroke="#ffc83d" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M150,300 V318" stroke={dark} strokeWidth="3" />
          <rect x="115" y="372" width="30" height="12" rx="3" fill={shade(c, 1.15)} {...o} strokeWidth={2.5} transform="rotate(-2 130 378)" />
          <rect x="155" y="372" width="30" height="12" rx="3" fill={shade(c, 1.15)} {...o} strokeWidth={2.5} transform="rotate(2 170 378)" />
        </g>
      );
    case 'esofman':
      return (
        <g>
          <Pants c={c} pat={pat} />
          <path d="M121,304 L117,386 M179,304 L183,386" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M114,380 H146 M154,380 H186" stroke={dark} strokeWidth="6" />
          <path d="M146,286 L143,300 M154,286 L157,300" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'kargo':
      return (
        <g>
          <Pants c={c} dash={62} pat={pat} />
          <rect x="108" y="322" width="16" height="20" rx="3" fill={dark} {...o} strokeWidth={2.5} />
          <rect x="176" y="322" width="16" height="20" rx="3" fill={dark} {...o} strokeWidth={2.5} />
        </g>
      );
    case 'uzunetek': {
      const d = 'M112,284 H188 L216,388 C190,398 110,398 84,388 Z';
      return (
        <g>
          <path d={d} {...fill(c)} />
          <Pat d={d} p={pat} />
          <path d={d} fill="none" {...o} />
          <path d="M100,332 C130,340 170,340 200,332 M92,362 C130,372 170,372 208,362" fill="none" stroke={dark} strokeWidth="3" />
        </g>
      );
    }
    case 'tutu': {
      const d = 'M110,282 H190 L230,330 C200,344 100,344 70,330 Z';
      return (
        <g>
          <path d={d} {...fill(c)} />
          <Pat d={d} p={pat} />
          <path d="M70,330 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M116,288 H184 L206,316 C186,326 114,326 94,316 Z" fill={shade(c, 1.12)} opacity="0.9" />
        </g>
      );
    }
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Tek parçalar (elbise, kostüm)
// ------------------------------------------------------------------------------------------------
export const DRESS_SLEEVE2: Record<string, [number, string?]> = {
  pijama: [94],
  astronot: [94, '#f4f4f4'],
  doktor: [94, '#ffffff'],
  yagmurluk: [94],
  sovalye: [94, '#b9c6cc'],
  balerin: [0],
  ressam: [94],
};

/** Pelerin, sırt çantası gibi arka katmanlar. */
export function dressBack2(id: string): ReactNode {
  if (id === 'astronot')
    return <rect x="108" y="186" width="84" height="92" rx="12" fill="#b9c6cc" {...o} />;
  return null;
}

export function dressLegs2(id: string, c: string, pat?: string): ReactNode {
  switch (id) {
    case 'pijama':
      return <Pants c={c} pat={pat} />;
    case 'astronot':
      return (
        <g>
          <Pants c="#f4f4f4" />
          <rect x="116" y="340" width="28" height="12" rx="4" fill={c} {...o} strokeWidth={2.5} />
          <rect x="156" y="340" width="28" height="12" rx="4" fill={c} {...o} strokeWidth={2.5} />
        </g>
      );
    case 'doktor':
      return <Pants c={c} pat={pat} />;
    case 'sovalye':
      return <Pants c="#b9c6cc" w={24} />;
    case 'balerin':
      return (
        <>
          <Limb d="M134,300 L130,392" c="#ffd6e0" w={20} />
          <Limb d="M166,300 L170,392" c="#ffd6e0" w={20} />
        </>
      );
    default:
      return null;
  }
}

const COAT_L = 'M108,196 C108,184 120,178 132,178 L142,184 L140,352 H104 C100,352 98,348 99,344 Z';
const COAT_R = 'M192,196 C192,184 180,178 168,178 L158,184 L160,352 H196 C200,352 202,348 201,344 Z';
const RAINCOAT = 'M110,196 C110,184 121,178 134,178 H166 C179,178 190,184 190,196 L204,346 C180,354 120,354 96,346 Z';

export function dressBody2(id: string, c: string, pat?: string): ReactNode {
  const f = fill(c);
  const dark = shade(c, 0.8);
  switch (id) {
    case 'pijama':
      return (
        <g>
          <path d={TOP} {...f} />
          <Pat d={TOP} p={pat} />
          {!pat && [[126, 222, 'M'], [172, 240, 'S'], [138, 280, 'S'], [178, 292, 'M']].map(([x, y, k]) =>
            k === 'M'
              ? <path key={`${x}`} d={`M${x},${y} a8,8 0 1,0 8,10 a6,6 0 1,1 -8,-10 Z`} fill="#fff1c7" />
              : <path key={`${x}`} d={`M${x},${(y as number) - 6} l2,5 l5,0.5 l-4,3.5 l1,5 l-4,-2.5 l-4,2.5 l1,-5 l-4,-3.5 l5,-0.5 Z`} fill="#fff1c7" />,
          )}
          <path d="M134,179 L150,200 L166,179" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
        </g>
      );
    case 'astronot':
      return (
        <g>
          <path d={TOP} fill="#f4f4f4" {...o} />
          <rect x="128" y="212" width="44" height="40" rx="6" fill={c} {...o} strokeWidth={2.8} />
          <circle cx="140" cy="224" r="4" fill="#ff6b4a" />
          <circle cx="154" cy="224" r="4" fill="#ffc83d" />
          <circle cx="160" cy="240" r="4" fill="#2bb673" />
          <rect x="136" y="236" width="14" height="8" rx="2" fill="#fff" />
          <rect x="106" y="284" width="88" height="12" rx="4" fill={dark} {...o} strokeWidth={2.5} />
          <circle cx="122" cy="200" r="7" fill={c} {...o} strokeWidth={2} />
        </g>
      );
    case 'doktor':
      return (
        <g>
          <path d={TOP} {...f} />
          <path d={COAT_L} fill="#fff" {...o} />
          <path d={COAT_R} fill="#fff" {...o} />
          <path d="M132,179 L144,210 L134,216 L122,188 Z M168,179 L156,210 L166,216 L178,188 Z" fill="#eef3f6" {...o} strokeWidth={2.5} />
          <rect x="168" y="238" width="22" height="20" rx="3" fill="none" stroke={INK} strokeWidth="2.5" />
          <path d="M174,232 V246" stroke="#5b8def" strokeWidth="3" strokeLinecap="round" />
          <path d="M136,186 C128,214 130,236 146,242 M164,186 C172,214 170,236 154,242" fill="none" stroke="#3a2b27" strokeWidth="3" />
          <circle cx="150" cy="250" r="7" fill="#b9c6cc" {...o} strokeWidth={2.5} />
        </g>
      );
    case 'yagmurluk':
      return (
        <g>
          <path d="M118,186 C118,166 182,166 182,186 C170,196 130,196 118,186 Z" fill={dark} {...o} />
          <path d={RAINCOAT} {...f} />
          <Pat d={RAINCOAT} p={pat} />
          <path d="M150,182 V350" stroke={dark} strokeWidth="3" />
          {[214, 248, 282, 316].map((y) => <rect key={y} x="156" y={y} width="12" height="5" rx="2" fill={INK} />)}
          <path d="M104,318 L196,318" stroke={dark} strokeWidth="3" />
        </g>
      );
    case 'sovalye':
      return (
        <g>
          <path d={TOP} fill="#b9c6cc" {...o} />
          {[200, 216, 232, 248, 264, 280, 296].map((y) => <path key={y} d={`M112,${y} H188`} stroke="#9aa6ad" strokeWidth="2" strokeDasharray="3 4" />)}
          <path d="M122,184 H178 L182,330 L150,346 L118,330 Z" {...f} />
          <Pat d="M122,184 H178 L182,330 L150,346 L118,330 Z" p={pat} />
          <path d="M150,210 V270 M130,236 H170" stroke="#ffc83d" strokeWidth="8" strokeLinecap="round" />
          <rect x="108" y="286" width="84" height="10" rx="3" fill="#8c5a2b" {...o} strokeWidth={2.5} />
        </g>
      );
    case 'balerin': {
      const tutu = 'M104,282 H196 L240,318 C200,336 100,336 60,318 Z';
      return (
        <g>
          <path d={tutu} {...f} />
          <path d="M60,318 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0 q10,10 20,0" fill="none" stroke={INK} strokeWidth="3" />
          <path d={ATLET.replace('L192,302 C192,308 186,312 180,312 H120 C114,312 108,308 108,302', 'L190,292 H110')} {...f} />
          <Pat d={ATLET.replace('L192,302 C192,308 186,312 180,312 H120 C114,312 108,308 108,302', 'L190,292 H110')} p={pat} />
          <path d="M112,288 H188 L210,310 C186,320 114,320 90,310 Z" fill={shade(c, 1.12)} opacity="0.85" />
          <circle cx="150" cy="206" r="5" fill="#fff" {...o} strokeWidth={2} />
        </g>
      );
    }
    case 'ressam':
      return (
        <g>
          <path d={RAINCOAT} {...f} />
          <Pat d={RAINCOAT} p={pat} />
          {[[124, 230, '#ff6b4a'], [170, 250, '#5b8def'], [136, 300, '#ffc83d'], [182, 318, '#2bb673'], [118, 330, '#9b6bff']].map(([x, y, col]) => (
            <path key={`${x}`} d={`M${x},${y} c6,-6 14,-2 12,4 c6,2 2,12 -4,10 c-2,6 -12,4 -12,-2 c-6,-2 -2,-12 4,-12 Z`} fill={col as string} opacity="0.9" />
          ))}
          <rect x="132" y="258" width="36" height="28" rx="4" fill={dark} {...o} strokeWidth={2.5} />
          <path d="M140,258 L136,238 M150,258 V234 M160,258 L166,240" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M134,179 L150,198 L166,179" fill="none" stroke="#fff" strokeWidth="4" />
        </g>
      );
    default:
      return null;
  }
}

/** Yazlık/balo elbisesi ve tulum için desen geçişi (Doll.tsx'teki şekiller). */
export const DRESS_PATTERN_SHAPES: Record<string, string[]> = {
  yazlik: ['M112,282 H188 L216,364 C190,376 110,376 84,364 Z', BODICE],
  prenses: ['M112,278 H188 L228,398 C198,412 102,412 72,398 Z', BODICE],
  tulum: ['M124,222 H176 L178,300 H122 Z', 'M110,284 H190 L193,318 C170,322 130,322 107,318 Z'],
  kahraman: [TOP],
};

// ------------------------------------------------------------------------------------------------
// Ayakkabılar (sol ayak; sağ ayak aynalanır)
// ------------------------------------------------------------------------------------------------
export function shoe2(id: string, c: string): ReactNode {
  const f = fill(c);
  switch (id) {
    case 'bilekli':
      return (
        <g>
          <path d="M118,368 H145 V402 C145,407 142,410 137,410 H114 C109,410 108,404 110,399 C112,394 116,392 118,390 Z" {...f} />
          <path d="M110,399 C112,394 116,392 124,392 V410 H114 C109,410 108,404 110,399 Z" fill="#fff" {...o} strokeWidth={2.5} />
          <path d="M109,405 H146" stroke={INK} strokeWidth="2" />
          <circle cx="137" cy="380" r="5" fill="#fff" {...o} strokeWidth={2} />
          <path d="M126,376 L134,380 M126,384 L134,388" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'paten':
      return (
        <g>
          <path d="M118,366 H145 V398 C145,403 142,406 137,406 H114 C109,406 108,400 110,395 C112,390 116,388 118,386 Z" {...f} />
          <rect x="108" y="405" width="40" height="6" rx="2" fill="#b9c6cc" {...o} strokeWidth={2} />
          <circle cx="116" cy="416" r="6" fill="#ffc83d" {...o} strokeWidth={2} />
          <circle cx="140" cy="416" r="6" fill="#ffc83d" {...o} strokeWidth={2} />
          <path d="M126,374 L136,378 M126,382 L136,386" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'terlik':
      return (
        <g>
          <ellipse cx="134" cy="378" rx="4.5" ry="11" fill={c} {...o} strokeWidth={2.5} transform="rotate(-12 134 378)" />
          <ellipse cx="143" cy="380" rx="4.5" ry="11" fill={c} {...o} strokeWidth={2.5} transform="rotate(10 143 380)" />
          <path d="M108,400 C108,388 120,384 130,384 H138 C145,384 149,390 149,398 V404 C149,409 145,411 140,411 H116 C110,411 107,406 108,400 Z" {...f} />
          <circle cx="118" cy="396" r="2" fill={INK} />
          <circle cx="127" cy="396" r="2" fill={INK} />
          <circle cx="122" cy="401" r="2" fill="#ff8fb1" />
        </g>
      );
    case 'kovboy':
      return (
        <g>
          <path d="M118,350 H146 V400 C146,405 144,408 140,410 L102,410 C102,404 112,400 118,398 Z" {...f} />
          <path d="M140,410 H148 V404" fill={INK} stroke={INK} strokeWidth="3" />
          <path d="M122,362 C130,372 136,372 142,362 M124,378 C130,386 136,386 142,378" fill="none" stroke={shade(c, 0.7)} strokeWidth="2.5" />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Şapkalar
// ------------------------------------------------------------------------------------------------
export function hat2(id: string, c: string): ReactNode {
  const f = fill(c);
  switch (id) {
    case 'hasir':
      return (
        <g>
          <ellipse cx="150" cy="88" rx="92" ry="18" fill="#f2d27a" {...o} />
          <path d="M104,88 C104,42 196,42 196,88 Z" fill="#f2d27a" {...o} />
          <path d="M104,76 C130,82 170,82 196,76 V88 C170,92 130,92 104,88 Z" {...f} />
          <path d="M120,58 L130,50 M170,50 L180,58 M80,90 L96,94 M204,94 L220,90" stroke="#c9a24a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'kovboy':
      return (
        <g>
          <path d="M106,82 C104,46 118,36 132,44 C140,48 146,44 150,40 C154,44 160,48 168,44 C182,36 196,46 194,82 Z" {...f} />
          <path d="M106,72 C130,78 170,78 194,72 V82 C170,86 130,86 106,82 Z" fill={shade(c, 0.6)} />
          <path d="M64,84 C84,64 110,82 150,82 C190,82 216,64 236,84 C214,102 86,102 64,84 Z" {...f} />
        </g>
      );
    case 'korsan':
      return (
        <g>
          <path d="M76,96 C90,36 210,36 224,96 C196,82 104,82 76,96 Z" fill="#2b2220" {...o} />
          <path d="M84,90 C110,80 190,80 216,90" fill="none" stroke="#ffc83d" strokeWidth="3" />
          <circle cx="150" cy="62" r="9" fill="#fff" />
          <circle cx="146" cy="61" r="2" fill="#2b2220" />
          <circle cx="154" cy="61" r="2" fill="#2b2220" />
          <path d="M138,74 L162,84 M162,74 L138,84" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'sef':
      return (
        <g>
          <circle cx="116" cy="50" r="19" fill="#fff" {...o} />
          <circle cx="184" cy="50" r="19" fill="#fff" {...o} />
          <circle cx="150" cy="38" r="24" fill="#fff" {...o} />
          <rect x="104" y="56" width="92" height="30" rx="6" fill="#fff" {...o} />
          <path d="M122,62 V82 M150,62 V82 M178,62 V82" stroke="#e6e6ee" strokeWidth="3" />
        </g>
      );
    case 'kedikulak':
      return (
        <g>
          <path d="M86,110 C82,52 218,52 214,110" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M86,110 C82,52 218,52 214,110" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" />
          <path d="M96,72 L100,36 L126,58 Z" {...f} />
          <path d="M204,72 L200,36 L174,58 Z" {...f} />
          <path d="M103,64 L104,48 L116,58 Z M197,64 L196,48 L184,58 Z" fill="#ffb3c6" />
        </g>
      );
    case 'anten':
      return (
        <g>
          <path d="M86,112 C82,52 218,52 214,112" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <path d="M86,112 C82,52 218,52 214,112" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
          <path d="M124,62 C116,50 130,42 120,26 M176,62 C184,50 170,42 180,26" {...line} />
          <circle cx="119" cy="20" r="9" fill="#2bb673" {...o} strokeWidth={2.8} />
          <circle cx="181" cy="20" r="9" fill="#2bb673" {...o} strokeWidth={2.8} />
        </g>
      );
    case 'unicorn':
      return (
        <g>
          <path d="M86,110 C82,52 218,52 214,110" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M86,110 C82,52 218,52 214,110" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" />
          <path d="M150,6 L138,54 H162 Z" fill="#ffd966" {...o} />
          <path d="M141,42 L158,36 M144,30 L156,25" stroke="#e8a200" strokeWidth="2.5" />
          <path d="M112,66 L108,44 L128,58 Z M188,66 L192,44 L172,58 Z" fill="#fff" {...o} strokeWidth={2.8} />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={176 + 6 * Math.cos((a * Math.PI) / 180)} cy={70 + 6 * Math.sin((a * Math.PI) / 180)} r="5" fill="#ff8fb1" {...o} strokeWidth={1.8} />)}
          <circle cx="176" cy="70" r="3.5" fill="#ffc83d" />
        </g>
      );
    case 'sihirbaz':
      return (
        <g>
          <path d="M104,80 L140,-20 C144,-30 152,-30 156,-20 L196,80 Z" {...f} />
          <path d="M142,26 l3,7 l7,1 l-5,5 l1,7 l-6,-3 l-6,3 l1,-7 l-5,-5 l7,-1 Z" fill="#ffc83d" />
          <circle cx="164" cy="50" r="3.5" fill="#ffc83d" />
          <circle cx="130" cy="62" r="2.5" fill="#fff" />
          <ellipse cx="150" cy="80" rx="54" ry="10" fill={shade(c, 0.78)} {...o} />
        </g>
      );
    case 'tokalar':
      return (
        <g>
          <path d="M104,78 l4,9 l10,1 l-7,7 l2,10 l-9,-5 l-9,5 l2,-10 l-7,-7 l10,-1 Z" {...f} strokeWidth={2.5} />
          <path d={heart(196, 90, 1.1)} {...f} strokeWidth={2.5} />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Eldeki eşyalar (arka: elin altında; ön: baş ve şapkanın üstünde kalan büyük parçalar)
// ------------------------------------------------------------------------------------------------
export function hand2(id: string, layer: 'back' | 'front'): ReactNode {
  if (layer === 'front') {
    if (id === 'semsiye')
      return (
        <g>
          <path d="M146,146 C146,90 274,90 274,146 C264,136 252,136 242,146 C232,136 220,136 210,146 C200,136 188,136 178,146 C168,136 156,136 146,146 Z" fill="#5b8def" {...o} />
          <path d="M178,146 C182,112 196,98 210,96 M242,146 C238,112 224,98 210,96" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" />
          <path d="M210,96 V86" {...line} />
        </g>
      );
    if (id === 'ucurtma')
      return (
        <g>
          <path d="M252,40 L278,80 L252,120 L226,80 Z" fill="#ff6b4a" {...o} />
          <path d="M252,40 V120 M226,80 H278" stroke={INK} strokeWidth="2" />
          <path d="M252,40 L278,80 L252,80 Z M226,80 L252,120 V80 Z" fill="#ffc83d" />
          <path d="M252,120 C246,140 262,150 254,170" fill="none" stroke={INK} strokeWidth="2" />
          <path d="M250,138 l-8,-4 l0,8 Z M256,158 l8,-4 l0,8 Z" fill="#14a89a" />
        </g>
      );
    return null;
  }
  switch (id) {
    case 'semsiye':
      return (
        <g>
          <path d="M210,146 V306 C210,316 198,316 198,306" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M210,146 V306 C210,316 198,316 198,306" fill="none" stroke="#8c5a2b" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'ucurtma':
      return <path d="M210,298 C230,220 236,160 252,120" fill="none" stroke={INK} strokeWidth="2" />;
    case 'buket':
      return (
        <g>
          {[[204, 250, '#ff6b4a'], [222, 246, '#ff8fb1'], [212, 234, '#ffc83d'], [196, 238, '#9b6bff']].map(([x, y, col]) => (
            <g key={`${x}`}>
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={(x as number) + 6 * Math.cos((a * Math.PI) / 180)} cy={(y as number) + 6 * Math.sin((a * Math.PI) / 180)} r="5" fill={col as string} {...o} strokeWidth={1.8} />)}
              <circle cx={x as number} cy={y as number} r="3.5" fill="#fff1c7" />
            </g>
          ))}
          <path d="M198,258 H226 L214,310 H208 Z" fill="#9be7de" {...o} />
          <path d="M204,280 C210,286 216,286 222,280" fill="none" stroke="#e9487d" strokeWidth="4" />
        </g>
      );
    case 'asa':
      return (
        <g>
          <path d="M206,312 L236,234" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <path d="M206,312 L236,234" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M240,208 l6,12 l13,2 l-9,9 l2,13 l-12,-6 l-12,6 l2,-13 l-9,-9 l13,-2 Z" fill="#ffc83d" {...o} strokeWidth={2.8} />
          <path d="M262,212 l4,-4 M266,230 l6,0 M252,196 l0,-6" stroke="#ffc83d" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'mikrofon':
      return (
        <g>
          <path d="M210,312 L222,272" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <path d="M210,312 L222,272" stroke="#3a2b27" strokeWidth="6" strokeLinecap="round" />
          <circle cx="226" cy="258" r="14" fill="#b9c6cc" {...o} />
          <path d="M216,254 H236 M218,262 H234 M226,246 V270" stroke="#8a969c" strokeWidth="2" />
        </g>
      );
    case 'pamuk':
      return (
        <g>
          <path d="M210,306 L222,240" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M210,306 L222,240" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          {[[222, 222, 18], [206, 214, 14], [238, 212, 14], [222, 200, 15]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#ffb3d1" {...o} strokeWidth={2.5} />)}
          <path d="M210,222 C220,214 234,214 240,222" fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
        </g>
      );
    case 'roket':
      return (
        <g transform="rotate(20 222 262)">
          <path d="M212,300 L212,254 C212,236 222,224 222,224 C222,224 232,236 232,254 L232,300 Z" fill="#fff" {...o} />
          <path d="M212,280 L202,300 H212 Z M232,280 L242,300 H232 Z" fill="#ff6b4a" {...o} strokeWidth={2.5} />
          <circle cx="222" cy="258" r="6" fill="#5b8def" {...o} strokeWidth={2.2} />
          <path d="M216,302 L222,316 L228,302 Z" fill="#ffc83d" />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Evcil dostlar (karakterin solunda, yerde)
// ------------------------------------------------------------------------------------------------
export function Pet({ id }: { id?: string }) {
  switch (id) {
    case 'kedi':
      return (
        <g>
          <path d="M84,398 C104,396 110,376 98,366" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M84,398 C104,396 110,376 98,366" fill="none" stroke="#ff9f43" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="62" cy="386" rx="26" ry="24" fill="#ff9f43" {...o} />
          <path d="M46,340 L42,316 L60,332 Z M78,340 L82,316 L64,332 Z" fill="#ff9f43" {...o} strokeWidth={3} />
          <circle cx="62" cy="348" r="21" fill="#ff9f43" {...o} />
          <circle cx="55" cy="346" r="3" fill={INK} />
          <circle cx="69" cy="346" r="3" fill={INK} />
          <path d="M59,354 Q62,357 65,354 M38,352 H50 M74,352 H86" {...line} strokeWidth={2} />
          <path d="M52,392 V408 M72,392 V408" stroke="#e8862a" strokeWidth="3" />
        </g>
      );
    case 'kopek':
      return (
        <g>
          <path d="M88,386 C100,378 104,370 100,362" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <path d="M88,386 C100,378 104,370 100,362" fill="none" stroke="#c98a55" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="62" cy="388" rx="27" ry="22" fill="#c98a55" {...o} />
          <circle cx="62" cy="348" r="22" fill="#c98a55" {...o} />
          <ellipse cx="40" cy="352" rx="8" ry="15" fill="#7a4a2b" {...o} strokeWidth={3} transform="rotate(14 40 352)" />
          <ellipse cx="84" cy="352" rx="8" ry="15" fill="#7a4a2b" {...o} strokeWidth={3} transform="rotate(-14 84 352)" />
          <ellipse cx="62" cy="358" rx="10" ry="8" fill="#f2d2b0" />
          <circle cx="54" cy="344" r="3" fill={INK} />
          <circle cx="70" cy="344" r="3" fill={INK} />
          <ellipse cx="62" cy="354" rx="4" ry="3" fill={INK} />
          <path d="M60,364 C60,372 66,372 66,364" fill="#ff8fb1" {...o} strokeWidth={2} />
        </g>
      );
    case 'tavsan':
      return (
        <g>
          <ellipse cx="52" cy="318" rx="7" ry="20" fill="#fff" {...o} strokeWidth={3} transform="rotate(-8 52 318)" />
          <ellipse cx="72" cy="318" rx="7" ry="20" fill="#fff" {...o} strokeWidth={3} transform="rotate(8 72 318)" />
          <ellipse cx="52" cy="320" rx="3" ry="12" fill="#ffb3c6" transform="rotate(-8 52 320)" />
          <ellipse cx="72" cy="320" rx="3" ry="12" fill="#ffb3c6" transform="rotate(8 72 320)" />
          <ellipse cx="62" cy="388" rx="25" ry="22" fill="#fff" {...o} />
          <circle cx="86" cy="396" r="7" fill="#fff" {...o} strokeWidth={2.5} />
          <circle cx="62" cy="350" r="19" fill="#fff" {...o} />
          <circle cx="55" cy="348" r="2.8" fill={INK} />
          <circle cx="69" cy="348" r="2.8" fill={INK} />
          <path d="M60,355 L62,357 L64,355" {...line} strokeWidth={2} />
          <ellipse cx="50" cy="356" rx="4" ry="2.5" fill="#ffb3c6" />
          <ellipse cx="74" cy="356" rx="4" ry="2.5" fill="#ffb3c6" />
        </g>
      );
    case 'kus':
      return (
        <g>
          <path d="M56,404 V412 M68,404 V412" stroke="#e8a200" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="386" r="20" fill="#5b8def" {...o} />
          <path d="M50,390 C58,400 70,398 74,388" fill="#9ec3ff" {...o} strokeWidth={2.5} />
          <circle cx="68" cy="378" r="3" fill={INK} />
          <path d="M80,380 L92,384 L80,388 Z" fill="#ffc83d" {...o} strokeWidth={2} />
          <path d="M58,366 C56,358 62,354 66,358" fill="none" stroke={INK} strokeWidth="2.5" />
        </g>
      );
    case 'kaplumbaga':
      return (
        <g>
          <ellipse cx="90" cy="398" rx="11" ry="9" fill="#8fd18a" {...o} strokeWidth={3} />
          <circle cx="94" cy="396" r="2" fill={INK} />
          <path d="M34,404 C34,370 86,370 86,404 Z" fill="#2bb673" {...o} />
          <path d="M48,396 l6,-8 h8 l6,8 l-6,8 h-8 Z" fill="#8fd18a" stroke="#1f8a55" strokeWidth="2" />
          <path d="M40,408 v6 M78,408 v6" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'dino':
      return (
        <g>
          <path d="M40,356 l6,-10 l6,10 M50,366 l6,-10 l6,10 M30,370 l6,-10 l6,10" fill="#ffc83d" {...o} strokeWidth={2.5} />
          <path d="M26,404 C18,390 26,376 40,378 L60,380 C64,356 72,338 88,338 C100,338 104,352 98,358 C92,364 82,362 80,370 L82,404 Z" fill="#6cc46a" {...o} />
          <circle cx="90" cy="348" r="3" fill={INK} />
          <path d="M94,356 Q98,358 100,354" {...line} strokeWidth={2} />
          <path d="M46,404 v8 M72,404 v8" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Arka planlar
// ------------------------------------------------------------------------------------------------
export function bg2(id: string): ReactNode {
  switch (id) {
    case 'orman':
      return (
        <g>
          <rect width="300" height="440" fill="#d9f1ff" />
          {[[30, 250, 70], [110, 230, 60], [210, 240, 70], [280, 250, 60]].map(([x, y, h]) => (
            <path key={x} d={`M${x},${y - h * 2} L${x + h * 0.7},${y} H${x - h * 0.7} Z`} fill="#8fcf8a" />
          ))}
          {[[20, 340, 70], [270, 330, 76]].map(([x, y, h]) => (
            <g key={x}>
              <rect x={x - 6} y={y - 10} width="12" height="40" fill="#8c5a2b" />
              <path d={`M${x},${y - h * 2.2} L${x + h * 0.75},${y} H${x - h * 0.75} Z`} fill="#2f9e5a" />
            </g>
          ))}
          <path d="M0,368 C100,356 200,360 300,368 V440 H0 Z" fill="#7cc576" />
          <path d="M234,398 h14 v10 h-14 Z" fill="#fff" />
          <path d="M228,400 C228,384 254,384 254,400 Z" fill="#e63946" />
          <circle cx="236" cy="392" r="2.5" fill="#fff" />
        </g>
      );
    case 'sehir':
      return (
        <g>
          <rect width="300" height="440" fill="#c7e8ff" />
          {[[0, 170, 64, '#ffb4a2'], [60, 120, 56, '#9ec3ff'], [112, 190, 70, '#ffe08a'], [178, 100, 60, '#b5e3c3'], [234, 160, 66, '#d6c8ff']].map(([x, y, w, col]) => (
            <g key={x as number}>
              <rect x={x as number} y={y as number} width={w as number} height={372 - (y as number)} fill={col as string} />
              {Array.from({ length: Math.floor((372 - (y as number) - 20) / 28) }, (_, r) => [0, 1].map((cc) => (
                <rect key={`${r}-${cc}`} x={(x as number) + 10 + cc * ((w as number) / 2 - 2)} y={(y as number) + 14 + r * 28} width={(w as number) / 2 - 18} height="14" rx="2" fill="#fff" opacity="0.8" />
              )))}
            </g>
          ))}
          <rect y="372" width="300" height="68" fill="#cfcfd6" />
          <path d="M0,404 H300" stroke="#fff" strokeWidth="4" strokeDasharray="20 16" />
        </g>
      );
    case 'denizalti':
      return (
        <g>
          <rect width="300" height="440" fill="#2a8fc4" />
          <rect width="300" height="160" fill="#45aee0" />
          {[[40, 120, 10], [60, 80, 6], [250, 150, 8], [230, 100, 5], [270, 60, 7]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.8" />)}
          {[20, 50, 250, 280].map((x) => <path key={x} d={`M${x},440 C${x - 14},400 ${x + 14},370 ${x},330 C${x - 12},300 ${x + 10},280 ${x},250`} fill="none" stroke="#2bb673" strokeWidth="9" strokeLinecap="round" />)}
          <path d="M210,210 c10,-12 30,-12 38,0 c-8,12 -28,12 -38,0 Z M248,210 l12,-8 v16 Z" fill="#ffc83d" />
          <circle cx="222" cy="208" r="2.5" fill={INK} />
          <path d="M40,250 c8,-10 24,-10 30,0 c-6,10 -22,10 -30,0 Z M70,250 l10,-7 v14 Z" fill="#ff8fb1" />
          <path d="M0,396 C100,386 200,388 300,396 V440 H0 Z" fill="#f1d48d" />
          <path d="M236,420 l4,-9 l4,9 l9,1 l-7,6 l2,9 l-8,-5 l-8,5 l2,-9 l-7,-6 Z" fill="#ff6b4a" />
        </g>
      );
    case 'sinif':
      return (
        <g>
          <rect width="300" height="440" fill="#e3f4e6" />
          <rect x="34" y="44" width="232" height="126" rx="8" fill="#2f5d50" stroke="#8c5a2b" strokeWidth="10" />
          <text x="60" y="104" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="34" fill="#fff" opacity="0.9">A B C</text>
          <text x="60" y="148" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="26" fill="#ffe08a" opacity="0.9">1 + 2 = 3</text>
          <circle cx="226" cy="90" r="16" fill="none" stroke="#fff" strokeWidth="3" opacity="0.85" />
          <path d="M226,64 v-8 M226,116 v8 M200,90 h-8 M252,90 h8" stroke="#fff" strokeWidth="3" opacity="0.85" />
          <rect x="120" y="178" width="60" height="6" rx="3" fill="#8c5a2b" />
          <rect y="372" width="300" height="68" fill="#e2b07a" />
          <path d="M0,372 H300 M75,372 V440 M150,372 V440 M225,372 V440" stroke="#c9955f" strokeWidth="3" />
        </g>
      );
    case 'sato':
      return (
        <g>
          <rect width="300" height="440" fill="#ffe3f1" />
          <rect y="200" width="300" height="240" fill="#f3e2ff" />
          <path d="M40,330 V200 H80 V330 M220,330 V200 H260 V330" fill="#c9b8f0" />
          <path d="M34,202 L60,150 L86,202 Z M214,202 L240,150 L266,202 Z" fill="#9b6bff" />
          <path d="M60,150 V130 L78,136 L60,142 M240,150 V130 L258,136 L240,142" fill="#ff6b4a" stroke="#ff6b4a" strokeWidth="2" />
          <rect x="80" y="240" width="140" height="100" fill="#d8cbf5" />
          <path d="M80,240 v-14 h14 v14 h14 v-14 h14 v14 h14 v-14 h14 v14 h14 v-14 h14 v14 h14 v-14 h14 v14 h14 v-14 h14 v14" fill="#d8cbf5" />
          <path d="M130,340 V296 C130,282 170,282 170,296 V340 Z" fill="#8c5a2b" />
          <path d="M0,350 C90,330 210,334 300,350 V440 H0 Z" fill="#b7e3a3" />
        </g>
      );
    case 'gece':
      return (
        <g>
          <rect width="300" height="440" fill="#18224f" />
          {[[30, 40], [80, 90], [140, 30], [200, 70], [260, 40], [40, 170], [270, 160], [120, 140], [180, 190]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 2 : 3} fill="#fff" />)}
          <path d="M240,60 a26,26 0 1,0 20,40 a20,20 0 1,1 -20,-40 Z" fill="#fff1c7" />
          <path d="M0,300 H60 V250 L90,226 L120,250 V300 H160 V270 H220 V240 L250,220 L280,240 V300 H300 V440 H0 Z" fill="#0e1636" />
          {[[74, 262], [98, 262], [176, 284], [200, 284], [256, 256]].map(([x, y]) => <rect key={`${x}`} x={x} y={y} width="12" height="14" rx="2" fill="#ffd166" />)}
        </g>
      );
    default:
      return null;
  }
}
