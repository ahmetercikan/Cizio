/**
 * Harfler ve Sayılar: Türk alfabesinin 29 harfi (büyük ve küçük) ve 0-9 rakamları parmakla yazılır.
 *
 * Çizim motorunun aynısını kullanır: harf kalem hareketi kalem hareketi gösterilir, çocuk üstünden geçer,
 * isabet puanlanır (src/trace/TraceBoard.tsx). Her harf en iyi yıldızıyla saklanır ve yıldızlar günün
 * toplamına eklenir — yani harf yazmak da ders yapmak gibi ilerleme sayılır.
 */
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { BackButton, Stars } from '../components/ui';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { useApp, useProfileData } from '../store/useApp';
import { TraceBoard } from '../trace/TraceBoard';
import { harfCifti, kucukHarf, SAYILAR, sayi, TR_HARFLER, type Glyph } from '../trace/glyphs';
import { HARF_SES, harfCumlesi, SAYI_SES, sayiCumlesi } from '../trace/lines';

type Mod = { kind: 'harf'; ch: string } | { kind: 'sayi'; n: string } | null;

export default function Letters() {
  const data = useProfileData();
  const [sec, setSec] = useState<Mod>(null);
  const trace = data.trace ?? {};

  if (sec) return <Tahta mod={sec} onBack={() => setSec(null)} />;

  const harfYildiz = (ch: string) => (trace[ch] ?? 0) + (trace[`k-${ch}`] ?? 0);
  const bitenHarf = TR_HARFLER.filter((c) => harfYildiz(c) >= 2).length;
  const bitenSayi = SAYILAR.filter((n) => (trace[`s-${n}`] ?? 0) > 0).length;

  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">Parmağınla harfleri ve sayıları yaz</p>
          <h1 className="title-xl">Harfler ve Sayılar</h1>
        </div>
        <Mascot size={74} mood="cheer" />
      </header>

      <section className="letters rise">
        <h2 className="title-md letters__head">Alfabe <small>{bitenHarf}/{TR_HARFLER.length}</small></h2>
        <div className="letters__grid">
          {TR_HARFLER.map((ch, i) => {
            const y = harfYildiz(ch);
            return (
              <button key={ch} className={`letter-card ${y >= 2 ? 'done' : ''} rise`} style={{ animationDelay: `${i * 0.015}s` }}
                onClick={() => { sfx.pop(); setSec({ kind: 'harf', ch }); }}>
                <b>{ch}<span>{kucukHarf(ch)}</span></b>
                <Stars value={Math.min(3, Math.round(y / 2)) as 0 | 1 | 2 | 3} size={11} dim="rgba(29,23,64,0.12)" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="letters rise">
        <h2 className="title-md letters__head">Sayılar <small>{bitenSayi}/10</small></h2>
        <div className="letters__grid letters__grid--num">
          {SAYILAR.map((n, i) => (
            <button key={n} className={`letter-card letter-card--num ${trace[`s-${n}`] ? 'done' : ''} rise`} style={{ animationDelay: `${i * 0.02}s` }}
              onClick={() => { sfx.pop(); setSec({ kind: 'sayi', n }); }}>
              <b>{n}</b>
              <Stars value={(trace[`s-${n}`] ?? 0) as 0 | 1 | 2 | 3} size={11} dim="rgba(29,23,64,0.12)" />
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

/** Tek bir harf ya da rakamın yazma ekranı. */
function Tahta({ mod, onBack }: { mod: NonNullable<Mod>; onBack: () => void }) {
  const record = useApp((s) => s.recordTrace);
  const data = useProfileData();
  const [i, setI] = useState(0);
  const [kazanilan, setKazanilan] = useState<number | null>(null);

  const glyphs: Glyph[] = useMemo(
    () => (mod.kind === 'harf' ? harfCifti(mod.ch) : [sayi(mod.n)]),
    [mod],
  );
  const glyph = glyphs[Math.min(i, glyphs.length - 1)];
  const ses = mod.kind === 'harf' ? HARF_SES[mod.ch] : SAYI_SES[mod.n];
  const cumle = mod.kind === 'harf' ? harfCumlesi(mod.ch) : sayiCumlesi(mod.n);

  const soyle = () => speak(cumle);
  useEffect(() => {
    speak(cumle);
  }, [cumle]);

  const bitti = (stars: 0 | 1 | 2 | 3) => {
    const k = record(glyph.id, stars);
    setKazanilan(k);
    window.setTimeout(() => {
      setKazanilan(null);
      if (i + 1 < glyphs.length) setI(i + 1);
      else onBack();
    }, 1500);
  };

  const etiket = mod.kind === 'harf'
    ? (glyph.kind === 'buyuk' ? `Büyük ${mod.ch}` : `Küçük ${kucukHarf(mod.ch)}`)
    : `Sayı ${mod.n}`;

  return (
    <AppShell flow={0}>
      <header className="page-head rise">
        <div className="row-gap">
          <BackButton onBack={onBack} />
          <div>
            <p className="sub">{etiket} · "{ses}" diye okunur</p>
            <h1 className="title-xl">{glyph.ch}</h1>
          </div>
        </div>
        <button className="btn-outline btn-outline--sm" onClick={soyle} aria-label="Sesi dinle"><Volume2 size={18} /> Dinle</button>
      </header>

      <TraceBoard glyph={glyph} onFinish={bitti} onSay={() => sfx.pop()} />

      {glyphs.length > 1 && (
        <div className="trace__nav">
          <button className="btn-outline btn-outline--sm" disabled={i === 0} onClick={() => { sfx.tab(); setI(i - 1); }}><ChevronLeft size={18} /> Büyük</button>
          <span className="trace__nav-label">{i + 1} / {glyphs.length}</span>
          <button className="btn-outline btn-outline--sm" disabled={i >= glyphs.length - 1} onClick={() => { sfx.tab(); setI(i + 1); }}>Küçük <ChevronRight size={18} /></button>
        </div>
      )}

      {kazanilan !== null && (
        <p className="trace__won rise">{kazanilan > 0 ? `+${kazanilan} yıldız!` : 'Yine yazdın, aferin!'}</p>
      )}

      <p className="trace__best muted">Bu harfteki en iyin: <Stars value={(data.trace?.[glyph.id] ?? 0) as 0 | 1 | 2 | 3} size={14} dim="rgba(29,23,64,0.12)" /></p>
    </AppShell>
  );
}
