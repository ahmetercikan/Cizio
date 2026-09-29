/**
 * Karşılama ekranı: küçük bir kurşun kalem maskotun etrafına kalp çizer.
 *
 * Tek bir zaman çizelgesi (requestAnimationFrame) hem kalemi hem çizgiyi sürer, böylece çizgi her karede
 * tam kalem ucunda biter. Akış: kalem havadan süzülüp kâğıda iner → kalbi üst girintiden başlayıp önce sol,
 * sonra sağ kavisle çizer (el gibi: başta hızlanır, alt uçta ve sonda yavaşlar; hareket yönüne hafif yatar,
 * ucu kâğıda bastırırken titrer) → kalkıp uzaklaşır → kalp parıltıyla atmaya başlar.
 *
 * İki SVG döner: kalp (maskotun arkasında) ve kalem (maskotun önünde); z-index'ler CSS'te.
 * Hareket azaltma tercihinde kalp doğrudan çizili gösterilir, kalem hiç çıkmaz.
 */
import { useEffect, useRef, useState } from 'react';

/** 300×300 kutu; üst girintiden (150,96) başlar, sol kavis → alt uç → sağ kavis → girinti. */
const HEART_D =
  'M150,96 C141,76 125,56 102,46 C54,24 8,58 8,110 C8,184 86,238 150,284 ' +
  'C214,238 292,184 292,110 C292,58 246,24 198,46 C175,56 159,76 150,96 Z';

// Zaman çizelgesi (ms)
const T_START = 450;
const T_LAND = 650; // havadan kâğıda iniş
const T_HALF = 1250; // her kavis (sol, sağ) için süre
const T_LIFT = 650; // kalkış ve uzaklaşma
const DRAW_START = T_START + T_LAND;
const DRAW_END = DRAW_START + 2 * T_HALF;
const END = DRAW_END + T_LIFT;

const TILT = 36; // kalemin sağ elde tutulma açısı (derece)
const HOVER = 34; // havadayken ucun kâğıttan yüksekliği

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeIn = (x: number) => x * x * x;
/** Bir kavis içinde ilerleme: yumuşak başlayıp yavaşlayarak biter (fırçayı uca doğru yavaşlatan el gibi). */
const stroke = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

export function HeartDraw() {
  const lineRef = useRef<SVGPathElement>(null);
  const pencilRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const line = lineRef.current;
    const pencil = pencilRef.current;
    const body = bodyRef.current;
    const shadow = shadowRef.current;
    if (!line || !pencil || !body || !shadow) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const len = line.getTotalLength();
    line.style.strokeDasharray = `${len}`;
    if (reduce) {
      line.style.strokeDashoffset = '0';
      pencil.style.opacity = '0';
      setDone(true);
      return;
    }
    line.style.strokeDashoffset = `${len}`;

    const at = (p: number) => line.getPointAtLength(clamp01(p) * len);
    const start = at(0);
    let raf = 0;
    let t0 = 0;
    let lean = 0;
    let finished = false;
    const finish = () => {
      if (!finished) setDone((finished = true));
    };

    const place = (x: number, y: number, lift: number, angle: number, opacity: number) => {
      pencil.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      pencil.style.opacity = opacity.toFixed(3);
      // Kalem ucu ekseni boyunca kalkar (yukarı-sağa), gölge kâğıtta kalır ve kalktıkça silikleşir.
      body.setAttribute('transform', `rotate(${angle.toFixed(2)}) translate(0 ${(-lift).toFixed(2)})`);
      const s = 1 + lift / 40;
      shadow.setAttribute('transform', `translate(${(lift * 0.35).toFixed(2)} 0) scale(${s.toFixed(3)})`);
      shadow.style.opacity = (0.22 * (1 - lift / (HOVER * 1.6))).toFixed(3);
    };

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0;

      if (t < T_START) {
        place(start.x + 70, start.y - 90, HOVER, TILT + 8, 0);
      } else if (t < DRAW_START) {
        // Sağ üstten süzülerek gelir, ucu kâğıda değer.
        const k = easeOut((t - T_START) / T_LAND);
        place(start.x + 70 * (1 - k), start.y - 90 * (1 - k), HOVER * (1 - easeInOut(k)), TILT + 8 * (1 - k), Math.min(1, k * 2.5));
      } else if (t < DRAW_END) {
        const u = (t - DRAW_START) / T_HALF;
        const p = u < 1 ? stroke(u) * 0.5 : 0.5 + stroke(u - 1) * 0.5;
        const pt = at(p);
        const ahead = at(p + 0.004);
        line.style.strokeDashoffset = `${len * (1 - p)}`;
        // Hareket yönüne göre hafif yatma (sola giderken dik, sağa giderken daha yatık), yumuşatılmış.
        const dx = ahead.x - pt.x;
        const dy = ahead.y - pt.y;
        const n = Math.hypot(dx, dy) || 1;
        lean += ((dx / n) * 7 - (dy / n) * 2 - lean) * 0.12;
        // Bastırırken küçük titreşim; kavis uçlarında (yavaşken) daha az.
        const speed = Math.sin(Math.PI * (u % 1));
        const tremor = Math.sin(t / 22) * 0.9 * speed + Math.sin(t / 37) * 0.5;
        place(pt.x, pt.y, 0.6 + Math.sin(t / 45) * 0.6 * speed, TILT + lean + tremor, 1);
      } else if (t < END) {
        line.style.strokeDashoffset = '0';
        // Kâğıttan kalkar, hafif dönerek sağ alta çekilir ve kaybolur.
        const k = (t - DRAW_END) / T_LIFT;
        const up = easeOut(clamp01(k * 1.8));
        const away = easeIn(k);
        place(start.x + 60 * away, start.y + 40 * away, HOVER * up, TILT + lean * (1 - k) + 14 * away, 1 - clamp01((k - 0.45) / 0.55));
        if (k > 0.2) finish();
      } else {
        pencil.style.opacity = '0';
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <svg className={`heart-draw heart-draw--line ${done ? 'is-done' : ''}`} viewBox="0 0 300 300" aria-hidden="true">
        <g className="heart-draw__beat">
          <path ref={lineRef} className="heart-draw__path" d={HEART_D} />
        </g>
        {/* Bitişte kalbin çevresinden dışarı sıçrayan parıltılar */}
        <g className="heart-draw__burst">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={150 + Math.cos(a) * 150}
                y1={160 + Math.sin(a) * 148}
                x2={150 + Math.cos(a) * 168}
                y2={160 + Math.sin(a) * 166}
                style={{ animationDelay: `${(i % 2) * 60}ms` }}
              />
            );
          })}
        </g>
      </svg>
      <svg className="heart-draw heart-draw--pencil" viewBox="0 0 300 300" aria-hidden="true">
        <g ref={pencilRef} style={{ opacity: 0 }}>
          <ellipse ref={shadowRef} cx="6" cy="3" rx="13" ry="3.6" fill="#3a2b27" />
          <g ref={bodyRef}>
            <path d="M0,0 L-3.2,-8 L3.2,-8 Z" fill="#3a2b27" />
            <path d="M-3.2,-8 L-9,-23 L9,-23 L3.2,-8 Z" fill="#f6d7a7" stroke="#2b2250" strokeWidth="2" strokeLinejoin="round" />
            <path d="M-9,-23 H9 V-84 H-9 Z" fill="#ffc531" stroke="#2b2250" strokeWidth="2" strokeLinejoin="round" />
            <path d="M-3,-25 V-82 M3,-25 V-82" stroke="#f5a623" strokeWidth="2.4" />
            <path d="M-6.5,-27 V-80" stroke="#fff3c4" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <rect x="-9.5" y="-95" width="19" height="11" rx="2" fill="#cfcbe0" stroke="#2b2250" strokeWidth="2" />
            <path d="M-9.5,-89.5 H9.5" stroke="#a9a3c4" strokeWidth="1.6" />
            <path d="M-9,-95 V-103 Q-9,-110 -2,-110 H2 Q9,-110 9,-103 V-95 Z" fill="#ff8fb1" stroke="#2b2250" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </>
  );
}
