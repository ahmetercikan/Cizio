/**
 * Ebeveyn bölümü → Çevrimiçi arkadaşlar. Arkadaşlık yalnızca buradan (kilitli alandan) kurulur: ebeveyn kodu
 * girer, karşı tarafın ebeveyni onaylar. Çocuk tarafında arama, açık profil ya da yazışma yoktur.
 */
import { Check, Copy, Loader2, Search, UserMinus, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AvatarArt } from '../components/Avatars';
import { Confirm, Modal } from '../components/ui';
import { genitive } from '../lib/util';
import { useApp, type Profile } from '../store/useApp';
import { ONLINE_AVAILABLE, online } from './index';
import { useOnline, viewFor } from './store';
import { isOnlineNow, type PlayerInfo } from './types';

const fmt = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

export function ParentOnline({ profile, toast }: { profile: Profile; toast: (m: string) => void }) {
  const id = useApp((s) => s.data[profile.id]?.online);
  const setOnline = useApp((s) => s.setOnline);
  const st = useOnline();
  const v = viewFor(st, id?.pid);
  const [busy, setBusy] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [code, setCode] = useState('');
  const [found, setFound] = useState<PlayerInfo | null>(null);
  const [confirmOff, setConfirmOff] = useState(false);
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);

  // Kimlik hâlâ bu cihazın mı? (Uygulama silinip kurulduysa yeniden açmak gerekir.) Ad/avatar da eşitlenir.
  const fresh = useRef<string | null>(null); // bu ekranda az önce kaydedilen kimlik: doğrulamaya gerek yok
  useEffect(() => {
    if (!id) return setValid(null);
    let alive = true;
    online()
      .then(async (c) => {
        const ok = id.pid === fresh.current || (await c.stillMine(id));
        if (ok) await c.updateMe(id.pid, profile.name, profile.avatar);
        if (alive) setValid(ok);
      })
      .catch(() => alive && setValid(null));
    return () => {
      alive = false;
    };
  }, [id?.pid, profile.name, profile.avatar]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ONLINE_AVAILABLE) return null;

  const run = async (fn: () => Promise<void>, fail = 'İnternet bağlantısını kontrol edip tekrar deneyin.') => {
    setBusy(true);
    try {
      await fn();
    } catch {
      toast(fail);
    } finally {
      setBusy(false);
    }
  };

  const enable = () =>
    run(async () => {
      const c = await online();
      const reg = await c.register(profile.name, profile.avatar);
      fresh.current = reg.pid;
      setOnline(profile.id, reg);
      setValid(true);
    });

  const find = () =>
    run(async () => {
      const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (clean.length !== 6) return toast('Arkadaş kodu 6 karakterdir.');
      if (clean === id?.code) return toast(`Bu, ${genitive(profile.name)} kendi kodu.`);
      const p = await (await online()).lookupCode(clean);
      if (!p) return toast('Bu kodla bir arkadaş bulunamadı.');
      setFound(p);
    });

  const add = () =>
    run(async () => {
      const r = await (await online()).requestFriend(id!.pid, found!.pid);
      toast(r === 'accepted' ? `${found!.name} ile artık arkadaşsınız!` : r === 'exists' ? 'Bu arkadaşlık zaten var ya da onay bekliyor.' : 'İstek gönderildi. Karşı tarafın ebeveyni onaylayınca arkadaş olacaksınız.');
      setFound(null);
      setCode('');
    });

  const name = (pid: string) => st.players[pid]?.name ?? '…';
  const avatar = (pid: string) => st.players[pid]?.avatar ?? 'kedi';

  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }}>
      <h2 className="card-title"><Users size={22} style={{ verticalAlign: '-4px' }} /> Çevrimiçi arkadaşlar — {profile.name}</h2>

      {!id ? (
        <>
          <p className="muted" style={{ fontWeight: 600 }}>
            Çevrimiçi özellikleri açarsanız {profile.name}, sizin onayladığınız arkadaşlarıyla meydan okuma, canlı düello ve birlikte boyama oynayabilir.
          </p>
          <ul className="online-facts">
            <li>Arkadaşlar yalnızca ebeveyn onayıyla, bu kilitli bölümden eklenir. Arama ya da yabancıyla eşleşme yoktur.</li>
            <li>Mesajlaşma yoktur; çocuklar yalnızca hazır tepkiler (alkış, yıldız…) gönderebilir.</li>
            <li>Arkadaşların gördükleri: görünen ad ({profile.name}), avatar, meydan okuma sonuçları ve o oyunda çizilen resim.</li>
            <li>E-posta, telefon, konum ya da gerçek kimlik istenmez. İstediğiniz zaman kapatıp tüm çevrimiçi verileri silebilirsiniz.</li>
          </ul>
          <button className="btn-dark" disabled={busy} onClick={enable} style={{ marginTop: 12 }}>
            {busy ? <Loader2 className="spin" size={20} /> : <Users size={20} />} Çevrimiçi özellikleri aç
          </button>
        </>
      ) : valid === false ? (
        <>
          <p className="muted" style={{ fontWeight: 600 }}>Bu cihazdaki çevrimiçi kimlik artık geçerli değil (uygulama yeniden kurulmuş olabilir). Yeniden açınca yeni bir arkadaş kodu alınır; arkadaşları yeniden eklemek gerekir.</p>
          <button className="btn-dark" disabled={busy} onClick={enable}>Çevrimiçi özellikleri yeniden aç</button>
        </>
      ) : (
        <>
          <div className="online-code">
            <span className="online-code__label">{genitive(profile.name)} arkadaş kodu</span>
            <b className="online-code__value">{fmt(id.code)}</b>
            <button className="btn-outline btn-outline--sm" onClick={() => navigator.clipboard?.writeText(id.code).then(() => toast('Kod kopyalandı.')).catch(() => {})}>
              <Copy size={16} /> Kopyala
            </button>
          </div>
          <p className="muted" style={{ fontWeight: 600, marginTop: 6 }}>Bu kodu yalnızca tanıdığınız bir arkadaşın ebeveyniyle paylaşın.</p>

          <div className="online-add">
            <input className="input" value={code} maxLength={8} placeholder="Arkadaşın kodu (ör. ABC 123)" aria-label="Arkadaşın kodu"
              onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && find()} />
            <button className="btn-dark" disabled={busy || code.replace(/\s/g, '').length < 6} onClick={find}>
              {busy ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Bul
            </button>
          </div>

          {v && v.incoming.length > 0 && (
            <div className="online-list">
              <h3>Onay bekleyen istekler</h3>
              {v.incoming.map(({ f, pid }) => (
                <div key={f.id} className="toggle-row">
                  <span className="row" style={{ gap: 10 }}><AvatarArt id={avatar(pid)} size={40} /> <b>{name(pid)}</b> arkadaş olmak istiyor</span>
                  <span className="row" style={{ gap: 6 }}>
                    <button className="btn-dark btn-dark--sm" disabled={busy} onClick={() => run(async () => (await online()).acceptFriend(f.id))}><Check size={16} /> Onayla</button>
                    <button className="round-btn round-btn--soft" aria-label="Reddet" disabled={busy} onClick={() => run(async () => (await online()).removeFriendship(f.id))}><X size={18} /></button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {v && v.outgoing.length > 0 && (
            <div className="online-list">
              <h3>Gönderilen istekler</h3>
              {v.outgoing.map(({ f, pid }) => (
                <div key={f.id} className="toggle-row">
                  <span className="row" style={{ gap: 10 }}><AvatarArt id={avatar(pid)} size={40} /> <b>{name(pid)}</b> <small className="muted">onay bekleniyor</small></span>
                  <button className="btn-outline btn-outline--sm" disabled={busy} onClick={() => run(async () => (await online()).removeFriendship(f.id))}>Geri al</button>
                </div>
              ))}
            </div>
          )}

          <div className="online-list">
            <h3>Arkadaşlar {v ? `(${v.friends.length})` : ''}</h3>
            {v && v.friends.length === 0 && <p className="muted" style={{ fontWeight: 600 }}>Henüz arkadaş yok. Arkadaşınızın kodunu yukarıya girin.</p>}
            {v?.friends.map(({ f, pid }) => (
              <div key={f.id} className="toggle-row">
                <span className="row" style={{ gap: 10 }}>
                  <AvatarArt id={avatar(pid)} size={40} /> <b>{name(pid)}</b>
                  {isOnlineNow(st.players[pid]) && <span className="online-dot" title="Şu an uygulamada" />}
                </span>
                <button className="round-btn round-btn--soft" aria-label="Arkadaşlıktan çıkar" onClick={() => setRemoving({ id: f.id, name: name(pid) })}><UserMinus size={18} /></button>
              </div>
            ))}
          </div>

          <button className="btn-outline btn-outline--sm" style={{ marginTop: 16 }} onClick={() => setConfirmOff(true)}>Çevrimiçi özellikleri kapat</button>
        </>
      )}

      {found && (
        <Modal onClose={() => setFound(null)}>
          <div style={{ textAlign: 'center' }}>
            <AvatarArt id={found.avatar} size={96} />
            <h2 className="title-lg" style={{ marginTop: 10 }}>{found.name} arkadaş olarak eklensin mi?</h2>
            <p className="muted" style={{ fontWeight: 600 }}>İstek gönderilir; {genitive(found.name)} ebeveyni onaylayınca arkadaş olursunuz.</p>
          </div>
          <div className="modal-actions">
            <button className="btn-outline" onClick={() => setFound(null)}>Vazgeç</button>
            <button className="btn-dark" disabled={busy} onClick={add}>İstek gönder</button>
          </div>
        </Modal>
      )}
      {removing && (
        <Confirm title={`${removing.name} arkadaşlıktan çıkarılsın mı?`} yes="Çıkar" danger
          onNo={() => setRemoving(null)} onYes={() => { const r = removing; setRemoving(null); void run(async () => (await online()).removeFriendship(r.id)); }} />
      )}
      {confirmOff && (
        <Confirm title="Çevrimiçi özellikler kapatılsın mı?" text={`${genitive(profile.name)} arkadaş kodu, arkadaşlıkları, arkadaşlarıyla oynadığı oyunlar ve paylaşılan resimler sunucudan silinir. Cihazdaki çizimler ve ilerleme etkilenmez.`}
          yes="Kapat" danger onNo={() => setConfirmOff(false)}
          onYes={() => { setConfirmOff(false); void run(async () => { await (await online()).unregister(id!); await import('./rt').then((r) => r.forget(id!.pid)).catch(() => {}); setOnline(profile.id, undefined); }); }} />
      )}
    </section>
  );
}
