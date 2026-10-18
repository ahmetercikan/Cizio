/**
 * ABC: İngiliz alfabesinin 26 harfi.
 *
 * Her harfte üç şey var: harfin adı ("ay"), çıkardığı ses ("a") ve o sesle başlayan bir kelime
 * ("apple") — resmiyle birlikte. Çocuk harfi dinler, sonra aynı izleme tahtasında (src/trace) önce
 * büyük sonra küçük hâlini parmağıyla yazar.
 */
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { BackButton, Stars } from '../components/ui';
import { sfx } from '../lib/sfx';
import { useApp, useProfileData } from '../store/useApp';
import { TraceBoard } from '../trace/TraceBoard';
import { buyuk, kucuk, type Glyph } from '../trace/glyphs';
import { WordArt } from './Art';
import { ABC, ABC_UI, abcDoneLine, abcLine, abcSoundLine, type AbcLetter } from './abc';
import { say } from './voice';

/** Bir harfin izleme kimliği (Türkçe harflerle karışmasın diye "en-" önekli). */
const key = (ch: string, kucukMu: boolean) => `en-${kucukMu ? 'k-' : ''}${ch}`;

export default function EnglishAbc() {
  const data = useProfileData();
  const [sec, setSec] = useState<AbcLetter | null>(null);
  const trace = data.trace ?? {};

  useEffect(() => {
    if (!sec) say(ABC_UI.pick);
  }, [sec]);

  if (sec) return <Harf a={sec} onBack={() => setSec(null)} />;

  const yildiz = (ch: string) => (trace[key(ch, false)] ?? 0) + (trace[key(ch, true)] ?? 0);
  const biten = ABC.filter((a) => yildiz(a.ch) >= 2).length;

  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">Listen, say it, then write it</p>
          <h1 className="title-xl">{ABC_UI.title}</h1>
        </div>
        <span className="en-agechip">{biten}/26</span>
      </header>

      <div className="abc-grid">
        {ABC.map((a, i) => (
          <button key={a.ch} className={`abc-card ${yildiz(a.ch) >= 2 ? 'done' : ''} rise`} style={{ animationDelay: `${i * 0.02}s` }}
            onClick={() => { sfx.pop(); setSec(a); }}>
            <WordArt art={a.art} className="abc-card__art" />
            <b>{a.ch}<span>{a.ch.toLowerCase()}</span></b>
            <small>{a.word}</small>
            <Stars value={Math.min(3, Math.round(yildiz(a.ch) / 2)) as 0 | 1 | 2 | 3} size={10} dim="rgba(29,23,64,0.12)" />
          </button>
        ))}
      </div>
    </AppShell>
  );
}

function Harf({ a, onBack }: { a: AbcLetter; onBack: () => void }) {
  const record = useApp((s) => s.recordTrace);
  const [i, setI] = useState(0);
  const [kazanilan, setKazanilan] = useState<number | null>(null);
  const glyphs: Glyph[] = useMemo(() => [buyuk(a.ch), kucuk(a.ch)], [a.ch]);
  const glyph = glyphs[i];

  useEffect(() => {
    say(abcLine(a));
  }, [a]);

  const bitti = (stars: 0 | 1 | 2 | 3) => {
    const k = record(key(a.ch, i === 1), stars);
    setKazanilan(k);
    if (i === 0) {
      say(ABC_UI.small);
      window.setTimeout(() => {
        setKazanilan(null);
        setI(1);
      }, 1400);
    } else {
      say(abcDoneLine(a));
      window.setTimeout(() => {
        setKazanilan(null);
        onBack();
      }, 2200);
    }
  };

  return (
    <AppShell>
      <header className="page-head rise">
        <div className="row-gap">
          <BackButton onBack={onBack} />
          <div>
            <p className="sub">{a.ch} says "{a.sound}" · {a.word} ({a.wordTr})</p>
            <h1 className="title-xl">{a.ch} {a.ch.toLowerCase()}</h1>
          </div>
        </div>
        <button className="round-btn round-btn--light" aria-label={ABC_UI.again} onClick={() => say(abcSoundLine(a))}><Volume2 size={24} /></button>
      </header>

      <div className="abc-head rise">
        <WordArt art={a.art} className="abc-head__art" />
        <div>
          <b className="abc-head__word">{a.word}</b>
          <small className="abc-head__tr">{a.wordTr}</small>
        </div>
      </div>

      <TraceBoard glyph={glyph} onFinish={bitti} hint={i === 0 ? 'Big letter' : 'Small letter'} />

      <div className="trace__nav">
        <button className="btn-outline btn-outline--sm" disabled={i === 0} onClick={() => { sfx.tab(); setI(0); }}><ChevronLeft size={18} /> {a.ch}</button>
        <span className="trace__nav-label">{i === 0 ? ABC_UI.big : ABC_UI.small}</span>
      </div>

      {kazanilan !== null && <p className="trace__won rise">{kazanilan > 0 ? `+${kazanilan}` : 'Nice!'}</p>}
    </AppShell>
  );
}
