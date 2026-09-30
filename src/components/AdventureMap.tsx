/**
 * Çizio'nun maceraları: el çizimi hazine haritası. Kıvrımlı toprak yol duraklar arasında dönemeçlerle
 * ilerler; tamamlanan kısım boyanır. Her durağın çevresinde kendi temasına uygun süsler, yolun başında
 * tabela, sonunda hazine sandığı. Harita ekranı boydan boya kaplar: piksel ölçüsünde çizilir, yol ortada
 * kıvrılır, kenarlar ağaç, çalı ve taşlarla dolar.
 */
import { Check, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getPath, lessonsByPath } from '../lessons';
import type { ChapterState } from '../lib/adventure';
import { Mascot } from './Mascot';
import { getOutfit } from './Outfits';
import { ChestArt } from './Rewards';
import { SketchImg } from './Sketch';
import { useSize } from './ui';

const INK = '#3a2b27';
const s = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ------------------------------------------------------------------------------------------------
// Süsler (her durağın teması)
// ------------------------------------------------------------------------------------------------
const pine = (x: number, y: number, k = 1) => (
  <g key={`p${x}-${y}`} transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x="-3" y="10" width="6" height="10" fill="#8c5a2b" />
    <path d="M0,-22 L16,12 H-16 Z" fill="#2f9e5a" {...s} />
  </g>
);
const bush = (x: number, y: number) => (
  <g key={`b${x}-${y}`}>
    <circle cx={x} cy={y} r="11" fill="#9ed48a" />
    <circle cx={x + 12} cy={y + 3} r="8" fill="#8cc97a" />
  </g>
);
const flower = (x: number, y: number, c: string) => (
  <g key={`f${x}-${y}`}>
    {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 5 * Math.cos((a * Math.PI) / 180)} cy={y + 5 * Math.sin((a * Math.PI) / 180)} r="4" fill={c} />)}
    <circle cx={x} cy={y} r="2.6" fill="#ffc83d" />
  </g>
);

const DECOR: ((x: number, y: number) => ReactNode)[] = [
  // Kalem Köyü: kalemler ve boya kalemi evleri
  (x, y) => (
    <g>
      <g transform={`translate(${x} ${y}) rotate(-20)`}>
        <rect x="-5" y="-26" width="10" height="36" fill="#ffc531" {...s} />
        <path d="M-5,10 L0,20 L5,10 Z" fill="#f6d7a7" {...s} />
        <rect x="-5" y="-32" width="10" height="7" rx="2" fill="#ff8fb1" {...s} />
      </g>
      <g transform={`translate(${x + 40} ${y + 20})`}>
        <rect x="-14" y="-10" width="28" height="22" fill="#fff1c7" {...s} />
        <path d="M-18,-10 L0,-26 L18,-10 Z" fill="#ff6b4a" {...s} />
        <rect x="-4" y="2" width="8" height="10" fill="#8c5a2b" />
      </g>
    </g>
  ),
  // Pati Ormanı: çamlar ve pati izleri
  (x, y) => (
    <g>
      {pine(x, y, 1.1)}
      {pine(x + 30, y + 16, 0.9)}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${x - 26 + i * 18} ${y + 44 - i * 8})`} fill="#8c5a2b" opacity="0.7">
          <ellipse cx="0" cy="0" rx="5" ry="4" />
          <circle cx="-5" cy="-6" r="2" />
          <circle cx="0" cy="-8" r="2" />
          <circle cx="5" cy="-6" r="2" />
        </g>
      ))}
    </g>
  ),
  // Şeker Kasabası: cupcake ve lolipop
  (x, y) => (
    <g>
      <g transform={`translate(${x} ${y})`}>
        <path d="M-12,0 H12 L8,18 H-8 Z" fill="#ffc83d" {...s} />
        <path d="M-14,0 C-14,-20 14,-20 14,0 Z" fill="#ff8fb1" {...s} />
        <circle cx="0" cy="-17" r="4" fill="#e63946" {...s} strokeWidth={1.6} />
      </g>
      <g transform={`translate(${x + 38} ${y + 12})`}>
        <path d="M0,4 V30" stroke={INK} strokeWidth="3" />
        <circle cx="0" cy="-6" r="12" fill="#9b6bff" {...s} />
        <path d="M-6,-8 C-2,-14 6,-10 2,-4" fill="none" stroke="#fff" strokeWidth="2.5" />
      </g>
    </g>
  ),
  // Çiçek Vadisi: çiçekler ve güneş
  (x, y) => (
    <g>
      <circle cx={x + 30} cy={y - 16} r="13" fill="#ffc83d" {...s} />
      {flower(x, y + 10, '#ff6b9a')}
      {flower(x + 22, y + 26, '#9b6bff')}
      {flower(x - 16, y + 30, '#ff6b4a')}
      {bush(x + 44, y + 22)}
    </g>
  ),
  // Masal Şatosu
  (x, y) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-26" y="-8" width="52" height="34" fill="#d8cbf5" {...s} />
      <rect x="-34" y="-22" width="14" height="48" fill="#c9b8f0" {...s} />
      <rect x="20" y="-22" width="14" height="48" fill="#c9b8f0" {...s} />
      <path d="M-37,-22 L-27,-40 L-17,-22 Z M17,-22 L27,-40 L37,-22 Z" fill="#9b6bff" {...s} />
      <path d="M-8,26 V12 C-8,4 8,4 8,12 V26 Z" fill="#8c5a2b" />
      <path d="M-27,-40 V-50 L-18,-46 L-27,-43" fill="#ff6b4a" />
    </g>
  ),
  // Mercan Koyu: dalgalar, balık
  (x, y) => (
    <g>
      <path d={`M${x - 30},${y} q10,-8 20,0 t20,0 t20,0 t20,0`} fill="none" stroke="#3aa7d8" strokeWidth="4" strokeLinecap="round" />
      <path d={`M${x - 20},${y + 16} q10,-8 20,0 t20,0 t20,0`} fill="none" stroke="#5cc0e8" strokeWidth="4" strokeLinecap="round" />
      <g transform={`translate(${x + 20} ${y - 22})`}>
        <path d="M-12,0 C-6,-9 8,-9 12,0 C8,9 -6,9 -12,0 Z M12,0 L22,-8 V8 Z" fill="#ff8a3d" {...s} />
        <circle cx="-4" cy="-2" r="1.8" fill={INK} />
      </g>
    </g>
  ),
  // Dino Adası: volkan ve palmiye
  (x, y) => (
    <g>
      <path d={`M${x - 30},${y + 20} L${x - 8},${y - 20} H${x + 8} L${x + 30},${y + 20} Z`} fill="#b07a4f" {...s} />
      <path d={`M${x - 8},${y - 20} q8,-14 16,0`} fill="#ff6b4a" />
      <path d={`M${x - 4},${y - 30} q-6,-8 0,-14 M${x + 6},${y - 32} q6,-8 0,-14`} fill="none" stroke="#b9b3c9" strokeWidth="4" strokeLinecap="round" />
      <g transform={`translate(${x + 46} ${y + 10})`}>
        <path d="M0,24 C2,10 -2,0 0,-10" fill="none" stroke="#8c5a2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M0,-10 C-14,-18 -22,-10 -24,-4 M0,-10 C14,-18 22,-10 24,-4 M0,-10 C-6,-24 -16,-24 -18,-20 M0,-10 C6,-24 16,-24 18,-20" fill="none" stroke="#2bb673" strokeWidth="5" strokeLinecap="round" />
      </g>
    </g>
  ),
  // Hız Pisti: roket ve damalı bayrak
  (x, y) => (
    <g>
      <g transform={`translate(${x} ${y}) rotate(30)`}>
        <path d="M0,-24 C10,-14 10,4 8,16 H-8 C-10,4 -10,-14 0,-24 Z" fill="#fff" {...s} />
        <circle cx="0" cy="-6" r="5" fill="#5b8def" {...s} strokeWidth={1.8} />
        <path d="M-8,8 L-16,20 H-8 Z M8,8 L16,20 H8 Z" fill="#ff6b4a" {...s} strokeWidth={1.8} />
        <path d="M-5,16 L0,28 L5,16 Z" fill="#ffc83d" />
      </g>
      <g transform={`translate(${x + 40} ${y + 6})`}>
        <path d="M0,30 V-14" stroke={INK} strokeWidth="3" />
        <rect x="0" y="-14" width="22" height="16" fill="#fff" {...s} strokeWidth={1.8} />
        <path d="M0,-14 h5.5 v4 h-5.5 Z M11,-14 h5.5 v4 h-5.5 Z M5.5,-10 h5.5 v4 h-5.5 Z M16.5,-10 h5.5 v4 h-5.5 Z M0,-6 h5.5 v4 h-5.5 Z M11,-6 h5.5 v4 h-5.5 Z" fill={INK} />
      </g>
    </g>
  ),
  // Kutlama Meydanı: balonlar
  (x, y) => (
    <g>
      {[['#ff6b4a', 0, 0], ['#ffc83d', 22, -10], ['#9b6bff', 40, 4]].map(([c, dx, dy]) => (
        <g key={c as string}>
          <path d={`M${x + (dx as number)},${y + (dy as number) + 16} C${x + (dx as number) - 4},${y + (dy as number) + 30} ${x + (dx as number) + 4},${y + (dy as number) + 36} ${x + 18},${y + 50}`} fill="none" stroke={INK} strokeWidth="1.5" />
          <ellipse cx={x + (dx as number)} cy={y + (dy as number)} rx="11" ry="14" fill={c as string} {...s} />
        </g>
      ))}
    </g>
  ),
];

// ------------------------------------------------------------------------------------------------
// Sahne (kenarları dolduran ağaçlar, çalılar, taşlar, gölcük)
// ------------------------------------------------------------------------------------------------
const roundTree = (x: number, y: number, k = 1) => (
  <g key={`r${x}-${y}`} transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x="-4" y="6" width="8" height="18" rx="3" fill="#8c5a2b" />
    <circle cx="0" cy="-8" r="20" fill="#6cc46a" {...s} />
    <circle cx="-8" cy="-12" r="5" fill="#8fd38a" />
  </g>
);
const rock = (x: number, y: number) => (
  <g key={`k${x}-${y}`}>
    <path d={`M${x - 16},${y + 8} C${x - 16},${y - 8} ${x - 4},${y - 12} ${x + 6},${y - 8} C${x + 16},${y - 4} ${x + 18},${y + 8} ${x + 12},${y + 8} Z`} fill="#c9c2b8" {...s} strokeWidth={2} />
  </g>
);
const pond = (x: number, y: number) => (
  <g key={`o${x}-${y}`}>
    <ellipse cx={x} cy={y} rx="44" ry="18" fill="#8fd3f0" stroke="#6cbfe0" strokeWidth="3" />
    <path d={`M${x - 20},${y} q6,-4 12,0 M${x + 6},${y + 6} q6,-4 12,0`} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
  </g>
);

/** Tekrarlanabilir sahte rastgele (her açılışta aynı harita). */
const rnd = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

// ------------------------------------------------------------------------------------------------
// Harita: ölçülen genişliğe göre çizilir (büyümez; geniş ekranda kenarlar sahneyle dolar)
// ------------------------------------------------------------------------------------------------
const TOP = 170;
const STEP = 200;
/** Dönemeçler: durak sırayla ortanın sağına/soluna (genliğe oranla). */
const OFFS = [-0.9, 0.92, -0.8, 0.96, -0.96, 0.86, -0.74, 1, -0.5];

export function AdventureMap({ chapters, here, onLocked }: { chapters: ChapterState[]; here: number; onLocked: (i: number) => void }) {
  const [ref, box] = useSize<HTMLDivElement>();
  const w = Math.round(box.w);
  const n = chapters.length;
  const cx = w / 2;
  const A = Math.min(w * 0.28, 190);
  const pt = (i: number) => ({ x: cx + OFFS[i % OFFS.length] * A, y: TOP + i * STEP });
  const last = pt(n - 1);
  const end = { x: cx, y: last.y + 170 };
  const H = end.y + 230;

  let road = `M${cx},70 C${cx},120 ${pt(0).x},${pt(0).y - 80} ${pt(0).x},${pt(0).y}`;
  for (let i = 1; i < n; i++) {
    const a = pt(i - 1);
    const b = pt(i);
    road += ` C${a.x},${a.y + STEP * 0.55} ${b.x},${b.y - STEP * 0.55} ${b.x},${b.y}`;
  }
  road += ` C${last.x},${last.y + 100} ${cx},${end.y - 90} ${cx},${end.y}`;

  const reached = here < 0 ? n : here;
  const progress = n > 0 ? Math.min(1, (reached + 0.3) / (n + 0.6)) : 0;
  const riverY = pt(5).y + STEP / 2;
  const river = `M0,${riverY - 20} C${w * 0.25},${riverY - 50} ${w * 0.4},${riverY + 30} ${cx},${riverY} S${w * 0.8},${riverY - 40} ${w},${riverY + 10}`;

  // Kenar sahnesi: yolun ve kartların dışında kalan şeritler
  const inner = A + 220;
  const scenery: ReactNode[] = [];
  for (let row = 0; row * 120 + 60 < H - 80; row++) {
    const y = 60 + row * 120 + rnd(row, 1) * 40;
    for (const side of [-1, 1]) {
      const room = cx - inner;
      if (room < 50) continue;
      const x = cx + side * (inner + rnd(row, side + 3) * (room - 30));
      const kind = Math.floor(rnd(row, side + 7) * 6);
      const item = kind === 0 ? pine(x, y, 1.2) : kind === 1 ? roundTree(x, y) : kind === 2 ? bush(x, y) : kind === 3 ? rock(x, y) : kind === 4 && row % 3 === 1 ? pond(x, y) : flower(x, y, ['#ff8fb1', '#ffffff', '#ffc83d', '#b79cf0'][row % 4]);
      scenery.push(<g key={`${row}${side}`}>{item}</g>);
      if (room > 160) scenery.push(<g key={`${row}${side}b`}>{flower(x + side * 50, y + 44, ['#ffffff', '#ff8fb1', '#b79cf0'][row % 3])}</g>);
    }
  }

  return (
    <div className="adv-world" ref={ref}>
      {w > 0 && (
        <div className="adv-world__inner" style={{ height: H }}>
          <svg className="adv-world__svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
            {/* çayır: üstte dalgalı kenarla sayfaya karışır */}
            <path d={`M0,40 C${w * 0.2},10 ${w * 0.35},56 ${w * 0.55},30 S${w * 0.85},8 ${w},34 V${H} H0 Z`} fill="#e3f4d0" />
            <path d={`M0,40 C${w * 0.2},10 ${w * 0.35},56 ${w * 0.55},30 S${w * 0.85},8 ${w},34`} fill="none" stroke="#b9e3a0" strokeWidth="6" />
            {scenery}
            {Array.from({ length: Math.floor(H / 90) }, (_, i) => {
              const side = i % 2 ? 1 : -1;
              const x = cx + side * (A + 40 + rnd(i, 11) * 60);
              const y = TOP + 90 + i * 90;
              return y < H - 60 ? <g key={`fl${i}`}>{flower(x, y, ['#ff8fb1', '#ffffff', '#ffc83d', '#b79cf0'][i % 4])}</g> : null;
            })}

            {/* nehir ve köprü */}
            <path d={river} fill="none" stroke="#8fd3f0" strokeWidth="30" strokeLinecap="round" />
            <path d={river} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="10 14" opacity="0.8" />

            {/* yol */}
            <path d={road} fill="none" stroke="#c9a36a" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
            <path d={road} fill="none" stroke="#f3dfb2" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
            <path d={road} fill="none" stroke="#ffc83d" strokeWidth="30" strokeLinecap="round" pathLength={1} strokeDasharray={`${progress} 2`} opacity="0.85" />
            <path d={road} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="9 12" strokeLinecap="round" />
            <g transform={`translate(${cx - 32} ${riverY - 13})`}>
              <rect width="64" height="26" rx="5" fill="#b07a4f" {...s} />
              <path d="M10,0 V26 M22,0 V26 M34,0 V26 M46,0 V26" stroke="#8c5a2b" strokeWidth="2" />
            </g>

            {/* her durağın teması: durağın altındaki boş kıvrımda */}
            {chapters.map((c, i) => {
              const p = pt(i);
              return (
                <g key={c.path} className={c.open ? '' : 'adv-decor--dim'}>
                  {DECOR[i % DECOR.length](p.x - 30, p.y + 110)}
                </g>
              );
            })}

            {/* başlangıç tabelası */}
            <g transform={`translate(${cx + 34} 56)`}>
              <path d="M0,50 V6" stroke="#8c5a2b" strokeWidth="5" strokeLinecap="round" />
              <path d="M-4,4 H54 L64,14 L54,24 H-4 Z" fill="#fff1c7" {...s} />
              <text x="26" y="19" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="12" fill={INK}>Başla</text>
            </g>

            {/* hazine işareti */}
            <path d={`M${end.x - 16},${end.y + 22} L${end.x + 16},${end.y + 54} M${end.x + 16},${end.y + 22} L${end.x - 16},${end.y + 54}`} stroke="#e63946" strokeWidth="7" strokeLinecap="round" />
          </svg>

          <div className="adv-treasure" style={{ left: end.x, top: end.y }}>
            <ChestArt className={here < 0 ? 'shake' : ''} />
            <span>{here < 0 ? 'Bütün maceralar tamam!' : 'Yolun sonunda hazine!'}</span>
          </div>

          {chapters.map((c, i) => {
            const p = pt(i);
            const path = getPath(c.path);
            const first = lessonsByPath(c.path)[0];
            const state = c.complete ? 'done' : i === here ? 'here' : c.open ? 'open' : 'locked';
            const side = p.x > cx ? 'left' : 'right';
            const body = (
              <>
                <span className="adv-node__disc">
                  {first && <SketchImg lesson={first} mode={c.complete ? 'color' : 'graphite'} pad={12} />}
                  <span className="adv-node__num">{i + 1}</span>
                  {state === 'done' && <span className="adv-node__badge adv-node__badge--done"><Check size={16} strokeWidth={3.4} /></span>}
                  {state === 'locked' && <span className="adv-node__badge"><Lock size={16} /></span>}
                </span>
                <span className={`adv-node__label adv-node__label--${side}`}>
                  <b>{c.place}</b>
                  <small>{path?.title}</small>
                  <span className="adv-node__bar"><i style={{ width: `${(c.done / Math.max(1, c.total)) * 100}%` }} /></span>
                  <small>{c.done} / {c.total} ders</small>
                  <span className={`adv-node__prize ${c.complete ? 'won' : ''}`} title={getOutfit(c.outfit)?.title}>
                    <Mascot size={24} outfit={c.outfit} />
                  </span>
                </span>
              </>
            );
            return (
              <div key={c.path} className={`adv-node adv-node--${state}`} style={{ left: p.x, top: p.y, ['--pc' as string]: path?.color }}>
                {state === 'here' && <span className="adv-node__me" aria-label="Buradasın"><Mascot size={46} mood="cheer" /></span>}
                {c.open ? (
                  <Link to={`/yol/${c.path}`} className="adv-node__hit" aria-label={`${i + 1}. durak: ${c.place}`}>{body}</Link>
                ) : (
                  <button type="button" className="adv-node__hit" aria-disabled="true" aria-label={`${i + 1}. durak: ${c.place} (kilitli)`} onClick={() => onLocked(i)}>
                    {body}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
