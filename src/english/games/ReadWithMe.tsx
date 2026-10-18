/**
 * Read With Me — ilk okuma ve cümle kurma oyunu.
 *
 * Resim görünür, Çizio cümleyi okur, kelime kartları karışık dizilir. Çocuk kartlara sırayla dokunarak
 * cümleyi kurar. Yanlış karta dokununca kart hafifçe sallanır ve cümle yeniden okunur — ceza yok.
 * Cümle tamamlanınca Çizio birlikte bir kez daha okur.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { sfx } from '../../lib/sfx';
import { WordArt } from '../Art';
import { show, type Age } from '../data';
import { merge, noResult, praise, shuffle, type Result } from '../kit';
import { READ_UI, SENTENCES, sentenceText, type Sentence } from '../reading';
import { say } from '../voice';

const seviye = (age: Age) => (age === 'mini' ? 1 : age === 'junior' ? 2 : 3);

export function ReadWithMe({ age, count = 4, onDone, onStep }: {
  age: Age; count?: number; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void;
}) {
  const cumleler = useMemo(() => {
    const max = seviye(age);
    const havuz = SENTENCES.filter((s) => s.level <= max);
    return shuffle(havuz.length >= count ? havuz : SENTENCES).slice(0, count);
  }, [age, count]);

  const [i, setI] = useState(0);
  const [kurulan, setKurulan] = useState<number[]>([]);
  const [yanlis, setYanlis] = useState<number | null>(null);
  const [bitti, setBitti] = useState(false);
  const s: Sentence | undefined = cumleler[i];

  // kartlar: kelimelerin karışık sırası (aynı kelime iki kez geçebilir, bu yüzden sıra numarasıyla)
  const kartlar = useMemo(() => (s ? shuffle(s.words.map((w, k) => ({ w, k }))) : []), [s]);

  const oku = useCallback(() => s && say(sentenceText(s)), [s]);

  useEffect(() => {
    if (!s) return;
    onStep?.(i, cumleler.length);
    setKurulan([]);
    setYanlis(null);
    setBitti(false);
    say([sentenceText(s), READ_UI.tap]);
  }, [i, s]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) return null;

  const dokun = (k: number) => {
    if (bitti) return;
    const sira = kurulan.length;
    if (k !== sira) {
      setYanlis(k);
      sfx.soft();
      window.setTimeout(() => setYanlis(null), 450);
      say(READ_UI.wrong);
      return;
    }
    const yeni = [...kurulan, k];
    setKurulan(yeni);
    sfx.note(sira % 6);
    if (yeni.length < s.words.length) return;
    setBitti(true);
    sfx.success();
    say([READ_UI.good, sentenceText(s), praise()], () => {
      if (i + 1 < cumleler.length) setI(i + 1);
      else onDone(cumleler.reduce((a, c) => merge(a, { seen: [c.id], got: [c.id] }), noResult));
    });
  };

  return (
    <div className="read rise">
      <div className="read__art"><WordArt art={s.art} /></div>

      <p className="read__line" aria-live="polite">
        {s.words.map((w, k) => (
          <span key={k} className={`read__slot ${k < kurulan.length ? 'on' : ''}`}>{k < kurulan.length ? w : '—'}</span>
        ))}
        {bitti && <span className="read__dot">.</span>}
      </p>

      <p className="read__hint">{bitti ? show(READ_UI.good) : show(READ_UI.tap)}</p>

      <div className="read__cards">
        {kartlar.map(({ w, k }) => (
          <button key={k} className={`read__card ${kurulan.includes(k) ? 'used' : ''} ${yanlis === k ? 'wrong' : ''}`}
            disabled={kurulan.includes(k)} onClick={() => dokun(k)}>
            {w}
          </button>
        ))}
      </div>

      <div className="read__row">
        <button className="round-btn round-btn--light" aria-label="Tekrar dinle" onClick={oku}><Volume2 size={24} /></button>
        <Mascot size={58} mood={bitti ? 'cheer' : 'happy'} className={bitti ? 'float' : ''} />
      </div>
    </div>
  );
}
