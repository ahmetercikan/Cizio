/**
 * Yıldız Dükkanı: kazanılan yıldızlar burada harcanır. Nadir Giydir eşyaları (sandıktan da çıkar),
 * hazine sandığı, avatar çerçeveleri ve her gün değişen "günün fırsatı" (yarı fiyatına bir nadir eşya).
 * Harcamak deneyimi (seviyeyi) düşürmez, yalnızca cüzdanı.
 */
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AvatarArt } from '../components/Avatars';
import { ChestArt, ChestModal, RarePreview, StarIcon } from '../components/Rewards';
import { Modal, useToast } from '../components/ui';
import { CHEST_PRICE, dailyDeal, FRAMES, RARE, RARE_PRICE, rareKey, walletOf, type RareItem } from '../lib/rewards';
import { sfx } from '../lib/sfx';
import { useApp, useProfile, useProfileData } from '../store/useApp';

const celebrate = () => {
  sfx.fanfare();
  void confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ['#ffc83d', '#ff6b4a', '#14a89a', '#9b6bff'], disableForReducedMotion: true });
};

function Price({ n, old }: { n: number; old?: number }) {
  return (
    <span className="price">
      <StarIcon size={18} />
      {old && <s>{old}</s>}
      <b>{n}</b>
    </span>
  );
}

/** Nadir eşya satın alma penceresi (dükkan ve Giydir'deki kilitli eşyalar). */
export function BuyRareModal({ item, price = RARE_PRICE, onClose }: { item: RareItem; price?: number; onClose: () => void }) {
  const data = useProfileData();
  const buy = useApp((s) => s.buyRare);
  const [done, setDone] = useState(false);
  const wallet = walletOf(data);
  const missing = price - wallet;
  return (
    <Modal onClose={onClose} className="reward-modal">
      <div className="reward">
        <p className="reward__why">{done ? 'Artık senin!' : 'Nadir eşya'}</p>
        <h2 className="title-lg">{item.title}</h2>
        <RarePreview item={item} className="reward__item buy__preview" />
        {done ? (
          <>
            <p className="sub">Giydir'de karakterine hemen giydirebilirsin.</p>
            <div className="reward__actions">
              <Link to="/giydir" className="pill" onClick={onClose}>Giydir'de dene</Link>
              <button type="button" className="btn-dark" onClick={onClose}>Süper!</button>
            </div>
          </>
        ) : (
          <>
            <p className="sub">Hazine sandığından çıkabilir ya da yıldızlarınla hemen alabilirsin.</p>
            <div className="buy__wallet">Cüzdanında <StarIcon size={18} /> <b>{wallet}</b> yıldız var</div>
            <div className="reward__actions">
              {missing > 0 ? (
                <p className="buy__need">{missing} yıldız daha topla! Ders bitir, görev yap, günün hediyesini aç.</p>
              ) : (
                <button type="button" className="pill pill--yellow" onClick={() => { if (buy(rareKey(item), price)) { setDone(true); celebrate(); } }}>
                  Satın al <Price n={price} />
                </button>
              )}
              <button type="button" className="btn-outline" onClick={onClose}>Vazgeç</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function Shop() {
  const profile = useProfile()!;
  const data = useProfileData();
  const buyChest = useApp((s) => s.buyChest);
  const buyFrame = useApp((s) => s.buyFrame);
  const setFrame = useApp((s) => s.setFrame);
  const [toast, showToast] = useToast();
  const [buying, setBuying] = useState<{ item: RareItem; price: number } | null>(null);
  const [chest, setChest] = useState(false);
  const wallet = walletOf(data);
  const owned = new Set(data.owned ?? []);
  const deal = dailyDeal(data, profile.id);
  const need = (price: number) => {
    sfx.soft();
    showToast(`${price - wallet} yıldız daha topla!`);
  };

  return (
    <AppShell flow={1}>
      <header className="page-head rise">
        <div>
          <p className="sub">Kazandığın yıldızlarla harika şeyler al!</p>
          <h1 className="title-xl">Yıldız Dükkanı</h1>
        </div>
        <div className="shop-wallet"><StarIcon size={30} /> <b>{wallet}</b> <span>yıldız</span></div>
      </header>

      <div className="shop-top rise">
        {deal && (
          <button type="button" className="shop-deal" onClick={() => { sfx.pop(); setBuying(deal); }}>
            <span className="shop-deal__tag">Günün fırsatı</span>
            <RarePreview item={deal.item} className="shop-deal__art" />
            <span className="shop-deal__text">
              <b>{deal.item.title}</b>
              <small>Sadece bugün yarı fiyatına!</small>
              <Price n={deal.price} old={RARE_PRICE} />
            </span>
          </button>
        )}
        <div className="shop-chest">
          <ChestArt className="shop-chest__art shake" />
          <span className="shop-deal__text">
            <b>Hazine sandığı</b>
            <small>İçinden nadir bir eşya çıkar!</small>
            <Price n={CHEST_PRICE} />
          </span>
          <button type="button" className="pill pill--yellow" onClick={() => {
            if (buyChest(CHEST_PRICE)) { sfx.pop(); setChest(true); } else need(CHEST_PRICE);
          }}>Sandık al</button>
        </div>
      </div>

      <section className="row-section">
        <h2 className="row-section__title">Nadir eşyalar</h2>
        <div className="shop-grid">
          {RARE.map((r) => {
            const has = owned.has(rareKey(r));
            return (
              <button key={rareKey(r)} type="button" className={`shop-item ${has ? 'owned' : ''}`}
                onClick={() => { if (has) return; sfx.pop(); setBuying({ item: r, price: RARE_PRICE }); }}>
                <RarePreview item={r} className="shop-item__art" />
                <b>{r.title}</b>
                {has ? <span className="shop-item__owned"><Check size={16} strokeWidth={3} /> Sende var</span> : <Price n={RARE_PRICE} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="row-section">
        <h2 className="row-section__title">Avatar çerçeveleri</h2>
        <div className="shop-grid">
          {FRAMES.map((f) => {
            const has = (data.frames ?? []).includes(f.id);
            const on = data.frame === f.id;
            return (
              <button key={f.id} type="button" className={`shop-item ${on ? 'on' : ''}`}
                onClick={() => {
                  if (has) { sfx.select(); setFrame(on ? undefined : f.id); return; }
                  if (buyFrame(f.id, f.price)) { celebrate(); showToast(`${f.title} senin!`); } else need(f.price);
                }}>
                <span className={`shop-item__frame frame frame--${f.id}`}><AvatarArt id={profile.avatar} size={72} /></span>
                <b>{f.title}</b>
                {has ? <span className="shop-item__owned">{on ? 'Takılı' : 'Tak'}</span> : <Price n={f.price} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="shop-how rise">
        <b>Yıldız nasıl kazanılır?</b>
        <p>Ders bitir, meydan okuma yap, günün görevini ve stil görevini tamamla, her gün hediyeni aç. Harcadığın yıldızlar seviyeni düşürmez!</p>
      </section>

      {buying && <BuyRareModal item={buying.item} price={buying.price} onClose={() => setBuying(null)} />}
      {chest && <ChestModal onClose={() => setChest(false)} />}
      {toast}
    </AppShell>
  );
}
