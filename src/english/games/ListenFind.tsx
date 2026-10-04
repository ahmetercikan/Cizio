/**
 * Listen & Find: Çizio bir kelime söyler ("Where is the cat?"), çocuk resmi bulur.
 * Yanlış resme dokunursa "yanlış" denmez: Çizio dokunulanın adını söyler ve soruyu tekrarlar (recasting).
 */
import { Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sfx';
import { WordArt } from '../Art';
import { askLine, isLine, optionCount, showText, topicOf, type Age, type Word } from '../data';
import { praise, shuffle, type Result } from '../kit';
import { say } from '../voice';

export function ListenFind({ targets, pool, age, onDone, onStep }: {
  targets: Word[]; pool: Word[]; age: Age; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void;
}) {
  // Turlar ve seçenekler oyun başında bir kez kurulur: üst bileşen yeniden çizilse (yeni dizi gelse) bile
  // değişmez — yoksa Çizio'nun söylediği kelime ile ekrandaki soru birbirini tutmaz.
  const [rounds] = useState(() =>
    shuffle(targets).map((target) => {
      const n = optionCount(age);
      const same = shuffle(pool.filter((w) => w.id !== target.id && topicOf(w.id).id === topicOf(target.id).id));
      const other = shuffle(pool.filter((w) => w.id !== target.id && topicOf(w.id).id !== topicOf(target.id).id));
      const distractors = [...same, ...other].filter((w, k, a) => a.findIndex((x) => x.id === w.id) === k).slice(0, n - 1);
      return { target, options: shuffle([target, ...distractors]) };
    }),
  );
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const missed = useRef(new Set<string>());
  const target = rounds[i]?.target;
  const options = rounds[i]?.options ?? [];

  useEffect(() => {
    if (!target) return;
    onStep?.(i, rounds.length);
    setSolved(false);
    say(askLine(target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!target) return null;

  const tap = (w: Word) => {
    if (solved) return;
    if (w.id === target.id) {
      setSolved(true);
      sfx.success();
      say([praise(), isLine(target)], () => {
        if (i + 1 < rounds.length) setI(i + 1);
        else onDone({ seen: rounds.map((r) => r.target.id), got: rounds.filter((r) => !missed.current.has(r.target.id)).map((r) => r.target.id) });
      });
    } else {
      missed.current.add(target.id);
      sfx.soft();
      setWrong(w.id);
      window.setTimeout(() => setWrong(null), 600);
      say([isLine(w), askLine(target)]);
    }
  };

  const label = (w: Word) => age === 'star' || (showText(age) && solved && w.id === target.id);
  return (
    <div className="en-find">
      <button className="en-ask" onClick={() => say(askLine(target))}>
        {showText(age) ? askLine(target) : <Volume2 size={34} strokeWidth={2.4} aria-label="Tekrar dinle" />}
      </button>
      <div className={`en-grid en-grid--${options.length}`}>
        {options.map((w) => (
          <button key={w.id} className={`en-card ${solved && w.id === target.id ? 'is-right' : ''} ${solved && w.id !== target.id ? 'is-dim' : ''} ${wrong === w.id ? 'is-wobble' : ''}`}
            onClick={() => tap(w)} aria-label={w.en}>
            <WordArt art={w.art} />
            {label(w) && <span className="en-card__word">{w.en}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
