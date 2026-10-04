/**
 * Home Hunt: ekrandan kalkıp evde gerçek bir şey bulma görevi ("Find something blue in your room!").
 * Pasif ekran süresini kırar; 30 saniyelik kum saati, ölçme yok.
 */
import { Check, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sfx } from '../../lib/sfx';
import { WordArt } from '../Art';
import { HOME_HUNTS, showText, UI, type Age } from '../data';
import { pick, type Result } from '../kit';
import { say } from '../voice';

const MS = 30000;

export function HomeHunt({ age, initial, onDone }: { age: Age; initial?: number; onDone: (r: Result) => void }) {
  const [idx, setIdx] = useState(() => initial ?? HOME_HUNTS.indexOf(pick(HOME_HUNTS)));
  const [left, setLeft] = useState(MS);
  const [done, setDone] = useState(false);
  const h = HOME_HUNTS[idx];

  useEffect(() => {
    setLeft(MS);
    say(h.en);
    const start = Date.now();
    let asked = false;
    const t = window.setInterval(() => {
      const l = Math.max(0, MS - (Date.now() - start));
      setLeft(l);
      if (l === 0 && !asked) {
        asked = true;
        window.clearInterval(t);
        say(UI.didYouFind);
      }
    }, 250);
    return () => window.clearInterval(t);
  }, [idx, h.en]);

  const found = () => {
    setDone(true);
    sfx.success();
    say(UI.foundIt, () => onDone({ seen: [], got: [] }));
  };

  return (
    <div className="en-home">
      <button className="en-home__card" onClick={() => say(h.en)} aria-label="Tekrar dinle">
        <WordArt art={h.art} />
        {showText(age) && <b>{h.en}</b>}
      </button>
      <div className="en-timer en-timer--big" aria-hidden="true"><i style={{ width: `${(left / MS) * 100}%` }} /></div>
      <p className="sub en-home__hint">Bul ve Çizio'ya göster!</p>
      <div className="en-home__actions">
        <button className="pill pill--light" disabled={done} onClick={() => setIdx((idx + 1 + Math.floor(Math.random() * (HOME_HUNTS.length - 1))) % HOME_HUNTS.length)}>
          <RefreshCw size={22} /> Başka görev
        </button>
        <button className="pill pill--teal pill--big" disabled={done} onClick={found}><Check size={26} strokeWidth={3} /> Buldum!</button>
      </div>
    </div>
  );
}
