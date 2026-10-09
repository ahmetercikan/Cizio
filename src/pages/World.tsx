/**
 * Çizio Adası (/ada): 3B oyun dünyası (src/world/island.ts). Şimdilik herkese açık (PLUS_ENABLED = false);
 * ücretli olursa abonelik yoksa tanıtım ve satın alma (ebeveyn kilidi arkasında) gösterilir.
 */
import { ArrowLeft, Check, Crown, Hand, Home, Images, Loader2, MessageCircle, PartyPopper, RotateCcw, Shirt, Sparkles, Star, Users, X, Map as MapIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarArt } from '../components/Avatars';
import { Doodles } from '../components/Doodles';
import { Mascot } from '../components/Mascot';
import { Modal } from '../components/ui';
import { PRESETS } from '../dressup/catalog';
import { Doll } from '../dressup/Doll';
import { listArtworks, type Artwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/speech';
import { dayKey, hashStr } from '../lib/util';
import { ISLAND_REWARD, useApp, useProfile, useProfileData } from '../store/useApp';
import type { Island, Spot } from '../world/island';
import { coastAt, LAKE, SNOW_PEAK, WORLD_R, ZONES, type Zone } from '../world/layout';
import { buyPlus, canBuy, managePlus, PLUS_ENABLED, restorePlus, usePlus } from '../world/plus';
import { ISLAND_LINES, QUESTS, STARS_GOAL, todayQuests, type QuestId } from '../world/quests';
import { Gate } from './Parent';
import { ISLAND_ONLINE } from '../online/config';
import { useOnlineView } from '../online/OnlineHost';
import type { Presence, RoomHandle } from '../online/rt';

export default function World() {
  const owned = usePlus((s) => s.owned);
  return owned ? <IslandPlay /> : <Paywall />;
}

// ------------------------------------------------------------------------------------------------
// Tanıtım ve satın alma
// ------------------------------------------------------------------------------------------------
function Paywall() {
  const nav = useNavigate();
  const data = useProfileData();
  const { price, busy, error, status } = usePlus();
  const [gate, setGate] = useState(false);
  const doll = data.doll ?? PRESETS[0];
  const android = canBuy();
  return (
    <div className="bg paywall">
      <Doodles variant={2} />
      <header className="paywall__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav('/')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
      </header>
      <main className="paywall__main rise">
        <div className="paywall__hero">
          <IslandArt />
          <span className="paywall__doll"><Doll d={doll} bg={false} viewBox="20 -10 260 440" /></span>
        </div>
        <div className="paywall__text">
          <span className="paywall__badge"><Crown size={18} /> Çizio Plus</span>
          <h1 className="title-xl">Çizio Adası</h1>
          <p className="sub">Giydirdiğin karakterle 3 boyutlu bir adada dolaş, oyna, keşfet!</p>
          <ul className="paywall__list">
            <li><Check size={20} /> Kendi karakterinle adada özgürce gez</li>
            <li><Check size={20} /> Kaydırak, salıncak, dans pisti ve tekne turu</li>
            <li><Check size={20} /> Sanat galerisinde kendi resimlerin sergileniyor</li>
            <li><Check size={20} /> Her gün yeni görevler ve yıldız avı</li>
            <li><Check size={20} /> Reklam yok, mesajlaşma yok, çocuklar için güvenli</li>
          </ul>
          {android ? (
            <>
              <button className="pill paywall__buy" disabled={busy || status === 'loading'} onClick={() => setGate(true)}>
                {busy ? <Loader2 className="spin" size={22} /> : <Crown size={22} />} Yıllık {price}
              </button>
              <p className="paywall__fine">
                Satın alma için bir büyüğün onayı gerekir. Abonelik her yıl kendiliğinden yenilenir; Google Play &gt; Abonelikler'den istediğiniz zaman iptal edebilirsiniz.
              </p>
              <div className="paywall__links">
                <button className="btn-outline btn-outline--sm" disabled={busy} onClick={() => void restorePlus()}><RotateCcw size={16} /> Satın alımı geri yükle</button>
              </div>
              {status === 'unavailable' && !error && <p className="online-send__err">Google Play'e şu an bağlanılamıyor. İnternet bağlantısını ve Play Store'u kontrol edip tekrar deneyin.</p>}
              {error && <p className="online-send__err">{error}</p>}
            </>
          ) : (
            <p className="paywall__fine">Çizio Adası, Çizio'nun Android uygulamasında açılır. Google Play'den Çizio'yu indirip Ebeveyn bölümünden Çizio Plus'a geçebilirsiniz.</p>
          )}
        </div>
      </main>
      {gate && <Gate onCancel={() => setGate(false)} onPass={() => { setGate(false); void buyPlus(); }} />}
    </div>
  );
}

function IslandArt() {
  return (
    <svg viewBox="0 0 320 220" className="paywall__island" aria-hidden="true">
      <ellipse cx="160" cy="180" rx="150" ry="34" fill="#3fb7dd" />
      <ellipse cx="160" cy="168" rx="122" ry="30" fill="#f3dca2" stroke="#3a2b27" strokeWidth="4" />
      <ellipse cx="160" cy="160" rx="104" ry="24" fill="#8fd16f" stroke="#3a2b27" strokeWidth="4" />
      <rect x="70" y="112" width="44" height="38" fill="#ffd166" stroke="#3a2b27" strokeWidth="4" />
      <path d="M62,114 L92,88 L122,114 Z" fill="#e05a4f" stroke="#3a2b27" strokeWidth="4" strokeLinejoin="round" />
      <path d="M220,150 L226,104 L232,150" fill="none" stroke="#9b6b43" strokeWidth="6" />
      <circle cx="226" cy="98" r="20" fill="#5cc36b" stroke="#3a2b27" strokeWidth="4" />
      <path d="M150,154 L176,118 L176,154" fill="#ffc83d" stroke="#3a2b27" strokeWidth="4" strokeLinejoin="round" />
      <path d="M262,40 l5,11 12,2 -9,8 2,12 -10,-6 -10,6 2,-12 -9,-8 12,-2 Z" fill="#ffc83d" stroke="#3a2b27" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

// ------------------------------------------------------------------------------------------------
// Oyun
// ------------------------------------------------------------------------------------------------
/** Adada dolaşan kâğıt kartların ders çizimleri. */
const CARD_IDS = ['ayi', 'tilki', 'tavsan', 'baykus', 'kedi', 'kopek', 'penguen', 'trex', 'triceratops', 'uzun-boyun', 'stegozor', 'ucan-dinozor', 'dino-yumurta', 'prenses', 'sovalye', 'balik', 'denizyildizi', 'ahtapot', 'denizati', 'yengec'];

function IslandPlay() {
  const nav = useNavigate();
  const profile = useProfile()!;
  const data = useProfileData();
  const settings = useApp((s) => s.settings);
  const { islandStar, islandDone, islandReward } = useApp.getState();
  const ref = useRef<HTMLCanvasElement>(null);
  const world = useRef<Island | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState<Spot | null>(null);
  const [busy, setBusy] = useState(false);
  const [driving, setDriving] = useState(false);
  const [panel, setPanel] = useState<'quests' | 'gallery' | 'map' | 'friends' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState({ x: 0, z: 12, h: 0 });
  // Birlikte oynama (Realtime Database): oda = adanın sahibinin pid'i
  const ov = useOnlineView();
  const myId = data.online?.pid;
  const [room, setRoom] = useState<string | null>(null);
  const [peerNames, setPeerNames] = useState<string[]>([]);
  const [presence, setPresence] = useState<Record<string, Presence | null>>({});
  const [rtReady, setRtReady] = useState(false);
  const rt = useRef<typeof import('../online/rt') | null>(null);
  const handle = useRef<RoomHandle | null>(null);
  const goTo = useRef<string | null>(null);
  const known = useRef<Set<string>>(new Set());
  const friends = ov?.friends ?? [];
  const friendKey = friends.map((f) => f.pid).join(',');
  const day = dayKey();
  const island = data.island?.day === day ? data.island : { day, stars: [], done: [] as string[], rewarded: false };
  const quests = useMemo(() => todayQuests(profile.id, day), [profile.id, day]);
  const questDone = (q: QuestId) => (q === 'stars' ? island.stars.length >= STARS_GOAL : island.done.includes(q));
  const allDone = quests.every(questDone);
  const say = (t: string) => settings.narration && speak(t, { rate: settings.rate });
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast((x) => (x === t ? null : x)), 2400);
  };

  // Ada kurulumu
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [{ Island }, tex] = await Promise.all([import('../world/island'), import('../world/textures')]);
        const doll = data.doll ?? PRESETS[0];
        const [pet, art, mascot, cards] = await Promise.all([
          doll.pet ? tex.petCanvas(doll) : Promise.resolve(null),
          tex.artCanvases(profile.id),
          tex.mascotCanvas(),
          Promise.all(CARD_IDS.map(async (id) => [id, await tex.lessonCanvas(id)] as const)),
        ]);
        if (!alive || !ref.current) return;
        world.current = new Island(ref.current, {
          doll, pet, art, tex: { ...Object.fromEntries(cards), maskot: mascot }, taken: island.stars, starSeed: hashStr(`${day}|${profile.id}|yildiz`),
        }, {
          onNear: setNear,
          onStar: (id) => {
            islandStar(id);
            const n = useApp.getState().data[profile.id]?.island?.stars.length ?? 0;
            if (n === STARS_GOAL) {
              flash('Görev tamam: 5 yıldız!');
              say(ISLAND_LINES.questDone);
            }
          },
          onDone: (q) => doneRef.current(q),
          onBusy: setBusy,
          onDrive: setDriving,
          onMessage: flash,
          onPos: (x, z, h) => setMe({ x, z, h }),
          onPage: (id) => pageRef.current(id),
          sound: { star: (i) => sfx.star(i % 6), pop: () => sfx.pop(), note: (i) => sfx.note(i), kick: () => sfx.kick() },
        });
        setReady(true);
        if (import.meta.env.DEV) (window as unknown as { __island?: Island }).__island = world.current;
        say(ISLAND_LINES.welcome);
      } catch (e) {
        console.error(e);
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
      world.current?.dispose();
      world.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || !myId || !ISLAND_ONLINE) return;
    let alive = true;
    void (async () => {
      try {
        const r = await import('../online/rt');
        if (!alive) return;
        rt.current = r;
        await r.claim(myId);
        setRtReady(true);
        await enter(myId);
      } catch {
        /* çevrimdışı: tek başına oynanır */
      }
    })();
    const send = setInterval(() => {
      const w = world.current;
      if (w && handle.current) handle.current.send({ ...w.liveState(), n: profile.name });
    }, 200);
    return () => {
      alive = false;
      clearInterval(send);
      void handle.current?.leave();
      handle.current = null;
    };
  }, [ready, myId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Kendi adama yalnızca onaylı arkadaşlarım girebilsin (arkadaş listesi değişince güncellenir)
  useEffect(() => {
    if (!rtReady || !myId || !rt.current) return;
    const owners = friends.map(({ f, pid }) => f.owners[f.members.indexOf(pid)]).filter((u): u is string => !!u);
    void rt.current.allowFriends(myId, owners).catch(() => {});
  }, [rtReady, friendKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Arkadaşlarım şu an adada mı?
  useEffect(() => {
    if (!rtReady || !rt.current || !friends.length) return;
    return rt.current.watchPresence(friends.map((f) => f.pid), setPresence);
  }, [rtReady, friendKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const markDone = (q: string) => {
    if (!(q in QUESTS) || !quests.includes(q as QuestId) || questDone(q as QuestId)) return;
    islandDone(q);
    flash(`Görev tamam: ${QUESTS[q as QuestId]}`);
    say(ISLAND_LINES.questDone);
  };
  const page = (id: string) => {
    if (id === 'gallery') {
      setPanel('gallery');
      markDone('gallery');
    } else if (id === 'cizio') {
      setPanel('quests');
      say(allDone ? (island.rewarded ? ISLAND_LINES.doneToday : ISLAND_LINES.allDone) : ISLAND_LINES.hello);
    } else if (id === 'home') {
      markDone('home');
      nav('/giydir');
    }
  };
  const doneRef = useRef(markDone);
  doneRef.current = markDone;
  const pageRef = useRef(page);
  pageRef.current = page;

  // Dokunarak yürüme / sürükleyerek kamerayı döndürme
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 10) d.moved = true;
    if (d.moved) {
      world.current?.rotateCamera(dx);
      d.x = e.clientX;
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) world.current?.tapTo(e.clientX, e.clientY);
  };

  if (failed) {
    return (
      <div className="bg live-center">
        <div className="live-center__body"><h1 className="title-xl">Ada bu cihazda açılamadı</h1><button className="pill" onClick={() => nav('/')}>Geri dön</button></div>
      </div>
    );
  }
  const claim = () => {
    const n = islandReward();
    if (n) {
      sfx.fanfare();
      flash(`+${n} yıldız!`);
    }
  };
  /** Bir odaya gir (kendi adam ya da bir arkadaşın adası). */
  const enter = async (roomId: string, friendPid?: string) => {
    const r = rt.current;
    if (!r || !myId) return;
    await handle.current?.leave();
    handle.current = null;
    world.current?.setPeers({});
    known.current = new Set();
    goTo.current = friendPid ?? null;
    try {
      const h = await r.joinRoom(roomId, myId, data.doll ?? PRESETS[0], (peers) => {
        world.current?.setPeers(peers);
        const live = Object.entries(peers).filter(([, p]) => p.live && p.look);
        setPeerNames(live.map(([, p]) => p.live!.n));
        for (const [pid, p] of live) {
          if (!known.current.has(pid)) {
            known.current.add(pid);
            if (roomId === myId) flash(`${p.live!.n} adana geldi!`);
          }
        }
        if (goTo.current && peers[goTo.current]?.live && world.current?.goToPeer(goTo.current)) goTo.current = null;
      }, () => flash('Bu ada dolu: bir adada sen ve en çok 10 arkadaşın olabilir.'));
      if (!h) {
        if (roomId !== myId) void enter(myId);
        return;
      }
      handle.current = h;
      setRoom(roomId);
    } catch {
      flash('Arkadaşının adasına şu an girilemiyor.');
      if (roomId !== myId) void enter(myId);
    }
  };

  const travel = (z: Zone) => {
    sfx.pop();
    setPanel(null);
    world.current?.teleport(...z.spawn);
    flash(z.name);
  };

  return (
    <div className="island">
      <canvas ref={ref} className="island__canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => (drag.current = null)} />
      {!ready && <div className="alive__wait"><Mascot size={110} mood="think" /><b>Ada hazırlanıyor…</b></div>}
      <header className="island__top">
        <button className="round-btn round-btn--light" aria-label="Adadan çık" onClick={() => nav('/')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        <button className="island__quests" onClick={() => setPanel('quests')}>
          <Star size={20} fill="#ffc83d" color="#3a2b27" /> {Math.min(island.stars.length, STARS_GOAL)}/{STARS_GOAL}
          <span className="island__qdots">{quests.map((q) => <i key={q} className={questDone(q) ? 'on' : ''} />)}</span>
        </button>
        {ready && (
          <span className="island__right">
            {ISLAND_ONLINE && (
              <button className="island__friends" aria-label="Arkadaşlar" onClick={() => setPanel('friends')}>
                <Users size={22} />
                {peerNames.length > 0 && <b>{peerNames.length + 1}</b>}
              </button>
            )}
            <MiniMap me={me} onOpen={() => setPanel('map')} />
          </span>
        )}
      </header>
      {ready && (
        <>
          {!busy && <Joystick onChange={(x, y) => world.current?.setJoystick(x, y)} />}
          {!driving && !busy && (
            <div className="island__emotes">
              <button className="game__btn" aria-label="El salla" onClick={() => world.current?.emote('wave')}><Hand size={26} /></button>
              <button className="game__btn" aria-label="Zıpla" onClick={() => world.current?.emote('jump')}><PartyPopper size={26} /></button>
              <button className="game__btn" aria-label="Alkışla" onClick={() => world.current?.emote('clap')}><Sparkles size={26} /></button>
            </div>
          )}
          {driving && <button className="pill pill--yellow island__act rise" onClick={() => world.current?.dismount()}>İn</button>}
          {near && !busy && !driving && (
            <button className="pill island__act rise" onClick={() => { sfx.pop(); world.current?.activity(near.id); }}>
              {near.id === 'gallery' ? <Images size={22} /> : near.id === 'home' ? <Shirt size={22} /> : near.id === 'cizio' ? <MessageCircle size={22} /> : <Sparkles size={22} />} {near.label}
            </button>
          )}
        </>
      )}
      {toast && <div className="island__toast pop-in">{toast}</div>}
      {panel === 'quests' && (
        <Modal onClose={() => setPanel(null)}>
          <div className="island__panel">
            <Mascot size={90} mood={allDone ? 'cheer' : 'happy'} />
            <h2 className="title-lg">Bugünün görevleri</h2>
            <ul className="island__qlist">
              {quests.map((q) => (
                <li key={q} className={questDone(q) ? 'done' : ''}>
                  <span className="island__check">{questDone(q) && <Check size={18} strokeWidth={3} />}</span>
                  {QUESTS[q]}{q === 'stars' && ` (${Math.min(island.stars.length, STARS_GOAL)}/${STARS_GOAL})`}
                </li>
              ))}
            </ul>
            {allDone && !island.rewarded ? (
              <button className="pill" onClick={claim}><Star size={20} fill="currentColor" /> {ISLAND_REWARD} yıldızını al</button>
            ) : island.rewarded ? (
              <p className="sub">Bugünkü ödülünü aldın. Yarın yeni görevler gelecek!</p>
            ) : (
              <p className="sub">Hepsini bitirince {ISLAND_REWARD} yıldız kazanırsın. Haritadan istediğin yere hemen gidebilirsin.</p>
            )}
            {PLUS_ENABLED && <button className="btn-outline btn-outline--sm" onClick={() => void managePlus()}><Crown size={16} /> Aboneliği yönet</button>}
          </div>
        </Modal>
      )}
      {panel === 'map' && <BigMap me={me} onPick={travel} onClose={() => setPanel(null)} />}
      {panel === 'friends' && (
        <Modal onClose={() => setPanel(null)}>
          <div className="island__panel">
            <h2 className="title-lg">Adada arkadaşlarım</h2>
            {!myId ? (
              <p className="sub">Arkadaşlarınla birlikte oynamak için bir büyüğünden ebeveyn bölümünde "Çevrimiçi arkadaşlar"ı açmasını iste.</p>
            ) : (
              <>
                <p className="sub">{room && room !== myId ? `${ov?.players[room]?.name ?? 'Arkadaşının'} adasındasın.` : 'Kendi adandasın.'} Bir adada sen ve en çok 10 arkadaşın olabilir.</p>
                {peerNames.length > 0 && <p className="island__here">Burada: {peerNames.join(', ')}</p>}
                {friends.length === 0 && <p className="sub">Henüz arkadaşın yok. Bir büyüğün ebeveyn bölümünden arkadaş ekleyebilir.</p>}
                <ul className="island__flist">
                  {friends.map(({ pid }) => {
                    const pr = presence[pid];
                    const info = ov?.players[pid];
                    const there = pr?.room && pr.room === room;
                    return (
                      <li key={pid}>
                        <AvatarArt id={info?.avatar ?? 'kedi'} size={44} />
                        <span><b>{info?.name ?? 'Arkadaşın'}</b><small>{!pr ? 'Adada değil' : there ? 'Seninle aynı adada' : pr.room === pid ? 'Kendi adasında' : 'Adada'}</small></span>
                        {pr && !there && (
                          <button className="pill pill--sm" onClick={() => { setPanel(null); flash('Yolculuk başlıyor…'); void enter(pr.room, pid); }}>Yanına git</button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {room && room !== myId && (
                  <button className="btn-outline" onClick={() => { setPanel(null); void enter(myId); world.current?.teleport(0, 12); }}><Home size={18} /> Kendi adama dön</button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
      {panel === 'gallery' && <GalleryPanel profileId={profile.id} onClose={() => setPanel(null)} />}
    </div>
  );
}

/** Ada çizimi (küçük ve büyük haritada ortak): kıyı, göl, dağ ve bölgeler. */
function IslandSvg({ me, onPick, labels }: { me: { x: number; z: number; h: number }; onPick?: (z: Zone) => void; labels?: boolean }) {
  const S = 300 / (WORLD_R * 2);
  const P = (x: number, z: number) => [150 + x * S, 150 + z * S];
  const coast = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const [x, y] = P(Math.cos(a) * coastAt(a), Math.sin(a) * coastAt(a));
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + 'Z';
  const [mx, my] = P(me.x, me.z);
  const [lx, ly] = P(LAKE.x, LAKE.z);
  const [sx, sy] = P(SNOW_PEAK.x, SNOW_PEAK.z);
  return (
    <svg viewBox="0 0 300 300" className="island-map" aria-label="Ada haritası">
      <circle cx="150" cy="150" r="150" fill="#3fb7dd" />
      <path d={coast} fill="#f3dca2" stroke="#3a2b27" strokeWidth="2" />
      <path d={coast} fill="#8fd16f" transform="translate(150 150) scale(0.94) translate(-150 -150)" />
      <circle cx={lx} cy={ly} r={LAKE.r * S} fill="#3fb7dd" stroke="#3a2b27" strokeWidth="1.5" />
      <circle cx={sx} cy={sy} r={SNOW_PEAK.r * S * 0.6} fill="#f4f9ff" stroke="#3a2b27" strokeWidth="1.5" />
      {ZONES.map((z) => {
        const [x, y] = P(z.x, z.z);
        return (
          <g key={z.id} onClick={onPick ? () => onPick(z) : undefined} style={onPick ? { cursor: 'pointer' } : undefined}>
            <circle cx={x} cy={y} r={labels ? 11 : 6} fill={z.color} stroke="#3a2b27" strokeWidth="2" />
            {labels && <text x={x} y={y + 24} textAnchor="middle" className="island-map__label">{z.name}</text>}
          </g>
        );
      })}
      <g transform={`translate(${mx} ${my}) rotate(${(-me.h * 180) / Math.PI + 180})`}>
        <circle r={labels ? 7 : 5} fill="#ffffff" stroke="#ef4b4b" strokeWidth="3" />
        <path d="M0,-12 L5,-4 H-5 Z" fill="#ef4b4b" />
      </g>
    </svg>
  );
}

function MiniMap({ me, onOpen }: { me: { x: number; z: number; h: number }; onOpen: () => void }) {
  return (
    <button className="island__mini" aria-label="Haritayı aç" onClick={onOpen}>
      <IslandSvg me={me} />
    </button>
  );
}

function BigMap({ me, onPick, onClose }: { me: { x: number; z: number; h: number }; onPick: (z: Zone) => void; onClose: () => void }) {
  return (
    <Modal onClose={onClose} className="modal--wide">
      <div className="art-view__head">
        <b className="title-lg"><MapIcon size={24} style={{ verticalAlign: '-4px' }} /> Ada haritası</b>
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={onClose}><X /></button>
      </div>
      <p className="sub" style={{ marginTop: 0 }}>Gitmek istediğin yere dokun!</p>
      <div className="island-map__wrap"><IslandSvg me={me} onPick={onPick} labels /></div>
      <div className="island-map__list">
        {ZONES.map((z) => (
          <button key={z.id} className="island-map__chip" style={{ ['--c' as string]: z.color }} onClick={() => onPick(z)}>{z.name}</button>
        ))}
      </div>
    </Modal>
  );
}

function GalleryPanel({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const [items, setItems] = useState<Artwork[]>([]);
  useEffect(() => {
    void listArtworks(profileId).then((a) => setItems(a.filter((x) => x.kind !== 'style').slice(0, 12)));
  }, [profileId]);
  const urls = useMemo(() => items.map((a) => URL.createObjectURL(a.blob)), [items]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return (
    <Modal onClose={onClose} className="modal--wide">
      <div className="art-view__head">
        <b className="title-lg">Sanat galerim</b>
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={onClose}><X /></button>
      </div>
      {items.length === 0 ? <p className="sub">Galerin henüz boş. Bir ders bitirince resmin burada sergilenir.</p> : (
        <div className="island__art">{urls.map((u, i) => <img key={i} src={u} alt="" />)}</div>
      )}
    </Modal>
  );
}

/** Sol alttaki sanal kol: sürükledikçe yön ve hız verir. */
function Joystick({ onChange }: { onChange: (x: number, y: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const R = 46;
  const move = (e: React.PointerEvent) => {
    if (id.current !== e.pointerId) return;
    const r = base.current!.getBoundingClientRect();
    let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(x, y);
    if (l > R) [x, y] = [(x / l) * R, (y / l) * R];
    setKnob({ x, y });
    onChange(x / R, -y / R);
  };
  const end = () => {
    id.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  };
  return (
    <div ref={base} className="joystick" onPointerDown={(e) => { id.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e); }}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label="Yürüme kolu" role="application">
      <span className="joystick__knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
