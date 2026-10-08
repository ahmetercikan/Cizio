/** Ebeveyn bölümü: Çizio Plus aboneliğinin durumu, satın alma, geri yükleme ve yönetim. */
import { Crown, Loader2, RotateCcw, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buyPlus, canBuy, managePlus, restorePlus, usePlus } from './plus';

export function ParentPlus() {
  const nav = useNavigate();
  const { owned, price, busy, error } = usePlus();
  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }}>
      <h2 className="card-title"><Crown size={22} style={{ verticalAlign: '-4px' }} /> Çizio Plus</h2>
      <p className="muted" style={{ fontWeight: 600 }}>
        {owned
          ? 'Aboneliğiniz etkin: Çizio Adası açık. Abonelik Google Play üzerinden yönetilir; ödeme bilgilerinizi Çizio görmez.'
          : `Çizio Adası: çocuğunuzun giydirdiği karakterle gezdiği 3 boyutlu oyun dünyası. Yıllık ${price}; her yıl kendiliğinden yenilenir, istediğiniz zaman Google Play'den iptal edebilirsiniz.`}
      </p>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        {owned ? (
          <>
            <button className="btn-dark" onClick={() => nav('/ada')}>Adaya git</button>
            <button className="btn-outline btn-outline--sm" onClick={() => void managePlus()}><Settings2 size={16} /> Aboneliği yönet</button>
          </>
        ) : canBuy() ? (
          <>
            <button className="btn-dark" disabled={busy} onClick={() => void buyPlus()}>{busy ? <Loader2 className="spin" size={18} /> : <Crown size={18} />} Yıllık {price} ile aç</button>
            <button className="btn-outline btn-outline--sm" disabled={busy} onClick={() => void restorePlus()}><RotateCcw size={16} /> Satın alımı geri yükle</button>
          </>
        ) : (
          <p className="muted" style={{ fontWeight: 600, margin: 0 }}>Çizio Plus, Çizio'nun Android uygulamasından satın alınır.</p>
        )}
      </div>
      {error && <p className="online-send__err" style={{ marginTop: 8 }}>{error}</p>}
    </section>
  );
}
