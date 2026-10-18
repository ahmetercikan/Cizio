/**
 * Müzik Odası: çalgılar ve "dinle, sonra sen çal" oyunu.
 *
 * Serbest çalma kısmında yanlış nota yoktur: çocuk hangi tuşa dokunursa o ses çıkar. Ezgi oyununda
 * Çizio kısa bir ezgi çalar, çocuk aynısını tekrarlar; yanlışta ceza yok, ezgi yeniden dinletilir.
 * Bütün sesler uygulamanın içinde üretilir, ses dosyası gerekmez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Ear, Music, Play, RotateCcw } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { Stars } from '../components/ui';
import { DRUMS, INSTRUMENTS, play, SCALE, SONGLETS, tune, type InstrumentId } from '../lib/instruments';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { useApp, useProfileData } from '../store/useApp';

type Mod = 'serbest' | 'ezgi';

export default function MusicRoom() {
  const [inst, setInst] = useState<InstrumentId>('piyano');
  const [mod, setMod] = useState<Mod>('serbest');
  const cur = INSTRUMENTS.find((i) => i.id === inst)!;
  const tuslar = inst === 'davul' ? DRUMS : SCALE;

  useEffect(() => {
    speak('Müzik Odası’na hoş geldin! Hangi çalgıyı çalalım?');
  }, []);

  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">Çal, dinle, ezgiyi tekrarla</p>
          <h1 className="title-xl">Müzik Odası</h1>
        </div>
        <Mascot size={74} mood="cheer" className="float" />
      </header>

      <div className="music-insts rise">
        {INSTRUMENTS.map((i) => (
          <button key={i.id} className={`music-inst ${inst === i.id ? 'on' : ''}`} style={{ ['--ic' as string]: i.color }}
            onClick={() => { sfx.pop(); setInst(i.id); speak(i.hint); }}>
            <Music size={22} strokeWidth={2.6} />
            <b>{i.name}</b>
          </button>
        ))}
      </div>

      <div className="music-modes rise">
        <button className={mod === 'serbest' ? 'on' : ''} onClick={() => { sfx.tab(); setMod('serbest'); }}>Serbest çal</button>
        <button className={mod === 'ezgi' ? 'on' : ''} onClick={() => { sfx.tab(); setMod('ezgi'); }}>Ezgiyi tekrarla</button>
      </div>

      {mod === 'serbest'
        ? <Serbest inst={inst} tuslar={tuslar} color={cur.color} />
        : <Ezgi inst={inst} tuslar={tuslar} color={cur.color} />}
    </AppShell>
  );
}

/** Serbest çalma: tuşlar ve hazır küçük ezgiler. */
function Serbest({ inst, tuslar, color }: { inst: InstrumentId; tuslar: string[]; color: string }) {
  const [vuran, setVuran] = useState(-1);
  const calan = useRef(0);

  const bas = (i: number) => {
    play(inst, i);
    setVuran(i);
    window.setTimeout(() => setVuran((v) => (v === i ? -1 : v)), 180);
  };

  const ezgiCal = (notes: number[]) => {
    const id = ++calan.current;
    notes.forEach((n, k) => {
      window.setTimeout(() => {
        if (calan.current !== id) return;
        play(inst, n);
        setVuran(n);
        window.setTimeout(() => setVuran((v) => (v === n ? -1 : v)), 240);
      }, k * 420);
    });
  };

  return (
    <>
      <Klavye tuslar={tuslar} color={color} vuran={vuran} onPress={bas} />
      {inst !== 'davul' && (
        <section className="music-songs rise">
          <h2 className="title-md">Bunları dene</h2>
          <div className="music-songs__row">
            {SONGLETS.map((s) => (
              <button key={s.name} className="btn-outline btn-outline--sm" onClick={() => { sfx.tap(); ezgiCal(s.notes); }}>
                <Play size={16} /> {s.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Ezgiyi tekrarla: Çizio çalar, çocuk aynısını çalar. Her turda bir nota uzar. */
function Ezgi({ inst, tuslar, color }: { inst: InstrumentId; tuslar: string[]; color: string }) {
  const record = useApp((s) => s.recordTrace);
  const data = useProfileData();
  const n = tuslar.length;
  const [uzunluk, setUzunluk] = useState(3);
  const [dizi, setDizi] = useState<number[]>(() => tune(3, n));
  const [sira, setSira] = useState(0);
  const [calan, setCalan] = useState(false);
  const [vuran, setVuran] = useState(-1);
  const [durum, setDurum] = useState<'dinle' | 'sen' | 'dogru' | 'yanlis'>('dinle');
  const zaman = useRef<number[]>([]);

  const temizle = () => {
    for (const t of zaman.current) window.clearTimeout(t);
    zaman.current = [];
  };
  useEffect(() => temizle, []);

  const dinlet = useCallback((d: number[]) => {
    temizle();
    setCalan(true);
    setDurum('dinle');
    setSira(0);
    d.forEach((x, k) => {
      zaman.current.push(window.setTimeout(() => {
        play(inst, x);
        setVuran(x);
        zaman.current.push(window.setTimeout(() => setVuran((v) => (v === x ? -1 : v)), 260));
      }, 500 + k * 480));
    });
    zaman.current.push(window.setTimeout(() => {
      setCalan(false);
      setDurum('sen');
    }, 500 + d.length * 480 + 200));
  }, [inst]);

  useEffect(() => {
    dinlet(dizi);
  }, [dizi, dinlet]);

  const bas = (i: number) => {
    if (calan || durum === 'dogru') return;
    play(inst, i);
    setVuran(i);
    window.setTimeout(() => setVuran((v) => (v === i ? -1 : v)), 180);
    if (i !== dizi[sira]) {
      setDurum('yanlis');
      sfx.soft();
      speak('Olsun, bir daha dinleyelim.');
      window.setTimeout(() => dinlet(dizi), 1200);
      return;
    }
    const next = sira + 1;
    setSira(next);
    if (next < dizi.length) return;
    setDurum('dogru');
    sfx.success();
    const yeni = Math.min(8, uzunluk + 1);
    // her yeni uzunluk bir yıldız kazandırır (aynı uzunluk tekrar yıldız vermez)
    const kazanc = record(`ezgi-${uzunluk}`, Math.min(3, uzunluk - 2) as 1 | 2 | 3);
    speak(uzunluk >= 7 ? 'Bütün ezgiyi doğru çaldın! Sen küçük bir müzisyensin!' : 'Harika! Kulağın çok iyi!');
    if (kazanc) sfx.star(3);
    window.setTimeout(() => {
      setUzunluk(yeni);
      setDizi(tune(yeni, n));
    }, 1800);
  };

  const enIyi = Math.max(0, ...Object.keys(data.trace ?? {}).filter((k) => k.startsWith('ezgi-')).map((k) => Number(k.slice(5))));

  return (
    <>
      <p className={`music-state rise ${durum}`}>
        {durum === 'dinle' ? <><Ear size={19} /> Şimdi dinle…</>
          : durum === 'sen' ? <><Music size={19} /> Sıra sende! {sira}/{dizi.length}</>
            : durum === 'dogru' ? 'Harika! Kulağın çok iyi!'
              : 'Olsun, bir daha dinleyelim.'}
      </p>
      <Klavye tuslar={tuslar} color={color} vuran={vuran} onPress={bas} pasif={calan} />
      <div className="music-bar">
        <button className="btn-outline btn-outline--sm" onClick={() => dinlet(dizi)} disabled={calan}><RotateCcw size={16} /> Tekrar dinle</button>
        <span className="music-best">En uzun ezgin: <b>{enIyi || uzunluk}</b> nota <Stars value={Math.min(3, Math.max(0, enIyi - 2)) as 0 | 1 | 2 | 3} size={14} dim="rgba(29,23,64,0.12)" /></span>
      </div>
    </>
  );
}

/** Çalgının tuşları (piyano/ksilofon/gitar/flüt: nota adları; davul: vuruş adları). */
function Klavye({ tuslar, color, vuran, onPress, pasif }: {
  tuslar: string[]; color: string; vuran: number; onPress: (i: number) => void; pasif?: boolean;
}) {
  return (
    <div className={`music-keys rise ${pasif ? 'pasif' : ''}`} style={{ ['--ic' as string]: color }}>
      {tuslar.map((t, i) => (
        <button key={`${t}-${i}`} className={`music-key ${vuran === i ? 'hit' : ''}`}
          style={{ ['--k' as string]: `${(i / Math.max(1, tuslar.length - 1)) * 100}%` }}
          disabled={pasif} onClick={() => onPress(i)}>
          <span>{t}</span>
        </button>
      ))}
    </div>
  );
}
