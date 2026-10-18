/**
 * Say It! — konuşma pratiği.
 *
 * Çizio bir kelimeyi söyler, çocuk mikrofon düğmesine basıp aynısını söyler, sonra kendi sesini
 * geri dinler. Doğru / yanlış yok: amaç çocuğun sesini çıkarması ve duyması. Konuşurken sesinin
 * yüksekliği ekranda dalga olur. Kayıt telefonda kalır, hiçbir yere gönderilmez ve dinlendikten
 * sonra silinir.
 *
 * Mikrofon yoksa ya da izin verilmezse oyun yine oynanır: çocuk sesli tekrar eder, kayıt olmaz.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Mic, Square, Volume2 } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { sfx } from '../../lib/sfx';
import { WordArt } from '../Art';
import { ALL_WORDS, known, seen, show, UI, wordLine, type EnglishData, type Word } from '../data';
import { forget, micSupported, playBack, record, type MicError, type Recorder } from '../mic';
import { merge, noResult, praise, shuffle, type Result } from '../kit';
import { say } from '../voice';

const SAY_UI = { listen: UI.sayListen, your: UI.sayYour, rec: UI.sayRec, hear: UI.sayHear, next: UI.sayNext, noMic: UI.sayNoMic };

type Asama = 'dinle' | 'sira' | 'kayit' | 'dinlet' | 'bitti';

export function SayIt({ e, count = 5, onDone, onStep }: {
  e: EnglishData; count?: number; onDone: (r: Result) => void; onStep?: (i: number, n: number) => void;
}) {
  const [kelimeler] = useState<Word[]>(() => {
    // önce tanıdığı kelimeler (söylemesi kolay olsun), yetmezse bütün kelimelerden
    const bilinen = ALL_WORDS.filter((w) => seen(e, w.id) || known(e, w.id));
    const havuz = bilinen.length >= count ? bilinen : ALL_WORDS;
    return shuffle(havuz).slice(0, count);
  });
  const [i, setI] = useState(0);
  const [asama, setAsama] = useState<Asama>('dinle');
  const [seviye, setSeviye] = useState(0);
  const [hata, setHata] = useState<MicError | null>(null);
  const [ovgu, setOvgu] = useState('');
  const rec = useRef<Recorder | null>(null);
  const ses = useRef<string | null>(null);
  const raf = useRef(0);
  const sonuc = useRef<Result>(noResult);

  const w = kelimeler[i];
  const mikrofonVar = micSupported() && hata !== 'yok';

  const temizle = useCallback(() => {
    cancelAnimationFrame(raf.current);
    rec.current?.cancel();
    rec.current = null;
    if (ses.current) {
      forget(ses.current);
      ses.current = null;
    }
  }, []);
  useEffect(() => temizle, [temizle]);

  // yeni kelime: Çizio söyler
  useEffect(() => {
    if (!w) return;
    onStep?.(i, kelimeler.length);
    setAsama('dinle');
    say(wordLine(w), () => setAsama('sira'));
  }, [i, w]); // eslint-disable-line react-hooks/exhaustive-deps

  const tekrarDinle = () => w && say(wordLine(w));

  const basla = async () => {
    sfx.pop();
    const r = await record();
    if (typeof r === 'string') {
      setHata(r);
      setAsama('sira');
      return;
    }
    rec.current = r;
    setAsama('kayit');
    const tick = () => {
      setSeviye(r.level());
      raf.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const bitir = async () => {
    cancelAnimationFrame(raf.current);
    setSeviye(0);
    const r = rec.current;
    rec.current = null;
    const url = r ? await r.stop() : null;
    sonuc.current = merge(sonuc.current, { seen: [w.id], got: [w.id] });
    if (!url) return ileri();
    ses.current = url;
    setAsama('dinlet');
    say(SAY_UI.hear, async () => {
      await playBack(url);
      sfx.star(i % 5);
      const p = praise();
      setOvgu(p);
      setAsama('bitti');
      say(p);
    });
  };

  const ileri = () => {
    temizle();
    if (i + 1 < kelimeler.length) setI(i + 1);
    else onDone(sonuc.current);
  };

  /** Mikrofonsuz: çocuk sesli söyler, "söyledim" der. */
  const soyledim = () => {
    sonuc.current = merge(sonuc.current, { seen: [w.id], got: [w.id] });
    sfx.star(i % 5);
    say(praise(), ileri);
  };

  if (!w) return null;

  return (
    <div className="say rise">
      <div className="say__art"><WordArt art={w.art} /></div>
      <b className="say__word">{w.en}</b>

      <p className="say__hint">
        {asama === 'dinle' ? show(SAY_UI.listen)
          : asama === 'kayit' ? show(SAY_UI.rec)
            : asama === 'dinlet' ? show(SAY_UI.hear)
              : asama === 'bitti' ? ovgu
                : mikrofonVar ? show(SAY_UI.your) : show(SAY_UI.noMic)}
      </p>

      {hata === 'izin' && <p className="say__warn">Mikrofona izin verilmedi. Yine de sesli söyleyebilirsin!</p>}

      <div className="say__wave" aria-hidden="true">
        {Array.from({ length: 9 }, (_, k) => {
          const h = asama === 'kayit' ? 10 + seviye * 60 * (0.5 + Math.abs(Math.sin((k + 1) * 1.3 + seviye * 9))) : 10;
          return <i key={k} style={{ height: `${h}px` }} />;
        })}
      </div>

      <div className="say__row">
        <button className="round-btn round-btn--light" aria-label={SAY_UI.listen} onClick={tekrarDinle}><Volume2 size={26} /></button>
        {asama === 'kayit' ? (
          <button className="say__mic say__mic--on" onClick={bitir} aria-label="Bitti"><Square size={34} strokeWidth={3} /></button>
        ) : asama === 'bitti' ? (
          <button className="say__mic say__mic--done" onClick={ileri} aria-label={SAY_UI.next}><Check size={38} strokeWidth={3} /></button>
        ) : mikrofonVar ? (
          <button className="say__mic" disabled={asama !== 'sira'} onClick={basla} aria-label={SAY_UI.your}><Mic size={38} strokeWidth={2.6} /></button>
        ) : (
          <button className="say__mic" disabled={asama !== 'sira'} onClick={soyledim} aria-label="Söyledim"><Check size={38} strokeWidth={3} /></button>
        )}
        <Mascot size={58} mood={asama === 'kayit' ? 'happy' : 'cheer'} className={asama === 'kayit' ? '' : 'float'} />
      </div>
    </div>
  );
}
