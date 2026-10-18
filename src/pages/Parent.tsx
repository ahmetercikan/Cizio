/**
 * Ebeveyn bölümü (basit çarpma sorusuyla korunur): profiller, ses, çizim ayarları, ilerleme ve yedekleme.
 */
import { ParentPremium } from '../world/ParentPremium';
import { WeekSummary } from '../components/WeekCard';
import { Download, Trash2, Upload, Volume2, Printer } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Confirm, TopBar, useToast } from '../components/ui';
import { Gate } from '../components/Gate';
import { lessons, lessonsByPath, paths } from '../lessons';
import { blobToDataUrl, dataUrlToBlob, deleteArtworksOf, listArtworks, saveArtwork, type Artwork } from '../lib/gallery';
import { setNaturalVoice, speak, speechSupported, testVoice, turkishVoices } from '../lib/speech';
import { saveFile } from '../lib/files';
import { coloringPdf } from '../lib/coloring';
import { weekTheme } from '../lib/theme';
import { addDays, dayKey, TR_DAYS } from '../lib/util';
import { useApp } from '../store/useApp';
import { AvatarArt, AVATARS } from '../components/Avatars';
import { Doodles } from '../components/Doodles';
import { ParentOnline } from '../online/ParentOnline';
import { ParentPlus } from '../world/ParentPlus';
import { PLUS_ENABLED } from '../world/plus';
import { AGES, ALL_WORDS, HOME_PHRASES, known, STORIES } from '../english/data';
import { say as sayEn } from '../english/voice';

/** Yazdırılabilir boyama sayfaları. */
function ColoringCard({ name }: { name: string }) {
  const data = useApp((x) => (x.activeId ? x.data[x.activeId] : undefined));
  const [busy, setBusy] = useState<string | null>(null);
  const tema = weekTheme();
  const favoriler = (data?.favorites ?? []).map((id) => lessons.find((l) => l.id === id)).filter(Boolean) as typeof lessons;
  const bitirilen = lessons.filter((l) => data?.lessons?.[l.id]);

  const setler: { id: string; ad: string; ders: typeof lessons }[] = [
    { id: 'tema', ad: `Bu haftanın teması: ${tema.title}`, ders: tema.lessons.slice(0, 8) },
    ...(favoriler.length ? [{ id: 'fav', ad: `Favorileri (${favoriler.length})`, ders: favoriler.slice(0, 12) }] : []),
    ...(bitirilen.length ? [{ id: 'bit', ad: `Bitirdiği dersler (${bitirilen.length})`, ders: bitirilen.slice(0, 12) }] : []),
  ];

  const yap = async (set: { id: string; ad: string; ders: typeof lessons }) => {
    setBusy(set.id);
    try {
      const blob = await coloringPdf(set.ders, name);
      await saveFile(blob, `cizio-boyama-${set.id}.pdf`, 'Boyama sayfaları');
    } catch {
      /* iptal edildi ya da kaydedilemedi */
    }
    setBusy(null);
  };

  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }}>
      <h2 className="card-title">Boyama sayfaları</h2>
      <p className="muted" style={{ fontWeight: 600 }}>
        Çizimlerin boş konturlarını PDF olarak kaydedin, yazdırıp {name} ile ekransız boyayın.
        Her sayfada iki çizim var.
      </p>
      <div className="limit-row">
        {setler.map((s) => (
          <button key={s.id} className="limit-chip" disabled={!!busy} onClick={() => yap(s)}>
            <Printer size={16} /> {busy === s.id ? 'Hazırlanıyor…' : s.ad}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Günlük ekran süresi sınırı (çocuk başına). */
function ScreenTimeCard() {
  const setLimit = useApp((x) => x.setLimit);
  const addBonus = useApp((x) => x.addBonus);
  const active = useApp((x) => x.activeId);
  const d = useApp((x) => (x.activeId ? x.data[x.activeId] : undefined));
  const name = useApp((x) => x.profiles.find((p) => p.id === x.activeId)?.name ?? '');
  const k = dayKey();
  const limit = d?.limitMin ?? 0;
  const used = d?.used?.[k] ?? 0;
  const bonus = d?.bonusMin?.[k] ?? 0;
  if (!active) return null;
  const secenekler = [0, 15, 30, 45, 60, 90];
  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }}>
      <h2 className="card-title">Ekran süresi — {name}</h2>
      <p className="muted" style={{ fontWeight: 600 }}>
        Günlük sınır dolunca çocuğa nazik bir "mola zamanı" ekranı çıkar. Süre yalnızca uygulama açıkken işler;
        ebeveyn bölümü sınırın dışındadır.
      </p>
      <div className="limit-row">
        {secenekler.map((m) => (
          <button key={m} className={`limit-chip ${limit === m ? 'on' : ''}`} onClick={() => setLimit(m)}>
            {m === 0 ? 'Sınırsız' : `${m} dk`}
          </button>
        ))}
      </div>
      {limit > 0 && (
        <p className="limit-used">
          Bugün: <b>{used}</b> / {limit + bonus} dakika{bonus ? ` (${bonus} dk ek izin)` : ''}
          <button className="btn-outline btn-outline--sm" style={{ marginLeft: 10 }} onClick={() => addBonus(15)}>Bugün 15 dk ekle</button>
        </p>
      )}
    </section>
  );
}

interface Backup {
  app: 'cizio' | 'ciziktir';
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

  if (!ok) return <div className="bg"><Doodles variant={1} /><Gate onPass={() => setOk(true)} onCancel={() => nav(-1)} /></div>;

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 13));
  const maxL = Math.max(1, ...last14.map((d) => data?.days[dayKey(d)]?.lessons ?? 0));
  const minutes = Object.values(data?.days ?? {}).reduce((a, d) => a + d.minutes, 0);

  const exportAll = async () => {
    const arts = await listArtworks();
    const backup: Backup = {
      app: 'cizio',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: { profiles: s.profiles, data: s.data, settings: s.settings, activeId: s.activeId },
      artworks: await Promise.all(arts.map(async ({ blob, ...rest }) => ({ ...rest, data: await blobToDataUrl(blob) }))),
    };
    await saveFile(new Blob([JSON.stringify(backup)], { type: 'application/json' }), `cizio-yedek-${dayKey()}.json`, 'Çizio yedeği');
  };

  const importAll = async (file?: File) => {
    if (!file) return;
    try {
      const b = JSON.parse(await file.text()) as Backup;
      // Eski adla (önceki sürüm) alınmış yedekler de kabul edilir.
      if (b.app !== 'cizio' && b.app !== 'ciziktir') throw new Error('format');
      s.replaceAll(b.state as Parameters<typeof s.replaceAll>[0]);
      for (const { data: d, ...rest } of b.artworks) await saveArtwork({ ...rest, blob: await dataUrlToBlob(d) });
      showToast('Yedek geri yüklendi.');
    } catch {
      showToast('Bu dosya bir Çizio yedeği değil.');
    }
  };

  return (
    <div className="bg settings-page">
      <Doodles variant={3} />
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

      {active && data && (
        <section className="paper-card settings-card" style={{ marginTop: 16 }}>
          <h2 className="card-title">English Club — {active.name}</h2>
          <p className="muted" style={{ fontWeight: 600 }}>
            {data.english?.sessions.length ?? 0} gün English Time · {ALL_WORDS.filter((w) => data.english && known(data.english, w.id)).length} / {ALL_WORDS.length} kelime biliniyor · {data.english?.stories.length ?? 0} / {STORIES.length} hikaye
          </p>
          <div className="toggle-row">
            <span>Yaş grubu</span>
            <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {AGES.map((a) => (
                <button key={a.id} className="btn-outline btn-outline--sm"
                  style={data.english?.age === a.id ? { borderColor: '#3f7fe0', color: '#2a62bd' } : undefined} onClick={() => s.setEnglishAge(a.id)}>
                  {a.label} · {a.years}
                </button>
              ))}
            </span>
          </div>
          {data.english && ALL_WORDS.some((w) => known(data.english!, w.id)) && (
            <p className="muted" style={{ fontWeight: 600, marginTop: 10 }}>
              Bildiği kelimeler: {ALL_WORDS.filter((w) => known(data.english!, w.id)).map((w) => `${w.en} (${w.tr})`).join(', ')}
            </p>
          )}
          <h3 style={{ margin: '16px 0 0', fontSize: 18 }}>Evde İngilizce</h3>
          <ul className="en-parent-tips">
            <li>Her gün 15–20 dakika yeter. Aynı saatte "English Time" yapmak alışkanlık kazandırır.</li>
            <li>Hatayı düzeltmeyin, doğrusunu tekrar edin: çocuk "I goed" derse "Yes, you went to the park!" deyin.</li>
            <li>"Bu ne demek?" diye çeviri istemeyin. Resimle, hareketle ve jestle anlatın.</li>
            <li>Komut verin, birlikte yapın: "Jump!", "Clap your hands!", "Touch something blue!"</li>
            <li>Birlikte okuyun ve soru sorun: "Where is the cat? What color is it?"</li>
            <li>Ekranı pasif izlemeye çevirmeyin. Şarkıları ve diyalogları birlikte canlandırın.</li>
          </ul>
          <div className="en-parent-phrases">
            {HOME_PHRASES.map((p) => (
              <button key={p.en} className="en-parent-phrase" onClick={() => sayEn(p.en)}>
                <Volume2 size={20} />
                <span><b>{p.en}</b><small>{p.tr} · {p.when}</small></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {active && data && <WeekSummary data={data} name={active.name} />}

      {active && <ColoringCard name={active.name} />}

      {active && <ScreenTimeCard />}

      <section className="paper-card settings-card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Ses</h2>
        <label className="toggle-row">
          Sesli anlatım (Çizio konuşsun)
          <input type="checkbox" className="switch" checked={s.settings.narration} onChange={(e) => s.updateSettings({ narration: e.target.checked })} />
        </label>
        <label className="toggle-row">
          <span>Doğal ses<br /><small className="muted">İnsan sesine yakın, önceden kaydedilmiş anlatım</small></span>
          <input type="checkbox" className="switch" checked={s.settings.naturalVoice}
            onChange={(e) => { s.updateSettings({ naturalVoice: e.target.checked }); setNaturalVoice(e.target.checked); }} />
        </label>
        <VoiceCheck />
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
          onClick={() => speak('Merhaba! Ben Çizio. Birlikte çizim yapalım mı?', { rate: s.settings.rate, voiceURI: s.settings.voiceURI })}>
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
        <h2 className="card-title">Erişilebilirlik</h2>
        <p className="muted" style={{ fontWeight: 600 }}>Yazılar küçük geliyorsa ya da ekranı görmek zorsa buradan büyütün.</p>
        <div className="limit-row">
          {([[0, 'Normal'], [1, 'Büyük'], [2, 'Daha büyük']] as const).map(([v, ad]) => (
            <button key={v} className={`limit-chip ${(s.settings.zoom ?? 0) === v ? 'on' : ''}`} onClick={() => s.updateSettings({ zoom: v })}>{ad}</button>
          ))}
        </div>
        <label className="toggle-row">
          <span>Yüksek karşıtlık<br /><small className="muted">Yazılar daha koyu, kenarlar daha belirgin</small></span>
          <input type="checkbox" className="switch" checked={s.settings.contrast ?? false} onChange={(e) => s.updateSettings({ contrast: e.target.checked })} />
        </label>
      </section>

      {PLUS_ENABLED && <ParentPlus />}
        <ParentPremium />
      {active && <ParentOnline profile={active} toast={showToast} />}

      <section className="paper-card settings-card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Yedekleme</h2>
        <p className="muted" style={{ fontWeight: 600, marginBottom: 10 }}>
          Çizimler ve ilerleme yalnızca bu cihazda saklanır. (Çevrimiçi arkadaşlar açıksa yalnızca görünen ad, avatar ve arkadaşla oynanan oyunların sonuçları ile resimleri paylaşılır.) Başka bir cihaza taşımak için yedek alın.
        </p>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { void importAll(e.target.files?.[0]); e.target.value = ''; }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn-outline btn-outline--sm" onClick={exportAll}><Download size={18} /> Yedeği indir</button>
          <button className="btn-outline btn-outline--sm" onClick={() => fileRef.current?.click()}><Upload size={18} /> Yedeği yükle</button>
        </div>
      </section>

      <p className="sub" style={{ textAlign: 'center', marginTop: 20 }}>Çizio v{__APP_VERSION__}</p>
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

/** Doğal sesi dene: kayıtlı bir cümle çalar ve sonucu yazar (ses gelmiyorsa nedenini görmek için). */
function VoiceCheck() {
  const [msg, setMsg] = useState('');
  return (
    <div className="toggle-row">
      <button className="btn-outline btn-outline--sm" onClick={() => { setMsg('Deneniyor…'); void testVoice().then(setMsg); }}>
        <Volume2 size={18} /> Sesi dene
      </button>
      {msg && <small className="muted">{msg}</small>}
    </div>
  );
}
