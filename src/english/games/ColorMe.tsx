/**
 * Color Me (görev temelli): Çizio "Color the roof... Red!" der; çocuk boya kalemini seçer ve parçaya dokunur.
 * Kalemlere dokununca rengin adı okunur. Yanlış renk ya da parça olursa doğrusu tekrar edilir.
 */
import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../lib/sfx';
import { lessonCut } from '../Art';
import { COLORS, getWord, isLine, PAINT_COLORS, PAINT_PAGES, paintAsk, paintDone, paintIs, showText, UI, wordLine, askLine, type Age, type PaintPage } from '../data';
import { pick, praise, shuffle, type Result } from '../kit';
import { say } from '../voice';

const colorWord = (c: string) => getWord(`colors.${c}`)!;

export function ColorMe({ age, page: fixed, onDone, onStep }: { age: Age; page?: PaintPage; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void }) {
  // Sayfa ve renk planı oyun başında bir kez seçilir (söylenen renk ile ekrandaki hep aynı kalsın).
  const [page] = useState(() => fixed ?? pick(PAINT_PAGES));
  const { shapes, box } = useMemo(() => lessonCut(page.lesson), [page]);
  const [plan] = useState(() => {
    const targets = age === 'mini' ? page.targets.slice(0, 3) : page.targets;
    const colors = shuffle(PAINT_COLORS);
    return targets.map((t, i) => ({ t, color: colors[i % colors.length] }));
  });
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [painted, setPainted] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [wobble, setWobble] = useState<number | null>(null);
  const missed = useRef(new Set<string>());
  const cur = plan[i];

  const targetOf = (part?: string) => plan.findIndex((p) => p.t.parts.includes(part ?? ''));
  const instruct = () => cur && say([paintAsk(cur.t), wordLine(colorWord(cur.color))]);

  useEffect(() => {
    if (finished || !cur) return;
    onStep?.(i, plan.length);
    setSel(null);
    instruct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const choose = (c: string) => {
    sfx.select();
    setSel(c);
    say(wordLine(colorWord(c)));
  };

  const tapShape = (k: number, part?: string) => {
    if (finished) return;
    const ti = targetOf(part);
    if (ti === i) {
      if (!sel) return say(UI.pickColor);
      if (sel !== cur.color) {
        missed.current.add(cur.color);
        setWobble(k);
        window.setTimeout(() => setWobble(null), 600);
        return say([isLine(colorWord(sel)), askLine(colorWord(cur.color))]);
      }
      sfx.wear();
      setPainted((p) => ({ ...p, [cur.t.en]: cur.color }));
      if (i + 1 < plan.length) {
        say(praise(), () => setI(i + 1));
      } else {
        setFinished(true);
        say([praise(), paintDone(page)], () =>
          onDone({ seen: plan.map((p) => `colors.${p.color}`), got: plan.filter((p) => !missed.current.has(p.color)).map((p) => `colors.${p.color}`) }),
        );
      }
      return;
    }
    if (ti >= 0 && !painted[plan[ti].t.en]) {
      setWobble(k);
      window.setTimeout(() => setWobble(null), 600);
      return say([paintIs(plan[ti].t), paintAsk(cur.t), wordLine(colorWord(cur.color))]);
    }
    instruct();
  };

  const fillOf = (part: string | undefined, original: string) => {
    const ti = targetOf(part);
    if (ti < 0) return original;
    const done = painted[plan[ti].t.en];
    return done ? COLORS[done] : '#fff';
  };

  return (
    <div className="en-color">
      {cur && !finished && (
        <button className="en-ask" onClick={instruct}>
          {showText(age) ? <span>Color the {cur.t.en} <b style={{ color: cur.color === 'yellow' ? '#e8a200' : COLORS[cur.color] }}>{cur.color}</b>!</span> : (
            <span className="en-ask__swatch" style={{ background: COLORS[cur.color] }} aria-label="Tekrar dinle" />
          )}
        </button>
      )}
      <svg className={`en-color__pic ${finished ? 'is-done' : ''}`} viewBox={box}>
        {shapes.map((s, k) => (
          <path key={k} d={s.d} fill={s.fill ? fillOf(s.part, s.fill) : 'none'} stroke="#3a2b27" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
            className={`${s.fill ? 'en-tap' : ''} ${wobble === k ? 'is-wobble' : ''} ${cur && !finished && targetOf(s.part) === i ? 'is-target' : ''}`}
            onClick={s.fill ? () => tapShape(k, s.part) : undefined} />
        ))}
      </svg>
      <div className="en-crayons" role="radiogroup" aria-label="Renkler">
        {PAINT_COLORS.map((c) => (
          <button key={c} role="radio" aria-checked={sel === c} aria-label={c} className={`en-crayon ${sel === c ? 'on' : ''}`} style={{ ['--c' as string]: COLORS[c] }} onClick={() => choose(c)}>
            <svg viewBox="0 0 40 90" aria-hidden="true">
              <path d="M8,30 L20,4 L32,30 Z" fill="var(--c)" stroke="#3a2b27" strokeWidth="3" strokeLinejoin="round" />
              <rect x="8" y="30" width="24" height="54" rx="5" fill="var(--c)" stroke="#3a2b27" strokeWidth="3" />
              <path d="M8,44 H32 M8,70 H32" stroke="#3a2b27" strokeWidth="3" opacity="0.4" />
            </svg>
            {showText(age) && <span>{c}</span>}
            {sel === c && <Check className="en-crayon__on" size={18} strokeWidth={3.4} />}
          </button>
        ))}
      </div>
    </div>
  );
}
