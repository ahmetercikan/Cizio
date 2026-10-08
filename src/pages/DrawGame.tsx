/**
 * "Çizdiğinle oyna": çocuğun kendi çizimi 3B bir koşu oyununun kahramanıdır (src/play3d/runner.ts).
 *   koş / sür — sağa sola kaydırarak şerit değiştir, dokunarak zıpla
 *   uç / yüz  — yukarı aşağı kaydırarak yüksel / alçal
 * Yıldız, mıknatıs, kalkan ve kalp toplanır; 3 can, 60 saniyelik tur.
 */
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronsUp, ChevronUp, Footprints, Gamepad2, Heart, Magnet, Play, RotateCcw, Shield, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GAME_END_LINES, GAME_LINES, GAME_LIVES_LINE } from '../art/lines';
import { facingOf, motionOf, type GameKind } from '../art/motion';
import { rigOf, type Rig } from '../art/rig';
import { AppShell } from '../components/AppShell';
import { Doodles } from '../components/Doodles';
import { Mascot } from '../components/Mascot';
import { getLesson } from '../lessons';
import { getArtwork, listArtworks, type Artwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import type { RunnerEnd, RunnerHud, RunScene } from '../play3d/runner';
import { GAME_ROUNDS_PER_DAY, useApp, useProfile } from '../store/useApp';

export const ROUND_SECONDS = 60;
/** Oynanabilir resimler: ders ya da serbest çizimler (kombinler hariç). */
export const playable = (a: Artwork) => a.kind !== 'style';

// ------------------------------------------------------------------------------------------------
// Resim seçimi (/oyun)
// ------------------------------------------------------------------------------------------------
export function DrawGamePicker() {
  const profile = useProfile()!;
  const [items, setItems] = useState<Artwork[] | null>(null);
  useEffect(() => {
    void listArtworks(profile.id).then((a) => setItems(a.filter(playable).slice(0, 30)));
  }, [profile.id]);
  const urls = useMemo(() => new Map((items ?? []).map((a) => [a.id, URL.createObjectURL(a.blob)])), [items]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return (
    <AppShell flow={1}>
      <header className="page-head rise">
        <div>
          <p className="sub">Kendi resminle oyna</p>
          <h1 className="title-xl">Çizdiğinle oyna</h1>
        </div>
      </header>
      {items && items.length === 0 ? (
        <div className="empty rise">
          <Mascot size={90} mood="think" />
          <div>
            <p className="title-md">Önce bir resim çiz!</p>
            <p className="sub">Bir ders bitirince çizdiğin resim burada oyunun kahramanı olur.</p>
            <Link to="/ogren" className="pill pill--sm" style={{ marginTop: 12 }}>Derslere git</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="hint rise">Hangi resmin oyunun kahramanı olsun?</p>
          <div className="board">
            {(items ?? []).map((a, i) => (
              <Link key={a.id} to={`/oyun/${a.id}`} className="pinned" style={{ ['--r' as string]: `${((i * 37) % 7) - 3}deg` }}>
                <span className="pinned__pin" />
                <img src={urls.get(a.id)} alt="" loading="lazy" />
                <span className="pinned__cap"><Gamepad2 size={16} /> {a.lessonId ? getLesson(a.lessonId)?.title ?? 'Çizim' : 'Serbest çizim'}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

// ------------------------------------------------------------------------------------------------
// Oyun (/oyun/:id)
// ------------------------------------------------------------------------------------------------
type Runner = import('../play3d/runner').Runner;

/** Sahne: oyun türüne ve dersin sahnesine göre. */
function runSceneOf(game: GameKind, scene: string): RunScene {
  if (game === 'swim') return 'sea';
  if (game === 'fly') return scene === 'space' ? 'space' : 'sky';
  if (game === 'drive') return 'road';
  return scene === 'sea' ? 'beach' : scene === 'snow' ? 'snow' : 'meadow';
}

export default function DrawGame() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const settings = useApp((s) => s.settings);
  const recordGame = useApp((s) => s.recordGame);
  const [art, setArt] = useState<Artwork | null | undefined>(undefined);
  const [rig, setRig] = useState<Rig | null>(null);
  const [phase, setPhase] = useState<'ready' | 'play' | 'end'>('ready');
  const [round, setRound] = useState(0);
  const [hud, setHud] = useState<RunnerHud>({ stars: 0, lives: 3, left: ROUND_SECONDS, dist: 0, power: null });
  const [end, setEnd] = useState<RunnerEnd | null>(null);
  const [reward, setReward] = useState(0);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);
  const runner = useRef<Runner | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const lesson = art?.lessonId ? getLesson(art.lessonId) : undefined;
  const prof = motionOf(lesson);
  const game = prof.game;
  const air = game === 'fly' || game === 'swim';

  useEffect(() => {
    void getArtwork(id).then((a) => setArt(a ?? null));
  }, [id]);
  useEffect(() => {
    if (!art) return;
    const tm = setTimeout(() => void rigOf(art, lesson).then(setRig), 60);
    return () => clearTimeout(tm);
  }, [art]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (rig && settings.narration) speak(GAME_LINES[game], { rate: settings.rate });
  }, [rig]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3B sahne (her turda yeniden kurulur)
  useEffect(() => {
    if (!rig || !ref.current) return;
    let alive = true;
    const canvas = ref.current;
    void import('../play3d/runner')
      .then(({ Runner }) => {
        if (!alive) return;
        runner.current = new Runner(canvas, {
          rig,
          facing: facingOf(lesson),
          game,
          scene: runSceneOf(game, prof.scene),
          seconds: ROUND_SECONDS,
          onHud: setHud,
          onEnd: (r) => {
            setEnd(r);
            setPhase('end');
            setReward(recordGame(r.stars));
            sfx.fanfare();
            if (settings.narration) speak(r.reason === 'lives' ? GAME_LIVES_LINE : GAME_END_LINES[r.stars % 2], { rate: settings.rate });
          },
          sound: { star: (i) => sfx.star(i % 6), hit: () => sfx.soft(), jump: () => sfx.tap(), power: () => sfx.success(), lane: () => sfx.tab() },
        });
        if (round > 0) runner.current.start();
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      runner.current?.dispose();
      runner.current = null;
    };
  }, [rig, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const begin = () => {
    sfx.pop();
    setHud({ stars: 0, lives: 3, left: ROUND_SECONDS, dist: 0, power: null });
    setEnd(null);
    if (phase === 'ready' && round === 0) {
      runner.current?.start();
      setPhase('play');
    } else {
      setPhase('play');
      setRound((r) => r + 1);
    }
  };
  const cmd = (c: 'left' | 'right' | 'up' | 'down' | 'jump') => runner.current?.input(c);

  // Kaydırma: yatay → şerit (koşu), dikey → zıpla / yüksel-alçal; kısa dokunuş → zıpla / yüksel
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button,a')) return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || phase !== 'play') return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return cmd(air ? 'up' : 'jump');
    if (Math.abs(dx) > Math.abs(dy)) cmd(dx < 0 ? 'left' : 'right');
    else cmd(dy < 0 ? 'up' : 'down');
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const m: Record<string, 'left' | 'right' | 'up' | 'down' | 'jump'> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'jump' };
      if (m[e.key]) {
        e.preventDefault();
        cmd(m[e.key]);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (art === null || failed) {
    return (
      <div className="bg live-center">
        <Doodles variant={1} />
        <div className="live-center__body">
          <h1 className="title-xl">{failed ? 'Oyun bu cihazda açılamadı' : 'Bu resim bulunamadı'}</h1>
          <button className="pill" onClick={() => nav('/oyun')}>Başka resim seç</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
      <canvas ref={ref} className="game__canvas" />
      <header className="game__top">
        <button className="round-btn round-btn--light" aria-label="Oyundan çık" onClick={() => nav(-1)}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        {phase === 'play' && (
          <>
            <span className="game__lives" aria-label={`${hud.lives} can`}>
              {[0, 1, 2].map((i) => <Heart key={i} size={24} fill={i < hud.lives ? '#ff6b8a' : 'none'} color={i < hud.lives ? '#3a2b27' : 'rgba(58,43,39,0.35)'} />)}
            </span>
            <div className="game__time" aria-label={`${hud.left} saniye`}><i style={{ width: `${(hud.left / ROUND_SECONDS) * 100}%` }} /></div>
            {hud.power && <span className={`game__power game__power--${hud.power}`}>{hud.power === 'magnet' ? <Magnet size={20} /> : <Shield size={20} />}</span>}
            <span className="game__stars"><Star size={22} fill="#ffc83d" color="#3a2b27" /> {hud.stars}</span>
          </>
        )}
      </header>
      {phase === 'play' && (
        <div className="game__pad" aria-hidden="false">
          {air ? (
            <div className="game__pad-col">
              <button className="game__btn" aria-label="Yüksel" onPointerDown={(e) => { e.stopPropagation(); cmd('up'); }}><ChevronUp size={34} /></button>
              <button className="game__btn" aria-label="Alçal" onPointerDown={(e) => { e.stopPropagation(); cmd('down'); }}><ChevronDown size={34} /></button>
            </div>
          ) : (
            <>
              <div className="game__pad-row">
                <button className="game__btn" aria-label="Sola geç" onPointerDown={(e) => { e.stopPropagation(); cmd('left'); }}><ChevronLeft size={34} /></button>
                <button className="game__btn" aria-label="Sağa geç" onPointerDown={(e) => { e.stopPropagation(); cmd('right'); }}><ChevronRight size={34} /></button>
              </div>
              <button className="game__btn game__btn--jump" aria-label="Zıpla" onPointerDown={(e) => { e.stopPropagation(); cmd('jump'); }}><ChevronsUp size={30} /> Zıpla</button>
            </>
          )}
        </div>
      )}
      {!rig && <div className="alive__wait"><Mascot size={110} mood="think" /><b>Oyun hazırlanıyor…</b></div>}
      {rig && phase === 'ready' && (
        <div className="game__panel rise">
          <h1 className="title-lg">{lesson ? `${lesson.title} oyunda!` : 'Resmin oyunda!'}</h1>
          <p className="sub">{GAME_LINES[game]}</p>
          <button className="pill" onClick={begin}><Play size={22} fill="currentColor" /> Başla</button>
        </div>
      )}
      {phase === 'end' && end && (
        <div className="game__panel rise">
          <h1 className="title-lg">{end.reason === 'lives' ? 'Canların bitti!' : 'Süre doldu!'}</h1>
          <div className="game__result">
            <span><Star size={26} fill="#ffc83d" color="#3a2b27" /> <b>{end.stars}</b> yıldız</span>
            <span><Footprints size={24} /> <b>{end.dist}</b> metre</span>
          </div>
          <p className="sub">
            {reward > 0 ? `Yıldız kumbarana ${reward} yıldız eklendi.` : end.stars > 0 ? `Bugünkü ${GAME_ROUNDS_PER_DAY} ödüllü oyunu bitirdin; yarın yine yıldız kazanabilirsin.` : 'Bir dahakine yıldızları yakala!'}
          </p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="pill" onClick={begin}><RotateCcw size={20} /> Tekrar oyna</button>
            <button className="pill pill--ghost pill--sm" onClick={() => nav('/oyun')}>Başka resim</button>
          </div>
        </div>
      )}
    </div>
  );
}
