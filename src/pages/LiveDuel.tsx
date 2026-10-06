/**
 * Canlı düello (çevrimiçi): iki arkadaş aynı resmi aynı anda, kendi cihazlarında çizer; sonuçlar birlikte açılır.
 * Akış: davet → (arkadaş kabul eder) → iki cihazda 3-2-1 → bakarak ya da hafızadan 60 sn çizim → sonuç gönderilir →
 * arkadaşın sonucu gelince Reveal. Arkadaş kaybolursa 90 sn sonra kendi sonucunla çıkılabilir.
 */
import { ArrowLeft, Check, Loader2, RotateCcw, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AvatarArt } from '../components/Avatars';
import { Doodles } from '../components/Doodles';
import { PencilPalette, ToolCapsule, useToolState } from '../components/DrawTools';
import { SketchImg } from '../components/Sketch';
import { useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import { scoreFreehand } from '../engine/scoring';
import { getLesson, lessons } from '../lessons';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { uid } from '../lib/util';
import { online } from '../online';
import { smallImage } from '../online/image';
import { useOnlineView } from '../online/OnlineHost';
import { otherOf, type Duel, type PlayResult } from '../online/types';
import { useApp, useProfile } from '../store/useApp';
import { DuelStage, Reveal } from './Duel';

const DRAW_SECONDS = 60;
const LOOK_SECONDS = 6;
const INVITE_MS = 2 * 60_000;
const WAIT_FRIEND_MS = 90_000;

type Phase = 'wait' | 'count' | 'show' | 'draw' | 'sent' | 'reveal' | 'gone';

export const randomDuelLesson = (except?: string) => {
  const pool = lessons.filter((l) => l.level <= 2 && l.id !== except);
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function LiveDuel() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const v = useOnlineView();
  const profile = useProfile();
  const settings = useApp((s) => s.settings);
  const recordDuel = useApp((s) => s.recordDuel);
  const [duel, setDuel] = useState<Duel | null | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>('wait');
  const [count, setCount] = useState(3);
  const [left, setLeft] = useState(DRAW_SECONDS);
  const [mine, setMine] = useState<PlayResult | null>(null);
  const [now, setNow] = useState(Date.now());
  const [toast, showToast] = useToast();
  const doc = useMemo(() => new DrawingDoc(), []);
  const ts = useToolState({ tool: 'pencil', color: '#2f2f36' });
  const finishing = useRef(false);
  const recorded = useRef(false);
  const sentAt = useRef(0);

  // Belgeyi canlı izle
  useEffect(() => {
    let off: (() => void) | undefined;
    void online().then((c) => (off = c.watchDoc<Duel>('duels', id, setDuel)));
    return () => off?.();
  }, [id]);

  const me = v?.me;
  const friend = duel && me ? otherOf(duel, me) : undefined;
  const lesson = duel ? getLesson(duel.lessonId) : undefined;
  const friendInfo = friend ? v?.players[friend] : undefined;

  // Davet linkinden gelindiyse kabul et
  useEffect(() => {
    if (duel && me && duel.state === 'invited' && duel.from !== me && params.get('kabul') === '1')
      void online().then((c) => c.setDuelState(id, 'countdown'));
  }, [duel?.state, me]); // eslint-disable-line react-hooks/exhaustive-deps

  // Arkadaş kabul edince (ya da kabul eden biz isek) geri sayım başlar — her cihazda bir kez
  useEffect(() => {
    if (duel?.state === 'countdown' && phase === 'wait') {
      setCount(3);
      setPhase('count');
      sfx.pop();
    }
  }, [duel?.state, phase]);

  // Saatler: davet süresi, geri sayım, bakma ve çizim
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (phase === 'count') {
      if (count <= 0) {
        doc.clear();
        if (duel?.mode === 'memory') {
          setLeft(LOOK_SECONDS);
          setPhase('show');
        } else {
          setLeft(DRAW_SECONDS);
          setPhase('draw');
        }
        return;
      }
      const t = setTimeout(() => { setCount((n) => n - 1); sfx.tap(); }, 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'show' || phase === 'draw') {
      if (left <= 0) {
        if (phase === 'show') {
          setLeft(DRAW_SECONDS);
          setPhase('draw');
        } else void finish(true);
        return;
      }
      const t = setTimeout(() => { setLeft((n) => n - 1); if (left <= 4) sfx.tap(); }, 1000);
      return () => clearTimeout(t);
    }
  }, [phase, count, left]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = async (timeUp = false) => {
    if (finishing.current || !lesson || !me) return;
    const strokes = doc.strokes((s) => s.tool !== 'eraser');
    if (!strokes.length && !timeUp) return showToast('Önce bir şeyler çiz!');
    finishing.current = true;
    const res = strokes.length ? scoreFreehand(lesson.steps.flatMap((s) => s.shapes), strokes) : { score: 0, stars: 0 };
    const image = await smallImage(doc);
    const r: PlayResult = { percent: Math.round(res.score * 100), stars: res.stars, image, at: Date.now() };
    setMine(r);
    setPhase('sent');
    sentAt.current = Date.now();
    sfx.success();
    if (profile && strokes.length) void saveArtwork({ id: uid(), profileId: profile.id, lessonId: lesson.id, kind: 'free', stars: r.stars, createdAt: Date.now(), blob: await doc.toBlob() });
    try {
      await (await online()).submitDuel(id, me, r);
    } catch {
      showToast('Sonucun gönderilemedi. İnternet bağlantısını kontrol et.');
    }
  };

  // İki sonuç da geldiyse açıklama
  const theirs = duel && friend ? duel.results[friend] : undefined;
  useEffect(() => {
    if (phase === 'sent' && mine && theirs) {
      setPhase('reveal');
      if (!recorded.current && profile) {
        recorded.current = true;
        recordDuel(profile.id, mine.stars, mine.percent > theirs.percent);
        if (duel && duel.state !== 'done') void online().then((c) => c.setDuelState(id, 'done'));
      }
    }
    if (phase === 'sent' && !theirs && now - sentAt.current > WAIT_FRIEND_MS) setPhase('gone');
  }, [phase, mine, theirs, now]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    if (duel && (duel.state === 'invited' || (duel.state === 'countdown' && phase !== 'reveal' && !mine))) void online().then((c) => c.setDuelState(id, 'cancelled'));
    nav('/arkadaslar');
  };

  const rematch = async () => {
    if (!me || !friend || !duel) return;
    try {
      const next = await (await online()).inviteDuel(me, friend, randomDuelLesson(duel.lessonId).id, duel.mode);
      nav(`/canli/${next}`, { replace: true });
      setPhase('wait');
      setMine(null);
      finishing.current = false;
      recorded.current = false;
    } catch {
      showToast('Davet gönderilemedi.');
    }
  };

  // ------------------------------------------------------------------ ekranlar
  if (!v) {
    return (
      <Centered title="Çevrimiçi arkadaşlar kapalı" onBack={() => nav('/atolye')}>
        <p className="sub">Ebeveyn bölümünden açılabilir.</p>
      </Centered>
    );
  }
  if (duel === undefined || !lesson) return <Centered title="Bağlanıyor…" onBack={leave}><Loader2 className="spin" size={40} /></Centered>;
  if (duel === null) return <Centered title="Bu düello artık yok" onBack={() => nav('/arkadaslar')} />;
  const fname = friendInfo?.name ?? 'Arkadaşın';

  if (phase === 'reveal' && mine && theirs) {
    const players = [
      { key: 'me', name: profile?.name ?? 'Sen', avatar: profile?.avatar ?? 'kedi' },
      { key: 'friend', name: fname, avatar: friendInfo?.avatar ?? 'kedi' },
    ];
    return (
      <Reveal lesson={lesson} players={players} results={[mine, theirs]} actions={
        <>
          <button className="pill" onClick={rematch}><RotateCcw size={20} /> Rövanş</button>
          <button className="pill pill--ghost pill--sm" onClick={() => nav('/arkadaslar')}><Users size={18} /> Arkadaşlarım</button>
        </>
      } />
    );
  }

  if (phase === 'wait') {
    const expired = duel.state === 'invited' && now - duel.createdAt > INVITE_MS;
    const declined = duel.state === 'declined' || duel.state === 'cancelled' || expired;
    const incoming = duel.state === 'invited' && duel.from !== v.me;
    return (
      <Centered title={declined ? `${fname} şu an gelemedi` : incoming ? `${fname} seni düelloya çağırıyor!` : `${fname} bekleniyor…`} onBack={leave}>
        <div className="live-wait">
          <AvatarArt id={profile?.avatar ?? 'kedi'} size={80} ring />
          <span className="live-wait__vs">VS</span>
          <AvatarArt id={friendInfo?.avatar ?? 'kedi'} size={80} ring />
        </div>
        <div className="live-wait__lesson"><SketchImg lesson={lesson} paper pad={14} /><b>{lesson.title}</b><span>{duel.mode === 'memory' ? 'Hafızadan' : 'Bakarak'} · {DRAW_SECONDS} sn</span></div>
        {incoming && !declined ? (
          <div className="modal-actions">
            <button className="btn-outline" onClick={() => { void online().then((c) => c.setDuelState(id, 'declined')); nav('/arkadaslar'); }}>Şimdi değil</button>
            <button className="btn-dark" onClick={() => void online().then((c) => c.setDuelState(id, 'countdown'))}>Kabul et</button>
          </div>
        ) : declined ? (
          <button className="pill" onClick={() => nav('/arkadaslar')}>Arkadaşlarım</button>
        ) : (
          <>
            <p className="sub">{fname} uygulamayı açınca daveti görecek. Davet {Math.max(0, Math.ceil((INVITE_MS - (now - duel.createdAt)) / 1000))} saniye geçerli.</p>
            <button className="pill pill--ghost pill--sm" onClick={leave}><X size={18} /> Vazgeç</button>
          </>
        )}
      </Centered>
    );
  }

  if (phase === 'count') {
    return (
      <div className="bg live-count">
        <Doodles variant={2} />
        <p className="sub">{lesson.title} · {duel.mode === 'memory' ? `${LOOK_SECONDS} saniye bak, sonra çiz` : 'Örneğe bakarak çiz'}</p>
        <span key={count} className="live-count__n pop-in">{count > 0 ? count : 'Başla!'}</span>
        <div className="live-wait">
          <AvatarArt id={profile?.avatar ?? 'kedi'} size={64} />
          <span className="live-wait__vs">VS</span>
          <AvatarArt id={friendInfo?.avatar ?? 'kedi'} size={64} />
        </div>
      </div>
    );
  }

  if (phase === 'sent' || phase === 'gone') {
    return (
      <Centered title={phase === 'gone' ? `${fname} çizimini gönderemedi` : `${fname} çizmeyi bitiriyor…`} onBack={() => nav('/arkadaslar')}>
        {mine && (
          <figure className="live-mine">
            <img src={mine.image} alt="Senin çizimin" />
            <figcaption>Senin çizimin · %{mine.percent}</figcaption>
          </figure>
        )}
        {phase === 'sent' ? <Loader2 className="spin" size={36} /> : <button className="pill" onClick={() => nav('/arkadaslar')}>Arkadaşlarım</button>}
      </Centered>
    );
  }

  // bakma / çizim
  return (
    <div className={`player desk ${settings.leftHanded ? 'player--left' : ''} ${phase === 'draw' ? 'player--tools player--palette' : ''}`}>
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Düellodan çık" onClick={leave}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        <div className="player__title duel-title">
          <AvatarArt id={profile?.avatar ?? 'kedi'} size={30} /> <b>{profile?.name}</b>
          <span className="live-vs-mini">VS</span>
          <AvatarArt id={friendInfo?.avatar ?? 'kedi'} size={30} /> <b>{fname}</b>
        </div>
        <span className={`countdown ${left <= 5 ? 'hurry' : ''}`} aria-live="polite">{left}</span>
      </header>
      <DuelStage showExample={phase === 'show'} lesson={lesson} doc={doc} ts={ts} disabled={phase !== 'draw'} palmRejection={settings.palmRejection} />
      {phase === 'draw' && duel.mode === 'look' && (
        <div className="ref-float">
          <SketchImg lesson={lesson} paper pad={20} />
          <span>Örnek</span>
        </div>
      )}
      {phase === 'draw' && (
        <>
          <div className="tools-float"><ToolCapsule doc={doc} ts={ts} tools={['pencil', 'crayon', 'marker', 'eraser']} clear={false} /></div>
          <div className="palette-float"><PencilPalette ts={ts} /></div>
          <footer className="player__bottom player__bottom--end">
            <button className="pill pill--yellow" onClick={() => void finish()}>Bitti <Check size={22} /></button>
          </footer>
        </>
      )}
      {toast}
    </div>
  );
}

function Centered({ title, onBack, children }: { title: string; onBack: () => void; children?: React.ReactNode }) {
  return (
    <div className="bg live-center">
      <Doodles variant={1} />
      <header className="duel-setup__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={onBack}><ArrowLeft size={26} strokeWidth={2.6} /></button>
      </header>
      <div className="live-center__body rise">
        <h1 className="title-xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
