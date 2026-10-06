/**
 * "Çizdiğinle oyna": çocuğun kendi çizimi oyunun kahramanıdır.
 *   koş / sür — ekrana dokununca zıplar (havadayken bir kez daha), engellerin üstünden geçer
 *   uç / yüz  — dokundukça yükselir, bırakınca alçalır
 * Yolda yıldız toplanır. Engele çarpmak bir şey kaybettirmez (yalnızca sarsılır); 45 saniyelik tur.
 */
import { ArrowLeft, Gamepad2, Play, RotateCcw, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GAME_END_LINES, GAME_LINES } from '../art/lines';
import { facingOf, motionOf, type GameKind } from '../art/motion';
import { drawRig, rigOf, type Rig } from '../art/rig';
import { drawCloud, drawScene, drawStar, groundY } from '../art/scene';
import { AppShell } from '../components/AppShell';
import { Doodles } from '../components/Doodles';
import { Mascot } from '../components/Mascot';
import { getLesson } from '../lessons';
import { getArtwork, listArtworks, type Artwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { GAME_ROUNDS_PER_DAY, useApp, useProfile } from '../store/useApp';

export const ROUND_SECONDS = 45;
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
type Thing = { kind: 'star' | 'block'; x: number; y: number; w: number; h: number; got?: boolean; v: number; alt?: boolean };

interface World {
  t: number;
  y: number;
  vy: number;
  jumps: number;
  speed: number;
  dist: number;
  things: Thing[];
  next: number;
  stars: number;
  hitUntil: number;
  bursts: { x: number; y: number; t: number }[];
}

export default function DrawGame() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const settings = useApp((s) => s.settings);
  const recordGame = useApp((s) => s.recordGame);
  const [art, setArt] = useState<Artwork | null | undefined>(undefined);
  const [rig, setRig] = useState<Rig | null>(null);
  const [phase, setPhase] = useState<'ready' | 'play' | 'end'>('ready');
  const [hud, setHud] = useState({ stars: 0, left: ROUND_SECONDS });
  const [reward, setReward] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);
  const tap = useRef(0);
  const holding = useRef(false);
  const lesson = art?.lessonId ? getLesson(art.lessonId) : undefined;
  const prof = motionOf(lesson);
  const game = prof.game;
  const scene = game === 'swim' ? 'sea' : game === 'fly' ? (prof.scene === 'space' ? 'space' : 'sky') : game === 'drive' ? 'road' : prof.scene === 'sea' ? 'sea' : prof.scene === 'snow' ? 'snow' : 'meadow';

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

  // Oyun döngüsü (hazır ekranında da sahne ve karakter görünür)
  useEffect(() => {
    if (!rig) return;
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const facing = facingOf(lesson);
    const playing = phase === 'play';
    const W: World = { t: 0, y: 0, vy: 0, jumps: 0, speed: 0, dist: 0, things: [], next: 1.2, stars: 0, hitUntil: 0, bursts: [] };
    let last = performance.now(), raf = 0, lastHud = '';
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) [cv.width, cv.height] = [Math.round(w * dpr), Math.round(h * dpr)];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = Math.min(h * 0.22, w * 0.26);
      const ground = groundY(scene, h);
      const px = w * 0.24;
      const air = game === 'fly' || game === 'swim';
      if (!W.y) W.y = air ? h * 0.45 : ground - size / 2;

      if (playing) {
        W.t += dt;
        W.speed = h * (0.5 + 0.35 * Math.min(1, W.t / ROUND_SECONDS)) * (W.hitUntil > W.t ? 0.6 : 1);
        W.dist += W.speed * dt;
        // Kontrol
        const taps = tap.current;
        tap.current = 0;
        if (air) {
          const g = game === 'fly' ? h * 1.9 : h * 1.1;
          W.vy += g * dt;
          if (taps || holding.current) W.vy = Math.min(W.vy, game === 'fly' ? -h * 0.62 : -h * 0.42);
          if (game === 'swim') W.vy *= 0.985;
          W.y += W.vy * dt;
          const top = size / 2 + 8, bot = (scene === 'sea' ? h * 0.88 : h * 0.95) - size / 2;
          if (W.y < top) [W.y, W.vy] = [top, 0];
          if (W.y > bot) [W.y, W.vy] = [bot, 0];
        } else {
          const g = h * 3.2;
          const floor = ground - size / 2;
          if (taps && W.jumps < 2) {
            W.vy = -Math.sqrt(2 * g * h * (W.jumps ? 0.2 : 0.34));
            W.jumps++;
            sfx.tap();
          }
          W.vy += g * dt;
          W.y += W.vy * dt;
          if (W.y >= floor) [W.y, W.vy, W.jumps] = [floor, 0, 0];
        }
        // Yeni engeller ve yıldızlar
        W.next -= dt;
        if (W.next <= 0) {
          W.next = 1.4 + Math.random() * 0.9 - Math.min(0.5, W.t / 90);
          const bw = size * (0.45 + Math.random() * 0.2);
          if (air) {
            const y = h * (0.15 + Math.random() * 0.65);
            W.things.push({ kind: 'block', x: w + bw, y, w: bw * 1.2, h: bw, v: 1 });
            const sy = y + (y > h / 2 ? -1 : 1) * size * 1.3;
            for (let i = 0; i < 3; i++) W.things.push({ kind: 'star', x: w + bw + size * (1.2 + i * 0.7), y: sy, w: size * 0.38, h: size * 0.38, v: 1 });
          } else {
            const bh = bw * (0.7 + Math.random() * 0.4);
            W.things.push({ kind: 'block', x: w + bw, y: ground - bh / 2, w: bw, h: bh, v: 1, alt: Math.random() < 0.5 });
            for (let i = 0; i < 3; i++) {
              const u = (i + 1) / 4;
              W.things.push({ kind: 'star', x: w + bw + size * (-0.9 + i * 0.9), y: ground - bh - size * (0.4 + Math.sin(Math.PI * u) * 0.9), w: size * 0.38, h: size * 0.38, v: 1 });
            }
          }
        }
        // Çarpışmalar
        const hb = { x: px - size * 0.32, y: W.y - size * 0.32, w: size * 0.64, h: size * 0.64 };
        for (const o of W.things) {
          o.x -= W.speed * dt * o.v;
          const ow = o.w * (o.kind === 'block' ? 0.72 : 1), oh = o.h * (o.kind === 'block' ? 0.72 : 1);
          const hit = Math.abs(o.x - (hb.x + hb.w / 2)) < (ow + hb.w) / 2 && Math.abs(o.y - (hb.y + hb.h / 2)) < (oh + hb.h) / 2;
          if (!hit || o.got) continue;
          if (o.kind === 'star') {
            o.got = true;
            W.stars++;
            W.bursts.push({ x: o.x, y: o.y, t: W.t });
            sfx.star(W.stars % 6);
          } else if (W.hitUntil < W.t) {
            W.hitUntil = W.t + 1.1;
            sfx.soft();
          }
        }
        W.things = W.things.filter((o) => o.x > -o.w * 2 && !(o.kind === 'star' && o.got));
        W.bursts = W.bursts.filter((b) => W.t - b.t < 0.5);
        if (W.t >= ROUND_SECONDS) {
          setPhase('end');
          setReward(recordGame(W.stars));
          sfx.fanfare();
          if (settings.narration) speak(GAME_END_LINES[W.stars % 2], { rate: settings.rate });
        }
        const hudKey = `${W.stars}|${Math.ceil(ROUND_SECONDS - W.t)}`;
        if (hudKey !== lastHud) {
          lastHud = hudKey;
          setHud({ stars: W.stars, left: Math.max(0, Math.ceil(ROUND_SECONDS - W.t)) });
        }
      }

      // Çizim
      const clock = now / 1000;
      drawScene(ctx, scene, w, h, clock, W.dist);
      for (const o of W.things) {
        if (o.kind === 'star') drawStar(ctx, o.x, o.y + Math.sin(clock * 4 + o.x / 50) * 3, o.w / 2, '#ffc83d');
        else drawBlock(ctx, game, o, clock);
      }
      for (const b of W.bursts) {
        const u = (W.t - b.t) / 0.5;
        ctx.strokeStyle = `rgba(255,200,61,${1 - u})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, size * 0.2 + u * size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      const blink = W.hitUntil > W.t && Math.floor(W.t * 12) % 2 === 0;
      ctx.save();
      ctx.globalAlpha = blink ? 0.45 : 1;
      ctx.translate(px, W.y + (playing || air ? 0 : Math.sin(clock * 3) * 4));
      ctx.rotate(air ? Math.max(-0.35, Math.min(0.35, W.vy / (h * 2.2))) : W.jumps ? -0.08 : Math.sin(clock * 14) * 0.012);
      drawRig(ctx, rig, clock, 0, 0, size, { flip: facing < 0, spin: playing ? 2.5 : 1 });
      ctx.restore();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rig, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = () => {
    if (phase === 'play') tap.current++;
  };

  if (art === null) {
    return (
      <div className="bg live-center">
        <Doodles variant={1} />
        <div className="live-center__body"><h1 className="title-xl">Bu resim bulunamadı</h1><button className="pill" onClick={() => nav('/oyun')}>Başka resim seç</button></div>
      </div>
    );
  }
  return (
    <div className="game" onPointerDown={(e) => { if ((e.target as HTMLElement).closest('button,a')) return; holding.current = true; press(); }}
      onPointerUp={() => (holding.current = false)} onPointerCancel={() => (holding.current = false)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); press(); } }} tabIndex={0}>
      <canvas ref={ref} className="game__canvas" />
      <header className="game__top">
        <button className="round-btn round-btn--light" aria-label="Oyundan çık" onClick={() => nav(-1)}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        {phase === 'play' && (
          <>
            <div className="game__time" aria-label={`${hud.left} saniye`}><i style={{ width: `${(hud.left / ROUND_SECONDS) * 100}%` }} /></div>
            <span className="game__stars"><Star size={22} fill="#ffc83d" color="#3a2b27" /> {hud.stars}</span>
          </>
        )}
      </header>
      {!rig && <div className="alive__wait"><Mascot size={110} mood="think" /><b>Oyun hazırlanıyor…</b></div>}
      {rig && phase === 'ready' && (
        <div className="game__panel rise">
          <h1 className="title-lg">{lesson ? `${lesson.title} oyunda!` : 'Resmin oyunda!'}</h1>
          <p className="sub">{GAME_LINES[game]}</p>
          <button className="pill" onClick={() => { sfx.pop(); setHud({ stars: 0, left: ROUND_SECONDS }); setPhase('play'); }}><Play size={22} fill="currentColor" /> Başla</button>
        </div>
      )}
      {phase === 'end' && (
        <div className="game__panel rise">
          <h1 className="title-lg">{hud.stars} yıldız topladın!</h1>
          <p className="sub">
            {reward > 0 ? `Yıldız kumbarana ${reward} yıldız eklendi.` : hud.stars > 0 ? `Bugünkü ${GAME_ROUNDS_PER_DAY} ödüllü oyunu bitirdin; yarın yine yıldız kazanabilirsin.` : 'Bir dahakine yıldızları yakala!'}
          </p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="pill" onClick={() => { setHud({ stars: 0, left: ROUND_SECONDS }); setPhase('play'); }}><RotateCcw size={20} /> Tekrar oyna</button>
            <button className="pill pill--ghost pill--sm" onClick={() => nav('/oyun')}>Başka resim</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Engeller: koşuda kaya ve trafik konisi, uçarken gri bulut, denizde denizanası. */
function drawBlock(ctx: CanvasRenderingContext2D, game: GameKind, o: Thing, t: number) {
  const INK = '#3a2b27';
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  if (game === 'fly') {
    drawCloud(ctx, 0, 0, o.w * 0.55, '#8d93a8');
    ctx.fillStyle = '#ffc83d';
    ctx.beginPath();
    ctx.moveTo(-o.w * 0.05, o.h * 0.25);
    ctx.lineTo(o.w * 0.08, o.h * 0.25);
    ctx.lineTo(-o.w * 0.02, o.h * 0.5);
    ctx.lineTo(o.w * 0.1, o.h * 0.48);
    ctx.lineTo(-o.w * 0.08, o.h * 0.8);
    ctx.lineTo(-o.w * 0.01, o.h * 0.52);
    ctx.lineTo(-o.w * 0.12, o.h * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (game === 'swim') {
    ctx.fillStyle = '#ff8fb1';
    ctx.beginPath();
    ctx.arc(0, 0, o.w * 0.45, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ff8fb1';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * o.w * 0.15, 2);
      ctx.quadraticCurveTo(i * o.w * 0.15 + Math.sin(t * 5 + i) * 8, o.h * 0.3, i * o.w * 0.15, o.h * 0.55);
      ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-o.w * 0.12, -o.h * 0.15, 3, 0, Math.PI * 2);
    ctx.arc(o.w * 0.12, -o.h * 0.15, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (game === 'drive' || o.alt) {
    // trafik konisi
    ctx.fillStyle = '#ff7a3d';
    ctx.beginPath();
    ctx.moveTo(-o.w * 0.12, -o.h / 2);
    ctx.lineTo(o.w * 0.12, -o.h / 2);
    ctx.lineTo(o.w * 0.38, o.h / 2 - 6);
    ctx.lineTo(-o.w * 0.38, o.h / 2 - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-o.w * 0.22, -o.h * 0.05, o.w * 0.44, o.h * 0.14);
    ctx.fillStyle = '#ff7a3d';
    ctx.fillRect(-o.w * 0.48, o.h / 2 - 8, o.w * 0.96, 8);
    ctx.strokeRect(-o.w * 0.48, o.h / 2 - 8, o.w * 0.96, 8);
  } else {
    // kaya
    ctx.fillStyle = '#a7a2b5';
    ctx.beginPath();
    ctx.moveTo(-o.w / 2, o.h / 2);
    ctx.quadraticCurveTo(-o.w / 2, -o.h / 3, -o.w * 0.1, -o.h / 2);
    ctx.quadraticCurveTo(o.w / 2, -o.h / 2, o.w / 2, o.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-o.w * 0.12, -o.h * 0.15, o.w * 0.1, o.h * 0.06, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
