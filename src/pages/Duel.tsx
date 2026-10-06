/**
 * Düello (aynı cihazda): iki oyuncu aynı resmi sırayla çizer; çizimler hedef resimle karşılaştırılır
 * (konum ve boyuttan bağımsız biçim benzerliği, scoreFreehand) ve % benzerliği yüksek olan kazanır.
 * Modlar: bakarak (örnek görünür) ya da hafızadan (örneğe kısa süre bakılır, sonra saklanır).
 */
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Eye, Home, RotateCcw, Shuffle, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarArt, AVATARS } from '../components/Avatars';
import { ChallengeArt } from '../components/ChallengeArt';
import { Doodles } from '../components/Doodles';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { PencilPalette, ToolCapsule, useToolState } from '../components/DrawTools';
import { SketchImg } from '../components/Sketch';
import { useSize, useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import { scoreFreehand } from '../engine/scoring';
import { lessons } from '../lessons';
import type { Lesson } from '../lessons/types';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { uid } from '../lib/util';
import { useApp, useProfile } from '../store/useApp';

const DRAW_SECONDS = 60;
const LOOK_SECONDS = 6;

type Mode = 'look' | 'memory';
type Phase = 'setup' | 'ready' | 'show' | 'draw' | 'reveal';

interface Player {
  key: string;
  /** Cihazdaki profilin kimliği; misafirse yok. */
  profileId?: string;
  name: string;
  avatar: string;
}

interface Result {
  percent: number;
  stars: number;
  image: string;
  blob: Blob;
}

const randomLesson = (except?: string): Lesson => {
  const pool = lessons.filter((l) => l.level <= 2 && l.id !== except);
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function Duel() {
  const nav = useNavigate();
  const profiles = useApp((s) => s.profiles);
  const settings = useApp((s) => s.settings);
  const recordDuel = useApp((s) => s.recordDuel);
  const me = useProfile()!;

  // Oyuncu adayları: cihazdaki profiller + misafir
  const guestAvatar = AVATARS.find((a) => !profiles.some((p) => p.avatar === a.id))?.id ?? 'mantar';
  const candidates: Player[] = useMemo(
    () => [...profiles.map((p) => ({ key: p.id, profileId: p.id, name: p.name, avatar: p.avatar })), { key: 'guest', name: 'Misafir', avatar: guestAvatar }],
    [profiles, guestAvatar],
  );
  const [pA, setPA] = useState(me.id);
  const [pB, setPB] = useState(() => profiles.find((p) => p.id !== me.id)?.id ?? 'guest');
  const [guestName, setGuestName] = useState('Misafir');
  const [mode, setMode] = useState<Mode>('look');
  const [lesson, setLesson] = useState<Lesson>(() => randomLesson());
  const player = (key: string): Player => {
    const c = candidates.find((x) => x.key === key)!;
    return c.key === 'guest' ? { ...c, name: guestName.trim() || 'Misafir' } : c;
  };
  const [order, setOrder] = useState<Player[]>([]);

  const [phase, setPhase] = useState<Phase>('setup');
  const [turn, setTurn] = useState(0);
  const [left, setLeft] = useState(DRAW_SECONDS);
  const [results, setResults] = useState<Result[]>([]);
  const [toast, showToast] = useToast();
  const doc = useMemo(() => new DrawingDoc(), []);
  const ts = useToolState({ tool: 'pencil', color: '#2f2f36' });
  const finishing = useRef(false);

  const begin = (players: Player[], l = lesson) => {
    setLesson(l);
    setOrder(players);
    setResults([]);
    setTurn(0);
    setPhase('ready');
  };

  const startTurn = () => {
    sfx.pop();
    doc.clear();
    finishing.current = false;
    if (mode === 'memory') {
      setLeft(LOOK_SECONDS);
      setPhase('show');
    } else {
      setLeft(DRAW_SECONDS);
      setPhase('draw');
    }
  };

  // Geri sayım: hafızada bakma süresi, sonra çizim süresi
  useEffect(() => {
    if (phase !== 'show' && phase !== 'draw') return;
    if (left <= 0) {
      if (phase === 'show') {
        setLeft(DRAW_SECONDS);
        setPhase('draw');
      } else void finishTurn(true);
      return;
    }
    const t = setTimeout(() => {
      setLeft((n) => n - 1);
      if (left <= 4) sfx.tap();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  const finishTurn = async (timeUp = false) => {
    if (finishing.current) return;
    const strokes = doc.strokes((s) => s.tool !== 'eraser');
    if (!strokes.length && !timeUp) {
      showToast('Önce bir şeyler çiz!');
      return;
    }
    finishing.current = true;
    const res = scoreFreehand(lesson.steps.flatMap((s) => s.shapes), strokes);
    const blob = await doc.toBlob();
    const r: Result = { percent: strokes.length ? Math.round(res.score * 100) : 0, stars: strokes.length ? res.stars : 0, image: URL.createObjectURL(blob), blob };
    const next = [...results, r];
    setResults(next);
    doc.clear();
    if (turn === 0) {
      setTurn(1);
      setPhase('ready');
      sfx.soft();
    } else {
      setPhase('reveal');
    }
  };

  // Sonuç: profil olan oyuncuların kaydı ve galeri
  const recorded = useRef(false);
  useEffect(() => {
    if (phase !== 'reveal' || results.length < 2 || recorded.current) return;
    recorded.current = true;
    const best = Math.max(results[0].percent, results[1].percent);
    order.forEach((p, i) => {
      if (!p.profileId) return;
      const won = results[i].percent === best && results[0].percent !== results[1].percent;
      recordDuel(p.profileId, results[i].stars, won);
      void saveArtwork({ id: uid(), profileId: p.profileId, lessonId: lesson.id, kind: 'free', stars: results[i].stars, createdAt: Date.now(), blob: results[i].blob });
    });
  }, [phase, results, order, lesson.id, recordDuel]);

  const rematch = () => {
    recorded.current = false;
    // Sırayı değiştir: rövanşta diğer oyuncu başlasın.
    begin([order[1], order[0]], randomLesson(lesson.id));
  };

  const current = order[turn];

  // ---------------------------------------------------------------- kurulum
  if (phase === 'setup') {
    const a = player(pA);
    const b = player(pB);
    const same = pA === pB;
    return (
      <div className="bg duel-setup">
        <Doodles variant={3} />
        <header className="duel-setup__top">
          <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav('/atolye')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        </header>
        <div className="duel-setup__body rise">
          <div className="duel-setup__title">
            <span className="duel-setup__art"><ChallengeArt kind="duel" /></span>
            <div>
              <h1 className="title-xl">Düello</h1>
              <p className="sub">Aynı resmi ikiniz de çizin. Kimin çizimi daha çok benzerse o kazanır!</p>
            </div>
          </div>

          <div className="duel-players">
            {[
              { label: '1. oyuncu', value: pA, set: setPA, p: a },
              { label: '2. oyuncu', value: pB, set: setPB, p: b },
            ].map((slot, i) => (
              <div key={slot.label} className="duel-slot">
                <span className="duel-slot__label">{slot.label}</span>
                <AvatarArt id={slot.p.avatar} size={76} ring />
                <b>{slot.p.name}</b>
                <div className="duel-slot__pick">
                  {candidates.map((c) => (
                    <button key={c.key} type="button" className={`duel-pick ${slot.value === c.key ? 'on' : ''}`} onClick={() => { sfx.tap(); slot.set(c.key); }}>
                      <AvatarArt id={c.avatar} size={30} /> {c.key === 'guest' ? 'Misafir' : c.name}
                    </button>
                  ))}
                </div>
                {slot.value === 'guest' && (
                  <input className="duel-slot__name" value={guestName} maxLength={16} onChange={(e) => setGuestName(e.target.value)} aria-label="Misafirin adı" placeholder="Misafirin adı" />
                )}
                {i === 0 && <span className="duel-vs" aria-hidden="true">VS</span>}
              </div>
            ))}
          </div>
          {same && <p className="duel-warn">İki farklı oyuncu seç.</p>}

          <div className="duel-options">
            <div className="duel-lesson">
              <SketchImg lesson={lesson} paper pad={14} />
              <div>
                <b>{lesson.title}</b>
                <button type="button" className="btn-outline" onClick={() => { sfx.tap(); setLesson(randomLesson(lesson.id)); }}><Shuffle size={18} /> Başka resim</button>
              </div>
            </div>
            <div className="duel-modes" role="radiogroup" aria-label="Mod">
              <button type="button" role="radio" aria-checked={mode === 'look'} className={`duel-mode ${mode === 'look' ? 'on' : ''}`} onClick={() => setMode('look')}>
                <Eye size={22} /> <b>Bakarak</b> <span>Örnek hep görünür, {DRAW_SECONDS} saniye</span>
              </button>
              <button type="button" role="radio" aria-checked={mode === 'memory'} className={`duel-mode ${mode === 'memory' ? 'on' : ''}`} onClick={() => setMode('memory')}>
                <span aria-hidden="true">🧠</span> <b>Hafızadan</b> <span>{LOOK_SECONDS} saniye bak, sonra saklanır</span>
              </button>
            </div>
          </div>

          <button className="pill pill--big" disabled={same} onClick={() => begin([a, b])}>Düelloyu başlat <Users size={22} /></button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- sonuç
  if (phase === 'reveal' && results.length === 2) {
    return (
      <Reveal lesson={lesson} players={order} results={results} actions={
        <>
          <button className="pill" onClick={rematch}><RotateCcw size={20} /> Rövanş</button>
          <button className="pill pill--ghost pill--sm" onClick={() => { recorded.current = false; setPhase('setup'); }}><Users size={18} /> Oyuncuları değiştir</button>
          <button className="pill pill--ghost pill--sm" onClick={() => nav('/atolye')}><Home size={18} /> Ana sayfa</button>
        </>
      } />
    );
  }

  // ---------------------------------------------------------------- sıra perdesi
  if (phase === 'ready' && current) {
    return (
      <div className="bg duel-curtain">
        <Doodles variant={2} />
        <div className="duel-curtain__card rise">
          <span className="duel-curtain__turn">{turn + 1}. tur</span>
          <AvatarArt id={current.avatar} size={120} ring />
          <p className="sub">Sıradaki oyuncu</p>
          <h1 className="title-xl">{current.name}</h1>
          {turn === 1 && <p className="duel-curtain__hint">🙈 {order[0].name} ekrana bakmasın!</p>}
          <p className="duel-curtain__hint">{mode === 'memory' ? `Resme ${LOOK_SECONDS} saniye bakacaksın, sonra hatırladığın gibi çiz.` : `Örneğe bakarak ${DRAW_SECONDS} saniyede çiz.`}</p>
          <button className="pill pill--big" onClick={startTurn}>Hazırım!</button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- bakma / çizim
  return (
    <div className={`player desk ${settings.leftHanded ? 'player--left' : ''} ${phase === 'draw' ? 'player--tools player--palette' : ''}`}>
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Düellodan çık" onClick={() => setPhase('setup')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        <div className="player__title duel-title">
          {current && <AvatarArt id={current.avatar} size={30} />}
          <b>{current?.name}</b>
        </div>
        <span className={`countdown ${left <= 5 ? 'hurry' : ''}`} aria-live="polite">{left}</span>
      </header>

      <DuelStage showExample={phase === 'show'} lesson={lesson} doc={doc} ts={ts} disabled={phase !== 'draw'} palmRejection={settings.palmRejection} />

      {phase === 'draw' && mode === 'look' && (
        <div className="ref-float">
          <SketchImg lesson={lesson} paper pad={20} />
          <span>Örnek</span>
        </div>
      )}

      {phase === 'draw' && (
        <>
          <div className="tools-float">
            <ToolCapsule doc={doc} ts={ts} tools={['pencil', 'crayon', 'marker', 'eraser']} clear={false} />
          </div>
          <div className="palette-float"><PencilPalette ts={ts} /></div>
          <footer className="player__bottom player__bottom--end">
            <button className="pill pill--yellow" onClick={() => void finishTurn()}>Bitti <Check size={22} /></button>
          </footer>
        </>
      )}
      {toast}
    </div>
  );
}

/**
 * Kâğıt ve çizim alanı. Ayrı bileşen: çizim ekranı açıldığında bağlanır, böylece boyutu doğru ölçülür
 * (useSize yalnızca ilk bağlanmada gözlemler; kurulum ekranında bu alan yoktur).
 */
export function DuelStage({ showExample, lesson, doc, ts, disabled, palmRejection }: {
  showExample: boolean;
  lesson: Lesson;
  doc: DrawingDoc;
  ts: ReturnType<typeof useToolState>;
  disabled: boolean;
  palmRejection: boolean;
}) {
  const [wrapRef, box] = useSize<HTMLDivElement>();
  const S = Math.floor(Math.min(box.w, box.h) * 0.94);
  return (
    <div className="player__wrap" ref={wrapRef}>
      {S > 0 && (
        <div className="sheet" style={{ width: S, height: S }}>
          <div className="stage" style={{ width: S * 0.96, height: S * 0.96 }}>
            {showExample ? (
              <SketchImg lesson={lesson} pad={10} className="stage__img" />
            ) : (
              <DrawingCanvas doc={doc} tool={ts.tool} color={ts.color} size={ts.size} disabled={disabled} palmRejection={palmRejection} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Sonuç: yüzdeler sayarak yükselir, sonra kazanan açıklanır
// ------------------------------------------------------------------------------------------------
export function Reveal({ lesson, players, results, actions }: {
  lesson: Lesson;
  players: { key: string; name: string; avatar: string }[];
  results: { percent: number; image: string }[];
  /** Sonuç açıklandıktan sonra gösterilecek düğmeler. */
  actions: React.ReactNode;
}) {
  const [k, setK] = useState(0); // 0..1 sayaç ilerlemesi
  const done = k >= 1;
  const [a, b] = results.map((r) => r.percent);
  const winner = a === b ? -1 : a > b ? 0 : 1;

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setK(1);
    let raf = 0;
    const t0 = performance.now() + 500;
    const tick = (now: number) => {
      const x = Math.max(0, Math.min(1, (now - t0) / 1800));
      setK(x);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!done) return;
    sfx.fanfare();
    if (winner >= 0) void confetti({ particleCount: 140, spread: 80, origin: { x: winner === 0 ? 0.3 : 0.7, y: 0.5 }, disableForReducedMotion: true });
  }, [done, winner]);

  const ease = 1 - (1 - k) ** 3;
  return (
    <div className="bg duel-reveal">
      <Doodles variant={2} />
      <h1 className="title-xl duel-reveal__title rise">
        {!done ? 'Kim daha benzer çizdi?' : winner < 0 ? 'Berabere!' : `${players[winner].name} kazandı!`}
      </h1>
      <div className="duel-reveal__cards">
        {players.map((p, i) => (
          <figure key={p.key} className={`duel-card ${done && winner === i ? 'win' : ''} ${done && winner >= 0 && winner !== i ? 'lose' : ''} rise`} style={{ animationDelay: `${i * 0.1}s` }}>
            {done && winner === i && <span className="duel-card__crown" aria-hidden="true">👑</span>}
            <img src={results[i].image} alt={`${p.name} çizimi`} />
            <figcaption>
              <AvatarArt id={p.avatar} size={40} />
              <b>{p.name}</b>
              <span className="duel-card__pct">%{Math.round(results[i].percent * ease)}</span>
            </figcaption>
            <span className="duel-card__bar"><i style={{ width: `${results[i].percent * ease}%` }} /></span>
          </figure>
        ))}
        <figure className="duel-card duel-card--ref rise" style={{ animationDelay: '0.2s' }}>
          <SketchImg lesson={lesson} paper pad={16} />
          <figcaption><b>Örnek</b></figcaption>
        </figure>
      </div>
      {done && <div className="celebrate__actions rise">{actions}</div>}
    </div>
  );
}
