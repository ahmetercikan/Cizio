/**
 * Kasabadaki Butik (nadir kıyafetler ada altınıyla) ve Oyun Çadırı (mini oyunlar: hafıza kartları, balon patlatma).
 * Mini oyunu bitiren altın kazanır; günde 3 kez de evine bir eşya ya da üstüne bir kıyafet (economy.ts miniReward).
 */
import { Coins, Crown, PartyPopper, Shirt, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Modal } from '../components/ui';
import { RARE, rareKey, type RareItem } from '../lib/rewards';
import { sfx } from '../lib/sfx';
import { PREMIUM_HINT, usePremium } from './premium';
import type { MiniPrize } from './economy';

const SLOT_PRICE: Record<RareItem['slot'], number> = { back: 260, pet: 220, dress: 200, hat: 160, shoes: 140, bg: 120 };
const SLOT_EMOJI: Record<RareItem['slot'], string> = { back: '🪽', pet: '🐾', dress: '👗', hat: '👑', shoes: '👟', bg: '🌈' };
export const rarePrice = (r: RareItem) => SLOT_PRICE[r.slot];

function Panel({ title, icon, onClose, children }: { title: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return (
    <Modal onClose={onClose} className="modal--wide farm-modal">
      <div className="art-view__head">
        <b className="title-lg">{icon} {title}</b>
        <button className="round-btn round-btn--light" aria-label="Kapat" onClick={onClose}><X /></button>
      </div>
      {children}
    </Modal>
  );
}

export function BoutiquePanel({ coins, owned, onBuy, onClose, onHint, onWear }: {
  coins: number; owned: string[]; onBuy: (r: RareItem, price: number) => void; onClose: () => void; onHint: (t: string) => void; onWear: () => void;
}) {
  const shiny = usePremium((x) => x.owned.includes('renk'));
  return (
    <Panel title="Butik" icon={<Shirt size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>Nadir kıyafetler ve dostlar burada! Ada altınınla alabilirsin.</p>
      <ul className="farm-list">
        {RARE.map((r) => {
          const has = owned.includes(rareKey(r)), price = rarePrice(r);
          return (
            <li key={rareKey(r)}>
              <span className="farm-emoji">{SLOT_EMOJI[r.slot]}</span>
              <span className="farm-list__name"><b>{r.title}</b><small>{has ? 'Senin' : 'Nadir'}</small></span>
              {has ? <button className="btn-outline btn-outline--sm" onClick={onWear}>Giy</button> : (
                <button className="pill pill--sm" disabled={coins < price} onClick={() => onBuy(r, price)}><Coins size={16} /> {price}</button>
              )}
            </li>
          );
        })}
        <li>
          <span className="farm-emoji">💎</span>
          <span className="farm-list__name"><b>Parıltılı Renkler</b><small>{shiny ? 'Giydir\'de renklerin arasında' : 'Altın, gümüş, inci, neon, galaksi'}</small></span>
          {shiny ? <button className="btn-outline btn-outline--sm" onClick={onWear}>Giy</button> : <button className="btn-outline btn-outline--sm" aria-label="Özel renkler" onClick={() => onHint(PREMIUM_HINT)}><Crown size={16} color="#c98a00" /></button>}
        </li>
      </ul>
    </Panel>
  );
}

// ------------------------------------------------------------------------------------------------
// Oyun Çadırı
// ------------------------------------------------------------------------------------------------
export function GamesPanel({ left, onPlay, onClose }: { left: number; onPlay: (g: 'memory' | 'balloon') => void; onClose: () => void }) {
  return (
    <Panel title="Oyun Çadırı" icon={<PartyPopper size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>
        Oyunu bitir, altın kazan! {left > 0 ? `Bugün ${left} kez de evine bir eşya ya da sana yeni bir kıyafet çıkabilir.` : 'Bugünkü eşya ödülleri bitti; yarın yine gel. Altın kazanmaya devam!'}
      </p>
      <div className="mini-pick">
        <button onClick={() => onPlay('memory')}><span>🃏</span><b>Hafıza kartları</b><small>Eşleri bul</small></button>
        <button onClick={() => onPlay('balloon')}><span>🎈</span><b>Balon patlat</b><small>Doğru renkleri patlat</small></button>
      </div>
    </Panel>
  );
}

const EMOJI = ['🛋️', '🛏️', '🪴', '🎨', '🧸', '🎹', '🌷', '👗', '👟', '🎩', '🚲', '🐶'];

export function MemoryGame({ onWin, onClose }: { onWin: () => void; onClose: () => void }) {
  const cards = useMemo(() => {
    const pick = [...EMOJI].sort(() => Math.random() - 0.5).slice(0, 6);
    return [...pick, ...pick].map((e, i) => ({ e, i })).sort(() => Math.random() - 0.5);
  }, []);
  if (import.meta.env.DEV) (window as unknown as { __memory?: string[] }).__memory = cards.map((c) => c.e);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const won = done.size === 6;
  const flip = (k: number) => {
    if (open.length === 2 || open.includes(k) || done.has(cards[k].e)) return;
    sfx.pop();
    const next = [...open, k];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (cards[next[0]].e === cards[next[1]].e) {
        setTimeout(() => {
          sfx.star(done.size);
          const d = new Set(done).add(cards[k].e);
          setDone(d);
          setOpen([]);
          if (d.size === 6) setTimeout(onWin, 500);
        }, 350);
      } else setTimeout(() => setOpen([]), 800);
    }
  };
  return (
    <Panel title="Hafıza kartları" icon={<Sparkles size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>{won ? 'Hepsini buldun!' : `Aynı iki resmi bul. Hamle: ${moves}`}</p>
      <div className="mini-memory">
        {cards.map((c, k) => {
          const up = open.includes(k) || done.has(c.e);
          return (
            <button key={k} className={`mini-card ${up ? 'up' : ''} ${done.has(c.e) ? 'done' : ''}`} onClick={() => flip(k)} aria-label={up ? c.e : 'Kapalı kart'}>
              <span>{up ? c.e : '?'}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

const BCOLS = [
  { id: 'pembe', c: '#ff8fb1', name: 'pembe' },
  { id: 'mavi', c: '#5b8def', name: 'mavi' },
  { id: 'sari', c: '#ffc83d', name: 'sarı' },
  { id: 'yesil', c: '#2bb673', name: 'yeşil' },
];
const GOAL = 10, TIME = 30;

export function BalloonGame({ onEnd, onClose }: { onEnd: (won: boolean) => void; onClose: () => void }) {
  const target = useMemo(() => BCOLS[Math.floor(Math.random() * BCOLS.length)], []);
  const [balloons, setBalloons] = useState<{ id: number; x: number; y: number; col: (typeof BCOLS)[number]; sp: number }[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(TIME);
  const [over, setOver] = useState(false);
  const seq = useRef(0);
  const ended = useRef(false);
  useEffect(() => {
    let raf = 0, last = performance.now(), spawn = 0, t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      spawn -= dt;
      setBalloons((bs) => {
        const out = bs.map((b) => ({ ...b, y: b.y - b.sp * dt })).filter((b) => b.y > -15);
        if (spawn <= 0) {
          spawn = 0.55;
          const col = Math.random() < 0.45 ? target : BCOLS[Math.floor(Math.random() * BCOLS.length)];
          out.push({ id: ++seq.current, x: 6 + Math.random() * 82, y: 110, col, sp: 18 + Math.random() * 14 });
        }
        return out;
      });
      setLeft(Math.max(0, Math.ceil(TIME - t)));
      if (t >= TIME) {
        setOver(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  useEffect(() => {
    if (ended.current) return;
    if (score >= GOAL || over) {
      ended.current = true;
      setTimeout(() => onEnd(score >= GOAL), 600);
    }
  }, [score, over, onEnd]);
  const pop = (id: number, ok: boolean) => {
    setBalloons((bs) => bs.filter((b) => b.id !== id));
    if (ok) {
      sfx.star(score % 6);
      setScore((s) => s + 1);
    } else sfx.pop();
  };
  return (
    <Panel title="Balon patlat" icon={<PartyPopper size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose}>
      <p className="sub" style={{ marginTop: 0 }}>
        Sadece <b style={{ color: target.c }}>{target.name}</b> balonları patlat! <b>{score}/{GOAL}</b> · ⏱ {left}
      </p>
      <div className="mini-sky">
        {balloons.map((b) => (
          <button key={b.id} className="mini-balloon" style={{ left: `${b.x}%`, top: `${b.y}%`, background: b.col.c }} aria-label={`${b.col.name} balon`}
            onPointerDown={() => pop(b.id, b.col.id === target.id)} />
        ))}
      </div>
    </Panel>
  );
}

export function PrizeModal({ prize, coins, onClose, onGo }: { prize: MiniPrize; coins: number; onClose: () => void; onGo: (where: 'home' | 'dress') => void }) {
  const cloth = prize.kind === 'cloth' ? RARE.find((r) => rareKey(r) === prize.key) : null;
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <Trophy size={60} color="#ffc83d" fill="#ffe8a3" />
        <h2 className="title-lg">Aferin!</h2>
        <span className="farm-coin big"><Coins size={22} /> +{coins}</span>
        {prize.kind === 'item' && <p className="sub">Hediye: <b>{prize.name}</b>! Evindeki depoda seni bekliyor.</p>}
        {cloth && <p className="sub">Hediye: <b>{cloth.title}</b>! Giydir'de giyebilirsin.</p>}
        <div className="farm-order__btns">
          {prize.kind === 'item' && <button className="btn-outline" onClick={() => onGo('home')}>Evime koy</button>}
          {cloth && <button className="btn-outline" onClick={() => onGo('dress')}>Hemen giy</button>}
          <button className="pill" onClick={onClose}>Harika!</button>
        </div>
      </div>
    </Modal>
  );
}
