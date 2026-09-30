/**
 * Ders oynatıcı (Simply Draw tarzı "video" deneyimi).
 *
 * Masa üstünde bir kâğıt; kalem her adımı çizer (izle) → adım sonunda durur → sıra çocukta.
 *  - Kâğıt modu: çocuk kendi kâğıdına çizer, DEVAM der; sonunda canlı kamerayla fotoğraf → karşılaştırma.
 *  - Ekran modu: çocuk aynı kâğıdın üstüne parmak/kalemle çizer; her adım puanlanır; sonunda boyama.
 * Altta yatay zaman çubuğu (ileri/geri sarma, hız), ortada ⟲ ⏸ ⟳ düğmeleri.
 */
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Check, Hand, Heart, Monitor, NotebookPen, Pause, Play, RotateCcw, RotateCw, Settings2, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { withShading } from '../art/shading';
import { buildTimeline, fmtTime, frameAt, type Timeline } from '../art/timeline';
import { CameraCapture } from '../components/CameraCapture';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { PencilPalette, ToolCapsule, useToolState } from '../components/DrawTools';
import { Doodles } from '../components/Doodles';
import { GuideLayer } from '../components/GuideLayer';
import { Mascot } from '../components/Mascot';
import { PencilDefs, PencilSprite } from '../components/Pencil';
import { PhotoStage, usePhoto } from '../components/PhotoStep';
import { LiveSketch, SketchImg } from '../components/Sketch';
import { Confirm, Stars, useSize, useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import { feedbackText, scoreFreehand, scoreStep, type ScoreResult } from '../engine/scoring';
import { getLesson, lessonsByPath, paths } from '../lessons';
import type { Lesson } from '../lessons/types';
import { listArtworks, saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { isSpeaking, preloadLines, speak, stopSpeaking } from '../lib/speech';
import { uid } from '../lib/util';
import { getSticker } from '../stickers';
import { useApp, useProfile, useProfileData, type DrawMode, type LessonProgress, type Scaffold } from '../store/useApp';
import { ChestNote } from '../components/Rewards';

type Phase = 'intro' | 'watch' | 'turn' | 'feedback' | 'color' | 'camera' | 'review' | 'done';

const SCAFFOLDS: { id: Scaffold; label: string; hint: string }[] = [
  { id: 'trace', label: 'İz sür', hint: 'Turuncu çizginin üstünden geçersin' },
  { id: 'dots', label: 'Noktalar', hint: 'Noktaları birleştirerek çizersin' },
  { id: 'free', label: 'Kendin çiz', hint: 'Örneğe bakıp kendin çizersin' },
];

function suggestScaffold(p?: LessonProgress): Scaffold {
  if (!p || p.bestStars < 3) return p?.bestScaffold === 'dots' || p?.bestScaffold === 'free' ? p.bestScaffold : 'trace';
  return p.bestScaffold === 'trace' ? 'dots' : 'free';
}

function nextLesson(l: Lesson): Lesson | undefined {
  const inPath = lessonsByPath(l.path);
  const i = inPath.findIndex((x) => x.id === l.id);
  if (inPath[i + 1]) return inPath[i + 1];
  const pi = paths.findIndex((p) => p.id === l.path);
  for (let k = 1; k < paths.length; k++) {
    const first = lessonsByPath(paths[(pi + k) % paths.length].id)[0];
    if (first) return first;
  }
  return undefined;
}

export default function LessonPage() {
  const { id } = useParams();
  const lesson = id ? getLesson(id) : undefined;
  if (!lesson)
    return (
      <div className="bg onb__center">
        <h1 className="title-lg">Bu ders bulunamadı</h1>
        <Link to="/" className="pill">Ana sayfa</Link>
      </div>
    );
  return <Player key={lesson.id} lesson={lesson} />;
}

function Player({ lesson }: { lesson: Lesson }) {
  const nav = useNavigate();
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const completeLesson = useApp((s) => s.completeLesson);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const profile = useProfile();
  const pdata = useProfileData();
  const progress = pdata.lessons[lesson.id];
  const [mode, setMode] = useState<DrawMode>(settings.defaultMode);
  // Kâğıt modunda çizgilerden sonra kalemle gölgelendirme adımları eklenir; ekranda boyama yapılır.
  const play = useMemo(() => (mode === 'paper' ? withShading(lesson) : lesson), [lesson, mode]);
  const tl = useMemo(() => buildTimeline(play), [play]);
  const last = play.steps.length - 1;
  const [scaffold, setScaffold] = useState<Scaffold>(() => suggestScaffold(progress));
  const [phase, setPhase] = useState<Phase>('intro');
  const [cur, setCur] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gear, setGear] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [stepStars, setStepStars] = useState<number[]>([]);
  const [selfStars, setSelfStars] = useState(0);
  const [compare, setCompare] = useState(true);
  const [final, setFinal] = useState<{ stars: number; image?: string; prev?: string; earned: string[] } | null>(null);
  const [leave, setLeave] = useState(false);
  const [toast, showToast] = useToast();

  const tRef = useRef(0);
  const curRef = useRef(0);
  const startedAt = useRef(Date.now());
  const doc = useMemo(() => new DrawingDoc(), []);
  const ts = useToolState();
  const photo = usePhoto(lesson);
  const [wrapRef, box] = useSize<HTMLDivElement>();
  const speed = settings.speed;

  const say = useCallback(
    (text: string) => settings.narration && speak(text, { rate: settings.rate, voiceURI: settings.voiceURI }),
    [settings.narration, settings.rate, settings.voiceURI],
  );

  useEffect(() => {
    preloadLines(play.steps.map((s) => s.say));
    return () => stopSpeaking();
  }, [play]);

  // ---------- oynatma döngüsü ----------
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const end = tl.steps[curRef.current].end;
      const nt = Math.min(end, tRef.current + dt * speed);
      tRef.current = nt;
      setT(nt);
      if (nt >= end) {
        setPlaying(false);
        setPhase('turn');
        sfx.pop();
        if (curRef.current === 0 && !isSpeaking())
          say(mode === 'paper' ? 'Şimdi sıra sende! Kâğıdına çiz, bitince devam et.' : 'Şimdi sıra sende! Turuncu çizginin üstünden geç.');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, tl, mode, say]);

  const seek = (nt: number) => {
    tRef.current = nt;
    setT(nt);
  };

  const playStep = (i: number, speakIt = true) => {
    curRef.current = i;
    setCur(i);
    seek(tl.steps[i].start);
    setResult(null);
    setPhase('watch');
    setPlaying(true);
    if (speakIt) say(play.steps[i].say);
  };

  const start = () => {
    sfx.pop();
    startedAt.current = Date.now();
    doc.clear();
    setStepStars([]);
    setSelfStars(0);
    if (mode === 'screen') ts.setTool('pencil');
    playStep(0);
  };

  const togglePlay = () => {
    if (phase !== 'watch') return replayStep();
    if (playing) {
      setPlaying(false);
      stopSpeaking();
    } else {
      setPlaying(true);
    }
  };

  const replayStep = () => {
    if (mode === 'screen' && phase === 'feedback') doc.removeWhere((a) => a.kind === 'stroke' && a.step === cur);
    playStep(cur);
  };

  const skipToTurn = () => {
    seek(tl.steps[cur].end);
    setPlaying(false);
    setPhase('turn');
  };

  const advance = (stars?: number) => {
    const all = stars === undefined ? stepStars : [...stepStars, stars];
    setStepStars(all);
    setResult(null);
    if (cur < last) return playStep(cur + 1);
    stopSpeaking();
    if (mode === 'paper') {
      setPhase('camera');
      say('Çiziminin fotoğrafını çek!');
    } else {
      setPhase('color');
      ts.setTool('fill');
      ts.setColor(lesson.palette?.[0] ?? '#ffc531');
      say('Şimdi en eğlenceli kısım: boyama! Boya kovasıyla şekillerin içine dokun.');
    }
  };

  const turnDone = () => {
    if (mode === 'paper' || scaffold === 'free') return advance();
    const strokes = doc.strokes((s) => s.step === cur && s.tool !== 'eraser');
    if (!strokes.length) {
      showToast('Önce çizmeyi dene! Turuncu çizgiyi takip et.');
      say('Önce çizmeyi dene!');
      return;
    }
    const context = lesson.steps.slice(0, cur + 1).flatMap((s) => s.shapes);
    const r = scoreStep(lesson.steps[cur].shapes, context, strokes, scaffold === 'trace' ? 16 : 20);
    setResult(r);
    setPhase('feedback');
    if (r.stars >= 2) sfx.success();
    else sfx.soft();
    say(feedbackText(r));
  };

  const retry = () => {
    doc.removeWhere((a) => a.kind === 'stroke' && a.step === cur);
    setResult(null);
    setPhase('turn');
  };

  const finish = async (stars: number, blob?: Blob) => {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const earned = completeLesson({ lessonId: lesson.id, stars, scaffold: mode === 'paper' ? 'paper' : scaffold, minutes });
    let prev: string | undefined;
    if (profile) {
      const older = (await listArtworks(profile.id)).find((a) => a.lessonId === lesson.id);
      if (older) prev = URL.createObjectURL(older.blob);
      if (blob)
        await saveArtwork({ id: uid(), profileId: profile.id, lessonId: lesson.id, kind: mode === 'paper' ? 'paper' : 'screen', stars, createdAt: Date.now(), blob });
    }
    setFinal({ stars, image: blob ? URL.createObjectURL(blob) : undefined, prev, earned });
    setPhase('done');
    sfx.fanfare();
    void confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 }, colors: ['#ffd43b', '#ffffff', '#a58bff', '#ff7eb6', '#2ecf8a'], disableForReducedMotion: true });
    say(stars >= 3 ? `Muhteşem! ${lesson.title} çok güzel oldu!` : 'Tebrikler! Dersi bitirdin!');
  };

  const finishScreen = async () => {
    const stars = scaffold === 'free'
      ? scoreFreehand(lesson.steps.flatMap((s) => s.shapes), doc.strokes()).stars
      : Math.max(1, Math.round(stepStars.reduce((a, b) => a + b, 0) / Math.max(1, stepStars.length)));
    await finish(stars, await doc.toBlob());
  };

  const exit = () => {
    stopSpeaking();
    nav('/');
  };

  // ---------- düzen ----------
  const portrait = box.h > box.w * 1.05;
  const aspect = portrait ? 3 / 4 : 4 / 3;
  let W = box.w * 0.94, H = W / aspect;
  if (H > box.h * 0.94) {
    H = box.h * 0.94;
    W = H * aspect;
  }
  const S = Math.floor(Math.min(W, H) * 0.94);
  const drawingEnabled = mode === 'screen' && (phase === 'turn' || phase === 'color');
  const showPlayer = phase === 'watch' || phase === 'turn' || phase === 'feedback';

  return (
    <div className={`player desk ${settings.leftHanded ? 'player--left' : ''} ${phase === 'intro' ? 'player--intro' : ''} ${mode === 'screen' && (phase === 'turn' || phase === 'color') ? 'player--tools' : ''} ${phase === 'color' ? 'player--palette' : ''}`}>
      {/* üst çubuk */}
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Dersten çık" onClick={() => (phase === 'intro' || phase === 'done' ? exit() : setLeave(true))}>
          <ArrowLeft size={26} strokeWidth={2.6} />
        </button>
        <div className="player__title">
          <b>{lesson.title}</b>
          {phase !== 'intro' && phase !== 'done' && (
            <span className="player__steps" aria-label={`Adım ${cur + 1} / ${play.steps.length}`}>
              {play.steps.map((_, i) => (
                <span key={i} className={i < cur || phase === 'color' || phase === 'camera' || phase === 'review' ? 'done' : i === cur ? 'now' : ''} />
              ))}
            </span>
          )}
        </div>
        <button className="round-btn round-btn--light" aria-label={settings.narration ? 'Sesi kapat' : 'Sesi aç'}
          onClick={() => { if (settings.narration) stopSpeaking(); updateSettings({ narration: !settings.narration }); }}>
          {settings.narration ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </header>

      {/* kâğıt */}
      <div className="player__wrap" ref={wrapRef}>
        {box.w > 0 && phase !== 'camera' && (
          <div className="sheet" style={{ width: W, height: H }}>
            <div className="stage" style={{ width: S, height: S }}>
              {phase === 'review' && photo.photo ? (
                <PhotoStage lesson={lesson} photo={photo.photo} align={photo.align} setAlign={photo.setAlign} opacity={compare ? 0.75 : 0} />
              ) : (
                <>
                  {phase === 'intro' && <SketchImg lesson={lesson} pad={0} className="stage__img" />}
                  {showPlayer && mode === 'paper' && <LiveSketch lesson={play} tl={tl} t={t} />}
                  {showPlayer && mode === 'screen' && !(phase !== 'watch' && scaffold === 'free') && (
                    <LiveSketch lesson={play} tl={tl} t={t} faintBefore={phase === 'watch' ? cur : cur + 1} showPencil={false} />
                  )}
                  {mode === 'screen' && (phase === 'turn' || phase === 'feedback') && scaffold !== 'free' && (
                    <GuideLayer lesson={lesson} step={cur} view={scaffold} missed={phase === 'feedback' ? result?.missed : undefined} />
                  )}
                  {mode === 'screen' && phase !== 'intro' && phase !== 'done' && (
                    <DrawingCanvas doc={doc} tool={ts.tool} color={ts.color} size={ts.size} pattern={ts.pattern} stamp={ts.stamp} step={cur} disabled={!drawingEnabled}
                      palmRejection={settings.palmRejection} />
                  )}
                  {mode === 'screen' && phase === 'watch' && <PencilOverlay tl={tl} t={t} />}
                </>
              )}
            </div>
          </div>
        )}
        {phase === 'camera' && (
          <CameraCapture
            onCapture={(b) => { void photo.load(b); setPhase('review'); }}
            onSkip={() => setPhase('review')}
          />
        )}
      </div>

      {/* "Kendin çiz" için örnek kartı */}
      {mode === 'screen' && scaffold === 'free' && (phase === 'turn' || phase === 'feedback') && (
        <div className="ref-float">
          <SketchImg lesson={lesson} upto={cur} paper pad={20} />
          <span>Örnek</span>
        </div>
      )}
      {phase === 'color' && (
        <div className="ref-float">
          <SketchImg lesson={lesson} mode="color" paper pad={20} />
          <span>Örnek</span>
        </div>
      )}

      {/* sıra sende */}
      {phase === 'turn' && (
        <div className="turn-banner rise">
          <Hand size={22} /> {mode === 'paper' ? (play.steps[cur]?.hatch ? 'Sıra sende! Kalemle gölgelendir.' : 'Sıra sende! Kâğıdına çiz.') : scaffold === 'free' ? 'Sıra sende! Örneğe bakarak çiz.' : 'Sıra sende! Turuncu çizgiyi takip et.'}
        </div>
      )}

      {/* çizim araçları */}
      {drawingEnabled && (
        <div className="tools-float">
          <ToolCapsule doc={doc} ts={ts} tools={phase === 'color' ? ['fill', 'pencil', 'crayon', 'marker', 'brush', 'watercolor', 'rainbow', 'glitter', 'stamp', 'eraser'] : ['pencil', 'eraser']} clear={phase === 'color'} />
        </div>
      )}
      {phase === 'color' && (
        <div className="palette-float">
          <PencilPalette ts={ts} palette={lesson.palette} />
        </div>
      )}

      {/* alt: zaman çubuğu + eylem */}
      {showPlayer && (
        <footer className="player__bottom">
          {/* Oynatma düğmeleri alt çubukta: izlerken hiçbir şey çizimin üstüne gelmesin */}
          {phase === 'watch' && (
            <div className="play-ctrl">
              <button className="play-ctrl__side" aria-label="Adımı baştan izle" onClick={replayStep}><RotateCcw size={22} /></button>
              <button className={`play-ctrl__main ${playing ? '' : 'is-paused'}`} aria-label={playing ? 'Duraklat' : 'Oynat'} onClick={togglePlay}>
                {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
              </button>
              <button className="play-ctrl__side" aria-label="Adımı atla" onClick={skipToTurn}><RotateCw size={22} /></button>
            </div>
          )}
          <TimeBar tl={tl} t={t} cur={cur} limitToStep={mode === 'screen'}
            onSeek={(nt) => {
              seek(nt);
              setPlaying(false);
              setPhase('watch');
              stopSpeaking();
            }}
            onSeekEnd={(nt) => {
              if (nt >= tl.steps[curRef.current].end - 0.01) skipToTurn();
              else setPlaying(true);
            }}
            onChangeStep={(i) => { curRef.current = i; setCur(i); }}
            onGear={() => setGear((g) => !g)}
          />
          {phase === 'turn' && (
            <>
              <button className="round-btn round-btn--light" aria-label="Adımı tekrar izle" onClick={replayStep}><RotateCcw size={24} /></button>
              <button className="pill pill--yellow" onClick={turnDone}>
                {mode === 'paper' ? (cur < last ? 'Çizdim' : 'Bitirdim') : 'Bitti'} <Check size={22} />
              </button>
            </>
          )}
        </footer>
      )}

      {phase === 'color' && (
        <footer className="player__bottom player__bottom--end">
          <button className="pill pill--yellow" onClick={finishScreen}>Resmim hazır <Check size={22} /></button>
        </footer>
      )}

      {gear && showPlayer && (
        <div className="gear-pop rise">
          <p>Hız</p>
          <div className="seg-dark">
            {[0.75, 1, 1.25, 1.5].map((v) => (
              <button key={v} className={speed === v ? 'on' : ''} onClick={() => updateSettings({ speed: v })}>{v}x</button>
            ))}
          </div>
        </div>
      )}

      {/* geri bildirim */}
      {phase === 'feedback' && result && (
        <div className={`feedback-card rise ${result.stars < 2 ? 'try' : ''}`} role="status">
          <Mascot size={70} mood={result.stars >= 2 ? 'cheer' : 'think'} />
          <div className="feedback-card__body">
            <Stars value={result.stars} size={34} animate dim="rgba(29,23,64,0.12)" />
            <p>{feedbackText(result)}</p>
          </div>
          <div className="feedback-card__actions">
            <button className="btn-outline" onClick={retry}><RotateCcw size={20} /> Tekrar</button>
            <button className="btn-dark" onClick={() => advance(result.stars)}>Devam <ArrowRight size={20} /></button>
          </div>
        </div>
      )}

      {/* fotoğraf değerlendirme */}
      {phase === 'review' && (
        <div className="review-panel rise">
          <h2 className="title-md">{photo.photo ? 'Örnekle karşılaştır' : 'Nasıl oldu?'}</h2>
          {photo.photo && (
            <label className="review-toggle">
              <input type="checkbox" className="switch" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
              Örnek çizimi üstüne koy
            </label>
          )}
          {photo.photo && compare && <p className="review-hint">Turuncu çizgileri sürükleyerek kendi çiziminin üstüne getirebilirsin.</p>}
          <p className="review-q">Nasıl oldu?</p>
          <div className="self-rate">
            {[{ v: 1, e: '😅', t: 'Biraz zordu' }, { v: 2, e: '🙂', t: 'İyi oldu' }, { v: 3, e: '🤩', t: 'Çok güzel!' }].map((o) => (
              <button key={o.v} className={selfStars === o.v ? 'on' : ''} onClick={() => { sfx.tap(); setSelfStars(o.v); }}>
                <span>{o.e}</span>{o.t}
              </button>
            ))}
          </div>
          <div className="review-actions">
            <button className="btn-outline" onClick={() => setPhase('camera')}>Yeniden çek</button>
            <button className="btn-dark" disabled={!selfStars} onClick={async () => finish(selfStars, await photo.toBlob())}>Kaydet <Check size={20} /></button>
          </div>
        </div>
      )}

      {/* giriş */}
      {phase === 'intro' && (
        <div className="intro rise">
          <div className="intro__head">
            <h1 className="title-lg">{lesson.title}</h1>
            <button className={`fav-btn ${pdata.favorites.includes(lesson.id) ? 'on' : ''}`} aria-label="Favori"
              onClick={() => { sfx.pop(); toggleFavorite(lesson.id); }}>
              <Heart size={22} fill={pdata.favorites.includes(lesson.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="intro__meta">
            {play.steps.length} adım · {fmtTime(tl.total)} · {['', 'Kolay', 'Orta', 'Zor'][lesson.level]}
            {progress && <Stars value={progress.bestStars} size={18} dim="rgba(29,23,64,0.12)" />}
          </p>
          <p className="intro__q">Nerede çizeceksin?</p>
          <div className="mode-cards">
            <button className={mode === 'paper' ? 'on' : ''} onClick={() => { sfx.tap(); setMode('paper'); updateSettings({ defaultMode: 'paper' }); }}>
              <NotebookPen size={30} /><b>Kâğıtta</b><span>Kalem ve kâğıt hazırla</span>
            </button>
            <button className={mode === 'screen' ? 'on' : ''} onClick={() => { sfx.tap(); setMode('screen'); updateSettings({ defaultMode: 'screen' }); }}>
              <Monitor size={30} /><b>Ekranda</b><span>Parmağınla ya da kalemle</span>
            </button>
          </div>
          {mode === 'screen' && (
            <>
              <div className="seg-light">
                {SCAFFOLDS.map((s) => (
                  <button key={s.id} className={scaffold === s.id ? 'on' : ''} onClick={() => setScaffold(s.id)}>{s.label}</button>
                ))}
              </div>
              <p className="intro__hint">{SCAFFOLDS.find((s) => s.id === scaffold)?.hint}</p>
            </>
          )}
          <button className="pill intro__start" onClick={start}>
            <Play size={22} fill="currentColor" /> Başla
          </button>
        </div>
      )}

      {/* kutlama */}
      {phase === 'done' && final && (
        <div className="bg celebrate">
          <Doodles variant={3} />
          <div className="celebrate__art rise">
            {final.prev && (
              <figure className="celebrate__card celebrate__card--prev">
                <img src={final.prev} alt="Önceki çizimin" />
                <figcaption>Önceki</figcaption>
              </figure>
            )}
            <figure className="celebrate__card">
              {final.image ? <img src={final.image} alt="Çizimin" /> : <SketchImg lesson={lesson} paper pad={20} />}
              <figcaption>{final.prev ? 'Şimdi' : profile?.name}</figcaption>
            </figure>
          </div>
          <div className="celebrate__text rise" style={{ animationDelay: '0.15s' }}>
            <h1 className="title-xl">Tebrikler{profile ? `, ${profile.name}` : ''}!</h1>
            <Stars value={final.stars} size={46} animate />
            <p className="sub">{lesson.skill}</p>
            <ChestNote />
            {final.earned.length > 0 && (
              <div className="celebrate__stickers">
                {final.earned.map((sid) => {
                  const st = getSticker(sid);
                  return st ? <span key={sid} className="sticker sticker--new" title={st.title}>{st.emoji}</span> : null;
                })}
                <span>Yeni çıkartma!</span>
              </div>
            )}
            <div className="celebrate__actions">
              {nextLesson(lesson) && (
                <button className="pill" onClick={() => nav(`/ders/${nextLesson(lesson)!.id}`, { replace: true })}>Sonraki ders <ArrowRight size={22} /></button>
              )}
              <button className="pill pill--ghost pill--sm" onClick={() => { setFinal(null); setPhase('intro'); seek(0); }}>Tekrar çiz</button>
              <button className="pill pill--ghost pill--sm" onClick={exit}>Ana sayfa</button>
            </div>
          </div>
        </div>
      )}

      {leave && (
        <Confirm title="Dersten çıkalım mı?" text="Bu dersteki çizimin kaydedilmeyecek." yes="Çık" no="Devam et" onNo={() => setLeave(false)} onYes={exit} />
      )}
      {toast}
    </div>
  );
}

/** Ekran modunda kalemi çocuğun çizgilerinin üstünde göstermek için ayrı katman. */
function PencilOverlay({ tl, t }: { tl: Timeline; t: number }) {
  const { pencil } = frameAt(tl, t);
  if (!pencil.visible) return null;
  return (
    <svg viewBox="0 0 400 400" className="pencil-layer" aria-hidden="true">
      <defs><PencilDefs /></defs>
      <PencilSprite x={pencil.x} y={pencil.y} lifted={pencil.lifted} scale={0.95} />
    </svg>
  );
}

/** Alttaki yatay zaman çubuğu: süre, sürüklenebilir ilerleme, adım işaretleri, ayar düğmesi. */
function TimeBar({ tl, t, cur, limitToStep, onSeek, onSeekEnd, onChangeStep, onGear }: {
  tl: Timeline; t: number; cur: number; limitToStep: boolean;
  onSeek: (t: number) => void; onSeekEnd: (t: number) => void; onChangeStep: (i: number) => void; onGear: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const min = limitToStep ? tl.steps[cur].start : 0;
  const max = tl.steps[cur].end;
  const at = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const v = ((clientX - r.left) / r.width) * tl.total;
    return Math.min(max, Math.max(min, v));
  };
  const move = (clientX: number) => {
    const nt = at(clientX);
    if (!limitToStep) {
      const s = tl.steps.findIndex((x) => nt < x.end - 1e-6);
      const i = s === -1 ? tl.steps.length - 1 : s;
      if (i !== cur) onChangeStep(i);
    }
    onSeek(nt);
    return nt;
  };
  return (
    <div className="timebar">
      <span className="timebar__time">{fmtTime(t)}</span>
      <div
        ref={track}
        className="timebar__track"
        role="slider"
        aria-label="Video ilerlemesi"
        aria-valuemin={0}
        aria-valuemax={Math.round(tl.total)}
        aria-valuenow={Math.round(t)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          move(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX)}
        onPointerUp={(e) => {
          if (!dragging.current) return;
          dragging.current = false;
          onSeekEnd(move(e.clientX));
        }}
      >
        <span className="timebar__rail" />
        <span className="timebar__fill" style={{ width: `${(t / tl.total) * 100}%` }} />
        {tl.steps.slice(0, -1).map((s) => (
          <span key={s.step} className="timebar__tick" style={{ left: `${(s.end / tl.total) * 100}%` }} />
        ))}
        <span className="timebar__thumb" style={{ left: `${(t / tl.total) * 100}%` }} />
      </div>
      <span className="timebar__time">{fmtTime(tl.total)}</span>
      <button className="timebar__gear" aria-label="Ayarlar" onClick={onGear}><Settings2 size={22} /></button>
    </div>
  );
}
