/**
 * Treasure Hunt: dağınık şekiller arasında "Find the red star!" (5–6: "Find a star!", 8–9: "Find all the
 * blue hearts!"). Her turda 30 saniyelik kum saati; süre bitince ceza yok, sadece sonraki tura geçilir.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../lib/sfx';
import { shapePath } from '../Art';
import { COLORS, getWord, HUNT_COLORS, HUNT_SHAPES, huntLine, isLine, UI, wordLine, type Age, type ShapeId } from '../data';
import { pick, praise, shuffle, type Result } from '../kit';
import { say } from '../voice';

const ROUND_MS = 30000;

interface Piece {
  id: number;
  shape: ShapeId;
  color: string;
  x: number;
  y: number;
  r: number;
  rot: number;
  match: boolean;
}

function makeRound(age: Age): { color: string; shape: ShapeId; pieces: Piece[] } {
  const color = pick(HUNT_COLORS);
  const shape = pick(HUNT_SHAPES);
  const matches = age === 'star' ? 2 + Math.floor(Math.random() * 2) : age === 'mini' ? 2 : 1;
  const cols = 5, rows = 3, total = cols * rows;
  const cells = shuffle(Array.from({ length: total }, (_, i) => i));
  const pieces: Piece[] = [];
  const isMatch = (s: ShapeId, c: string) => (age === 'mini' ? s === shape : s === shape && c === color);
  for (let k = 0; k < total; k++) {
    let s: ShapeId, c: string;
    if (k < matches) {
      s = shape;
      c = age === 'mini' ? pick(HUNT_COLORS) : color;
    } else {
      // Çeldiriciler: aynı renk başka şekil, aynı şekil başka renk ya da tamamen farklı
      do {
        const mode = Math.random();
        s = mode < 0.35 ? shape : pick(HUNT_SHAPES);
        c = mode >= 0.35 && mode < 0.7 ? color : pick(HUNT_COLORS);
      } while (isMatch(s, c));
    }
    const cell = cells[k];
    const cx = ((cell % cols) + 0.5) * (1000 / cols) + (Math.random() - 0.5) * 60;
    const cy = (Math.floor(cell / cols) + 0.5) * (600 / rows) + (Math.random() - 0.5) * 40;
    pieces.push({ id: k, shape: s, color: c, x: cx, y: cy, r: 54 + Math.random() * 14, rot: (Math.random() - 0.5) * 40, match: k < matches });
  }
  return { color, shape, pieces };
}

export function TreasureHunt({ age, rounds = 3, onDone, onStep }: { age: Age; rounds?: number; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void }) {
  const [i, setI] = useState(0);
  const round = useMemo(() => makeRound(age), [age, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const [found, setFound] = useState<number[]>([]);
  const [wobble, setWobble] = useState<number | null>(null);
  const [left, setLeft] = useState(ROUND_MS);
  const seenIds = useRef(new Set<string>());
  const busy = useRef(false);
  const need = round.pieces.filter((p) => p.match).length;
  const line = huntLine(age, round.color, round.shape);

  const next = () => {
    if (i + 1 < rounds) setI(i + 1);
    else onDone({ seen: [...seenIds.current], got: [] });
  };

  useEffect(() => {
    onStep?.(i, rounds);
    setFound([]);
    busy.current = false;
    setLeft(ROUND_MS);
    seenIds.current.add(`shapes.${round.shape}`);
    if (age !== 'mini') seenIds.current.add(`colors.${round.color}`);
    say(line);
    const start = Date.now();
    const t = window.setInterval(() => {
      const l = Math.max(0, ROUND_MS - (Date.now() - start));
      setLeft(l);
      if (l === 0 && !busy.current) {
        window.clearInterval(t);
        busy.current = true;
        say(UI.timesUp, next);
      }
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const tap = (p: Piece) => {
    if (busy.current || found.includes(p.id)) return;
    if (p.match) {
      const all = [...found, p.id];
      setFound(all);
      if (all.length >= (age === 'star' ? need : 1)) {
        busy.current = true;
        sfx.success();
        say([all.length > 1 ? UI.foundAll : praise()], next);
      } else {
        sfx.pop();
      }
    } else {
      sfx.soft();
      setWobble(p.id);
      window.setTimeout(() => setWobble(null), 600);
      say([...(age === 'mini' ? [] : [wordLine(getWord(`colors.${p.color}`)!)]), isLine(getWord(`shapes.${p.shape}`)!)]);
    }
  };

  return (
    <div className="en-hunt">
      <button className="en-ask" onClick={() => say(line)}>{age === 'mini' ? <svg viewBox="0 0 200 200" width="44" height="44" aria-label="Tekrar dinle"><path d={shapePath(round.shape)} fill="#fff" stroke="#3a2b27" strokeWidth="10" /></svg> : line}</button>
      <div className="en-timer" aria-hidden="true"><i style={{ width: `${(left / ROUND_MS) * 100}%` }} /></div>
      <svg className="en-hunt__field" viewBox="0 0 1000 600">
        {round.pieces.map((p) => (
          <g key={`${i}-${p.id}`} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
            <g className={`en-piece ${found.includes(p.id) ? 'is-found' : ''} ${wobble === p.id ? 'is-wobble' : ''}`} onClick={() => tap(p)}>
              <path d={shapePath(p.shape, 0, 0, p.r)} fill={COLORS[p.color]} stroke="#3a2b27" strokeWidth="7" strokeLinejoin="round" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
