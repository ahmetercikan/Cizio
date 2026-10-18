/**
 * Harf / rakam izleme tahtası.
 *
 * Harfi kalem hareketi kalem hareketi öğretir: sıradaki hareket turuncu ve animasyonlu gösterilir, başladığı
 * yerde numaralı bir nokta durur. Çocuk üstünden geçer; parmağını kaldırınca o hareket puanlanır, yeterince
 * isabetliyse bir sonrakine geçilir. Puanlama derslerle aynı motoru kullanır (src/engine/scoring.ts).
 *
 * Hem Çizim Atölyesi'ndeki Türkçe harfler hem English Club'daki ABC bu tahtayı kullanır.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { DrawingDoc } from '../engine/drawingDoc';
import { samplePath } from '../engine/pathSampler';
import { scoreStep } from '../engine/scoring';
import type { Shape } from '../lessons/types';
import { sfx } from '../lib/sfx';
import type { Glyph } from './glyphs';

const INK = '#2b2250';
const ORANGE = '#ff7a2f';
const SOFT = '#cfc7e8';
/** Bir hareketin "geçti" sayılması için gereken isabet. */
const GECER = 0.52;

/** Çizgi kaç saniyede çizilsin (uzun çizgi biraz daha yavaş). */
const sure = (d: string) => Math.min(2, Math.max(0.6, samplePath(d).length / 220));

/** Bir kalem hareketinin başladığı nokta. */
function basla(d: string): [number, number] {
  const p = samplePath(d, 6).points;
  return p.length ? p[0] : [200, 200];
}

export interface TraceBoardProps {
  glyph: Glyph;
  /** Harf bitince: kaç yıldız (0-3) ve kaç denemede. */
  onFinish: (stars: 0 | 1 | 2 | 3) => void;
  /** Harfin sesi (dokununca ve her hareket başında söylenir). */
  onSay?: () => void;
  /** Alt satırda görünen ipucu. */
  hint?: string;
}

export function TraceBoard({ glyph, onFinish, onSay, hint }: TraceBoardProps) {
  const [step, setStep] = useState(0);
  const [tries, setTries] = useState(0);
  const [miss, setMiss] = useState(false);
  const [bitti, setBitti] = useState(false);
  const doc = useMemo(() => new DrawingDoc(), []);
  const wrap = useRef<HTMLDivElement>(null);
  const [boy, setBoy] = useState(320);

  // harf değişince tahtayı temizle
  useEffect(() => {
    doc.clear();
    setStep(0);
    setTries(0);
    setMiss(false);
    setBitti(false);
  }, [glyph.id, doc]);

  // kare tahta: genişliğe göre
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoy(Math.max(220, Math.min(el.clientWidth, 460))));
    ro.observe(el);
    setBoy(Math.max(220, Math.min(el.clientWidth, 460)));
    return () => ro.disconnect();
  }, []);

  const hedef: Shape[] = useMemo(() => glyph.strokes.map((d) => ({ d })), [glyph]);

  const strokeBitti = useCallback(() => {
    if (bitti) return;
    const cur = hedef[step];
    if (!cur) return;
    // yalnızca bu hareket için çizilenler puanlanır
    const strokes = doc.strokes((s) => s.step === step);
    const r = scoreStep([cur], hedef.slice(0, step), strokes, 26);
    if (r.coverage >= GECER) {
      setMiss(false);
      sfx.star(Math.min(5, step));
      const next = step + 1;
      if (next >= hedef.length) {
        setBitti(true);
        sfx.success();
        // yıldız: hiç hata yapmadan bitirdiyse 3
        const stars: 0 | 1 | 2 | 3 = tries === 0 ? 3 : tries <= hedef.length ? 2 : 1;
        window.setTimeout(() => onFinish(stars), 650);
      } else {
        setStep(next);
        onSay?.();
      }
    } else {
      setMiss(true);
      setTries((t) => t + 1);
      sfx.soft();
      // yanlış denemeyi sil: çocuk aynı hareketi yeniden dener
      window.setTimeout(() => {
        doc.removeWhere((a) => a.kind === 'stroke' && a.step === step);
        setMiss(false);
      }, 550);
    }
  }, [bitti, doc, hedef, onFinish, onSay, step, tries]);

  const tekrar = () => {
    doc.clear();
    setStep(0);
    setTries(0);
    setMiss(false);
    setBitti(false);
    sfx.pop();
  };

  const simdiki = hedef[step]?.d;
  const [bx, by] = simdiki ? basla(simdiki) : [0, 0];

  return (
    <div className="trace" ref={wrap}>
      <div className="trace__board stage" style={{ width: boy, height: boy }}>
        <svg viewBox="0 0 400 400" className="trace__guide" aria-hidden="true">
          {/* yazı çizgileri: defter gibi */}
          <g stroke="#e3dcf2" strokeWidth="2">
            <line x1="20" y1="80" x2="380" y2="80" />
            <line x1="20" y1="170" x2="380" y2="170" strokeDasharray="8 10" />
            <line x1="20" y1="320" x2="380" y2="320" strokeWidth="3" />
          </g>
          {/* sıradaki hareketlerden sonrakiler: çok soluk */}
          {glyph.strokes.map((d, i) =>
            i > step ? <path key={`n${i}`} d={d} fill="none" stroke={SOFT} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} /> : null,
          )}
          {/* biten hareketler: koyu */}
          {glyph.strokes.map((d, i) =>
            i < step ? <path key={`d${i}`} d={d} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} /> : null,
          )}
          {/* sıradaki hareket: kalın turuncu yol + ilerleyen kalem ucu */}
          {simdiki && !bitti && (
            <g key={`${glyph.id}-${step}`}>
              <path d={simdiki} fill="none" stroke={ORANGE} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.22} />
              <path d={simdiki} pathLength={1} className="g-anim" style={{ ['--delay' as string]: '0.2s', ['--dur' as string]: `${sure(simdiki)}s` }}
                fill="none" stroke={ORANGE} strokeWidth={8} strokeDasharray="1 1" strokeLinecap="round" strokeLinejoin="round" />
              <circle r={11} fill={ORANGE} stroke="#fff" strokeWidth={4} opacity={0}>
                <set attributeName="opacity" to="1" begin="0.2s" />
                <animateMotion path={simdiki} dur={`${sure(simdiki)}s`} begin="0.2s" fill="freeze" />
              </circle>
              {/* başlangıç noktası ve sıra numarası */}
              <circle cx={bx} cy={by} r={18} fill="#fff" stroke={ORANGE} strokeWidth={4} />
              <text x={bx} y={by + 7} textAnchor="middle" fontSize={21} fontWeight={700} fill={ORANGE} fontFamily="Fredoka, Nunito, sans-serif">{step + 1}</text>
            </g>
          )}
        </svg>
        <DrawingCanvas doc={doc} tool="pencil" color={INK} size={14} step={step} disabled={bitti} onStroke={strokeBitti} />
      </div>
      <div className="trace__bar">
        <span className={`trace__hint ${miss ? 'trace__hint--miss' : ''}`}>
          {bitti ? 'Harika! Harfi yazdın.' : miss ? 'Az kaldı! Turuncu yolun üstünden geç.' : hint ?? `${step + 1}. hareket: turuncu noktadan başla`}
        </span>
        <button className="btn-outline btn-outline--sm" onClick={tekrar}><RotateCcw size={17} /> Baştan</button>
      </div>
      <div className="trace__dots" aria-hidden="true">
        {glyph.strokes.map((_, i) => <i key={i} className={i < step || bitti ? 'on' : ''} />)}
      </div>
    </div>
  );
}
