/**
 * Birlikte boyama (çevrimiçi, sırayla): bir ders çiziminin boyama sayfası; her sırada COOP_MOVES_PER_TURN boyama.
 * Hamleler (boya kovası: nokta + renk) iki cihazda aynı sırayla uygulanır; yalnızca yeni hamleler eklenir.
 */
import { ArrowLeft, Check, Hand, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AvatarArt } from '../components/Avatars';
import { Doodles } from '../components/Doodles';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { BASE_COLORS, PencilPalette, useToolState } from '../components/DrawTools';
import { Confirm, useSize, useToast } from '../components/ui';
import { DrawingDoc } from '../engine/drawingDoc';
import type { DrawAction, FillAction } from '../engine/types';
import { getLesson } from '../lessons';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { dative, locative, uid } from '../lib/util';
import { online } from '../online';
import { useOnlineView } from '../online/OnlineHost';
import { COOP_MOVES_PER_TURN, otherOf, type Coop as CoopDoc } from '../online/types';
import { useApp, useProfile } from '../store/useApp';
import { coloringPage } from './FreeDraw';

const toFill = (m: CoopDoc['moves'][number]): FillAction => ({ kind: 'fill', color: m.color, at: m.at, ...(m.pattern ? { pattern: m.pattern as FillAction['pattern'] } : {}) });

export default function Coop() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const v = useOnlineView();
  const profile = useProfile();
  const settings = useApp((s) => s.settings);
  const recordDrawing = useApp((s) => s.recordDrawing);
  const [coop, setCoop] = useState<CoopDoc | null | undefined>(undefined);
  const [toast, showToast] = useToast();
  const [confirmDone, setConfirmDone] = useState(false);
  const doc = useMemo(() => new DrawingDoc(), []);
  const ts = useToolState({ tool: 'fill', color: BASE_COLORS[3] });
  const applied = useRef(-1); // uygulanan hamle sayısı (-1: sayfa henüz kurulmadı)
  const remote = useRef(false);
  const pending = useRef(false); // yerelde boyandı, sunucudan onay bekleniyor (aynı anda tek hamle)
  const [waiting, setWaiting] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    let off: (() => void) | undefined;
    void online().then((c) => (off = c.watchDoc<CoopDoc>('coops', id, setCoop)));
    return () => off?.();
  }, [id]);

  const me = v?.me;
  const lesson = coop ? getLesson(coop.lessonId) : undefined;
  const friend = coop && me ? otherOf(coop, me) : undefined;
  const fname = (friend && v?.players[friend]?.name) || 'Arkadaşın';
  const myTurn = !!coop && coop.turnOf === me && coop.state !== 'done';
  let usedThisTurn = 0;
  if (coop && me) for (let i = coop.moves.length - 1; i >= 0 && coop.moves[i].by === me; i--) usedThisTurn++;

  // Davet edilen taraf açınca oyun başlar
  useEffect(() => {
    if (coop && me && coop.state === 'invited' && coop.from !== me) void online().then((c) => c.setCoopState(id, 'playing'));
  }, [coop?.state, me]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hamleleri sırayla uygula (yalnızca yenileri; bekleyen kendi hamlem zaten tuvalde)
  useEffect(() => {
    if (!coop || !lesson) return;
    remote.current = true;
    if (applied.current < 0 || coop.moves.length < applied.current) {
      doc.setActions([...coloringPage(lesson), ...coop.moves.map(toFill)] as DrawAction[]);
      pending.current = false;
    } else if (coop.moves.length > applied.current) {
      let next = coop.moves.slice(applied.current);
      if (pending.current && next[0].by === me) next = next.slice(1);
      pending.current = false;
      for (const m of next) doc.commit(toFill(m));
    }
    if (!pending.current) setWaiting(false);
    applied.current = coop.moves.length;
    remote.current = false;
    if (coop.state === 'done' && !saved.current && profile) {
      saved.current = true;
      void doc.toBlob().then((blob) => saveArtwork({ id: uid(), profileId: profile.id, lessonId: lesson.id, kind: 'free', createdAt: Date.now(), blob }));
      recordDrawing('free');
      sfx.fanfare();
    }
  }, [coop, lesson]); // eslint-disable-line react-hooks/exhaustive-deps

  // Kendi boyamam: yerelde hemen görünür, sonra paylaşılır; onay gelene dek yeni boyama yok, reddedilirse geri alınır
  useEffect(
    () =>
      doc.onChange(() => {
        if (remote.current || !me || !coop || !lesson) return;
        const last = doc.actions[doc.actions.length - 1];
        if (!last || last.kind !== 'fill') return;
        if (pending.current || doc.actions.length !== coloringPage(lesson).length + applied.current + 1) {
          // sırası dışında kalan yerel boyama: paylaşılmadığı için geri alınır
          remote.current = true;
          doc.undo();
          remote.current = false;
          return;
        }
        pending.current = true;
        setWaiting(true);
        sfx.select();
        const move = { by: me, color: last.color, at: [Math.round(last.at[0]), Math.round(last.at[1])] as [number, number], ...(last.pattern && last.pattern !== 'solid' ? { pattern: last.pattern } : {}) };
        void online()
          .then((c) => c.coopMove(id, me, move))
          .catch(() => {
            if (!pending.current) return;
            pending.current = false;
            setWaiting(false);
            remote.current = true;
            doc.undo();
            remote.current = false;
            showToast('Bu boyama gönderilemedi. İnternet bağlantısını kontrol et.');
          });
      }),
    [doc, me, coop, lesson, id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!v) return <Center title="Çevrimiçi arkadaşlar kapalı" onBack={() => nav('/atolye')} />;
  if (coop === undefined || !lesson) return <Center title="Bağlanıyor…" onBack={() => nav('/arkadaslar')}><Loader2 className="spin" size={40} /></Center>;
  if (coop === null) return <Center title="Bu boyama artık yok" onBack={() => nav('/arkadaslar')} />;

  const done = coop.state === 'done';
  return (
    <div className={`player desk ${settings.leftHanded ? 'player--left' : ''} ${myTurn ? 'player--palette' : ''}`}>
      <header className="player__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav('/arkadaslar')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        <div className="player__title duel-title">
          <AvatarArt id={profile?.avatar ?? 'kedi'} size={30} /> <b>{profile?.name}</b>
          <span className="live-vs-mini">+</span>
          <AvatarArt id={(friend && v.players[friend]?.avatar) || 'kedi'} size={30} /> <b>{fname}</b>
        </div>
        <span />
      </header>

      <CoopStage doc={doc} color={ts.color} pattern={ts.pattern} disabled={!myTurn || waiting} palmRejection={settings.palmRejection} />

      <div className={`coop-turn ${myTurn ? 'mine' : ''}`} aria-live="polite">
        {done ? (
          <><Check size={20} /> Resminiz bitti! Galerine kaydedildi.</>
        ) : myTurn ? (
          <><Hand size={20} /> Sıra sende: {COOP_MOVES_PER_TURN - usedThisTurn} boyama hakkın var</>
        ) : (
          <><Loader2 className="spin" size={18} /> Sıra {locative(fname)}… Boyadıkları burada görünecek.</>
        )}
      </div>

      {myTurn && <div className="palette-float"><PencilPalette ts={ts} /></div>}
      <footer className="player__bottom player__bottom--end">
        {!done && myTurn && usedThisTurn > 0 && (
          <button className="pill pill--ghost pill--sm" onClick={() => friend && online().then((c) => c.setCoopState(id, 'playing', friend))}>Sırayı {dative(fname)} ver</button>
        )}
        {!done ? (
          <button className="pill pill--yellow" onClick={() => setConfirmDone(true)}><Save size={20} /> Resim bitti</button>
        ) : (
          <button className="pill" onClick={() => nav('/arkadaslar')}>Arkadaşlarım</button>
        )}
      </footer>
      {confirmDone && (
        <Confirm title="Resim bitti mi?" text={`Bitirince ikinizin de galerisine kaydedilir; ${fname} da görür.`} yes="Bitti" onNo={() => setConfirmDone(false)}
          onYes={() => { setConfirmDone(false); void online().then((c) => c.setCoopState(id, 'done')); }} />
      )}
      {toast}
    </div>
  );
}

/** Kâğıt ve tuval; ölçüsünü kendisi alır (useSize yalnızca ilk bağlanmada gözlemler, "Bağlanıyor" ekranında bu alan yoktur). */
function CoopStage({ doc, color, pattern, disabled, palmRejection }: {
  doc: DrawingDoc; color: string; pattern: FillAction['pattern']; disabled: boolean; palmRejection: boolean;
}) {
  const [wrapRef, box] = useSize<HTMLDivElement>();
  const S = Math.floor(Math.min(box.w, box.h) * 0.94);
  return (
    <div className="player__wrap" ref={wrapRef}>
      {S > 0 && (
        <div className="sheet" style={{ width: S, height: S }}>
          <div className="stage" style={{ width: S * 0.96, height: S * 0.96 }}>
            <DrawingCanvas doc={doc} tool="fill" color={color} size={8} pattern={pattern} disabled={disabled} palmRejection={palmRejection} />
          </div>
        </div>
      )}
    </div>
  );
}

function Center({ title, onBack, children }: { title: string; onBack: () => void; children?: React.ReactNode }) {
  return (
    <div className="bg live-center">
      <Doodles variant={1} />
      <header className="duel-setup__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={onBack}><ArrowLeft size={26} strokeWidth={2.6} /></button>
      </header>
      <div className="live-center__body rise"><h1 className="title-xl">{title}</h1>{children}</div>
    </div>
  );
}
