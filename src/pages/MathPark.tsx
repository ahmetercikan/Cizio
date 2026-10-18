/**
 * Matematik Parkı: say, topla, çıkar ve saati oku.
 *
 * Sorular her seferinde yeniden üretilir; çocuğun yaşına göre zorluk seçilir (English Club'daki yaş
 * seçimiyle aynı mantık ama burada çocuk kendisi "kolay / orta / zor" seçer). Yanlış cevapta ceza yok:
 * doğru olan gösterilir, soru bir daha sorulur. On doğru cevapta tur biter ve yıldız kazanılır.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { GameIcon } from '../world/GameIcon';
import { Mascot } from '../components/Mascot';
import { Stars } from '../components/ui';
import { clockText, MATH_GAMES, MATH_UI, question, type MathGame, type MathQuestion } from '../lib/mathpark';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { useApp, useProfileData } from '../store/useApp';

const TUR = 10;

export default function MathPark() {
  const [oyun, setOyun] = useState<MathGame | null>(null);
  const [zorluk, setZorluk] = useState<1 | 2 | 3>(1);
  const data = useProfileData();

  useEffect(() => {
    if (!oyun) speak(MATH_UI.welcome);
  }, [oyun]);

  if (oyun) return <Tur oyun={oyun} zorluk={zorluk} onBack={() => setOyun(null)} />;

  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">Say, topla, çıkar, saati oku</p>
          <h1 className="title-xl">Matematik Parkı</h1>
        </div>
        <Mascot size={74} mood="happy" className="float" />
      </header>

      <div className="math-level rise">
        {([[1, 'Kolay'], [2, 'Orta'], [3, 'Zor']] as const).map(([v, ad]) => (
          <button key={v} className={zorluk === v ? 'on' : ''} onClick={() => { sfx.tab(); setZorluk(v); }}>{ad}</button>
        ))}
      </div>

      <div className="math-grid">
        {MATH_GAMES.map((g, i) => {
          const best = data.trace?.[`mat-${g.id}`] ?? 0;
          return (
            <button key={g.id} className="math-card rise" style={{ ['--mc' as string]: g.color, animationDelay: `${i * 0.04}s` }}
              onClick={() => { sfx.pop(); setOyun(g.id); }}>
              <span className="math-card__icon"><GameIcon name={g.icon} size={34} /></span>
              <b>{g.name}</b>
              <small>{g.hint}</small>
              <Stars value={best as 0 | 1 | 2 | 3} size={13} dim="rgba(29,23,64,0.12)" />
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}

function Tur({ oyun, zorluk, onBack }: { oyun: MathGame; zorluk: 1 | 2 | 3; onBack: () => void }) {
  const record = useApp((s) => s.recordTrace);
  const def = MATH_GAMES.find((g) => g.id === oyun)!;
  const [q, setQ] = useState<MathQuestion>(() => question(oyun, zorluk));
  const [dogru, setDogru] = useState(0);
  const [secilen, setSecilen] = useState<number | null>(null);
  const [bitti, setBitti] = useState(false);
  const [kazanc, setKazanc] = useState(0);

  const sor = useCallback((x: MathQuestion) => speak(x.clock ? x.say : x.say), []);
  useEffect(() => {
    sor(q);
  }, [q, sor]);

  const sec = (v: number) => {
    if (secilen !== null || bitti) return;
    setSecilen(v);
    if (v !== q.answer) {
      sfx.soft();
      speak(MATH_UI.wrong);
      window.setTimeout(() => setSecilen(null), 1300);
      return;
    }
    sfx.star(dogru % 5);
    speak(q.clock ? `${MATH_UI.right} ${clockText(q.clock[0], q.clock[1])}.` : MATH_UI.right);
    const n = dogru + 1;
    setDogru(n);
    window.setTimeout(() => {
      setSecilen(null);
      if (n >= TUR) {
        setBitti(true);
        sfx.fanfare();
        speak(MATH_UI.done);
        setKazanc(record(`mat-${oyun}`, Math.min(3, zorluk) as 1 | 2 | 3));
      } else setQ(question(oyun, zorluk));
    }, 1100);
  };

  return (
    <AppShell flow={0}>
      <header className="page-head rise">
        <div className="row-gap">
          <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => { sfx.tap(); onBack(); }}><ArrowLeft size={24} /></button>
          <div>
            <p className="sub">{def.hint} · {dogru}/{TUR}</p>
            <h1 className="title-lg">{def.name}</h1>
          </div>
        </div>
        <button className="round-btn round-btn--light" aria-label="Tekrar dinle" onClick={() => sor(q)}><Volume2 size={22} /></button>
      </header>

      {bitti ? (
        <div className="math-done rise">
          <Mascot size={140} mood="cheer" className="float" />
          <h2 className="title-lg">{MATH_UI.done}</h2>
          {kazanc > 0 && <p className="math-won">+{kazanc} yıldız</p>}
          <div className="math-done__row">
            <button className="pill pill--light" onClick={onBack}>Oyunlara dön</button>
            <button className="pill" onClick={() => { setDogru(0); setBitti(false); setQ(question(oyun, zorluk)); }}>Bir daha</button>
          </div>
        </div>
      ) : (
        <>
          <div className="math-bar" aria-hidden="true"><span style={{ width: `${(dogru / TUR) * 100}%`, background: def.color }} /></div>

          <section className="math-stage rise" style={{ ['--mc' as string]: def.color }}>
            {q.clock ? <Saat h={q.clock[0]} m={q.clock[1]} /> : <Sayma counts={q.counts ?? []} game={oyun} />}
            <p className="math-q">{q.text}</p>
          </section>

          <div className="math-options">
            {q.options.map((v) => (
              <button key={v} className={`math-opt ${secilen === v ? (v === q.answer ? 'dogru' : 'yanlis') : ''}`}
                style={{ ['--mc' as string]: def.color }} onClick={() => sec(v)}>
                {v}
                {secilen === v && v === q.answer && <Check size={20} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

/** Sayma / toplama / çıkarma için elma kümeleri. */
function Sayma({ counts, game }: { counts: number[]; game: MathGame }) {
  const renk = ['#ef4b4b', '#5b8def'];
  return (
    <div className="math-items">
      {counts.map((n, g) => (
        <div key={g} className="math-group">
          <div className="math-dots">
            {Array.from({ length: n }, (_, i) => (
              <i key={i} style={{ background: game === 'cikar' && g === 1 ? 'transparent' : renk[g % 2], borderColor: renk[g % 2] }} />
            ))}
          </div>
          {g === 0 && counts.length > 1 && <span className="math-op">{game === 'topla' ? '+' : '−'}</span>}
        </div>
      ))}
    </div>
  );
}

/** Akrep ve yelkovanlı saat. */
function Saat({ h, m }: { h: number; m: number }) {
  const akrep = ((h % 12) + m / 60) * 30 - 90;
  const yelkovan = m * 6 - 90;
  const ticks = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 30 - 90), []);
  return (
    <svg viewBox="0 0 200 200" className="math-clock" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="#fff" stroke="#3a2b27" strokeWidth="6" />
      {ticks.map((a, i) => {
        const r1 = 76, r2 = 84;
        const rad = (a * Math.PI) / 180;
        return <line key={i} x1={100 + Math.cos(rad) * r1} y1={100 + Math.sin(rad) * r1} x2={100 + Math.cos(rad) * r2} y2={100 + Math.sin(rad) * r2} stroke="#8c766e" strokeWidth="5" strokeLinecap="round" />;
      })}
      {ticks.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <text key={`n${i}`} x={100 + Math.cos(rad) * 62} y={100 + Math.sin(rad) * 62 + 8} textAnchor="middle"
            fontSize="23" fontWeight="700" fill="#3a2b27" fontFamily="Fredoka, Nunito, sans-serif">{i === 0 ? 12 : i}</text>
        );
      })}
      <line x1="100" y1="100" x2={100 + Math.cos((akrep * Math.PI) / 180) * 42} y2={100 + Math.sin((akrep * Math.PI) / 180) * 42}
        stroke="#3a2b27" strokeWidth="10" strokeLinecap="round" />
      <line x1="100" y1="100" x2={100 + Math.cos((yelkovan * Math.PI) / 180) * 64} y2={100 + Math.sin((yelkovan * Math.PI) / 180) * 64}
        stroke="#ef4b4b" strokeWidth="7" strokeLinecap="round" />
      <circle cx="100" cy="100" r="8" fill="#3a2b27" />
    </svg>
  );
}
