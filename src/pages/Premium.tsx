/**
 * Çizio Premium sayfası (ebeveyn kapısının arkasında): ne açıldığı, aylık/yıllık plan, ücretsiz deneme, satın alma,
 * geri yükleme ve mağazaların istediği abonelik bilgisi. Premium'daysa durum ve yönetim.
 */
import { ArrowLeft, BookOpen, Check, Crown, Globe2, Loader2, Palette, RotateCcw, Settings2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Doodles } from '../components/Doodles';
import { Gate } from '../components/Gate';
import { LESSON_META } from '../lessons/meta';
import { TOPICS } from '../english/data';
import { FREE_LESSON_COUNT } from '../account/limits';
import { LEGAL, STORE_LINKS } from '../account/config';
import { annualSaving, buy, canPurchase, initMembership, manage, restore, useMembership, type Plan } from '../account/membership';
import { startAccount, useAccount } from '../account/auth';
import { PREMIUM_ACIK } from '../lib/flags';
import { sfx } from '../lib/sfx';
import { Capacitor } from '@capacitor/core';

const dateTR = (ms?: number | null) => (ms ? new Date(ms).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default function PremiumPage() {
  const nav = useNavigate();
  const gated = !!(useLocation().state as { gated?: boolean } | null)?.gated;
  const [pass, setPass] = useState(gated);
  if (!pass) return <div className="bg"><Gate onPass={() => setPass(true)} onCancel={() => nav(-1)} /></div>;
  return <PremiumBody />;
}

function PremiumBody() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const m = useMembership();
  const user = useAccount((s) => s.user);
  const [plan, setPlan] = useState<Plan>('annual');
  const [restored, setRestored] = useState<boolean | null>(null);
  useEffect(() => {
    void initMembership();
    void startAccount().catch(() => {});
  }, []);
  const saving = annualSaving(m.offers);
  const chosen = m.offers.find((o) => o.plan === plan) ?? m.offers[0];
  const native = Capacitor.isNativePlatform();
  const store = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play';
  const why = params.get('neden');

  return (
    <div className="bg premium">
      <Doodles variant={1} />
      <header className="premium__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => nav(-1)}><ArrowLeft size={26} strokeWidth={2.6} /></button>
      </header>
      <main className="premium__main rise">
        <section className="premium__intro">
          <span className="premium__badge"><Crown size={18} /> Çizio Premium</span>
          <h1 className="title-xl">{m.premium ? 'Premium açık, iyi eğlenceler!' : "Çizio'nun tamamını açın"}</h1>
          <p className="sub">
            {m.premium
              ? 'Bütün dersler, English Club ve Çizio Adası açık.'
              : why === 'island'
                ? 'Çizio Adası, bütün çizim dersleri ve English Club Premium ile açılır.'
                : 'Bütün çizim dersleri, English Club ve 3B Çizio Adası tek abonelikte.'}
          </p>
          <ul className="premium__list">
            <li><Palette size={22} /><span><b>{LESSON_META.length} adım adım çizim dersi</b><small>Ücretsiz sürümde {FREE_LESSON_COUNT} ders</small></span></li>
            <li><Globe2 size={22} /><span><b>Çizio Adası</b><small>3B ada, yarışlar, portallar, inşa ve evin</small></span></li>
            <li><BookOpen size={22} /><span><b>English Club'ın tamamı</b><small>Her gün English Time, {TOPICS.length} kelime konusu, bütün hikaye ve şarkılar</small></span></li>
            <li><Sparkles size={22} /><span><b>Yeni içerikler</b><small>Eklenen her ders ve etkinlik dahil</small></span></li>
            <li><ShieldCheck size={22} /><span><b>Reklam yok, güvenli</b><small>Çocuğunuza satın alma gösterilmez</small></span></li>
          </ul>
        </section>

        <section className="premium__buy paper-card">
          {m.premium ? (
            <div className="premium__status">
              <Check size={34} strokeWidth={3} className="premium__ok" />
              <p><b>{m.plan === 'annual' ? 'Yıllık' : 'Aylık'} Premium{m.trial ? ' (ücretsiz deneme)' : ''}</b></p>
              {m.until && <p className="muted">{m.renews ? `${dateTR(m.until)} tarihinde yenilenir` : `${dateTR(m.until)} tarihine kadar açık`}</p>}
              {native && <button className="btn-outline btn-outline--sm" onClick={manage}><Settings2 size={16} /> Aboneliği yönet</button>}
            </div>
          ) : !PREMIUM_ACIK ? (
            <p className="muted">Çizio şu an tamamen ücretsiz. Premium çok yakında!</p>
          ) : native && !canPurchase() ? (
            <p className="muted">Premium bu sürümde henüz satın alınamıyor. Uygulamayı güncellediğinizde açılacak.</p>
          ) : !native ? (
            <div className="premium__web">
              <p>Premium'a Çizio'nun telefon ve tablet uygulamasından geçebilirsiniz.</p>
              <a className="pill" href={STORE_LINKS.android} target="_blank" rel="noreferrer">Google Play'den indir</a>
            </div>
          ) : (
            <>
              <div className="premium__plans" role="radiogroup" aria-label="Plan seçin">
                {m.offers.map((o) => (
                  <button key={o.plan} role="radio" aria-checked={plan === o.plan} className={`premium-plan ${plan === o.plan ? 'on' : ''}`}
                    onClick={() => { sfx.tap(); setPlan(o.plan); }}>
                    {o.plan === 'annual' && saving > 0 && <span className="premium-plan__tag">%{saving} indirim</span>}
                    <b>{o.plan === 'annual' ? 'Yıllık' : 'Aylık'}</b>
                    <span className="premium-plan__price">{o.price}<small>{o.plan === 'annual' ? ' / yıl' : ' / ay'}</small></span>
                    {o.plan === 'annual' && o.perMonth && <small className="muted">ayda {o.perMonth}</small>}
                  </button>
                ))}
              </div>
              <button className="pill pill--big pill--go premium__cta" disabled={m.busy || m.status === 'loading'} onClick={() => void buy(chosen.plan)}>
                {m.busy ? <Loader2 className="spin" size={22} /> : <Crown size={22} />}
                {chosen.trialDays ? `${chosen.trialDays} gün ücretsiz dene` : "Premium'a geç"}
              </button>
              <p className="premium__then">
                {chosen.trialDays ? `Deneme bitince ${chosen.price} / ${chosen.plan === 'annual' ? 'yıl' : 'ay'}. Deneme bitmeden iptal ederseniz ücret alınmaz.` : `${chosen.price} / ${chosen.plan === 'annual' ? 'yıl' : 'ay'}`}
              </p>
              {m.error && <p className="online-send__err">{m.error}</p>}
              {m.status === 'unavailable' && !m.error && <p className="online-send__err">{store}'a şu an bağlanılamıyor. İnternet bağlantısını kontrol edip tekrar deneyin.</p>}
              <button className="btn-outline btn-outline--sm" disabled={m.busy} onClick={() => void restore().then(setRestored)}><RotateCcw size={16} /> Satın alımı geri yükle</button>
              {restored === false && <p className="muted premium__small">Bu {store} hesabında Premium bulunamadı. Başka bir cihazda aldıysanız aynı Çizio hesabıyla giriş yapın.</p>}
            </>
          )}

          {PREMIUM_ACIK && (
            <button className="premium__account" onClick={() => nav('/hesap', { state: { gated: true } })}>
              <UserRound size={20} />
              {user ? <span>Hesap: <b>{user.email ?? 'Apple ile giriş'}</b></span> : <span><b>Hesap açın:</b> Premium yeni telefonda da açık olsun</span>}
            </button>
          )}

          {PREMIUM_ACIK && native && !m.premium && (
            <p className="premium__fine">
              Ödeme, onayladığınızda {store} hesabınızdan alınır. Abonelik, dönem bitmeden en az 24 saat önce iptal edilmezse aynı
              fiyatla kendiliğinden yenilenir. Aboneliğinizi {store} abonelik ayarlarından istediğiniz zaman yönetebilir ve iptal
              edebilirsiniz.
            </p>
          )}
          <p className="premium__legal">
            <a href={LEGAL.privacy} target="_blank" rel="noreferrer">Gizlilik politikası</a> · <a href={LEGAL.terms} target="_blank" rel="noreferrer">Kullanım koşulları</a>
          </p>
        </section>
      </main>
    </div>
  );
}
