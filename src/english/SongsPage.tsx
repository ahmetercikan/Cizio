/**
 * Şarkılar: geleneksel İngilizce çocuk şarkıları, sözleri hece hece ışıldayarak.
 *
 * Çocuk şarkıyı dinler ve birlikte söyler; o anki hece büyüyüp renklenir, böylece okuma yazmayı
 * bilmeyen çocuk bile nerede olduğunu görür. Her şarkının bir de hareket önerisi vardır (zıpla,
 * alkışla, kolunu çevir) — İngilizce bedenle öğrenilir.
 */
import { useEffect, useRef, useState } from 'react';
import { Music, Play, Square, Volume2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { BackButton } from '../components/ui';
import { sfx } from '../lib/sfx';
import { useApp } from '../store/useApp';
import { playSong, type Playing } from './songPlay';
import { lineText, SONG_UI, SONGS, type Song } from './songs';
import { songFree } from '../account/limits';
import { useUnlocked } from '../account/membership';
import { LockBadge, LockedModal } from '../account/Locked';
import { say } from './voice';

export default function EnglishSongs() {
  const [sec, setSec] = useState<Song | null>(null);
  const [lock, setLock] = useState(false);
  const unlocked = useUnlocked();

  useEffect(() => {
    if (!sec) say(SONG_UI.pick);
  }, [sec]);

  if (sec) return <Oynat s={sec} onBack={() => setSec(null)} />;

  return (
    <AppShell>
      <header className="page-head rise">
        <div>
          <p className="sub">Listen, sing and move!</p>
          <h1 className="title-xl">{SONG_UI.title}</h1>
        </div>
        <Mascot size={74} mood="cheer" className="float" />
      </header>

      <div className="song-grid">
        {SONGS.map((s, i) => (
          <button key={s.id} className="song-card rise" style={{ animationDelay: `${i * 0.03}s`, ['--sc' as string]: s.color }}
            onClick={() => { sfx.pop(); if (unlocked || songFree(i)) setSec(s); else setLock(true); }}>
            <span className="song-card__note" aria-hidden="true"><Music size={26} strokeWidth={2.6} /></span>
            <span className="song-card__text">
              <b>{s.title}</b>
              <small>{s.titleTr}</small>
            </span>
            {unlocked || songFree(i) ? <span className="song-card__play" aria-hidden="true"><Play size={20} strokeWidth={3} /></span> : <LockBadge />}
          </button>
        ))}
      </div>
      {lock && <LockedModal kind="song" onClose={() => setLock(false)} />}
    </AppShell>
  );
}

function Oynat({ s, onBack }: { s: Song; onBack: () => void }) {
  const record = useApp((x) => x.recordEnglish);
  const [pos, setPos] = useState<{ li: number; si: number } | null>(null);
  const [calan, setCalan] = useState(false);
  const [bitti, setBitti] = useState(false);
  const ref = useRef<Playing | null>(null);

  useEffect(() => () => ref.current?.stop(), []);
  useEffect(() => {
    say(s.move);
  }, [s]);

  const basla = () => {
    ref.current?.stop();
    setPos(null);
    setBitti(false);
    setCalan(true);
    ref.current = playSong(s, (li, si) => setPos({ li, si }), () => {
      setCalan(false);
      setPos(null);
      setBitti(true);
      sfx.success();
      say(SONG_UI.done);
      record({ game: true });
    });
  };
  const dur = () => {
    ref.current?.stop();
    ref.current = null;
    setCalan(false);
    setPos(null);
  };

  return (
    <AppShell>
      <header className="page-head rise">
        <div className="row-gap">
          <BackButton onBack={() => { dur(); onBack(); }} />
          <div>
            <p className="sub">{s.titleTr} · {s.about}</p>
            <h1 className="title-lg">{s.title}</h1>
          </div>
        </div>
        <button className="round-btn round-btn--light" aria-label="Dinle" onClick={() => say(s.move)}><Volume2 size={24} /></button>
      </header>

      <p className="song-move rise"><Mascot size={44} mood={calan ? 'cheer' : 'happy'} className={calan ? 'float' : ''} /> {s.move}</p>

      <div className="song-words rise" style={{ ['--sc' as string]: s.color }}>
        {s.lines.map((l, li) => (
          <p key={li} className={`song-line ${pos?.li === li ? 'on' : ''}`}>
            {l.words.map((w, wi) => (
              <span key={wi} className={`song-word ${pos?.li === li && l.syls[pos.si]?.w === wi ? 'sing' : ''}`}>{w}</span>
            ))}
          </p>
        ))}
      </div>

      <div className="song-bar">
        {calan ? (
          <button className="pill pill--big pill--ghost" onClick={dur}><Square size={22} /> {SONG_UI.stop}</button>
        ) : (
          <button className="pill pill--big" onClick={() => { sfx.pop(); basla(); }}><Play size={24} strokeWidth={3} /> {bitti ? SONG_UI.again : SONG_UI.play}</button>
        )}
      </div>

      {bitti && <p className="song-done rise">{SONG_UI.done}</p>}
      <p className="muted song-hint">{lineText(s.lines[0])}…</p>
    </AppShell>
  );
}
