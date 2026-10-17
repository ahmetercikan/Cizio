/**
 * Oyun Çadırı'nın ikinci kuşak oyunları: Kaç Tane?, Deseni Tamamla, Balık Tut, Labirent, Ritim Tut
 * ve Yılan. İlk kuşak MiniGames.tsx'te; ikisi de aynı sözleşmeyi kullanır: oyun bitince
 * `onEnd(kazandı mı, puan)` çağrılır, ödülü World.tsx verir (economy.ts miniWin).
 * Hepsi dokunmayla oynanır, bir–iki dakikayı geçmez ve sesi sfx ile çalar.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { rideSound, sfx } from '../lib/sfx';
import { GameIcon } from './GameIcon';
import { Panel } from './Shops';
import { useClock, useEnd, type End } from './MiniGames';

/** Oyunların üst satırı: anlatım, puan ve süre hep aynı yerde. */
function Bar({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <p className="sub mg-bar" style={{ marginTop: 0 }}>
      <span>{text}</span>
      {right && <b className="mg-bar__r">{right}</b>}
    </p>
  );
}

/** Dört yön tuşu (labirent ve yılan): baş parmakla rahat basılır. */
function Pad({ onMove }: { onMove: (dx: number, dy: number) => void }) {
  const dirs: [string, number, number, string][] = [['↑', 0, -1, 'u'], ['←', -1, 0, 'l'], ['→', 1, 0, 'r'], ['↓', 0, 1, 'd']];
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const d: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const v = d[e.key];
      if (!v) return;
      e.preventDefault();
      onMove(v[0], v[1]);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onMove]);
  return (
    <div className="mg-pad">
      {dirs.map(([ch, dx, dy, k]) => (
        <button key={k} className={`mg-pad__b mg-pad__b--${k}`} aria-label={ch} onPointerDown={() => onMove(dx, dy)}>{ch}</button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Kaç Tane? — sayma
// ------------------------------------------------------------------------------------------------
const COUNT_ICONS = ['cilek', 'balon', 'yildiz', 'ari', 'lale', 'yumurta', 'seker', 'balik'];
export function CountGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 8;
  const end = useEnd(onEnd);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [bad, setBad] = useState(-1);
  const make = (round: number) => {
    const n = 3 + Math.floor(Math.random() * (4 + round));
    const icon = COUNT_ICONS[Math.floor(Math.random() * COUNT_ICONS.length)];
    const opts = new Set([n]);
    while (opts.size < 4) opts.add(Math.max(1, n + Math.floor(Math.random() * 7) - 3));
    // her simge sabit bir yere düşsün (her çizimde zıplamasın)
    const spots = Array.from({ length: n }, (_, i) => ({ x: 10 + ((i * 37) % 76) + Math.random() * 8, y: 12 + ((i * 53) % 64) + Math.random() * 8 }));
    return { n, icon, spots, opts: [...opts].sort(() => Math.random() - 0.5) };
  };
  const [q, setQ] = useState(() => make(0));
  const pick = (v: number) => {
    if (v === q.n) {
      sfx.star(score % 6);
      const s = score + 1;
      setScore(s);
      setBad(-1);
      if (s >= GOAL) return end(true, s);
      setQ(make(s));
    } else {
      sfx.kick();
      setBad(v);
      const m = miss + 1;
      setMiss(m);
      if (m >= 4) end(false, score);
    }
  };
  return (
    <Panel title="Kaç Tane?" icon={<GameIcon name="sayi" size={26} />} onClose={onClose}>
      <Bar text="Say bakalım, kaç tane var?" right={<>{score}/{GOAL} · {'♥'.repeat(Math.max(0, 4 - miss))}</>} />
      <div className="mg-count">
        {q.spots.map((p, i) => (
          <span key={i} style={{ left: `${p.x}%`, top: `${p.y}%` }}><GameIcon name={q.icon} size={40} /></span>
        ))}
      </div>
      <div className="mg-answers">
        {q.opts.map((v, i) => (
          <button key={v} className={`mg-ans ${bad === v ? 'no' : ''}`} style={{ background: ['#ff8fb1', '#5b8def', '#ffc83d', '#2bb673'][i] }} onClick={() => pick(v)}>{v}</button>
        ))}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Deseni Tamamla — örüntü
// ------------------------------------------------------------------------------------------------
const PAT_ICONS = ['cilek', 'balon', 'yildiz', 'lale', 'ayicik', 'seker', 'mucevher', 'balik', 'yumurta', 'agac'];
export function PatternGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 8;
  const end = useEnd(onEnd);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [bad, setBad] = useState('');
  const make = (round: number) => {
    const pool = [...PAT_ICONS].sort(() => Math.random() - 0.5);
    // desen kalıbı: AB, AAB, ABC, ABB… tur ilerledikçe uzar
    const kinds = round < 2 ? [[0, 1]] : round < 5 ? [[0, 1], [0, 0, 1], [0, 1, 1]] : [[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1, 2]];
    const k = kinds[Math.floor(Math.random() * kinds.length)];
    const seq = Array.from({ length: 6 }, (_, i) => pool[k[i % k.length]]);
    const answer = pool[k[6 % k.length]];
    const opts = new Set([answer]);
    while (opts.size < 4) opts.add(pool[Math.floor(Math.random() * pool.length)]);
    return { seq, answer, opts: [...opts].sort(() => Math.random() - 0.5) };
  };
  const [q, setQ] = useState(() => make(0));
  const pick = (id: string) => {
    if (id === q.answer) {
      sfx.star(score % 6);
      const s = score + 1;
      setScore(s);
      setBad('');
      if (s >= GOAL) return end(true, s);
      setQ(make(s));
    } else {
      sfx.kick();
      setBad(id);
      const m = miss + 1;
      setMiss(m);
      if (m >= 4) end(false, score);
    }
  };
  return (
    <Panel title="Deseni Tamamla" icon={<GameIcon name="desen" size={26} />} onClose={onClose}>
      <Bar text="Sırada hangisi gelmeli?" right={<>{score}/{GOAL} · {'♥'.repeat(Math.max(0, 4 - miss))}</>} />
      <div className="mg-pattern">
        {q.seq.map((id, i) => <span key={i}><GameIcon name={id} size={44} /></span>)}
        <span className="mg-pattern__q">?</span>
      </div>
      <div className="mg-shadow__opts">
        {q.opts.map((id) => (
          <button key={id} className={`mg-shadow__opt ${bad === id ? 'no' : ''}`} onClick={() => pick(id)} aria-label="Seçenek"><GameIcon name={id} size={64} /></button>
        ))}
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Balık Tut — tam zamanında durdurma
// ------------------------------------------------------------------------------------------------
const FISH = ['balik', 'yengec', 'denizyildizi'];
export function FishGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 5;
  const end = useEnd(onEnd);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [pos, setPos] = useState(0);
  const [zone, setZone] = useState({ a: 40, w: 24 });
  const [caught, setCaught] = useState<string | null>(null);
  const st = useRef({ pos: 0, dir: 1, speed: 55, over: false, lock: false });
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.over && !s.lock) {
        s.pos += s.dir * s.speed * dt;
        if (s.pos > 100) {
          s.pos = 100;
          s.dir = -1;
        }
        if (s.pos < 0) {
          s.pos = 0;
          s.dir = 1;
        }
        setPos(s.pos);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pull = () => {
    const s = st.current;
    if (s.over || s.lock) return;
    const hit = s.pos >= zone.a && s.pos <= zone.a + zone.w;
    s.lock = true;
    if (hit) {
      rideSound('splash');
      const n = score + 1;
      setScore(n);
      setCaught(FISH[Math.floor(Math.random() * FISH.length)]);
      if (n >= GOAL) {
        s.over = true;
        return end(true, n);
      }
      s.speed = 55 + n * 14;
      setZone({ a: 10 + Math.random() * (90 - Math.max(10, 24 - n * 3)), w: Math.max(10, 24 - n * 3) });
    } else {
      sfx.kick();
      const m = miss + 1;
      setMiss(m);
      setCaught(null);
      if (m >= 3) {
        s.over = true;
        return end(false, score);
      }
      setZone({ a: 10 + Math.random() * 70, w: Math.max(10, 24 - score * 3) });
    }
    setTimeout(() => (st.current.lock = false), 550);
  };
  return (
    <Panel title="Balık Tut" icon={<GameIcon name="balik" size={26} />} onClose={onClose}>
      <Bar text="İmleç yeşil yere gelince Çek'e bas!" right={<>{score}/{GOAL} · {'♥'.repeat(Math.max(0, 3 - miss))}</>} />
      <div className="mg-fish">
        <div className="mg-fish__pond">{caught ? <GameIcon name={caught} size={92} /> : <GameIcon name="damla" size={64} />}</div>
        <div className="mg-fish__bar">
          <i className="mg-fish__zone" style={{ left: `${zone.a}%`, width: `${zone.w}%` }} />
          <i className="mg-fish__mark" style={{ left: `${pos}%` }} />
        </div>
        <button className="pill pill--yellow mg-fish__pull" onPointerDown={pull}>Çek!</button>
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Labirent — yolu bul
// ------------------------------------------------------------------------------------------------
const MZ = 9;
/** Rastgele ama her zaman çözülebilir labirent (derinlik öncelikli kazı). */
function digMaze(n: number) {
  // her hücrenin duvarları: [üst, sağ, alt, sol]
  const cells = Array.from({ length: n * n }, () => [true, true, true, true]);
  const seen = new Set<number>([0]);
  const stack = [0];
  const D: [number, number, number][] = [[0, -n, 2], [1, 1, 3], [2, n, 0], [3, -1, 1]];
  while (stack.length) {
    const c = stack[stack.length - 1];
    const opts = D.filter(([, d]) => {
      const t = c + d;
      if (t < 0 || t >= n * n || seen.has(t)) return false;
      if (Math.abs(d) === 1 && Math.floor(t / n) !== Math.floor(c / n)) return false;
      return true;
    });
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [w, d, back] = opts[Math.floor(Math.random() * opts.length)];
    cells[c][w] = false;
    cells[c + d][back] = false;
    seen.add(c + d);
    stack.push(c + d);
  }
  return cells;
}
export function MazeGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const end = useEnd(onEnd);
  const cells = useMemo(() => digMaze(MZ), []);
  const st = useRef({ at: 0, steps: 0 });
  const [at, setAt] = useState(0);
  const [steps, setSteps] = useState(0);
  const left = useClock(75, true, () => end(false, 0));
  const move = (dx: number, dy: number) => {
    const cur = st.current.at;
    const x = cur % MZ, y = Math.floor(cur / MZ);
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= MZ || ny < 0 || ny >= MZ) return;
    // duvar: yukarı 0, sağ 1, aşağı 2, sol 3
    if (cells[cur][dy < 0 ? 0 : dx > 0 ? 1 : dy > 0 ? 2 : 3]) {
      sfx.tab();
      return;
    }
    sfx.tap();
    const next = ny * MZ + nx;
    st.current = { at: next, steps: st.current.steps + 1 };
    setAt(next);
    setSteps(st.current.steps);
    if (next === MZ * MZ - 1) setTimeout(() => end(true, Math.max(1, 220 - st.current.steps * 2)), 150);
  };
  return (
    <Panel title="Labirent" icon={<GameIcon name="labirent" size={26} />} onClose={onClose}>
      <Bar text="Hazine sandığına giden yolu bul!" right={<>⏱ {left} · {steps} adım</>} />
      <div className="mg-maze" style={{ gridTemplateColumns: `repeat(${MZ}, 1fr)` }}>
        {cells.map((w, i) => (
          <span key={i} className="mg-maze__c" style={{ borderTopColor: w[0] ? '' : 'transparent', borderRightColor: w[1] ? '' : 'transparent', borderBottomColor: w[2] ? '' : 'transparent', borderLeftColor: w[3] ? '' : 'transparent' }}>
            {i === at && <GameIcon name="pati" size={22} />}
            {i === MZ * MZ - 1 && i !== at && <GameIcon name="sandik" size={22} />}
          </span>
        ))}
      </div>
      <Pad onMove={move} />
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Ritim Tut — notalara vuruşunda bas
// ------------------------------------------------------------------------------------------------
const LANES = [
  { c: '#ff6b6b', n: 0 },
  { c: '#ffd43b', n: 2 },
  { c: '#51cf66', n: 4 },
  { c: '#4dabf7', n: 7 },
];
export function RhythmGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 16;
  const end = useEnd(onEnd);
  type Note = { id: number; lane: number; y: number };
  const [notes, setNotes] = useState<Note[]>([]);
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [lit, setLit] = useState(-1);
  const st = useRef({ hits: 0, miss: 0, over: false, list: [] as Note[] });
  useEffect(() => {
    let raf = 0, last = performance.now(), spawn = 0.6, seq = 0, t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      spawn -= dt;
      const s = st.current;
      if (s.over) return;
      // notalar yavaş yavaş hızlanır ve sıklaşır
      const sp = 42 + t * 1.6;
      const out: Note[] = [];
      for (const n of s.list) {
        const y = n.y + sp * dt;
        if (y > 100) {
          // kaçan nota
          s.miss++;
          setMiss(s.miss);
          sfx.kick();
          if (s.miss >= 5) {
            s.over = true;
            end(false, s.hits);
            return;
          }
          continue;
        }
        out.push({ ...n, y });
      }
      if (spawn <= 0) {
        spawn = Math.max(0.42, 0.78 - t * 0.012);
        out.push({ id: ++seq, lane: Math.floor(Math.random() * 4), y: -8 });
      }
      s.list = out;
      setNotes(out);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tap = (lane: number) => {
    const s = st.current;
    setLit(lane);
    setTimeout(() => setLit(-1), 120);
    if (s.over) return;
    // vuruş çizgisine en yakın nota (çizgi %78'de)
    const i = s.list.findIndex((n) => n.lane === lane && n.y > 66 && n.y < 100);
    if (i < 0) {
      sfx.tab();
      return;
    }
    sfx.note(LANES[lane].n);
    s.list = s.list.filter((_, k) => k !== i);
    setNotes(s.list);
    s.hits++;
    setHits(s.hits);
    if (s.hits >= GOAL) {
      s.over = true;
      end(true, s.hits);
    }
  };
  return (
    <Panel title="Ritim Tut" icon={<GameIcon name="alkis" size={26} />} onClose={onClose}>
      <Bar text="Nota çizgiye gelince tuşuna bas!" right={<>{hits}/{GOAL} · {'♥'.repeat(Math.max(0, 5 - miss))}</>} />
      <div className="mg-rhythm">
        <div className="mg-rhythm__field">
          {LANES.map((_, i) => <i key={i} className="mg-rhythm__lane" style={{ left: `${i * 25}%` }} />)}
          <i className="mg-rhythm__hit" />
          {notes.map((n) => (
            <span key={n.id} className="mg-rhythm__note" style={{ left: `${n.lane * 25 + 12.5}%`, top: `${n.y}%`, background: LANES[n.lane].c }} />
          ))}
        </div>
        <div className="mg-rhythm__keys">
          {LANES.map((l, i) => (
            <button key={i} style={{ background: lit === i ? '#fff' : l.c }} onPointerDown={() => tap(i)} aria-label={`Tuş ${i + 1}`} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Yılan — meyveleri topla
// ------------------------------------------------------------------------------------------------
const SN = 11;
export function SnakeGame({ onEnd, onClose }: { onEnd: End; onClose: () => void }) {
  const GOAL = 10;
  const end = useEnd(onEnd);
  const [body, setBody] = useState<number[]>([SN * 5 + 3, SN * 5 + 2, SN * 5 + 1]);
  const [food, setFood] = useState(SN * 5 + 8);
  const [score, setScore] = useState(0);
  const st = useRef({ dir: 1, next: 1, body: [SN * 5 + 3, SN * 5 + 2, SN * 5 + 1], food: SN * 5 + 8, score: 0, over: false });
  const turn = (dx: number, dy: number) => {
    const d = dy ? dy * SN : dx;
    // tam ters yöne dönülmez
    if (d === -st.current.dir) return;
    st.current.next = d;
  };
  useEffect(() => {
    const step = () => {
      const s = st.current;
      if (s.over) return;
      s.dir = s.next;
      const head = s.body[0];
      const x = head % SN, y = Math.floor(head / SN);
      const nx = x + (s.dir === 1 ? 1 : s.dir === -1 ? -1 : 0);
      const ny = y + (s.dir === SN ? 1 : s.dir === -SN ? -1 : 0);
      const next = ny * SN + nx;
      if (nx < 0 || nx >= SN || ny < 0 || ny >= SN || s.body.includes(next)) {
        s.over = true;
        sfx.kick();
        end(false, s.score);
        return;
      }
      const ate = next === s.food;
      s.body = [next, ...(ate ? s.body : s.body.slice(0, -1))];
      if (ate) {
        s.score++;
        sfx.star(s.score % 6);
        setScore(s.score);
        if (s.score >= GOAL) {
          s.over = true;
          setBody([...s.body]);
          end(true, s.score);
          return;
        }
        const free: number[] = [];
        for (let i = 0; i < SN * SN; i++) if (!s.body.includes(i)) free.push(i);
        s.food = free[Math.floor(Math.random() * free.length)];
        setFood(s.food);
      }
      setBody([...s.body]);
    };
    let id = 0;
    const tick = () => {
      step();
      // yılan uzadıkça biraz hızlanır
      id = window.setTimeout(tick, Math.max(170, 340 - st.current.score * 16));
    };
    id = window.setTimeout(tick, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Panel title="Yılan" icon={<GameIcon name="yilan" size={26} />} onClose={onClose}>
      <Bar text="Meyveleri topla; duvara ve kuyruğuna çarpma!" right={<>{score}/{GOAL}</>} />
      <div className="mg-snake" style={{ gridTemplateColumns: `repeat(${SN}, 1fr)` }}>
        {Array.from({ length: SN * SN }, (_, i) => {
          const k = body.indexOf(i);
          return (
            <span key={i} className={`mg-snake__c ${k === 0 ? 'head' : k > 0 ? 'body' : ''}`}>
              {i === food && <GameIcon name="cilek" size={20} />}
            </span>
          );
        })}
      </div>
      <Pad onMove={turn} />
    </Panel>
  );
}
