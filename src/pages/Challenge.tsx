/**
 * Mini meydan okumalar:
 *   speed   — 60 saniyede örneğe bakarak çiz
 *   memory  — örneğe 6 saniye bak, saklanınca hatırladığın gibi çiz
 *   oneline — kalemi hiç kaldırmadan tek çizgiyle çiz
 * Sonuç, konum ve boyuttan bağımsız biçim benzerliğiyle (scoreFreehand) yıldıza çevrilir.
 */
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Play, RotateCcw, Shuffle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { PencilPalette, ToolCapsule, useToolState } from '../components/DrawTools';
import { Doodles } from '../components/Doodles';
import { SketchImg } from '../components/Sketch';
import { Stars, useSize, useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import { scoreFreehand } from '../engine/scoring';
import { getLesson, lessons } from '../lessons';
import type { Lesson } from '../lessons/types';
import { CHALLENGE_LINES, CHALLENGES, questDone, todayQuest, type ChallengeKind } from '../lib/daily';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { speak, stopSpeaking } from '../lib/speech';
import { uid } from '../lib/util';
import { getSticker } from '../stickers';
import { useApp, useProfile } from '../store/useApp';
import { ChestNote } from '../components/Rewards';

const SPEED_SECONDS = 60;
const MEMORY_SECONDS = 6;

function randomLesson(except?: string): Lesson {
  const pool = lessons.filter((l) => l.level <= 2 && l.id !== except);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Challenge() {
  const { kind, lessonId } = useParams();
  const nav = useNavigate();
  const def = CHALLENGES.find((c) => c.id === kind);
  const lesson = useMemo(() => (lessonId && getLesson(lessonId)) || randomLesson(), [lessonId]);
  if (!def) return <Link to="/">Ana sayfa</Link>;
  return <ChallengeRun key={`${def.id}-${lesson.id}`} kind={def.id} lesson={lesson} onAnother={() => nav(`/meydan/${def.id}/${randomLesson(lesson.id).id}`, { replace: true })} />;
}

type Phase = 'intro' | 'show' | 'draw' | 'result';

function ChallengeRun({ kind, lesson, onAnother }: { kind: ChallengeKind; lesson: Lesson; onAnother: () => void }) {
  const nav = useNavigate();
  const def = CHALLENGES.find((c) => c.id === kind)!;
  const settings = useApp((s) => s.settings);
  const recordChallenge = useApp((s) => s.recordChallenge);
  const profile = useProfile();
  const [phase, setPhase] = useState<Phase>('intro');
  const [left, setLeft] = useState(kind === 'memory' ? MEMORY_SECONDS : SPEED_SECONDS);
  const [result, setResult] = useState<{ stars: number; percent: number; record: boolean; image: string; earned: string[]; quest: boolean } | null>(null);
  const [toast, showToast] = useToast();
  const doc = useMemo(() => new DrawingDoc(), []);
  const ts = useToolState({ tool: 'pencil', color: '#2f2f36' });
  const [wrapRef, box] = useSize<HTMLDivElement>();
  const S = Math.floor(Math.min(box.w, box.h) * 0.94);
  const finishing = useRef(false);

  const say = (t: string) => settings.narration && speak(t, { rate: settings.rate, voiceURI: settings.voiceURI });
  useEffect(() => () => stopSpeaking(), []);

  const start = () => {
    sfx.pop();
    doc.clear();
    finishing.current = false;
    say(def.intro);
    if (kind === 'memory') {
      setLeft(MEMORY_SECONDS);
      setPhase('show');
    } else {
      setLeft(SPEED_SECONDS);
      setPhase('draw');
    }
  };

  // Geri sayım: hafıza (bakma süresi) ve hızlı çizim (çizim süresi)
  useEffect(() => {
    const counting = (kind === 'memory' && phase === 'show') || (kind === 'speed' && phase === 'draw');
    if (!counting) return;
    if (left <= 0) {
      if (phase === 'show') {
        setPhase('draw');
        say(CHALLENGE_LINES.memoryDraw);
      } else {
        say(CHALLENGE_LINES.timeUp);
        void finish();
      }
      return;
    }
    const t = setTimeout(() => {
      setLeft((n) => n - 1);
      if (left <= 4) sfx.tap();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left, kind]);

  const finish = async () => {
    if (finishing.current) return;
    finishing.current = true;
    const strokes = doc.strokes((s) => s.tool !== 'eraser');
    if (!strokes.length) {
      finishing.current = false;
      if (kind === 'speed' && left <= 0) setPhase('intro');
      showToast('Önce bir şeyler çiz!');
      return;
    }
    const res = scoreFreehand(lesson.steps.flatMap((s) => s.shapes), strokes);
    const stars = res.stars;
    const percent = Math.round(res.score * 100);
    const blob = await doc.toBlob();
    if (profile) await saveArtwork({ id: uid(), profileId: profile.id, lessonId: lesson.id, kind: 'free', stars, createdAt: Date.now(), blob });
    const before = useApp.getState();
    const questBefore = profile ? before.data[profile.id]?.quests?.length ?? 0 : 0;
    const prevRecord = profile ? before.data[profile.id]?.records?.[kind] : undefined;
    const earned = recordChallenge(kind, lesson.id, stars, percent);
    const after = profile ? useApp.getState().data[profile.id] : undefined;
    const quest = !!after && (after.quests?.length ?? 0) > questBefore;
    setResult({ stars, percent, record: prevRecord !== undefined && percent > prevRecord, image: URL.createObjectURL(blob), earned, quest });
    setPhase('result');
    sfx.fanfare();
    void confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, disableForReducedMotion: true });
    if (quest) say(CHALLENGE_LINES.questDone);
  };

  // Tek çizgi: ikinci darbe = kalem kaldırıldı → baştan
  const onStroke = () => {
    if (kind !== 'oneline') return;
    const n = doc.strokes((s) => s.tool !== 'eraser').length;
    if (n > 1) {
      sfx.soft();
      showToast('Kalemini kaldırdın! Hadi baştan deneyelim.');
      say(CHALLENGE_LINES.lifted);
      doc.clear();
    }
  };

  const showRef = phase === 'draw' && kind !== 'memory';

  return (
    <div className={`player desk ${settings.leftHanded ? 'player--left' : ''} ${phase === 'draw' ? 'player--tools player--palette' : ''}`}>
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav('/')}>
          <ArrowLeft size={26} strokeWidth={2.6} />
        </button>
        <div className="player__title">
          <b>{def.emoji} {def.title}</b>
        </div>
        {(phase === 'show' || (phase === 'draw' && kind === 'speed')) ? (
          <span className={`countdown ${left <= 5 ? 'hurry' : ''}`} aria-live="polite">{left}</span>
        ) : <span style={{ width: 52 }} />}
      </header>

      <div className="player__wrap" ref={wrapRef}>
        {S > 0 && (
          <div className="sheet" style={{ width: S, height: S }}>
            <div className="stage" style={{ width: S * 0.96, height: S * 0.96 }}>
              {phase === 'show' || phase === 'intro' ? (
                <SketchImg lesson={lesson} pad={10} className="stage__img" />
              ) : (
                <DrawingCanvas doc={doc} tool={ts.tool} color={ts.color} size={ts.size} disabled={phase !== 'draw'}
                  palmRejection={settings.palmRejection} onStroke={onStroke} />
              )}
            </div>
          </div>
        )}
      </div>

      {showRef && (
        <div className="ref-float">
          <SketchImg lesson={lesson} paper pad={20} />
          <span>Örnek</span>
        </div>
      )}

      {phase === 'draw' && (
        <>
          <div className="tools-float">
            <ToolCapsule doc={doc} ts={ts} tools={kind === 'oneline' ? ['pencil', 'marker'] : ['pencil', 'crayon', 'marker', 'eraser']} clear={false} />
          </div>
          <div className="palette-float"><PencilPalette ts={ts} /></div>
          <footer className="player__bottom player__bottom--end">
            <button className="pill pill--yellow" onClick={() => void finish()}>Bitti <Check size={22} /></button>
          </footer>
        </>
      )}

      {phase === 'intro' && (
        <div className="intro rise">
          <h1 className="title-lg">{def.emoji} {def.title}</h1>
          <p className="intro__meta">{lesson.title}</p>
          <p className="intro__hint" style={{ fontSize: 16 }}>
            {kind === 'speed' && 'Örneğe bakarak 60 saniye içinde çiz. Süre bitince sonucu göreceksin!'}
            {kind === 'memory' && `Resme ${MEMORY_SECONDS} saniye iyice bak. Sonra saklanacak ve hatırladığın gibi çizeceksin.`}
            {kind === 'oneline' && 'Kalemini kâğıttan hiç kaldırmadan, tek bir çizgiyle çiz. Kaldırırsan baştan başlarsın!'}
          </p>
          <div className="row-gap" style={{ gap: 10 }}>
            <button className="btn-outline" onClick={onAnother}><Shuffle size={18} /> Başka resim</button>
            <button className="pill" style={{ flex: 1, minWidth: 0 }} onClick={start}><Play size={20} fill="currentColor" /> Başla</button>
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="bg celebrate">
          <Doodles variant={2} />
          <div className="celebrate__art rise">
            <figure className="celebrate__card celebrate__card--prev">
              <SketchImg lesson={lesson} paper pad={20} />
              <figcaption>Örnek</figcaption>
            </figure>
            <figure className="celebrate__card">
              <img src={result.image} alt="Çizimin" />
              <figcaption>{profile?.name}</figcaption>
            </figure>
          </div>
          <div className="celebrate__text rise" style={{ animationDelay: '0.15s' }}>
            <h1 className="title-xl">{result.stars >= 3 ? 'Muhteşem!' : result.stars === 2 ? 'Çok iyi!' : 'Güzel deneme!'}</h1>
            <Stars value={result.stars} size={46} animate />
            <p className="similarity">
              <b>%{result.percent}</b> benzerlik
              {result.record && <span className="similarity__record">Yeni rekor!</span>}
            </p>
            <p className="sub">{def.title} meydan okumasını tamamladın.</p>
            {result.quest && <div className="celebrate__stickers"><span>Günün görevini tamamladın!</span></div>}
            <ChestNote />
            {result.earned.length > 0 && (
              <div className="celebrate__stickers">
                {result.earned.map((id) => {
                  const st = getSticker(id);
                  return st ? <span key={id} className="sticker sticker--new" title={st.title}>{st.emoji}</span> : null;
                })}
                <span>Yeni çıkartma!</span>
              </div>
            )}
            <div className="celebrate__actions">
              <button className="pill" onClick={onAnother}>Yeni meydan okuma <Shuffle size={20} /></button>
              <button className="pill pill--ghost pill--sm" onClick={() => { setResult(null); setPhase('intro'); }}><RotateCcw size={18} /> Tekrar</button>
              <button className="pill pill--ghost pill--sm" onClick={() => nav('/')}>Ana sayfa</button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  );
}

/** Günün görevinin bağlantısı. */
export function questLink(q: ReturnType<typeof todayQuest>): string {
  return q.kind === 'lesson' ? `/ders/${q.lessonId}` : `/meydan/${q.challenge}/${q.lessonId}`;
}
export { questDone };
