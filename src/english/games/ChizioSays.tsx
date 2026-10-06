/**
 * Çizio Says (TPR): Çizio bir komut söyler ("Chizio says, jump!"), çocuk bedeniyle yapar; ekranda hareketi
 * canlandırılmış resim gösterilir. Ölçme yok, puan yok — yalnızca hareket ve övgü.
 * 8–9 yaşta bazı turlar hilelidir: "Chizio says" denmeden verilen komutta kıpırdamamak gerekir. Çocuk
 * kıpırdadıysa da sorun değil ("It's a tricky game!").
 */
import { Hand, Snowflake } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../lib/sfx';
import { WordArt } from '../Art';
import { COMMANDS, saysLine, show, showText, UI, type Age, type Command } from '../data';
import { praise, shuffle, type Result } from '../kit';
import { say } from '../voice';

const DO_MS = 4200;

export function ChizioSays({ age, count, onDone, onStep }: { age: Age; count: number; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void }) {
  // Komutlar oyun başında bir kez seçilir (söylenen ve gösterilen hep aynı kalsın).
  const [rounds] = useState(() => {
    const pool = shuffle(COMMANDS.filter((c) => age !== 'mini' || !c.id.match(/^(angry|surprised)$/)));
    // Hileli turlar yalnızca 8–9 yaşta; ilk tur hiçbir zaman hileli değil.
    return pool.slice(0, count).map((c, i) => ({ c, trick: age === 'star' && i > 0 && Math.random() < 0.3 }));
  });
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'listen' | 'do' | 'ask' | 'done'>('listen');
  const timer = useRef<number>();
  const round = rounds[i];

  const next = () => {
    if (i + 1 < rounds.length) setI(i + 1);
    else onDone({ seen: [], got: [] });
  };

  const line = (r: { c: Command; trick: boolean }) => (r.trick ? r.c.en : saysLine(r.c));

  useEffect(() => {
    onStep?.(i, rounds.length);
    setPhase('listen');
    say(line(round), () => {
      setPhase('do');
      timer.current = window.setTimeout(() => {
        if (round.trick) {
          setPhase('ask');
          say(UI.didYouMove);
        } else {
          setPhase('done');
          sfx.star();
          say(praise(), next);
        }
      }, DO_MS);
    });
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const answer = (moved: boolean) => {
    setPhase('done');
    sfx.pop();
    say(moved ? UI.movedOk : UI.stillGreat, next);
  };

  return (
    <div className="en-says">
      <div className={`en-says__art ${phase === 'do' ? 'is-doing' : ''}`}>
        <WordArt art={round.c.art} className={phase === 'listen' ? 'is-still' : ''} />
        {phase === 'do' && <svg className="en-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" style={{ animationDuration: `${DO_MS}ms` }} /></svg>}
      </div>
      {showText(age) && <p className="en-says__text">{show(line(round))}</p>}
      {round.c.real && <p className="en-says__hint">Etrafına bak ve dokun!</p>}
      {phase === 'ask' && (
        <div className="en-says__ask rise">
          <button className="pill pill--light" onClick={() => answer(true)}><Hand size={22} /> Kıpırdadım</button>
          <button className="pill pill--teal" onClick={() => answer(false)}><Snowflake size={22} /> Donup kaldım</button>
        </div>
      )}
    </div>
  );
}
