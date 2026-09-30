/**
 * Ödül arayüzü: hazine sandığı (açılış animasyonu ve ödül), seviye rozeti, günün hediyesi.
 * Çizimler el yapımı SVG (mürekkep kontur, düz renk); emoji kullanılmaz.
 */
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRESETS, type DollState } from '../dressup/catalog';
import { Doll, REGIONS } from '../dressup/Doll';
import { CHEST_TEXT, GIFT_DAYS, giftStatus, levelOf, xpOf, type ChestReason, type Reward } from '../lib/rewards';
import { sfx } from '../lib/sfx';
import { useApp, useProfileData } from '../store/useApp';
import { Modal } from './ui';

const INK = '#3a2b27';
const o = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ------------------------------------------------------------------------------------------------
// Çizimler
// ------------------------------------------------------------------------------------------------
export function ChestArt({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true" overflow="visible">
      {open && (
        <g className="chest__rays">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <path key={i} d={`M100,70 L${100 + Math.cos(a - 0.12) * 150},${70 + Math.sin(a - 0.12) * 150} L${100 + Math.cos(a + 0.12) * 150},${70 + Math.sin(a + 0.12) * 150} Z`} fill="#ffe08a" opacity="0.55" />;
          })}
          <circle cx="100" cy="70" r="46" fill="#fff5c4" />
        </g>
      )}
      {/* gövde */}
      <path d="M26,82 H174 V154 C174,160 170,164 164,164 H36 C30,164 26,160 26,154 Z" fill="#c9793b" {...o} />
      <path d="M26,104 H174 M26,134 H174" stroke="#a45f2a" strokeWidth="4" />
      <path d="M52,82 V164 M148,82 V164" stroke="#ffc83d" strokeWidth="10" />
      <path d="M52,82 V164 M148,82 V164" stroke={INK} strokeWidth="2" opacity="0.35" />
      <rect x="86" y="92" width="28" height="30" rx="6" fill="#ffc83d" {...o} strokeWidth={3} />
      <circle cx="100" cy="104" r="4" fill={INK} />
      <path d="M100,106 V114" stroke={INK} strokeWidth="3" />
      {/* kapak */}
      <g className="chest__lid" style={{ transformOrigin: '26px 82px', transform: open ? 'rotate(-38deg) translate(-6px,-14px)' : undefined }}>
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
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" overflow="visible">
      <rect x="18" y="52" width="84" height="58" rx="8" fill="#ff6b4a" {...o} strokeWidth={3.5} />
      <path d="M60,52 V110" stroke="#ffc83d" strokeWidth="12" />
      <g style={{ transformOrigin: '60px 50px', transform: open ? 'translateY(-26px) rotate(-12deg)' : undefined, transition: 'transform 0.4s cubic-bezier(0.3,1.6,0.5,1)' }}>
        <rect x="12" y="38" width="96" height="18" rx="6" fill="#ff8a6b" {...o} strokeWidth={3.5} />
        <path d="M60,38 V56" stroke="#ffc83d" strokeWidth="12" />
        <path d="M60,38 C44,18 28,26 38,36 C44,40 54,40 60,38 C66,40 76,40 82,36 C92,26 76,18 60,38 Z" fill="#ffc83d" {...o} strokeWidth={3} />
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

// ------------------------------------------------------------------------------------------------
// Sandık açma
// ------------------------------------------------------------------------------------------------
const SLOT_REGION: Record<string, string> = { back: 'back', dress: 'dress', hat: 'hat', pet: 'pet', bg: 'full', shoes: 'shoes' };

function RewardPreview({ reward, base }: { reward: Reward; base: DollState }) {
  if (reward.kind === 'stars') return <StarBurst n={reward.n + 2} />;
  const { slot, id } = reward.item;
  const d: DollState = { ...base, [slot]: id, ...(slot === 'dress' ? {} : {}) } as DollState;
  return (
    <div className="reward__item">
      <Doll d={d} bg={slot === 'bg'} viewBox={REGIONS[SLOT_REGION[slot]]} />
    </div>
  );
}

export function ChestModal({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const data = useProfileData();
  const openChest = useApp((s) => s.openChest);
  const [result, setResult] = useState<{ reason: ChestReason; reward: Reward } | null>(null);
  const [opening, setOpening] = useState(false);
  const pending = data.chests?.length ?? 0;
  const reason = result?.reason ?? data.chests?.[0];
  const level = levelOf(xpOf(data));
  const base = data.doll ?? PRESETS[0];

  const open = () => {
    if (opening || result) return;
    setOpening(true);
    sfx.tap();
    window.setTimeout(() => {
      const r = openChest();
      setOpening(false);
      if (!r) return onClose();
      setResult(r);
      sfx.fanfare();
      void confetti({ particleCount: 150, spread: 100, origin: { y: 0.45 }, disableForReducedMotion: true });
    }, 650);
  };

  if (!reason && !result) return null;
  return (
    <Modal onClose={onClose} className="reward-modal">
      <div className="reward">
        <p className="reward__why">{reason === 'level' ? `Seviye atladın! Yeni unvanın: ${level.name}` : reason ? CHEST_TEXT[reason] : ''}</p>
        {!result ? (
          <>
            <h2 className="title-lg">Hazine sandığı kazandın!</h2>
            <button type="button" className={`reward__chest ${opening ? 'opening' : 'shake'}`} onClick={open} aria-label="Sandığı aç">
              <ChestArt />
            </button>
            <p className="reward__tap">{opening ? 'Açılıyor…' : 'Açmak için sandığa dokun!'}</p>
          </>
        ) : (
          <>
            <div className="reward__open">
              <ChestArt open className="reward__chest-open" />
              <div className="reward__prize pop-in"><RewardPreview reward={result.reward} base={base} /></div>
            </div>
            <h2 className="title-lg">
              {result.reward.kind === 'item' ? `Nadir eşya: ${result.reward.item.title}!` : `${result.reward.n + 2} yıldız kazandın!`}
            </h2>
            {result.reward.kind === 'item' && <p className="sub">Giydir'de karakterine hemen giydirebilirsin. Üstelik 2 yıldız da senin!</p>}
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

/** Üst çubuktaki sandık düğmesi (bekleyen sandık varsa). İlk görünüşte sandık penceresini kendisi açar. */
let autoOpened = 0;
export function ChestButton() {
  const count = useApp((s) => (s.activeId ? s.data[s.activeId]?.chests?.length ?? 0 : 0));
  const [open, setOpen] = useState(false);
  // Yeni sandık geldiğinde pencereyi bir kez kendiliğinden aç (oturum boyunca aynı sandık için tekrar açmaz).
  useEffect(() => {
    if (count > autoOpened) {
      autoOpened = count;
      setOpen(true);
    } else if (count < autoOpened) autoOpened = count;
  }, [count]);
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
// Seviye rozeti
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

// ------------------------------------------------------------------------------------------------
// Günün hediyesi
// ------------------------------------------------------------------------------------------------
export function GiftCard() {
  const data = useProfileData();
  const claim = useApp((s) => s.claimGift);
  const st = giftStatus(data.gift);
  const [shown, setShown] = useState<{ streak: number; stars: number; chest: boolean } | null>(null);
  const [chest, setChest] = useState(false);
  if (!st.available && !shown) return null;
  const streak = shown?.streak ?? st.streak;

  const take = () => {
    const r = claim();
    if (!r) return;
    sfx.success();
    void confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 }, disableForReducedMotion: true });
    setShown(r);
  };

  return (
    <>
      <button type="button" className={`gift-card ${shown ? 'done' : ''}`} onClick={shown ? undefined : take} disabled={!!shown}>
        <GiftArt open={!!shown} className={`gift-card__art ${shown ? '' : 'shake'}`} />
        <span className="gift-card__text">
          <span className="gift-card__label">Günün hediyesi</span>
          <b>{shown ? (shown.chest ? 'Hazine sandığı!' : `+${shown.stars} yıldız!`) : 'Dokun, hediyeni aç!'}</b>
          <span className="gift-card__days" aria-label={`${streak}. gün`}>
            {GIFT_DAYS.map((_, i) => (
              <i key={i} className={`${i < streak ? 'on' : ''} ${i === 6 ? 'big' : ''}`} />
            ))}
            <small>{7 - streak > 0 ? `${7 - streak} gün sonra hazine sandığı` : 'Bugün sandık günü!'}</small>
          </span>
        </span>
      </button>
      {shown?.chest && !chest && (
        <button type="button" className="pill" onClick={() => setChest(true)}>Sandığı aç</button>
      )}
      {chest && <ChestModal onClose={() => setChest(false)} />}
    </>
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
