/**
 * Giydirilebilir karakter (300×440 SVG). Katman sırası:
 * arka plan → saç (arka) → pelerin → bacaklar → alt giysi → ayakkabı → boyun → gövde → üst giysi →
 * kollar → kollar (giysi) → eldeki eşya → eller → kulaklar/baş → yüz → saç (ön) → gözlük → şapka.
 * Koordinatlar: baş (150,118) r≈60, gövde y 180–310, kollar 118,198→90,296 ve 182,198→210,296,
 * bacaklar 134,300→130,392 ve 166,300→170,392, ayaklar y 386–410.
 */
import { useId, type ReactNode } from 'react';
import type { DollState } from './catalog';

import {
  bg2, bottom2, DRESS_PATTERN_SHAPES, DRESS_SLEEVE2, dressBack2, dressBody2, dressLegs2, face2, glasses2, hairBack2, hairFront2, hand2, hasFace2, hat2,
  Pat, PatLimb, PatternDef, Pet, shoe2, SLEEVE2, top2,
} from './extras';
import { ARM_L, ARM_R, BODICE, INK, LEG_L, LEG_R, Limb, o, shade, SW, TOP, TORSO } from './ink';
import { ArtPet, artIdOf, isArtPet } from './artPets';
import { backFront, backLayer, rareBg, rareDress, rareHat, rarePet, rareShoe } from './rare';

// ------------------------------------------------------------------------------------------------
// Arka planlar
// ------------------------------------------------------------------------------------------------
function Background({ id }: { id: string }) {
  switch (id) {
    case 'park':
      return (
        <g>
          <rect width="300" height="440" fill="#c9ecff" />
          <circle cx="250" cy="56" r="26" fill="#ffd43b" />
          <path d="M40,80 a16,16 0 0,1 28,-8 a14,14 0 0,1 24,6 a10,10 0 0,1 -4,18 H44 a10,10 0 0,1 -4,-16 Z" fill="#fff" />
          <path d="M0,340 C80,300 200,310 300,332 V440 H0 Z" fill="#a8dd8f" />
          <path d="M0,372 C100,356 200,360 300,370 V440 H0 Z" fill="#7cc576" />
          <rect x="28" y="250" width="16" height="110" rx="6" fill="#8c5a2b" />
          <circle cx="36" cy="230" r="42" fill="#5cb85c" />
          <circle cx="12" cy="256" r="26" fill="#4ea94e" />
        </g>
      );
    case 'plaj':
      return (
        <g>
          <rect width="300" height="440" fill="#b5e6ff" />
          <circle cx="60" cy="60" r="28" fill="#ffd43b" />
          <rect y="290" width="300" height="70" fill="#5cc0e8" />
          <path d="M20,312 q10,-6 20,0 t20,0 M200,330 q10,-6 20,0 t20,0 M120,300 q10,-6 20,0 t20,0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M0,356 C100,346 200,350 300,356 V440 H0 Z" fill="#f5d898" />
          <path d="M256,250 V372" stroke="#8c5a2b" strokeWidth="5" />
          <path d="M206,258 C210,214 302,214 306,258 Z" fill="#ff6b4a" />
          <path d="M238,258 C240,226 272,226 274,258 Z" fill="#fff" />
          <path d="M40,410 c6,-10 18,-10 22,0 Z" fill="#ff8fb1" />
        </g>
      );
    case 'kar':
      return (
        <g>
          <rect width="300" height="440" fill="#d7ecf8" />
          <path d="M0,350 C90,330 210,336 300,346 V440 H0 Z" fill="#fff" />
          <path d="M0,390 C100,378 200,382 300,392" fill="none" stroke="#dbeaf5" strokeWidth="6" />
          <circle cx="42" cy="334" r="24" fill="#fff" stroke="#c9dce8" strokeWidth="3" />
          <circle cx="42" cy="296" r="16" fill="#fff" stroke="#c9dce8" strokeWidth="3" />
          <path d="M42,296 l12,3 l-12,2 Z" fill="#ff8a3d" />
          {[[30, 40], [90, 90], [240, 60], [270, 150], [20, 180], [200, 120], [120, 30], [60, 250], [260, 250], [230, 200]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#fff" />
          ))}
        </g>
      );
    case 'sahne':
      return (
        <g>
          <rect width="300" height="440" fill="#3b2a5a" />
          <path d="M150,0 L60,380 H240 Z" fill="#fff5c4" opacity="0.28" />
          <path d="M0,0 H70 C60,120 70,260 44,400 H0 Z" fill="#d83a4a" />
          <path d="M300,0 H230 C240,120 230,260 256,400 H300 Z" fill="#d83a4a" />
          <path d="M20,0 C24,140 18,280 16,400 M270,0 C266,140 272,280 274,400" fill="none" stroke="#b02a3a" strokeWidth="5" />
          <rect y="380" width="300" height="60" fill="#a8683f" />
          <path d="M0,380 H300" stroke="#7a4a2b" strokeWidth="4" />
          <path d="M100,40 l4,9 l10,1 l-8,6 l3,10 l-9,-5 l-9,5 l3,-10 l-8,-6 l10,-1 Z M210,80 l3,6 l7,1 l-5,4 l2,7 l-7,-4 l-6,4 l2,-7 l-5,-4 l7,-1 Z" fill="#ffc83d" />
        </g>
      );
    case 'uzay':
      return (
        <g>
          <rect width="300" height="440" fill="#1f1b4d" />
          {[[20, 30], [70, 80], [130, 20], [200, 40], [280, 90], [40, 170], [250, 200], [20, 300], [280, 330], [110, 120], [180, 150], [60, 400], [240, 410]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 2 : 3.5} fill="#fff" opacity={i % 2 ? 0.7 : 1} />
          ))}
          <circle cx="62" cy="96" r="30" fill="#ff8fb1" />
          <ellipse cx="62" cy="96" rx="50" ry="10" fill="none" stroke="#ffc83d" strokeWidth="5" transform="rotate(-18 62 96)" />
          <circle cx="248" cy="72" r="20" fill="#f4f1de" />
          <circle cx="242" cy="66" r="4" fill="#dcd6bf" />
          <path d="M0,380 C100,360 200,366 300,380 V440 H0 Z" fill="#8c86c9" />
          <circle cx="60" cy="408" r="10" fill="#6d67a9" />
          <circle cx="220" cy="400" r="14" fill="#6d67a9" />
        </g>
      );
    case 'oda':
      return (
        <g>
          <rect width="300" height="440" fill="#fde9cf" />
          <path d="M0,40 H300 M0,120 H300 M0,200 H300 M0,280 H300" stroke="#f8dcb7" strokeWidth="18" />
          <rect x="22" y="44" width="84" height="84" rx="6" fill="#bfe6ff" stroke="#fff" strokeWidth="8" />
          <path d="M64,44 V128 M22,86 H106" stroke="#fff" strokeWidth="5" />
          <rect x="206" y="60" width="66" height="52" rx="4" fill="#fff" stroke="#8c5a2b" strokeWidth="5" />
          <circle cx="226" cy="80" r="8" fill="#ffc83d" />
          <path d="M212,106 L232,90 L246,100 L266,84" fill="none" stroke="#2bb673" strokeWidth="4" strokeLinejoin="round" />
          <rect y="372" width="300" height="68" fill="#e2b07a" />
          <path d="M0,372 H300 M60,372 V440 M150,372 V440 M240,372 V440" stroke="#c9955f" strokeWidth="3" />
          <ellipse cx="150" cy="414" rx="124" ry="18" fill="#ff8fb1" opacity="0.55" />
        </g>
      );
    default:
      return bg2(id) ?? rareBg(id) ?? <rect width="300" height="440" fill="#fffdf8" />;
  }
}

// ------------------------------------------------------------------------------------------------
// Saç
// ------------------------------------------------------------------------------------------------
const CAP = 'M86,124 C80,62 116,46 150,46 C184,46 220,62 214,124 C206,98 186,84 150,86 C114,84 94,98 86,124 Z';
const FOREHEAD = 'M86,124 C94,98 114,84 150,86 C186,84 206,98 214,124';

function HairBack({ style, c }: { style: string; c: string }) {
  const f = { fill: c, ...o };
  switch (style) {
    case 'afro':
      return (
        <g>
          <circle cx="150" cy="104" r="90" {...f} />
          <path d="M84,70 q10,-8 18,2 M196,64 q10,-6 16,6 M70,130 q8,-10 16,0 M214,138 q8,-10 16,0" fill="none" stroke={shade(c, 0.7)} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'kut':
      return <path d="M82,112 C78,50 222,50 218,112 L222,184 C198,194 102,194 78,184 Z" {...f} />;
    case 'uzun':
      return <path d="M84,112 C78,50 222,50 216,112 L230,266 C206,280 94,280 70,266 Z" {...f} />;
    case 'atkuyrugu':
      return (
        <g>
          <path d="M198,86 C246,78 262,132 248,188 C242,212 226,218 218,204 C232,164 228,120 204,104 Z" {...f} />
          <circle cx="206" cy="92" r="8" fill="#ff6b4a" {...o} strokeWidth={2.5} />
        </g>
      );
    case 'topuz':
      return (
        <g>
          <circle cx="100" cy="62" r="27" {...f} />
          <circle cx="200" cy="62" r="27" {...f} />
        </g>
      );
    case 'orgu':
      return (
        <g>
          {[0, 1].map((side) => {
            const x = side ? 212 : 88;
            return (
              <g key={side}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <ellipse key={i} cx={x + (side ? 2 : -2) * (i % 2)} cy={146 + i * 20} rx="12" ry="12" {...f} strokeWidth={3} />
                ))}
                <path d={`M${x - 10},268 l10,-6 l10,6 l-10,6 Z`} fill="#ff6b4a" {...o} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
      );
    default:
      return hairBack2(style, c);
  }
}

function HairFront({ style, c }: { style: string; c: string }) {
  const f = { fill: c, ...o };
  const extra = hairFront2(style, c);
  if (extra) return extra;
  switch (style) {
    case 'yan':
      return <path d="M86,124 C80,60 118,44 152,46 C190,48 220,66 214,124 C208,96 190,80 162,82 C152,98 124,106 100,104 C94,110 90,116 86,124 Z" {...f} />;
    case 'dikenli':
      return <path d="M86,122 L80,84 L98,90 L96,58 L116,72 L124,44 L140,66 L152,38 L164,64 L180,44 L186,70 L206,58 L204,88 L220,88 L214,122 C204,98 182,86 150,88 C118,86 96,98 86,122 Z" {...f} />;
    case 'kivircik':
      return (
        <g>
          {[[92, 104], [100, 78], [118, 60], [140, 50], [162, 50], [184, 60], [200, 78], [208, 104]].map(([x, y]) => (
            <circle key={`${x}`} cx={x} cy={y} r="17" {...f} />
          ))}
          <path d={CAP} fill={c} />
          <path d={FOREHEAD} fill="none" {...o} />
          <path d="M116,72 q8,-6 14,2 M160,66 q8,-6 14,2" fill="none" stroke={shade(c, 0.7)} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'afro':
      return (
        <g>
          <path d={CAP} fill={c} />
          <path d={FOREHEAD} fill="none" {...o} />
        </g>
      );
    case 'kut':
      return <path d="M86,122 C80,56 220,56 214,122 L212,104 C180,99 120,99 88,104 Z" {...f} />;
    case 'uzun':
    case 'orgu':
      return <path d="M86,126 C82,58 118,44 150,48 C182,44 218,58 214,126 C206,96 176,80 150,72 C124,80 94,96 86,126 Z" {...f} />;
    case 'atkuyrugu':
    case 'topuz':
      return <path d="M86,124 C80,58 116,44 150,46 C184,44 220,58 214,124 C206,96 184,82 150,80 C116,82 94,96 86,124 Z" {...f} />;
    default:
      return (
        <g>
          <path d={CAP} {...f} />
          <path d="M88,120 L90,132 M212,120 L210,132" stroke={c} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
  }
}

// ------------------------------------------------------------------------------------------------
// Yüz ve gözlük
// ------------------------------------------------------------------------------------------------
function Eye({ x, big }: { x: number; big?: boolean }) {
  return (
    <g>
      <ellipse cx={x} cy="128" rx={big ? 8.5 : 6.5} ry={big ? 9.5 : 8.5} fill={INK} />
      <circle cx={x + 2.4} cy="124.5" r={big ? 3 : 2.4} fill="#fff" />
    </g>
  );
}

function Face({ face, freckles }: { face: string; freckles: boolean }) {
  const line = { fill: 'none', stroke: INK, strokeWidth: SW, strokeLinecap: 'round' as const };
  const happyArc = (x: number) => <path d={`M${x - 8},130 Q${x},120 ${x + 8},130`} {...line} />;
  return (
    <g>
      {face === 'kararli' ? (
        <path d="M118,104 L138,110 M162,110 L182,104" {...line} strokeWidth={3.4} />
      ) : (
        <path d="M118,108 Q128,102 138,108 M162,108 Q172,102 182,108" {...line} strokeWidth={3} />
      )}
      {hasFace2(face) ? null : face === 'gulus' ? (
        <>
          {happyArc(128)}
          {happyArc(172)}
        </>
      ) : face === 'kirp' ? (
        <>
          <Eye x={128} />
          {happyArc(172)}
        </>
      ) : face === 'havali' ? (
        <>
          <path d="M120,128 Q128,123 136,128 M164,128 Q172,123 180,128" {...line} strokeWidth={4.5} />
        </>
      ) : (
        <>
          <Eye x={128} big={face === 'saskin'} />
          <Eye x={172} big={face === 'saskin'} />
        </>
      )}
      <path d="M147,139 Q150,142 153,139" {...line} strokeWidth={2.6} />
      <ellipse cx="114" cy="146" rx="9" ry="6" fill="#ff8fb1" opacity="0.5" />
      <ellipse cx="186" cy="146" rx="9" ry="6" fill="#ff8fb1" opacity="0.5" />
      {freckles && (
        <g fill="#b36b3e" opacity="0.75">
          {[[108, 138], [116, 136], [112, 142], [184, 136], [192, 138], [188, 142]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
          ))}
        </g>
      )}
      {hasFace2(face) ? face2(face, (x) => <Eye x={x} />) : face === 'gulus' ? (
        <g>
          <path d="M134,148 H166 C166,162 158,170 150,170 C142,170 134,162 134,148 Z" fill={INK} />
          <ellipse cx="150" cy="164" rx="8" ry="4" fill="#ff8fb1" />
        </g>
      ) : face === 'saskin' ? (
        <ellipse cx="150" cy="157" rx="6" ry="8" fill={INK} />
      ) : face === 'kirp' ? (
        <path d="M138,150 Q152,164 164,147" {...line} />
      ) : face === 'havali' ? (
        <path d="M140,153 Q152,159 162,149" {...line} />
      ) : (
        <path d="M138,151 Q150,162 162,151" {...line} />
      )}
    </g>
  );
}

function Glasses({ id }: { id: string }) {
  if (id === 'yuvarlak')
    return (
      <g fill="rgba(255,255,255,0.18)" {...o} strokeWidth={3.2}>
        <circle cx="128" cy="128" r="15" />
        <circle cx="172" cy="128" r="15" />
        <path d="M143,126 Q150,120 157,126 M113,126 L90,122 M187,126 L210,122" fill="none" />
      </g>
    );
  if (id === 'yildiz') {
    const star = (x: number) => `M${x},108 l6,12 l13,2 l-9,9 l2,13 l-12,-6 l-12,6 l2,-13 l-9,-9 l13,-2 Z`;
    return (
      <g fill="rgba(255,143,177,0.35)" stroke="#e9487d" strokeWidth={3} strokeLinejoin="round">
        <path d={star(128)} />
        <path d={star(172)} />
        <path d="M141,126 Q150,121 159,126" fill="none" />
      </g>
    );
  }
  if (id === 'gunes')
    return (
      <g {...o} strokeWidth={3}>
        <path d="M110,118 H144 V132 C144,142 136,146 127,146 C118,146 110,142 110,132 Z" fill="#2b2250" />
        <path d="M156,118 H190 V132 C190,142 182,146 173,146 C164,146 156,142 156,132 Z" fill="#2b2250" />
        <path d="M144,122 H156 M110,120 L90,118 M190,120 L210,118" fill="none" />
        <path d="M116,124 L124,132 M162,124 L170,132" stroke="#fff" strokeWidth={2.5} opacity={0.7} />
      </g>
    );
  return glasses2(id);
}

// ------------------------------------------------------------------------------------------------
// Giysiler
// ------------------------------------------------------------------------------------------------
const SHORT = 38;
const LONG = 94;

function TopWear({ id, c, clip, pat }: { id: string; c: string; clip: string; pat?: string }) {
  const f = { fill: c, ...o };
  const dark = shade(c, 0.8);
  const extra = top2(id, c, pat);
  if (extra) return <>{extra}</>;
  return (
    <g>
      {id === 'kapsonlu' && <path d="M116,190 C116,166 184,166 184,190 C170,200 130,200 116,190 Z" fill={dark} {...o} />}
      <path d={TOP} {...f} />
      <Pat d={TOP} p={pat} />
      {id === 'kazak' && (
        <g clipPath={`url(#${clip})`}>
          {[210, 234, 258, 282, 306].map((y) => <path key={y} d={`M100,${y} H200`} stroke="#fff" strokeWidth="8" opacity="0.55" />)}
        </g>
      )}
      {id === 'yildizli' && <path d="M150,216 l8,17 l18,2 l-13,12 l4,18 l-17,-9 l-17,9 l4,-18 l-13,-12 l18,-2 Z" fill="#ffc83d" {...o} strokeWidth={2.5} />}
      {id === 'forma' && (
        <>
          <path d="M138,178 L150,194 L162,178" fill="none" {...o} stroke="#fff" strokeWidth={4} />
          <text x="150" y="276" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="46" fill="#fff" stroke={INK} strokeWidth="2">7</text>
        </>
      )}
      {id === 'gomlek' && (
        <>
          <path d="M150,198 V310" stroke={dark} strokeWidth="3" />
          {[214, 238, 262, 286].map((y) => <circle key={y} cx="156" cy={y} r="3" fill={INK} />)}
          <path d="M134,179 L150,198 L140,206 L126,186 Z M166,179 L150,198 L160,206 L174,186 Z" fill="#fff" {...o} strokeWidth={2.8} />
        </>
      )}
      {id === 'kapsonlu' && (
        <>
          <path d="M126,262 H174 L170,292 H130 Z" fill={dark} {...o} strokeWidth={2.8} />
          <path d="M142,196 L140,224 M158,196 L160,224" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {id === 'tisort' && <path d="M136,180 Q150,194 164,180" fill="none" stroke={dark} strokeWidth="3" />}
    </g>
  );
}

function sleeveLen(top: string) {
  if (SLEEVE2[top]) return SLEEVE2[top][0];
  return top === 'kazak' || top === 'kapsonlu' ? LONG : SHORT;
}

function BottomWear({ id, c, pat }: { id: string; c: string; pat?: string }) {
  const f = { fill: c, ...o };
  const extra = bottom2(id, c, pat);
  if (extra) return <>{extra}</>;
  if (id === 'etek')
    return (
      <g>
        <path d="M112,284 H188 L212,356 C188,366 112,366 88,356 Z" {...f} />
        <Pat d="M112,284 H188 L212,356 C188,366 112,366 88,356 Z" p={pat} />
        <path d="M130,290 L120,358 M150,290 V362 M170,290 L180,358" stroke={shade(c, 0.8)} strokeWidth="3" />
      </g>
    );
  const dash = id === 'sort' ? 42 : undefined;
  const w = id === 'tayt' ? 23 : 27;
  return (
    <g>
      <Limb d="M134,298 L130,390" c={c} w={w} dash={dash} />
      <Limb d="M166,298 L170,390" c={c} w={w} dash={dash} />
      <PatLimb d="M134,298 L130,390" w={w} p={pat} dash={dash} />
      <PatLimb d="M166,298 L170,390" w={w} p={pat} dash={dash} />
      <path d="M110,284 H190 L193,318 C170,322 130,322 107,318 Z" {...f} />
      <Pat d="M110,284 H190 L193,318 C170,322 130,322 107,318 Z" p={pat} />
      {id === 'pantolon' && <path d="M150,300 V318" stroke={shade(c, 0.75)} strokeWidth="3" />}
    </g>
  );
}

/** Tek parça giysinin arka katmanı (pelerin). */
function DressBack({ id, c }: { id: string; c: string }) {
  if (id !== 'kahraman') return <>{dressBack2(id)}</>;
  const cape = c.toLowerCase() === '#ff6b4a' || c.toLowerCase() === '#e9487d' ? '#5b8def' : '#ff6b4a';
  return <path d="M120,186 L90,396 C126,410 174,410 210,396 L180,186 Z" fill={cape} {...o} />;
}

function DressLegs({ id, c, pat }: { id: string; c: string; pat?: string }) {
  if (id === 'kahraman' || id === 'tulum')
    return (
      <g>
        <Limb d="M134,298 L130,390" c={c} w={27} />
        <Limb d="M166,298 L170,390" c={c} w={27} />
        <PatLimb d="M134,298 L130,390" w={27} p={pat} />
        <PatLimb d="M166,298 L170,390" w={27} p={pat} />
        <path d="M110,284 H190 L193,318 C170,322 130,322 107,318 Z" fill={c} {...o} />
      </g>
    );
  return <>{dressLegs2(id, c, pat)}</>;
}

function DressBody({ id, c, pat }: { id: string; c: string; pat?: string }) {
  const extra = dressBody2(id, c, pat) ?? rareDress(id);
  if (extra) return <>{extra}</>;
  const f = { fill: c, ...o };
  switch (id) {
    case 'yazlik':
      return (
        <g>
          <path d="M112,282 H188 L216,364 C190,376 110,376 84,364 Z" {...f} />
          <path d={BODICE} {...f} />
          {[[120, 320], [150, 340], [180, 318], [104, 350], [196, 352], [136, 300], [166, 302]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#fff" opacity="0.8" />
          ))}
        </g>
      );
    case 'prenses':
      return (
        <g>
          <path d="M112,278 H188 L228,398 C198,412 102,412 72,398 Z" {...f} />
          <path d="M72,398 q13,10 26,0 q13,10 26,0 q13,10 26,0 q13,10 26,0 q13,10 26,0 q13,10 26,0" fill="none" stroke="#fff" strokeWidth="4" opacity="0.8" />
          <path d={BODICE} {...f} />
          <rect x="110" y="276" width="80" height="12" rx="6" fill="#fff" {...o} strokeWidth={2.5} />
        </g>
      );
    case 'tulum':
      return (
        <g>
          <TopWear id="tisort" c="#ffffff" clip="" />
          <path d="M124,222 H176 L178,300 H122 Z" {...f} />
          <path d="M124,224 L118,184 M176,224 L182,184" stroke={c} strokeWidth="8" strokeLinecap="round" />
          <circle cx="130" cy="232" r="4" fill="#ffc83d" {...o} strokeWidth={2} />
          <circle cx="170" cy="232" r="4" fill="#ffc83d" {...o} strokeWidth={2} />
          <path d="M136,246 H164 V266 H136 Z" fill={shade(c, 0.85)} {...o} strokeWidth={2.5} />
        </g>
      );
    case 'kahraman':
      return (
        <g>
          <path d={TOP} {...f} />
          <circle cx="150" cy="236" r="22" fill="#ffc83d" {...o} />
          <path d="M150,222 l5,10 l11,1 l-8,7 l2,11 l-10,-5 l-10,5 l2,-11 l-8,-7 l11,-1 Z" fill="#ff6b4a" />
          <rect x="108" y="284" width="84" height="12" rx="3" fill="#ffc83d" {...o} strokeWidth={2.5} />
        </g>
      );
    default:
      return null;
  }
}

function dressSleeve(id: string) {
  if (DRESS_SLEEVE2[id]) return DRESS_SLEEVE2[id][0];
  return id === 'kahraman' ? LONG : id === 'tulum' ? SHORT : 0;
}

function Shoe({ id, c }: { id: string; c: string }) {
  const f = { fill: c, ...o };
  const extra = shoe2(id, c) ?? rareShoe(id);
  if (extra) return <>{extra}</>;
  switch (id) {
    case 'bot':
      return (
        <g>
          <path d="M118,368 H145 V402 C145,407 142,410 137,410 H114 C109,410 108,404 110,399 C112,394 116,392 118,390 Z" {...f} />
          <path d="M116,368 H147 V378 H116 Z" fill={shade(c, 0.8)} {...o} strokeWidth={2.8} />
        </g>
      );
    case 'cizme':
      return (
        <g>
          <path d="M117,344 H146 V402 C146,407 143,410 138,410 H114 C109,410 108,404 110,399 C112,394 115,392 117,390 Z" {...f} />
          <path d="M138,352 V396" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    case 'sandalet':
      return (
        <g>
          <path d="M114,402 C114,394 120,391 128,391 H136 C142,391 146,395 146,400 V404 H114 Z" fill="#f6c9a0" />
          <rect x="111" y="403" width="37" height="7" rx="3" {...f} />
          <path d="M118,398 L142,394 M122,392 L130,404" stroke={c} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'babet':
      return (
        <g>
          <path d="M113,400 C114,393 121,391 129,391 H137 C142,391 146,394 146,399 V404 C146,408 143,410 139,410 H117 C113,410 111,406 113,400 Z" {...f} />
          <path d="M120,396 L142,392" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M122,400 L128,398" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M112,398 C112,389 120,386 128,386 H136 C142,386 146,390 146,396 V404 C146,408 143,410 139,410 H116 C112,410 110,406 112,398 Z" {...f} />
          <path d="M111,404 H147" stroke="#fff" strokeWidth="5" />
          <path d="M111,404 H147" stroke={INK} strokeWidth="1.5" opacity="0.4" />
          <path d="M130,390 L136,394 M128,394 L134,398" stroke={c === '#ffffff' ? INK : '#fff'} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
  }
}

// ------------------------------------------------------------------------------------------------
// Şapkalar ve eldeki eşyalar
// ------------------------------------------------------------------------------------------------
function Hat({ id, c }: { id: string; c: string }) {
  const f = { fill: c, ...o };
  switch (id) {
    case 'kep':
      return (
        <g>
          <path d="M88,104 C86,48 214,48 212,104 C180,96 120,96 88,104 Z" {...f} />
          <path d="M150,100 C190,92 234,94 246,104 C238,112 196,110 150,108 Z" fill={shade(c, 0.8)} {...o} />
          <circle cx="150" cy="52" r="6" {...f} />
        </g>
      );
    case 'yunbere':
      return (
        <g>
          <circle cx="150" cy="44" r="15" fill="#fff" {...o} />
          <path d="M86,108 C82,46 218,46 214,108 Z" {...f} />
          <path d="M82,98 C120,90 180,90 218,98 V116 C180,108 120,108 82,116 Z" fill={shade(c, 0.82)} {...o} />
        </g>
      );
    case 'tac':
      return (
        <g>
          <path d="M112,70 L110,34 L128,52 L150,26 L172,52 L190,34 L188,70 Z" fill={c === '#ffffff' ? '#ffc83d' : c} {...o} />
          <circle cx="150" cy="56" r="5" fill="#e9487d" />
          <circle cx="126" cy="60" r="3.5" fill="#14a89a" />
          <circle cx="174" cy="60" r="3.5" fill="#14a89a" />
        </g>
      );
    case 'fiyonk':
      return (
        <g>
          <path d="M196,72 L172,56 L174,86 Z M196,72 L220,56 L218,86 Z" {...f} />
          <circle cx="196" cy="72" r="7" fill={shade(c, 0.8)} {...o} strokeWidth={2.8} />
        </g>
      );
    case 'kulaklik':
      return (
        <g>
          <path d="M84,122 C80,36 220,36 216,122" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
          <path d="M84,122 C80,36 220,36 216,122" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" />
          <rect x="72" y="106" width="22" height="38" rx="10" {...f} />
          <rect x="206" y="106" width="22" height="38" rx="10" {...f} />
        </g>
      );
    case 'parti':
      return (
        <g transform="rotate(-14 150 70)">
          <path d="M150,-6 L122,68 C140,74 160,74 178,68 Z" {...f} />
          <circle cx="142" cy="44" r="4" fill="#fff" />
          <circle cx="158" cy="26" r="4" fill="#fff" />
          <circle cx="160" cy="56" r="4" fill="#fff" />
          <circle cx="150" cy="-8" r="9" fill="#ffc83d" {...o} strokeWidth={2.8} />
        </g>
      );
    case 'cicek':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={196 + 11 * Math.cos((a * Math.PI) / 180)} cy={72 + 11 * Math.sin((a * Math.PI) / 180)} r="9" {...f} strokeWidth={2.8} />
          ))}
          <circle cx="196" cy="72" r="7" fill="#ffc83d" {...o} strokeWidth={2.8} />
        </g>
      );
    default:
      return <>{hat2(id, c) ?? rareHat(id)}</>;
  }
}

function HandItem({ id }: { id: string }) {
  switch (id) {
    case 'balon':
      return (
        <g>
          <path d="M210,296 C222,250 232,214 238,190" fill="none" stroke={INK} strokeWidth="2" />
          <ellipse cx="240" cy="160" rx="25" ry="30" fill="#e9487d" {...o} />
          <path d="M236,190 l4,-4 l4,4 Z" fill="#e9487d" {...o} strokeWidth={2} />
          <path d="M228,146 q4,-10 12,-12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case 'dondurma':
      return (
        <g>
          <path d="M198,272 H222 L210,302 Z" fill="#f2cf9f" {...o} />
          <path d="M202,278 L216,290 M218,278 L204,290" stroke="#c9955f" strokeWidth="2" />
          <circle cx="210" cy="262" r="15" fill="#ff8fb1" {...o} />
          <circle cx="212" cy="246" r="5" fill="#e63946" {...o} strokeWidth={2} />
        </g>
      );
    case 'kitap':
      return (
        <g transform="rotate(-10 212 296)">
          <rect x="194" y="270" width="38" height="46" rx="3" fill="#5b8def" {...o} />
          <path d="M200,270 V316" stroke="#fff" strokeWidth="3" />
          <path d="M208,284 H226 M208,292 H222" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'firca':
      return (
        <g>
          <path d="M204,316 L232,236" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <path d="M204,316 L232,236" stroke="#c9955f" strokeWidth="5" strokeLinecap="round" />
          <path d="M228,244 L240,212 L246,216 L236,248 Z" fill="#cfcbe0" {...o} strokeWidth={2.5} />
          <path d="M240,212 C242,198 250,192 252,190 C254,198 252,208 246,216 Z" fill="#9b6bff" {...o} strokeWidth={2.5} />
        </g>
      );
    case 'top':
      return (
        <g>
          <circle cx="232" cy="292" r="24" fill="#fff" {...o} />
          <path d="M232,282 l9,7 l-4,10 h-10 l-4,-10 Z" fill={INK} />
          <path d="M232,282 V268 M241,289 L254,284 M237,299 L244,312 M227,299 L220,312 M223,289 L210,284" stroke={INK} strokeWidth="2" />
        </g>
      );
    case 'kupa':
      return (
        <g>
          <path d="M226,280 c12,0 12,18 0,18" fill="none" {...o} />
          <path d="M198,272 H228 V300 C228,308 222,312 214,312 H212 C204,312 198,308 198,300 Z" fill="#ff6b4a" {...o} />
          <path d="M206,264 c-4,-6 4,-10 0,-16 M218,264 c-4,-6 4,-10 0,-16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <path d="M206,264 c-4,-6 4,-10 0,-16 M218,264 c-4,-6 4,-10 0,-16" fill="none" stroke={INK} strokeWidth="1" opacity="0.25" />
        </g>
      );
    default:
      return <>{hand2(id, 'back')}</>;
  }
}

// ------------------------------------------------------------------------------------------------
// Karakter
// ------------------------------------------------------------------------------------------------
export function Doll({ d, bg = true, viewBox = '0 0 300 440', className, title }: { d: DollState; bg?: boolean; viewBox?: string; className?: string; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clip = `top${uid}`;
  const armsClip = `arms${uid}`;
  const skin = d.skin;
  const dressed = !!d.dress;
  const sleeve = dressed ? dressSleeve(d.dress) : sleeveLen(d.top);
  const sleeveColor = dressed
    ? (DRESS_SLEEVE2[d.dress]?.[1] ?? (d.dress === 'tulum' ? '#ffffff' : d.dressColor))
    : (SLEEVE2[d.top]?.[1] ?? d.topColor);
  // Desenler: her giysi için kendi rengine göre kontrastlı bir desen tanımı
  const pats = { top: `pt${uid}`, bottom: `pb${uid}`, dress: `pd${uid}` };
  const on = (p?: string) => !!p && p !== 'duz';
  const patUrl = (key: 'top' | 'bottom' | 'dress', p?: string) => (on(p) ? `url(#${pats[key]})` : undefined);
  const topPat = patUrl('top', d.topPattern);
  const bottomPat = patUrl('bottom', d.bottomPattern);
  const dressPat = patUrl('dress', d.dressPattern);
  const sleevePat = dressed ? (DRESS_SLEEVE2[d.dress]?.[1] || d.dress === 'tulum' ? undefined : dressPat) : SLEEVE2[d.top]?.[1] ? undefined : topPat;
  const hand = (x: number) => <circle cx={x} cy="300" r="11" fill={skin} {...o} />;
  const body: ReactNode = (
    <>
      {backLayer(d.back)}
      <HairBack style={d.hair} c={d.hairColor} />
      {dressed && <DressBack id={d.dress} c={d.dressColor} />}
      <Limb d={LEG_L} c={skin} w={20} />
      <Limb d={LEG_R} c={skin} w={20} />
      {dressed ? <DressLegs id={d.dress} c={d.dressColor} pat={dressPat} /> : <BottomWear id={d.bottom} c={d.bottomColor} pat={bottomPat} />}
      <Shoe id={d.shoes} c={d.shoesColor} />
      <g transform="translate(300 0) scale(-1 1)"><Shoe id={d.shoes} c={d.shoesColor} /></g>
      {isArtPet(d.pet) ? <ArtPet id={artIdOf(d.pet!)} /> : (
        <>
          <Pet id={d.pet} />
          {rarePet(d.pet)}
        </>
      )}
      <rect x="140" y="166" width="20" height="24" fill={skin} {...o} />
      <path d={TORSO} fill={skin} {...o} />
      {dressed ? (
        <>
          <DressBody id={d.dress} c={d.dressColor} pat={dressPat} />
          {(DRESS_PATTERN_SHAPES[d.dress] ?? []).map((sh, i) => <Pat key={i} d={sh} p={dressPat} />)}
        </>
      ) : (
        <TopWear id={d.top} c={d.topColor} clip={clip} pat={topPat} />
      )}
      {backFront(d.back)}
      {/* Kollar gövdenin dışında kalacak şekilde kırpılır: omuzda gövdenin kenarından temizce çıkar. */}
      <g clipPath={`url(#${armsClip})`}>
        <Limb d={ARM_L} c={skin} w={20} />
        <Limb d={ARM_R} c={skin} w={20} />
        {sleeve > 0 && (
          <>
            <Limb d={ARM_L} c={sleeveColor} w={25} dash={sleeve} />
            <Limb d={ARM_R} c={sleeveColor} w={25} dash={sleeve} />
            <PatLimb d={ARM_L} w={25} p={sleevePat} dash={sleeve} />
            <PatLimb d={ARM_R} w={25} p={sleevePat} dash={sleeve} />
          </>
        )}
      </g>
      {d.dress === 'prenses' && (
        <>
          <circle cx="118" cy="198" r="16" fill={d.dressColor} {...o} />
          <circle cx="182" cy="198" r="16" fill={d.dressColor} {...o} />
        </>
      )}
      <HandItem id={d.hand} />
      {hand(90)}
      {hand(210)}
      <ellipse cx="88" cy="124" rx="9" ry="12" fill={skin} {...o} />
      <ellipse cx="212" cy="124" rx="9" ry="12" fill={skin} {...o} />
      <ellipse cx="150" cy="118" rx="62" ry="60" fill={skin} {...o} />
      <Face face={d.face} freckles={d.freckles} />
      <HairFront style={d.hair} c={d.hairColor} />
      <Glasses id={d.glasses} />
      <Hat id={d.hat} c={d.hatColor} />
      {hand2(d.hand, 'front')}
    </>
  );
  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? d.name} overflow="hidden">
      <defs>
        <clipPath id={clip}><path d={TOP} /></clipPath>
        <clipPath id={armsClip}><path d={`M-60,-60 H360 V500 H-60 Z ${TOP}`} clipRule="evenodd" /></clipPath>
        {on(d.topPattern) && <PatternDef id={pats.top} kind={d.topPattern!} color={d.topColor} />}
        {on(d.bottomPattern) && <PatternDef id={pats.bottom} kind={d.bottomPattern!} color={d.bottomColor} />}
        {on(d.dressPattern) && <PatternDef id={pats.dress} kind={d.dressPattern!} color={d.dressColor} />}
      </defs>
      {bg && <Background id={d.bg} />}
      {body}
    </svg>
  );
}

/** Seçim düğmelerindeki önizlemeler için karakterin ilgili bölgesi. */
export const REGIONS: Record<string, string> = {
  full: '0 0 300 440',
  head: '60 10 180 180',
  hair: '50 0 200 290',
  face: '84 76 132 100',
  top: '66 164 168 164',
  bottom: '66 270 168 150',
  dress: '56 160 188 256',
  shoes: '96 336 108 80',
  hat: '56 -14 200 150',
  hand: '146 40 146 290',
  pet: '4 296 130 124',
  back: '0 120 300 300',
};
