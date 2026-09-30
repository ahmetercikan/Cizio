/**
 * Çizio'nun maceraları: el çizimi hazine haritası. Kıvrımlı toprak yol duraklar arasında dönemeçlerle
 * ilerler; tamamlanan kısım boyanır. Her durağın çevresinde kendi temasına uygun süsler, yolun başında
 * tabela, sonunda hazine sandığı. Koordinatlar 400 genişlikte bir SVG'de; duraklar yüzde ile yerleşir.
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

const INK = '#3a2b27';
const s = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const W = 400;
const TOP = 120;
const STEP = 190;
/** Yolun dönemeçleri: duraklar sırayla sağa sola kıvrılır. */
const XS = [110, 292, 120, 296, 104, 286, 126, 300, 150];

const point = (i: number) => ({ x: XS[i % XS.length], y: TOP + i * STEP });

function roadPath(n: number): string {
  const p0 = point(0);
  let d = `M${W / 2},30 C${W / 2},70 ${p0.x},${p0.y - 70} ${p0.x},${p0.y}`;
  for (let i = 1; i < n; i++) {
    const a = point(i - 1);
    const b = point(i);
    d += ` C${a.x},${a.y + STEP * 0.55} ${b.x},${b.y - STEP * 0.55} ${b.x},${b.y}`;
  }
  const last = point(n - 1);
  d += ` C${last.x},${last.y + 90} ${W / 2},${last.y + 80} ${W / 2},${last.y + 150}`;
  return d;
}

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
// Harita
// ------------------------------------------------------------------------------------------------
export function AdventureMap({ chapters, here, onLocked }: { chapters: ChapterState[]; here: number; onLocked: (i: number) => void }) {
  const n = chapters.length;
  const H = TOP + (n - 1) * STEP + 230;
  const road = roadPath(n);
  const reached = here < 0 ? n - 1 : here;
  // Tamamlanan yol: başlangıçtan bulunulan durağa kadar (yaklaşık, uzunluk oranıyla)
  const progress = n > 1 ? (reached + 0.35) / (n + 0.7) : 0;
  const end = { x: W / 2, y: point(n - 1).y + 150 };
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="adv-mapbox" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg className="adv-mapbox__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {/* zemin: çayır, bölge lekeleri, nehir */}
        <rect width={W} height={H} rx="28" fill="#e3f4d0" />
        {/* çayırda serpiştirilmiş çiçekler */}
        {Array.from({ length: Math.floor(H / 70) }, (_, i) => {
          const x = i % 2 ? 22 + ((i * 37) % 60) : W - 26 - ((i * 53) % 60);
          const y = 70 + i * 70 + ((i * 29) % 30);
          return flower(x, y, ['#ff8fb1', '#ffffff', '#ffc83d', '#b79cf0'][i % 4]);
        })}
        <path d={`M0,${TOP + 5.3 * STEP} C120,${TOP + 5.0 * STEP} 200,${TOP + 5.8 * STEP} ${W},${TOP + 5.45 * STEP}`} fill="none" stroke="#8fd3f0" strokeWidth="26" strokeLinecap="round" />
        <path d={`M0,${TOP + 5.3 * STEP} C120,${TOP + 5.0 * STEP} 200,${TOP + 5.8 * STEP} ${W},${TOP + 5.45 * STEP}`} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="10 14" opacity="0.8" />
        {[[40, 60], [350, 40], [30, 420], [370, 560], [20, 900], [375, 1100], [40, 1400], [360, 1650]].filter(([, y]) => y < H - 60).map(([x, y]) => bush(x, y))}

        {/* yol */}
        <path d={road} fill="none" stroke="#c9a36a" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" />
        <path d={road} fill="none" stroke="#f3dfb2" strokeWidth="29" strokeLinecap="round" strokeLinejoin="round" />
        <path d={road} fill="none" stroke="#ffc83d" strokeWidth="29" strokeLinecap="round" pathLength={1} strokeDasharray={`${progress} 2`} opacity="0.85" />
        <path d={road} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="9 12" strokeLinecap="round" />

        {/* süsler: durağın boş tarafında */}
        {chapters.map((c, i) => {
          const p = point(i);
          const left = p.x > W / 2;
          const dx = left ? 40 : W - 110;
          return <g key={c.path} className={c.open ? '' : 'adv-decor--dim'}>{DECOR[i % DECOR.length](dx, p.y - 48 + (i % 2) * 10)}</g>;
        })}

        {/* başlangıç tabelası */}
        <g transform={`translate(${W / 2 + 38} 20)`}>
          <path d="M0,50 V6" stroke="#8c5a2b" strokeWidth="5" strokeLinecap="round" />
          <path d="M-4,4 H54 L64,14 L54,24 H-4 Z" fill="#fff1c7" {...s} />
          <text x="26" y="19" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="12" fill={INK}>Başla</text>
        </g>

        {/* köprü */}
        <g transform={`translate(${point(5).x - 36} ${TOP + 5.42 * STEP - 12})`}>
          <rect x="0" y="0" width="44" height="24" rx="4" fill="#b07a4f" {...s} />
          <path d="M8,0 V24 M18,0 V24 M28,0 V24 M38,0 V24" stroke="#8c5a2b" strokeWidth="2" />
        </g>

        {/* hazine */}
        <path d={`M${end.x - 14},${end.y - 14} L${end.x + 14},${end.y + 14} M${end.x + 14},${end.y - 14} L${end.x - 14},${end.y + 14}`} stroke="#e63946" strokeWidth="7" strokeLinecap="round" />
      </svg>

      {/* hazine sandığı (yolun sonu) */}
      <div className="adv-treasure" style={{ left: pct(end.x, W), top: pct(end.y - 30, H) }}>
        <ChestArt className={here < 0 ? 'shake' : ''} />
        <span>{here < 0 ? 'Bütün maceralar tamam!' : 'Yolun sonunda hazine!'}</span>
      </div>

      {/* duraklar */}
      {chapters.map((c, i) => {
        const p = point(i);
        const path = getPath(c.path);
        const first = lessonsByPath(c.path)[0];
        const state = c.complete ? 'done' : i === here ? 'here' : c.open ? 'open' : 'locked';
        const side = p.x > W / 2 ? 'left' : 'right';
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
          <div key={c.path} className={`adv-node adv-node--${state}`} style={{ left: pct(p.x, W), top: pct(p.y, H), ['--pc' as string]: path?.color }}>
            {state === 'here' && (
              <span className="adv-node__me" aria-label="Buradasın"><Mascot size={46} mood="cheer" /></span>
            )}
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
  );
}
