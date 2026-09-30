/**
 * Ödül arayüzü: günün hediyesi ve hazine sandığı açılır pencereleri (animasyonlu), seviye rozeti,
 * sonuç ekranlarındaki sandık notu. Çizimler el yapımı SVG (mürekkep kontur, düz renk); emoji yok.
 *
 * RewardsHost (uygulama kabuğunda) pencereleri sırayla açar: önce günün hediyesi (günde bir kez; profil
 * bugün oluşturulduysa hiç), sonra bekleyen sandıklar.
 */
import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRESETS, type DollState } from '../dressup/catalog';
import { Doll, REGIONS } from '../dressup/Doll';
import { CHEST_TEXT, GIFT_DAYS, giftEligible, giftStatus, levelOf, walletOf, xpOf, type ChestReason, type RareItem, type Reward } from '../lib/rewards';
import { sfx } from '../lib/sfx';
import { dayKey } from '../lib/util';
import { useApp, useProfile, useProfileData } from '../store/useApp';
import { Modal } from './ui';

const INK = '#3a2b27';
const o = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ------------------------------------------------------------------------------------------------
// Çizimler
// ------------------------------------------------------------------------------------------------
function Rays() {
  return (
    <g className="chest__rays">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M100,70 L${100 + Math.cos(a - 0.12) * 150},${70 + Math.sin(a - 0.12) * 150} L${100 + Math.cos(a + 0.12) * 150},${70 + Math.sin(a + 0.12) * 150} Z`} fill="#ffe08a" opacity="0.55" />;
      })}
      <circle cx="100" cy="70" r="46" fill="#fff5c4" />
    </g>
  );
}

export function ChestArt({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true" overflow="visible">
      {open && <Rays />}
      <path d="M26,82 H174 V154 C174,160 170,164 164,164 H36 C30,164 26,160 26,154 Z" fill="#c9793b" {...o} />
      <path d="M26,104 H174 M26,134 H174" stroke="#a45f2a" strokeWidth="4" />
      <path d="M52,82 V164 M148,82 V164" stroke="#ffc83d" strokeWidth="10" />
      <path d="M52,82 V164 M148,82 V164" stroke={INK} strokeWidth="2" opacity="0.35" />
      <rect x="86" y="92" width="28" height="30" rx="6" fill="#ffc83d" {...o} strokeWidth={3} />
      <circle cx="100" cy="104" r="4" fill={INK} />
      <path d="M100,106 V114" stroke={INK} strokeWidth="3" />
      <g className={`chest__lid ${open ? 'open' : ''}`}>
        <path d="M26,82 V62 C26,34 174,34 174,62 V82 Z" fill="#dc8a47" {...o} />
        <path d="M52,40 V82 M148,40 V82" stroke="#ffc83d" strokeWidth="10" />
        <path d="M40,58 C70,50 130,50 160,58" fill="none" stroke="#fff" strokeWidth="4" opacity="0.35" strokeLinecap="round" />
      </g>
      {!open && (
        <g className="chest__sparks">
          <path d="M22,40 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3 Z" fill="#ffc83d" />
          <path d="M180,30 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2 Z" fill="#ffc83d" />
        </g>
      )}
    </svg>
  );
}

export function GiftArt({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true" overflow="visible">
      {open && <Rays />}
      <rect x="40" y="78" width="120" height="88" rx="12" fill="#ff6b4a" {...o} />
      <path d="M100,78 V166" stroke="#ffc83d" strokeWidth="18" />
      <path d="M100,78 V166" stroke={INK} strokeWidth="2" opacity="0.3" />
      <g className={`gift__lid ${open ? 'open' : ''}`}>
        <rect x="30" y="56" width="140" height="28" rx="8" fill="#ff8a6b" {...o} />
        <path d="M100,56 V84" stroke="#ffc83d" strokeWidth="18" />
        <path d="M100,56 C76,24 50,36 64,52 C72,58 88,58 100,56 C112,58 128,58 136,52 C150,36 124,24 100,56 Z" fill="#ffc83d" {...o} strokeWidth={3.5} />
      </g>
    </svg>
  );
}

function StarBurst({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 120 120" className="reward__stars" aria-hidden="true">
      <path d="M60,10 l14,30 l32,4 l-24,22 l7,32 l-29,-16 l-29,16 l7,-32 l-24,-22 l32,-4 Z" fill="#ffc83d" {...o} />
      <text x="60" y="76" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="30" fill={INK}>+{n}</text>
    </svg>
  );
}

/** Açılışta dışarı saçılan yıldız ve jeton parçacıkları. */
function Particles({ count = 16 }: { count?: number }) {
  return (
    <span className="particles" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 2) * 0.2;
        const dist = 110 + (i % 4) * 28;
        return (
          <i key={i} className={i % 3 === 0 ? 'coin' : i % 3 === 1 ? 'star' : 'spark'}
            style={{ ['--x' as string]: `${Math.cos(a) * dist}px`, ['--y' as string]: `${Math.sin(a) * dist - 30}px`, animationDelay: `${(i % 5) * 40}ms` }} />
        );
      })}
    </span>
  );
}

/** Seviye çubuğu: yeni yıldızlarla dolarken canlandırılır. */
function LevelProgress({ fromXp, toXp }: { fromXp: number; toXp: number }) {
  const [xp, setXp] = useState(fromXp);
  useEffect(() => {
    const t = window.setTimeout(() => setXp(toXp), 350);
    return () => window.clearTimeout(t);
  }, [toXp]);
  const lv = levelOf(xp);
  const up = levelOf(toXp).n > levelOf(fromXp).n && xp === toXp;
  const pct = Math.round(((lv.xp - lv.from) / Math.max(1, lv.to - lv.from)) * 100);
  return (
    <div className={`level-progress ${up ? 'up' : ''}`}>
      <span className="level-progress__n">{lv.n}</span>
      <div>
        <b>{up ? `Seviye atladın! ${lv.name}` : lv.name}</b>
        <span className="level__bar"><i style={{ width: `${pct}%` }} /></span>
        <small>{lv.xp} / {lv.to} yıldız</small>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Hazine sandığı penceresi
// ------------------------------------------------------------------------------------------------
const SLOT_REGION: Record<string, string> = { back: 'back', dress: 'dress', hat: 'hat', pet: 'pet', bg: 'full', shoes: 'shoes' };

/** Nadir eşyayı çocuğun kendi karakterinin üstünde gösterir (dükkan, sandık, Giydir). */
export function RarePreview({ item, className = 'reward__item' }: { item: RareItem; className?: string }) {
  const data = useProfileData();
  const base = data.doll ?? PRESETS[0];
  const d = { ...base, [item.slot]: item.id } as DollState;
  return (
    <div className={className}>
      <Doll d={d} bg={item.slot === 'bg'} viewBox={REGIONS[SLOT_REGION[item.slot]]} />
    </div>
  );
}

function RewardPreview({ reward }: { reward: Reward; base: DollState }) {
  if (reward.kind === 'stars') return <StarBurst n={reward.n + 2} />;
  return <RarePreview item={reward.item} />;
}

/** Cüzdan artışı: eski bakiyeden yeniye sayarak yükselir. */
function WalletGain({ from, to }: { from: number; to: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (to <= from) return setV(to);
    let raf = 0;
    const t0 = performance.now() + 450;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 900));
      setV(Math.round(from + (to - from) * k));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  return (
    <div className="wallet-gain">
      <StarIcon size={26} />
      <span>Yıldız cüzdanın: <b>{v}</b></span>
      {to > from && <em>+{to - from}</em>}
    </div>
  );
}

export function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12,2 l3,6.5 l7,1 l-5,4.8 l1.3,7 l-6.3,-3.4 l-6.3,3.4 l1.3,-7 l-5,-4.8 l7,-1 Z" fill="#ffc83d" stroke="#3a2b27" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Üst çubuktaki yıldız cüzdanı: artınca zıplar; dokununca Yıldız Dükkanı. */
export function StarCounter() {
  const wallet = useApp((s) => (s.activeId && s.data[s.activeId] ? walletOf(s.data[s.activeId]) : 0));
  const prev = useRef(wallet);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (wallet > prev.current) setBump((b) => b + 1);
    prev.current = wallet;
  }, [wallet]);
  return (
    <Link to="/dukkan" className="star-counter" aria-label={`${wallet} yıldız, Yıldız Dükkanı`} title="Yıldız Dükkanı">
      <span key={bump} className={bump ? 'star-counter__icon bump' : 'star-counter__icon'}><StarIcon size={26} /></span>
      <b>{wallet}</b>
    </Link>
  );
}

export function ChestModal({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const data = useProfileData();
  const openChest = useApp((s) => s.openChest);
  const [result, setResult] = useState<{ reason: ChestReason; reward: Reward; fromXp: number; fromWallet: number } | null>(null);
  const [opening, setOpening] = useState(false);
  const pending = data.chests?.length ?? 0;
  const reason = result?.reason ?? data.chests?.[0];
  const level = levelOf(xpOf(data));
  const base = data.doll ?? PRESETS[0];

  const open = () => {
    if (opening || result) return;
    setOpening(true);
    sfx.tap();
    const fromXp = xpOf(data);
    const fromWallet = walletOf(data);
    window.setTimeout(() => {
      const r = openChest();
      setOpening(false);
      if (!r) return onClose();
      setResult({ ...r, fromXp, fromWallet });
      sfx.fanfare();
      void confetti({ particleCount: 160, spread: 110, origin: { y: 0.42 }, colors: ['#ffc83d', '#ff6b4a', '#14a89a', '#9b6bff', '#ffffff'], disableForReducedMotion: true });
    }, 750);
  };

  if (!reason && !result) return null;
  return (
    <Modal onClose={onClose} className="reward-modal">
      <div className="reward">
        <p className="reward__why">{reason === 'level' ? `Seviye atladın! Yeni unvanın: ${level.name}` : reason ? CHEST_TEXT[reason] : ''}</p>
        {!result ? (
          <>
            <h2 className="title-lg">Hazine sandığı kazandın!</h2>
            <button type="button" className={`reward__box drop-in ${opening ? 'opening' : ''}`} onClick={open} aria-label="Sandığı aç">
              <span className="reward__glow" />
              <ChestArt className={opening ? '' : 'shake'} />
            </button>
            <p className="reward__tap">{opening ? 'Açılıyor…' : 'Açmak için sandığa dokun!'}</p>
          </>
        ) : (
          <>
            <div className="reward__open">
              <ChestArt open className="reward__chest-open" />
              <Particles />
              <div className="reward__prize"><RewardPreview reward={result.reward} base={base} /></div>
            </div>
            <h2 className="title-lg">
              {result.reward.kind === 'item' ? `Nadir eşya: ${result.reward.item.title}!` : `${result.reward.n + 2} yıldız kazandın!`}
            </h2>
            {result.reward.kind === 'item' && <p className="sub">Giydir'de karakterine hemen giydirebilirsin. Üstelik 2 yıldız da senin!</p>}
            <WalletGain from={result.fromWallet} to={walletOf(data)} />
            <LevelProgress fromXp={result.fromXp} toXp={xpOf(data)} />
            <div className="reward__actions">
              {result.reward.kind === 'item' && (
                <button type="button" className="pill" onClick={() => { onClose(); nav('/giydir'); }}>Giydir'de dene</button>
              )}
              {pending > 0 ? (
                <button type="button" className="pill pill--yellow" onClick={() => { setResult(null); sfx.pop(); }}>Sıradaki sandık ({pending})</button>
              ) : (
                <button type="button" className="btn-dark" onClick={onClose}>Süper!</button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------------------------------------
// Günün hediyesi penceresi
// ------------------------------------------------------------------------------------------------
function GiftCalendar({ streak, opened }: { streak: number; opened: boolean }) {
  return (
    <ol className="gift-cal" aria-label={`${streak}. gün`}>
      {GIFT_DAYS.map((n, i) => {
        const day = i + 1;
        const state = day < streak || (day === streak && opened) ? 'done' : day === streak ? 'today' : '';
        return (
          <li key={i} className={`gift-cal__day ${state} ${day === 7 ? 'big' : ''}`}>
            <small>{day}. gün</small>
            {day === 7 ? (
              <ChestArt className="gift-cal__chest" />
            ) : (
              <span className="gift-cal__stars">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12,2 l3,6.5 l7,1 l-5,4.8 l1.3,7 l-6.3,-3.4 l-6.3,3.4 l1.3,-7 l-5,-4.8 l7,-1 Z" fill="#ffc83d" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" /></svg>
                {n}
              </span>
            )}
            {state === 'done' && <span className="gift-cal__check" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export function DailyGiftModal({ onDone }: { onDone: (openChest: boolean) => void }) {
  const data = useProfileData();
  const claim = useApp((s) => s.claimGift);
  const st = giftStatus(data.gift);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'opened'>('closed');
  const [result, setResult] = useState<{ streak: number; stars: number; chest: boolean; fromXp: number; fromWallet: number } | null>(null);
  const streak = result?.streak ?? st.streak;

  const open = () => {
    if (phase !== 'closed') return;
    setPhase('opening');
    sfx.tap();
    const fromXp = xpOf(data);
    const fromWallet = walletOf(data);
    window.setTimeout(() => {
      const r = claim();
      if (!r) return onDone(false);
      setResult({ ...r, fromXp, fromWallet });
      setPhase('opened');
      sfx.success();
      void confetti({ particleCount: 110, spread: 90, origin: { y: 0.45 }, colors: ['#ffc83d', '#ff6b4a', '#ff8fb1', '#14a89a'], disableForReducedMotion: true });
    }, 700);
  };

  return (
    <Modal onClose={() => onDone(false)} className="reward-modal gift-modal">
      <div className="reward">
        <p className="reward__why">Günün hediyesi · {streak}. gün</p>
        <h2 className="title-lg">
          {phase !== 'opened' ? 'Bugünkü hediyen hazır!' : result!.chest ? '7 gün üst üste geldin!' : `${result!.stars} yıldız kazandın!`}
        </h2>
        <GiftCalendar streak={streak} opened={phase === 'opened'} />
        {phase !== 'opened' ? (
          <>
            <button type="button" className={`reward__box drop-in ${phase === 'opening' ? 'opening' : ''}`} onClick={open} aria-label="Hediyeyi aç">
              <span className="reward__glow" />
              {st.streak === 7 ? <ChestArt className={phase === 'opening' ? '' : 'shake'} /> : <GiftArt className={phase === 'opening' ? '' : 'shake'} />}
            </button>
            <p className="reward__tap">{phase === 'opening' ? 'Açılıyor…' : 'Açmak için dokun!'}</p>
          </>
        ) : (
          <>
            <div className="reward__open">
              {result!.chest ? <ChestArt open className="reward__chest-open" /> : <GiftArt open className="reward__chest-open" />}
              <Particles />
              <div className="reward__prize"><StarBurst n={result!.stars} /></div>
            </div>
            <WalletGain from={result!.fromWallet} to={walletOf(data)} />
            <LevelProgress fromXp={result!.fromXp} toXp={xpOf(data)} />
            <p className="sub">{result!.chest ? 'Bir hazine sandığı kazandın, hadi aç!' : `Yarın yine gel! ${7 - result!.streak} gün sonra hazine sandığı.`}</p>
            <div className="reward__actions">
              {result!.chest ? (
                <button type="button" className="pill pill--yellow" onClick={() => onDone(true)}>Sandığı aç</button>
              ) : (
                <button type="button" className="btn-dark" onClick={() => onDone(false)}>Harika!</button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------------------------------------
// Pencereleri sırayla açan yönetici ve üst çubuk düğmesi
// ------------------------------------------------------------------------------------------------
let giftShownFor = '';
let chestsSeen = -1;

/** Uygulama kabuğunda: günün hediyesi (günde bir kez) ve yeni kazanılan sandıklar için açılır pencere. */
export function RewardsHost() {
  const profile = useProfile();
  const data = useProfileData();
  const [mode, setMode] = useState<'none' | 'gift' | 'chest'>('none');
  const chests = data.chests?.length ?? 0;

  useEffect(() => {
    if (!profile || mode !== 'none') return;
    const key = `${profile.id}|${dayKey()}`;
    if (giftShownFor !== key && giftEligible(profile.createdAt, data.gift)) {
      giftShownFor = key;
      setMode('gift');
      return;
    }
    if (chestsSeen < 0) chestsSeen = 0;
    if (chests > chestsSeen) {
      chestsSeen = chests;
      setMode('chest');
    } else if (chests < chestsSeen) chestsSeen = chests;
  }, [profile, mode, chests, data.gift]);

  if (mode === 'gift') return <DailyGiftModal onDone={(openChest) => setMode(openChest ? 'chest' : 'none')} />;
  if (mode === 'chest') return <ChestModal onClose={() => { chestsSeen = useApp.getState().data[useApp.getState().activeId ?? '']?.chests?.length ?? 0; setMode('none'); }} />;
  return null;
}

/** Üst çubuktaki sandık düğmesi (bekleyen sandık varsa, dokununca açılır). */
export function ChestButton() {
  const count = useApp((s) => (s.activeId ? s.data[s.activeId]?.chests?.length ?? 0 : 0));
  const [open, setOpen] = useState(false);
  if (!count && !open) return null;
  return (
    <>
      {count > 0 && (
        <button type="button" className="chest-btn" aria-label={`${count} hazine sandığı`} onClick={() => { sfx.pop(); setOpen(true); }}>
          <ChestArt className="chest-btn__art" />
          <span className="chest-btn__count">{count}</span>
        </button>
      )}
      {open && <ChestModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ------------------------------------------------------------------------------------------------
// Seviye rozeti ve sonuç ekranı notu
// ------------------------------------------------------------------------------------------------
export function LevelBadge() {
  const data = useProfileData();
  const lv = levelOf(xpOf(data));
  const pct = Math.round(((lv.xp - lv.from) / Math.max(1, lv.to - lv.from)) * 100);
  return (
    <div className="level" title={`${lv.to - lv.xp} yıldız sonra ${lv.n + 1}. seviye`}>
      <svg viewBox="0 0 60 60" className="level__star" aria-hidden="true">
        <path d="M30,4 l7.5,16 l17.5,2 l-13,12 l3.5,17 l-15.5,-8.5 l-15.5,8.5 l3.5,-17 l-13,-12 l17.5,-2 Z" fill="#ffc83d" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <text x="30" y="38" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="17" fill={INK}>{lv.n}</text>
      </svg>
      <div className="level__text">
        <b>{lv.name}</b>
        <span className="level__bar"><i style={{ width: `${pct}%` }} /></span>
        <small>{lv.xp} / {lv.to} yıldız</small>
      </div>
    </div>
  );
}

/** Sonuç ekranlarında: bekleyen sandık varsa küçük bir hatırlatma (üst çubuktan açılır). */
export function ChestNote() {
  const count = useApp((s) => (s.activeId ? s.data[s.activeId]?.chests?.length ?? 0 : 0));
  if (!count) return null;
  return (
    <div className="chest-note pop-in">
      <ChestArt className="chest-note__art shake" />
      <span>
        <b>{count > 1 ? `${count} hazine sandığı kazandın!` : 'Hazine sandığı kazandın!'}</b>
        <small>Ana sayfada seni bekliyor.</small>
      </span>
    </div>
  );
}
