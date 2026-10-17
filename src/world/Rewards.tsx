/**
 * Ödüller: hazine sandıkları, günlük hediye serisi ve koleksiyon rozetleri.
 *
 * Buradaki her şey altın sarmalını besler: çadırda oyun kazanınca, seviye atlayınca ya da 7 gün
 * üst üste gelince anahtar çıkar; anahtar sandık açar, sandıktan altın, eşya ya da nadir kıyafet
 * çıkar. Rozetler ise uzun soluklu hedeflerdir (hesap: economy.ts).
 */
import { Gift, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../components/ui';
import { BADGES, CHESTS, STREAK_GIFTS, STREAK_KEY_DAY, badgeDone, type ChestDef, type DailyGift, type FarmState, type MiniPrize } from './economy';
import { GameIcon } from './GameIcon';
import { Panel } from './Shops';

/** Anahtarın nereden geldiğini çocuğun anlayacağı dille anlatır. */
const KEY_HINT = 'Anahtar: bir günde 3 ayrı oyunu kazanınca, seviye atlayınca ve 7 gün üst üste gelince çıkar.';

export function RewardsPanel({ s, day, onOpen, onClose }: { s: FarmState; day: string; onOpen: (c: ChestDef) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'sandik' | 'seri' | 'rozet'>('sandik');
  const keys = s.keys ?? 0;
  const streak = s.streak?.day === day ? s.streak.n : 0;
  const done = (s.badges ?? []).length;
  return (
    <Panel title="Ödüller" icon={<Trophy size={24} style={{ verticalAlign: '-4px' }} />} onClose={onClose}>
      <div className="farm-tabs">
        <button className={tab === 'sandik' ? 'on' : ''} onClick={() => setTab('sandik')}>Sandıklar</button>
        <button className={tab === 'seri' ? 'on' : ''} onClick={() => setTab('seri')}>Günlük hediye</button>
        <button className={tab === 'rozet' ? 'on' : ''} onClick={() => setTab('rozet')}>Koleksiyon</button>
        <span className="farm-coin"><GameIcon name="anahtar" size={22} /> {keys}</span>
      </div>
      {tab === 'sandik' && (
        <>
          <p className="sub" style={{ marginTop: 0 }}>{KEY_HINT}</p>
          <ul className="farm-list">
            {CHESTS.map((c) => {
              const can = keys >= c.keys;
              return (
                <li key={c.id} className={can ? '' : 'locked'}>
                  <GameIcon name={c.icon} size={44} className="farm-emoji" />
                  <span className="farm-list__name">
                    <b>{c.name}</b>
                    <small>{c.coins[0]}–{c.coins[1]} altın ve bir hediye{c.cloth >= 0.45 ? ' (çoğu zaman nadir kıyafet)' : ''}</small>
                  </span>
                  <button className="pill pill--sm" disabled={!can} onClick={() => onOpen(c)}><GameIcon name="anahtar" size={20} /> {c.keys}</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {tab === 'seri' && (
        <>
          <p className="sub" style={{ marginTop: 0 }}>Her gün adaya gel, hediye büyüsün! Bir gün kaçırırsan seri baştan başlar.</p>
          <div className="streak">
            {STREAK_GIFTS.map((n, i) => (
              <span key={i} className={`streak__day ${i < streak ? 'on' : ''} ${i + 1 === streak ? 'now' : ''}`}>
                <small>{i + 1}. gün</small>
                <GameIcon name={i + 1 === STREAK_KEY_DAY ? 'anahtar' : 'altin'} size={26} />
                <b>{n}</b>
              </span>
            ))}
          </div>
          <p className="sub">{streak ? `Bugünkü hediyeni aldın: serinin ${streak}. günü.` : 'Bugünkü hediyeni adaya girince alacaksın.'}</p>
        </>
      )}
      {tab === 'rozet' && (
        <>
          <p className="sub" style={{ marginTop: 0 }}>{done}/{BADGES.length} rozet kazandın. Her rozet altın da verir!</p>
          <div className="badges">
            {BADGES.map((b) => {
              const have = (s.badges ?? []).includes(b.id) || badgeDone(s, b);
              const at = Math.min(b.goal, b.of(s));
              return (
                <div key={b.id} className={`badge ${have ? 'on' : ''}`}>
                  <GameIcon name={b.icon} size={34} />
                  <b>{b.name}</b>
                  <small>{b.hint}</small>
                  <span className="badge__bar"><i style={{ width: `${Math.round((at / b.goal) * 100)}%` }} /></span>
                  <span className="badge__n">{have ? 'Tamam!' : `${at}/${b.goal}`} · <GameIcon name="altin" size={14} /> {b.coins}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}

/** Adaya girince çıkan günlük hediye. */
export function DailyGiftModal({ gift, onClose }: { gift: DailyGift; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <Gift size={60} color="#e9487d" />
        <h2 className="title-lg">Günlük hediyen!</h2>
        <p className="sub">Üst üste <b>{gift.n}. gün</b> adaya geldin.</p>
        <span className="farm-coin big"><GameIcon name="altin" size={27} /> +{gift.coins}</span>
        {gift.key && <p className="sub">Ayrıca bir <b>sandık anahtarı</b> kazandın! Ödüller'den sandık açabilirsin.</p>}
        <div className="farm-order__btns">
          <button className="pill" onClick={onClose}>Teşekkürler!</button>
        </div>
      </div>
    </Modal>
  );
}

/** Sandık açıldı: içinden çıkanlar. */
export function ChestModal({ name, prizes, onClose, onGo }: { name: string; prizes: MiniPrize[]; onClose: () => void; onGo: (where: 'home' | 'dress') => void }) {
  const coins = prizes.find((p) => p.kind === 'coins');
  const item = prizes.find((p) => p.kind === 'item');
  const cloth = prizes.find((p) => p.kind === 'cloth');
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <GameIcon name="sandik" size={92} />
        <h2 className="title-lg">{name} açıldı!</h2>
        {coins?.kind === 'coins' && <span className="farm-coin big"><GameIcon name="altin" size={27} /> +{coins.n}</span>}
        {item?.kind === 'item' && <p className="sub">İçinden <b>{item.name}</b> çıktı! Evindeki depoda seni bekliyor.</p>}
        {cloth && <p className="sub">İçinden <b>nadir bir kıyafet</b> çıktı! Giydir'de giyebilirsin.</p>}
        <div className="farm-order__btns">
          {item && <button className="btn-outline" onClick={() => onGo('home')}>Evime koy</button>}
          {cloth && <button className="btn-outline" onClick={() => onGo('dress')}>Hemen giy</button>}
          <button className="pill" onClick={onClose}>Harika!</button>
        </div>
      </div>
    </Modal>
  );
}

/** Yeni kazanılan rozetler. */
export function BadgeModal({ names, onClose }: { names: string[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="island__panel">
        <GameIcon name="kupa" size={86} />
        <h2 className="title-lg">{names.length > 1 ? 'Yeni rozetler!' : 'Yeni rozet!'}</h2>
        <p className="sub">{names.join(', ')}</p>
        <button className="pill" onClick={onClose}>Harika!</button>
      </div>
    </Modal>
  );
}
