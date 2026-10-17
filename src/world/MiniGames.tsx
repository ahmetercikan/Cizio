/**
 * Oyun Çadırı'nın yeni mini oyunları: Meyve Yakala, Köstebek Vur, Renk Dizisi, Kayan Yapboz, Toplama Balonları,
 * Gölgeyi Bul. Her biri bitince `onEnd(kazandı mı)` çağırır; kazanınca ödül (altın, bazen eşya/kıyafet) World.tsx'te.
 * Hepsi dokunmayla oynanır, kısa sürer (30–60 sn) ve sesi sfx ile çalar.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../lib/sfx';
import { GameIcon } from './GameIcon';
import { Panel } from './Shops';

/** Oyun bitti: kazandı mı ve (rekor defteri için) puanı. */
export type End = (won: boolean, score?: number) => void;

/** Oyun sonu bir kez çağrılır. */
export function useEnd(onEnd: End) {
  const done = useRef(false);
  return (won: boolean, score = 0) => {
    if (done.current) return;
    done.current = true;
    if (won) sfx.success();
    setTimeout(() => onEnd(won, score), 700);
  };
}

/** Geri sayım (saniye). */
export function useClock(total: number, running: boolean, onOver: () => void) {
  const [left, setLeft] = useState(total);
  const over = useRef(onOver);
  over.current = onOver;
  useEffect(() => {
    if (!running) return;
    const t0 = performance.now();
    const id = setInterval(() => {
      const l = Math.max(0, total - Math.floor((performance.now() - t0) / 1000));
      setLeft(l);
      if (l <= 0) {
        clearInterval(id);
        over.current();
      }
    }, 200);
    return () => clearInterval(id);
  }, [total, running]);
  return left;
}

// ------------------------------------------------------------------------------------------------
// Meyve Yakala: sepeti kaydır, meyveleri topla, tuğlalardan kaç
// ------------------------------------------------------------------------------------------------
const FOOD = ['cilek', 'domates', 'havuc', 'misir', 'kabak', 'peynir', 'ekmek'];
export function CatchGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 15;
  const end = useEnd(onEnd);
  const field = useRef<HTMLDivElement>(null);
  const [basket, setBasket] = useState(50);
  const bx = useRef(50);
  const [items, setItems] = useState<{ id: number; x: number; y: number; icon: string; bad: boolean; sp: number }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const st = useRef({ score: 0, lives: 3, over: false });
  const left = useClock(45, true, () => end(st.current.score >= GOAL, st.current.score));
  useEffect(() => {
    let raf = 0, last = performance.now(), spawn = 0, seq = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawn -= dt;
      if (st.current.over) return;
      setItems((list) => {
        const out: typeof list = [];
        for (const it of list) {
          const y = it.y + it.sp * dt;
          if (y > 84 && y < 96 && Math.abs(it.x - bx.current) < 11) {
            if (it.bad) {
              sfx.kick();
              st.current.lives--;
              setLives(st.current.lives);
              if (st.current.lives <= 0) {
                st.current.over = true;
                end(false);
              }
            } else {
              sfx.star(st.current.score % 6);
              st.current.score++;
              setScore(st.current.score);
              if (st.current.score >= GOAL) {
                st.current.over = true;
                end(true, st.current.score);
              }
            }
            continue;
          }
          if (y < 110) out.push({ ...it, y });
        }
        if (spawn <= 0) {
          spawn = 0.7;
          const bad = Math.random() < 0.25;
          out.push({ id: ++seq, x: 8 + Math.random() * 84, y: -8, icon: bad ? 'tugla' : FOOD[Math.floor(Math.random() * FOOD.length)], bad, sp: 22 + Math.random() * 16 + st.current.score });
        }
        return out;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = (e: React.PointerEvent) => {
    const r = field.current!.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100));
    bx.current = x;
    setBasket(x);
  };
  return (
    <Panel title="Meyve Yakala" icon={<GameIcon name="cilek" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Sepeti parmağınla kaydır, meyve ve sebzeleri yakala; tuğlalardan kaç! <b>{score}/{GOAL}</b> · {'♥'.repeat(lives)} · ⏱ {left}</p>
      <div ref={field} className="mg-field mg-field--sky" onPointerMove={move} onPointerDown={move}>
        {items.map((it) => (
          <span key={it.id} className="mg-fall" style={{ left: `${it.x}%`, top: `${it.y}%` }}><GameIcon name={it.icon} size={44} /></span>
        ))}
        <span className="mg-basket" style={{ left: `${basket}%` }} />
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Köstebek Vur
// ------------------------------------------------------------------------------------------------
function Mole({ hit }: { hit: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
      <ellipse cx="32" cy="40" rx="22" ry="22" fill="#8a5a35" stroke="#3a2b27" strokeWidth="3" />
      <ellipse cx="32" cy="46" rx="12" ry="9" fill="#d9b48a" />
      {hit ? (
        <>
          <path d="M20 30l6 6M26 30l-6 6M38 30l6 6M44 30l-6 6" stroke="#3a2b27" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="23" cy="33" r="3.5" fill="#3a2b27" />
          <circle cx="41" cy="33" r="3.5" fill="#3a2b27" />
          <circle cx="24" cy="32" r="1.2" fill="#fff" />
          <circle cx="42" cy="32" r="1.2" fill="#fff" />
        </>
      )}
      <ellipse cx="32" cy="42" rx="5" ry="3.5" fill="#ff8fb1" stroke="#3a2b27" strokeWidth="2" />
      <path d="M29 49h6v4h-6z" fill="#fff" stroke="#3a2b27" strokeWidth="1.5" />
    </svg>
  );
}
export function MoleGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 15;
  const end = useEnd(onEnd);
  const [up, setUp] = useState<{ hole: number; flower: boolean; hit: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const sc = useRef(0);
  const left = useClock(35, true, () => end(sc.current >= GOAL, sc.current));
  useEffect(() => {
    let alive = true;
    const next = () => {
      if (!alive || sc.current >= GOAL) return;
      const hole = Math.floor(Math.random() * 9);
      setUp({ hole, flower: Math.random() < 0.2, hit: false });
      const stay = Math.max(550, 1100 - sc.current * 35);
      setTimeout(() => {
        if (!alive) return;
        setUp(null);
        setTimeout(next, 180 + Math.random() * 300);
      }, stay);
    };
    const t = setTimeout(next, 600);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  const whack = (h: number) => {
    if (!up || up.hole !== h || up.hit) return;
    if (up.flower) {
      sfx.kick();
      sc.current = Math.max(0, sc.current - 1);
      setScore(sc.current);
      setUp({ ...up, hit: true });
      return;
    }
    sfx.pop();
    sc.current++;
    setScore(sc.current);
    setUp({ ...up, hit: true });
    if (sc.current >= GOAL) end(true, sc.current);
  };
  return (
    <Panel title="Köstebek Vur" icon={<GameIcon name="tarla" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Çıkan köstebeklere dokun! Çiçeklere dokunma. <b>{score}/{GOAL}</b> · ⏱ {left}</p>
      <div className="mg-holes">
        {Array.from({ length: 9 }, (_, h) => (
          <button key={h} className="mg-hole" onPointerDown={() => whack(h)} aria-label={`Delik ${h + 1}`}>
            <span className={`mg-mole ${up?.hole === h ? 'up' : ''}`}>{up?.hole === h && (up.flower ? <GameIcon name="lale" size={56} /> : <Mole hit={up.hit} />)}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Renk Dizisi (Simon)
// ------------------------------------------------------------------------------------------------
const PADS = [
  { c: '#ff6b6b', on: '#ffb3b3', n: 0 },
  { c: '#4dabf7', on: '#a8d8ff', n: 2 },
  { c: '#ffd43b', on: '#fff0a8', n: 4 },
  { c: '#51cf66', on: '#b2f2bb', n: 7 },
];
export function SimonGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 6;
  const end = useEnd(onEnd);
  const [seq, setSeq] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [lit, setLit] = useState(-1);
  const [turn, setTurn] = useState<'show' | 'play'>('show');
  const [pos, setPos] = useState(0);
  useEffect(() => {
    if (turn !== 'show') return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = () => {
      if (i >= seq.length) {
        setLit(-1);
        setTurn('play');
        setPos(0);
        return;
      }
      const k = seq[i++];
      setLit(k);
      sfx.note(PADS[k].n);
      timers.push(setTimeout(() => setLit(-1), 380));
      timers.push(setTimeout(step, 620));
    };
    timers.push(setTimeout(step, 700));
    return () => timers.forEach(clearTimeout);
  }, [turn, seq]);
  const press = (k: number) => {
    if (turn !== 'play') return;
    sfx.note(PADS[k].n);
    setLit(k);
    setTimeout(() => setLit(-1), 200);
    if (seq[pos] !== k) {
      sfx.kick();
      end(false, seq.length - 1);
      return;
    }
    if (pos + 1 === seq.length) {
      if (seq.length >= GOAL) return end(true, seq.length);
      setTurn('show');
      setSeq([...seq, Math.floor(Math.random() * 4)]);
    } else setPos(pos + 1);
  };
  return (
    <Panel title="Renk Dizisi" icon={<GameIcon name="nota" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>{turn === 'show' ? 'İzle ve dinle…' : 'Şimdi sen: aynı sırayla dokun!'} <b>Seviye {seq.length}/{GOAL}</b></p>
      <div className="mg-simon">
        {PADS.map((p, k) => (
          <button key={k} className="mg-pad" style={{ background: lit === k ? p.on : p.c, transform: lit === k ? 'scale(0.96)' : undefined }} onPointerDown={() => press(k)} aria-label={`Renk ${k + 1}`} />
        ))}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Kayan Yapboz (3×3)
// ------------------------------------------------------------------------------------------------
const TILE_ICONS = ['kopek', 'cilek', 'balon', 'yildiz', 'agac', 'ev', 'unicorn', 'bisiklet'];
export function PuzzleGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const end = useEnd(onEnd);
  const [tiles, setTiles] = useState<number[]>(() => {
    // çözülebilir karıştırma: çözümden rastgele geçerli hamleler
    const t = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let e = 8, prev = -1;
    for (let i = 0; i < 60; i++) {
      const n = [e - 3, e + 3, e % 3 ? e - 1 : -1, e % 3 < 2 ? e + 1 : -1].filter((k) => k >= 0 && k < 9 && k !== prev);
      const k = n[Math.floor(Math.random() * n.length)];
      [t[e], t[k]] = [t[k], t[e]];
      prev = e;
      e = k;
    }
    return t;
  });
  const [moves, setMoves] = useState(0);
  const left = useClock(90, true, () => end(false, 0));
  const tap = (i: number) => {
    const e = tiles.indexOf(0);
    const adj = (Math.abs(i - e) === 3) || (Math.abs(i - e) === 1 && Math.floor(i / 3) === Math.floor(e / 3));
    if (!adj) return;
    sfx.tap();
    const t = [...tiles];
    [t[e], t[i]] = [t[i], t[e]];
    setTiles(t);
    setMoves(moves + 1);
    if (t.every((v, k) => v === (k + 1) % 9)) end(true, Math.max(1, 200 - moves));
  };
  return (
    <Panel title="Kayan Yapboz" icon={<GameIcon name="kutu" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Kareleri kaydırıp 1'den 8'e sırala! Hamle: {moves} · ⏱ {left}</p>
      <div className="mg-puzzle">
        {tiles.map((v, i) => (
          <button key={v || 'bos'} className={`mg-tile ${v ? '' : 'empty'} ${v === i + 1 ? 'ok' : ''}`} onClick={() => tap(i)} aria-label={v ? `Kare ${v}` : 'Boş'}>
            {v > 0 && (
              <>
                <GameIcon name={TILE_ICONS[v - 1]} size={40} />
                <b>{v}</b>
              </>
            )}
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Toplama Balonları: doğru sonucu yazan balonu patlat
// ------------------------------------------------------------------------------------------------
export function MathGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 8;
  const end = useEnd(onEnd);
  const make = () => {
    const a = 1 + Math.floor(Math.random() * 5), b = 1 + Math.floor(Math.random() * 5);
    const ans = a + b;
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(Math.max(2, ans + Math.floor(Math.random() * 7) - 3));
    return { a, b, ans, opts: [...opts].sort(() => Math.random() - 0.5) };
  };
  const [q, setQ] = useState(make);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const sc = useRef(0);
  const left = useClock(60, true, () => end(sc.current >= GOAL, sc.current));
  const pick = (v: number) => {
    if (v === q.ans) {
      sfx.star(sc.current % 6);
      sc.current++;
      setScore(sc.current);
      if (sc.current >= GOAL) return end(true, sc.current);
      setQ(make());
      setWrong(-1);
    } else {
      sfx.kick();
      setWrong(v);
    }
  };
  const COLS = ['#ff8fb1', '#5b8def', '#ffc83d', '#2bb673'];
  return (
    <Panel title="Toplama Balonları" icon={<GameIcon name="balon" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Doğru cevabı taşıyan balonu patlat! <b>{score}/{GOAL}</b> · ⏱ {left}</p>
      <div className="mg-math">
        <div className="mg-q">
          {Array.from({ length: q.a }, (_, i) => <GameIcon key={`a${i}`} name="cilek" size={30} />)}
          <b>+</b>
          {Array.from({ length: q.b }, (_, i) => <GameIcon key={`b${i}`} name="cilek" size={30} />)}
          <b>= ?</b>
        </div>
        <div className="mg-q mg-q--text">{q.a} + {q.b} = ?</div>
        <div className="mg-answers">
          {q.opts.map((v, i) => (
            <button key={`${q.a}-${q.b}-${v}`} className={`mg-ans ${wrong === v ? 'no' : ''}`} style={{ background: COLS[i] }} onClick={() => pick(v)}>{v}</button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Gölgeyi Bul
// ------------------------------------------------------------------------------------------------
const SHADOW_ICONS = ['kopek', 'inek', 'tavuk', 'koyun', 'ari', 'agac', 'ev', 'bisiklet', 'unicorn', 'kardanadam', 'piyano', 'kanepe', 'sato', 'lale', 'ayicik', 'balon', 'jip', 'fener'];
export function ShadowGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 8;
  const end = useEnd(onEnd);
  const make = () => {
    const pool = [...SHADOW_ICONS].sort(() => Math.random() - 0.5).slice(0, 4);
    return { target: pool[0], opts: [...pool].sort(() => Math.random() - 0.5) };
  };
  const [q, setQ] = useState(make);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [bad, setBad] = useState('');
  const pick = (id: string) => {
    if (id === q.target) {
      sfx.star(score % 6);
      const s = score + 1;
      setScore(s);
      setBad('');
      if (s >= GOAL) return end(true, s);
      setQ(make());
    } else {
      sfx.kick();
      setBad(id);
      const m = miss + 1;
      setMiss(m);
      if (m >= 4) end(false, score);
    }
  };
  const hearts = useMemo(() => '♥'.repeat(Math.max(0, 4 - miss)), [miss]);
  return (
    <Panel title="Gölgeyi Bul" icon={<GameIcon name="ampul" size={26} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Bu resmin gölgesi hangisi? <b>{score}/{GOAL}</b> · {hearts}</p>
      <div className="mg-shadow">
        <div className="mg-shadow__target"><GameIcon name={q.target} size={110} /></div>
        <div className="mg-shadow__opts">
          {q.opts.map((id) => (
            <button key={id} className={`mg-shadow__opt ${bad === id ? 'no' : ''}`} onClick={() => pick(id)} aria-label="Gölge">
              <GameIcon name={id} size={76} className="mg-silhouette" />
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
