/**
 * Ebeveyn hesabı (ebeveyn kapısının arkasında): hesap aç / giriş yap / şifremi unuttum / Apple ile giriş,
 * girişliyken Premium durumu, çıkış ve hesabı silme. Web'de de çalışır: Google Play'in istediği
 * "hesap silme bağlantısı" https://ahmetercikan.github.io/Cizio/#/hesap?sil=1
 */
import { ArrowLeft, Crown, Eye, EyeOff, Loader2, LogOut, Mail, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Doodles } from '../components/Doodles';
import { Gate } from '../components/Gate';
import { Modal } from '../components/ui';
import {
  accountAvailable, appleAvailable, authMessage, deleteAccount, login, loginWithApple, logout, register, resetPassword, startAccount,
  useAccount,
} from '../account/auth';
import { useMembership } from '../account/membership';
import { PREMIUM_ACIK } from '../lib/flags';

export default function AccountPage() {
  const nav = useNavigate();
  const gated = !!(useLocation().state as { gated?: boolean } | null)?.gated;
  const [pass, setPass] = useState(gated);
  if (!pass) return <div className="bg"><Gate onPass={() => setPass(true)} onCancel={() => (history.length > 1 ? nav(-1) : nav('/'))} /></div>;
  return <AccountBody />;
}

function AccountBody() {
  const nav = useNavigate();
  const { ready, user } = useAccount();
  const [params] = useSearchParams();
  useEffect(() => void startAccount().catch(() => {}), []);
  return (
    <div className="bg premium">
      <Doodles variant={1} />
      <header className="premium__top">
        <button className="round-btn round-btn--light" aria-label="Geri" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}><ArrowLeft size={26} strokeWidth={2.6} /></button>
      </header>
      <main className="account rise">
        {!accountAvailable() ? (
          <p className="muted">Hesap bu sürümde kullanılamıyor.</p>
        ) : !ready ? (
          <Loader2 className="spin" size={36} />
        ) : user ? (
          <SignedIn wantDelete={params.get('sil') === '1'} />
        ) : (
          <SignForm />
        )}
      </main>
    </div>
  );
}

function SignForm() {
  const [mode, setMode] = useState<'register' | 'login' | 'reset'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setErr('');
    try {
      if (mode === 'register') await register(email, password);
      else if (mode === 'login') await login(email, password);
      else {
        await resetPassword(email);
        setSent(true);
      }
    } catch (e) {
      setErr(authMessage(e));
    }
    setBusy(false);
  };
  const apple = async () => {
    setBusy(true);
    setErr('');
    try {
      await loginWithApple();
    } catch (e) {
      setErr(authMessage(e));
    }
    setBusy(false);
  };

  return (
    <section className="account__card paper-card">
      <h1 className="title-lg">{mode === 'register' ? 'Ebeveyn hesabı açın' : mode === 'login' ? 'Giriş yapın' : 'Şifremi unuttum'}</h1>
      <p className="sub">
        {mode === 'reset'
          ? 'E-posta adresinizi yazın; şifrenizi yenilemeniz için bir bağlantı gönderelim.'
          : 'Premium başka bir telefonda ya da tablette de açık olsun. Hesap yalnızca e-postanızı tutar; çocuğunuzun bilgileri hesaba gönderilmez.'}
      </p>
      {mode !== 'reset' && (
        <div className="seg-light account__seg" role="tablist">
          <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr(''); }}>Hesap aç</button>
          <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); }}>Giriş yap</button>
        </div>
      )}
      {appleAvailable() && mode !== 'reset' && (
        <>
          <button className="account__apple" disabled={busy} onClick={() => void apple()}><AppleLogo /> Apple ile devam et</button>
          <p className="account__or"><span>ya da e-postayla</span></p>
        </>
      )}
      {sent ? (
        <p className="account__ok"><Mail size={20} /> Bağlantı gönderildi. E-postanızı (gerekirse gereksiz klasörünü) kontrol edin.</p>
      ) : (
        <form className="account__form" onSubmit={(e) => void submit(e)}>
          <label className="field">
            <span>E-posta</span>
            <input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />
          </label>
          {mode !== 'reset' && (
            <label className="field">
              <span>Şifre</span>
              <span className="field__pw">
                <input type={show ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'En az 6 karakter' : ''} />
                <button type="button" aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'} onClick={() => setShow(!show)}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </span>
            </label>
          )}
          {err && <p className="online-send__err">{err}</p>}
          <button className="pill pill--big pill--go" type="submit" disabled={busy}>
            {busy && <Loader2 className="spin" size={22} />} {mode === 'register' ? 'Hesabı aç' : mode === 'login' ? 'Giriş yap' : 'Bağlantı gönder'}
          </button>
        </form>
      )}
      {mode === 'login' && <button className="account__link" onClick={() => { setMode('reset'); setErr(''); setSent(false); }}>Şifremi unuttum</button>}
      {mode === 'reset' && <button className="account__link" onClick={() => { setMode('login'); setErr(''); setSent(false); }}>Girişe dön</button>}
    </section>
  );
}

function AppleLogo() {
  return (
    <svg width="20" height="24" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
      <path d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-164-40c-77 0-104 41-166 41s-106-57-156-127C45 791 0 668 0 551c0-188 122-288 243-288 64 0 117 42 157 42 39 0 99-45 172-45 28 0 128 3 194 81zM561 165c30-36 52-86 52-136 0-7-1-14-2-20-49 2-108 33-143 74-28 32-54 82-54 133 0 8 1 15 2 18 3 1 9 2 14 2 44 0 99-30 131-71z" />
    </svg>
  );
}

const dateTR = (ms?: number | null) => (ms ? new Date(ms).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

function SignedIn({ wantDelete }: { wantDelete: boolean }) {
  const nav = useNavigate();
  const user = useAccount((s) => s.user)!;
  const m = useMembership();
  const [del, setDel] = useState(wantDelete);
  return (
    <section className="account__card paper-card">
      <span className="account__avatar">{(user.email ?? 'A')[0].toUpperCase()}</span>
      <h1 className="title-lg">Hesabınız</h1>
      <p className="account__email">{user.email ?? 'Apple ile giriş'}</p>
      {PREMIUM_ACIK && (
        <div className={`account__plan ${m.premium ? 'is-on' : ''}`}>
          <Crown size={22} />
          {m.premium ? (
            <span><b>Çizio Premium</b>{m.until ? ` · ${m.renews ? 'yenilenme' : 'bitiş'}: ${dateTR(m.until)}` : ''}</span>
          ) : (
            <span><b>Ücretsiz</b> · Premium'a geçince bu hesaba bağlanır</span>
          )}
          <button className="pill pill--sm" onClick={() => nav('/premium', { state: { gated: true } })}>{m.premium ? 'Ayrıntılar' : "Premium'a geç"}</button>
        </div>
      )}
      <div className="account__actions">
        <button className="btn-outline btn-outline--sm" onClick={() => void logout()}><LogOut size={18} /> Çıkış yap</button>
        <button className="btn-outline btn-outline--sm account__danger" onClick={() => setDel(true)}><Trash2 size={18} /> Hesabı sil</button>
      </div>
      {del && <DeleteModal apple={user.apple} onClose={() => setDel(false)} />}
    </section>
  );
}

function DeleteModal({ apple, onClose }: { apple: boolean; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true);
    setErr('');
    try {
      await deleteAccount(password);
      onClose();
    } catch (e) {
      setErr(authMessage(e));
    }
    setBusy(false);
  };
  return (
    <Modal onClose={onClose}>
      <div className="account__del">
        <Trash2 size={36} color="var(--red)" />
        <h2 className="title-lg">Hesap silinsin mi?</h2>
        <p className="sub">
          Hesabınız ve e-postanız kalıcı olarak silinir. Çocuğunuzun çizimleri ve ilerlemesi bu cihazda kalır. Aboneliğiniz varsa
          mağazada sürer: iptal etmek için Google Play ya da App Store abonelik ayarlarını kullanın.
        </p>
        {!apple && (
          <label className="field">
            <span>Onaylamak için şifreniz</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {err && <p className="online-send__err">{err}</p>}
        <div className="row" style={{ gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-outline btn-outline--sm" onClick={onClose}>Vazgeç</button>
          <button className="pill pill--sm account__danger-btn" disabled={busy || (!apple && !password)} onClick={() => void go()}>
            {busy && <Loader2 className="spin" size={18} />} Kalıcı olarak sil
          </button>
        </div>
      </div>
    </Modal>
  );
}
