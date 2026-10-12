/** Ebeveyn bölümü: Çizio Adası'nın özel paketleri (bir kez alınır). Satın alma yalnızca burada, ebeveyn kilidinin arkasında. */
import { Check, Crown, Loader2, RotateCcw } from 'lucide-react';
import { buyPremium, canBuyPremium, PREMIUM, restorePremium, usePremium } from './premium';

export function ParentPremium() {
  const { owned, prices, busy, error } = usePremium();
  const can = canBuyPremium();
  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }}>
      <h2 className="card-title"><Crown size={22} style={{ verticalAlign: '-4px' }} /> Çizio Adası özel paketleri</h2>
      <p className="muted" style={{ fontWeight: 600 }}>
        Adadaki her şey oynayarak kazanılan altınla alınabilir. Bu paketlerdeki birkaç özel eşya ise yalnızca buradan, bir kez satın alınır ve hep sizde kalır.
        Çocuğunuza oyun içinde satın alma ekranı gösterilmez; ada altını gerçek parayla satılmaz.
      </p>
      <ul className="premium-list">
        {PREMIUM.map((p) => {
          const has = owned.includes(p.id);
          return (
            <li key={p.id}>
              <span className="premium-list__emoji">{p.emoji}</span>
              <span className="premium-list__text"><b>{p.name}</b><small>{p.desc}</small></span>
              {has ? <span className="premium-list__own"><Check size={18} /> Açık</span> : can ? (
                <button className="btn-dark" disabled={!!busy} onClick={() => void buyPremium(p.id)}>{busy === p.id ? <Loader2 className="spin" size={18} /> : <Crown size={16} />} {prices[p.id] ?? p.price}</button>
              ) : <span className="premium-list__soon">Yakında</span>}
            </li>
          );
        })}
      </ul>
      {can ? (
        <button className="btn-outline btn-outline--sm" disabled={!!busy} onClick={() => void restorePremium()}><RotateCcw size={16} /> Satın alımları geri yükle</button>
      ) : (
        <p className="muted" style={{ fontWeight: 600, margin: 0 }}>Paketler yakında Çizio'nun Android uygulamasından Google Play ile satın alınabilecek.</p>
      )}
      {error && <p className="online-send__err" style={{ marginTop: 8 }}>{error}</p>}
    </section>
  );
}
