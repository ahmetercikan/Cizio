/**
 * Ebeveyn bölümü (basit çarpma sorusuyla korunur): profiller, ses, çizim ayarları, ilerleme ve yedekleme.
 */
import { Download, Lock, Trash2, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Confirm, Modal, TopBar, useToast } from '../components/ui';
import { lessons, lessonsByPath, paths } from '../lessons';
import { blobToDataUrl, dataUrlToBlob, deleteArtworksOf, listArtworks, saveArtwork, type Artwork } from '../lib/gallery';
import { setNaturalVoice, speak, speechSupported, turkishVoices } from '../lib/speech';
import { addDays, dayKey, TR_DAYS } from '../lib/util';
import { useApp } from '../store/useApp';
import { AvatarArt, AVATARS } from '../components/Avatars';
import { FlowLine } from '../components/FlowLine';

function Gate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [q] = useState(() => [3 + Math.floor(Math.random() * 7), 3 + Math.floor(Math.random() * 7)] as const);
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const press = (k: string) => {
    setErr(false);
    if (k === '⌫') return setV((x) => x.slice(0, -1));
    const nv = (v + k).slice(0, 3);
    setV(nv);
    if (Number(nv) === q[0] * q[1]) onPass();
    else if (nv.length >= String(q[0] * q[1]).length) {
      setErr(true);
      setTimeout(() => setV(''), 500);
    }
  };
  return (
    <Modal onClose={onCancel}>
      <div style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
        <Lock size={36} style={{ justifySelf: 'center' }} color="var(--primary)" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Ebeveyn bölümü</h2>
        <p className="muted" style={{ fontWeight: 600 }}>Devam etmek için soruyu yanıtlayın:</p>
        <p style={{ fontSize: 36, fontWeight: 800 }}>{q[0]} × {q[1]} = <span style={{ color: err ? 'var(--danger)' : 'var(--primary)' }}>{v || '?'}</span></p>
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
            k ? <button key={i} className="btn-outline" onClick={() => press(k)}>{k}</button> : <span key={i} />,
          )}
        </div>
        <button className="btn-outline btn-outline--sm" onClick={onCancel}>Vazgeç</button>
      </div>
    </Modal>
  );
}

interface Backup {
  app: 'ciziktir';
  version: 1;
  exportedAt: string;
  state: unknown;
  artworks: (Omit<Artwork, 'blob'> & { data: string })[];
}

export default function Parent() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const s = useApp();
  const active = s.profiles.find((p) => p.id === s.activeId);
  const data = active ? s.data[active.id] : undefined;
  const [toast, showToast] = useToast();
  const [delProfile, setDelProfile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voices = useMemo(() => (ok ? turkishVoices() : []), [ok]);

  if (!ok) return <div className="bg"><FlowLine variant={1} /><Gate onPass={() => setOk(true)} onCancel={() => nav(-1)} /></div>;

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 13));
  const maxL = Math.max(1, ...last14.map((d) => data?.days[dayKey(d)]?.lessons ?? 0));
  const minutes = Object.values(data?.days ?? {}).reduce((a, d) => a + d.minutes, 0);

  const exportAll = async () => {
    const arts = await listArtworks();
    const backup: Backup = {
      app: 'ciziktir',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: { profiles: s.profiles, data: s.data, settings: s.settings, activeId: s.activeId },
      artworks: await Promise.all(arts.map(async ({ blob, ...rest }) => ({ ...rest, data: await blobToDataUrl(blob) }))),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciziktir-yedek-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const importAll = async (file?: File) => {
    if (!file) return;
    try {
      const b = JSON.parse(await file.text()) as Backup;
      if (b.app !== 'ciziktir') throw new Error('format');
      s.replaceAll(b.state as Parameters<typeof s.replaceAll>[0]);
      for (const { data: d, ...rest } of b.artworks) await saveArtwork({ ...rest, blob: await dataUrlToBlob(d) });
      showToast('Yedek geri yüklendi.');
    } catch {
      showToast('Bu dosya bir Çiziktir yedeği değil.');
    }
  };

  return (
    <div className="bg settings-page">
      <FlowLine variant={3} />
      <div className="settings-page__inner">
      <TopBar title="Ebeveyn bölümü" onBack={() => nav('/')} />

      <section className="paper-card settings-card">
        <h2 className="card-title">Profiller</h2>
        {s.profiles.map((p) => (
          <div key={p.id} className="toggle-row">
            <span className="row" style={{ gap: 10 }}>
              <AvatarArt id={p.avatar} size={48} />
              <input className="input input--inline" value={p.name} maxLength={20} aria-label="İsim"
                onChange={(e) => s.updateProfile(p.id, { name: e.target.value })} />
            </span>
            <span className="row" style={{ gap: 6 }}>
              {s.activeId !== p.id && <button className="btn-outline btn-outline--sm" onClick={() => s.setActive(p.id)}>Seç</button>}
              <button className="round-btn round-btn--soft" aria-label="Profili sil" onClick={() => setDelProfile(p.id)}><Trash2 size={20} /></button>
            </span>
          </div>
        ))}
        {active && (
          <div style={{ paddingTop: 12 }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>{active.name} için avatar:</p>
            <div className="avatar-grid avatar-grid--sm">
              {AVATARS.map((a) => (
                <button key={a.id} className={`avatar-pick avatar-pick--sm ${active.avatar === a.id ? 'on' : ''}`} aria-label={a.label} onClick={() => s.updateProfile(active.id, { avatar: a.id })}><AvatarArt id={a.id} size={56} /></button>
              ))}
            </div>
          </div>
        )}
        <button className="btn-outline btn-outline--sm" style={{ marginTop: 12 }} onClick={() => nav('/hosgeldin')}>+ Yeni profil</button>
      </section>

      {active && data && (
        <section className="paper-card settings-card" style={{ marginTop: 16 }}>
          <h2 className="card-title">{active.name} — ilerleme</h2>
          <p className="muted" style={{ fontWeight: 600 }}>
            {Object.keys(data.lessons).length} / {lessons.length} ders · toplam ~{minutes} dakika · {Object.keys(data.days).length} gün
          </p>
          <div className="bars" aria-label="Son 14 gün">
            {last14.map((d) => {
              const n = data.days[dayKey(d)]?.lessons ?? 0;
              return (
                <div key={dayKey(d)} className="bars__col" title={`${dayKey(d)}: ${n} ders`}>
                  <span style={{ height: `${(n / maxL) * 100}%` }} />
                  <small>{TR_DAYS[d.getDay()][0]}</small>
                </div>
              );
            })}
          </div>
          {paths.map((p) => {
            const ls = lessonsByPath(p.id);
            const done = ls.filter((l) => data.lessons[l.id]);
            const stars = done.reduce((a, l) => a + data.lessons[l.id].bestStars, 0);
            return (
              <div key={p.id} className="toggle-row">
                <span>{p.emoji} {p.title}</span>
                <span className="muted">{done.length}/{ls.length} ders · {stars}★</span>
              </div>
            );
          })}
        </section>
      )}

      <section className="paper-card settings-card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Ses</h2>
        <label className="toggle-row">
          Sesli anlatım (Kalemo konuşsun)
          <input type="checkbox" className="switch" checked={s.settings.narration} onChange={(e) => s.updateSettings({ narration: e.target.checked })} />
        </label>
        <label className="toggle-row">
          <span>Doğal ses<br /><small className="muted">İnsan sesine yakın, önceden kaydedilmiş anlatım</small></span>
          <input type="checkbox" className="switch" checked={s.settings.naturalVoice}
            onChange={(e) => { s.updateSettings({ naturalVoice: e.target.checked }); setNaturalVoice(e.target.checked); }} />
        </label>
        <label className="toggle-row">
          Ses efektleri
          <input type="checkbox" className="switch" checked={s.settings.sfx} onChange={(e) => s.updateSettings({ sfx: e.target.checked })} />
        </label>
        <label className="toggle-row">
          Konuşma hızı
          <input type="range" min={0.7} max={1.2} step={0.05} value={s.settings.rate} style={{ accentColor: 'var(--primary)' }}
            onChange={(e) => s.updateSettings({ rate: Number(e.target.value) })} />
        </label>
        {speechSupported && (
          <label className="toggle-row">
            Ses
            <select className="select" value={s.settings.voiceURI ?? ''} onChange={(e) => s.updateSettings({ voiceURI: e.target.value || undefined })}>
              <option value="">Otomatik</option>
              {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
            </select>
          </label>
        )}
        {speechSupported && voices.length === 0 && (
          <p className="muted" style={{ fontWeight: 600, paddingTop: 8 }}>
            Bu cihazda Türkçe ses bulunamadı. Cihaz ayarlarından Türkçe konuşma sesi indirebilirsiniz.
          </p>
        )}
        <button className="btn-outline btn-outline--sm" style={{ marginTop: 10 }}
          onClick={() => speak('Merhaba! Ben Kalemo. Birlikte çizim yapalım mı?', { rate: s.settings.rate, voiceURI: s.settings.voiceURI })}>
          Sesi dene
        </button>
      </section>

      <section className="paper-card settings-card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Çizim</h2>
        <label className="toggle-row">
          <span>Avuç içi koruması<br /><small className="muted">Kalem kullanılırken parmak dokunuşlarını yok say</small></span>
          <input type="checkbox" className="switch" checked={s.settings.palmRejection} onChange={(e) => s.updateSettings({ palmRejection: e.target.checked })} />
        </label>
        <label className="toggle-row">
          <span>Solak düzeni<br /><small className="muted">Araçlar tabletin sol tarafında</small></span>
          <input type="checkbox" className="switch" checked={s.settings.leftHanded} onChange={(e) => s.updateSettings({ leftHanded: e.target.checked })} />
        </label>
      </section>

      <section className="paper-card settings-card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Yedekleme</h2>
        <p className="muted" style={{ fontWeight: 600, marginBottom: 10 }}>
          Tüm veriler yalnızca bu cihazda saklanır, hiçbir sunucuya gönderilmez. Başka bir cihaza taşımak için yedek alın.
        </p>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { void importAll(e.target.files?.[0]); e.target.value = ''; }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn-outline btn-outline--sm" onClick={exportAll}><Download size={18} /> Yedeği indir</button>
          <button className="btn-outline btn-outline--sm" onClick={() => fileRef.current?.click()}><Upload size={18} /> Yedeği yükle</button>
        </div>
      </section>

      <p className="sub" style={{ textAlign: 'center', marginTop: 20 }}>Çiziktir v{__APP_VERSION__}</p>
      </div>

      {delProfile && (
        <Confirm
          title="Profil silinsin mi?"
          text="Bu profilin ilerlemesi ve tüm resimleri silinecek."
          yes="Sil"
          danger
          onNo={() => setDelProfile(null)}
          onYes={async () => {
            await deleteArtworksOf(delProfile);
            s.removeProfile(delProfile);
            setDelProfile(null);
            if (useApp.getState().profiles.length === 0) nav('/hosgeldin', { replace: true });
          }}
        />
      )}
      {toast}
    </div>
  );
}
