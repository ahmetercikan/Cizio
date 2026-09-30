/**
 * Karakter giydirme ("Giydir" sekmesi): kız ya da erkek, farklı tiplerde hazır karakterlerden biri seçilir;
 * sonra ten, saç, yüz, giysi, ayakkabı, şapka, gözlük, eldeki eşya ve arka plan değiştirilir. Giysilerin
 * rengi paletten seçilir. Ek olarak: "Şaşırt beni", fotoğraf çekip Galerim'e kaydetme, kombin dolabı ve
 * günün stil görevi (temaya uygun giydirince 2 yıldız, lige sayılır).
 */
import confetti from 'canvas-confetti';
import { Camera, Check, Heart, RefreshCw, Shuffle, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useToast } from '../components/ui';
import {
  BACKS, BGS, BOTTOMS, CLOTH_COLORS, DRESSES, FACES, GLASSES, HAIR_COLORS, HAIRS, HANDS, HATS, PATTERNS, PETS, PRESETS, SHOES, SKINS, THEME_GOAL, TOPS,
  randomOutfit, themeMatches, todayTheme, type DollState, type Gender, type Item,
} from '../dressup/catalog';
import { Doll, REGIONS } from '../dressup/Doll';
import { PatternDef } from '../dressup/extras';
import { CatIcon, ThemeArt } from '../dressup/Icons';
import { saveArtwork } from '../lib/gallery';
import { sfx } from '../lib/sfx';
import { dayKey, uid } from '../lib/util';
import { useApp, useProfile, useProfileData } from '../store/useApp';
import { ownsRare } from '../lib/rewards';

type ColorKey = 'hairColor' | 'topColor' | 'bottomColor' | 'dressColor' | 'shoesColor' | 'hatColor';
type PatternKey = 'topPattern' | 'bottomPattern' | 'dressPattern';

interface Category {
  id: string;
  label: string;
  key: keyof DollState;
  items: Item[];
  region: string;
  color?: ColorKey;
  colors?: string[];
  pattern?: PatternKey;
  /** Giysi mi (seçince kumaş sesi) */
  wear?: boolean;
}

const CATS: Category[] = [
  { id: 'yuz', label: 'Yüz', key: 'face', items: FACES, region: 'face' },
  { id: 'sac', label: 'Saç', key: 'hair', items: HAIRS, region: 'hair', color: 'hairColor', colors: HAIR_COLORS },
  { id: 'ust', label: 'Üst', key: 'top', items: TOPS, region: 'top', color: 'topColor', colors: CLOTH_COLORS, pattern: 'topPattern', wear: true },
  { id: 'alt', label: 'Alt', key: 'bottom', items: BOTTOMS, region: 'bottom', color: 'bottomColor', colors: CLOTH_COLORS, pattern: 'bottomPattern', wear: true },
  { id: 'elbise', label: 'Elbise', key: 'dress', items: DRESSES, region: 'dress', color: 'dressColor', colors: CLOTH_COLORS, pattern: 'dressPattern', wear: true },
  { id: 'ayakkabi', label: 'Ayakkabı', key: 'shoes', items: SHOES, region: 'shoes', color: 'shoesColor', colors: CLOTH_COLORS, wear: true },
  { id: 'sapka', label: 'Şapka', key: 'hat', items: HATS, region: 'hat', color: 'hatColor', colors: CLOTH_COLORS, wear: true },
  { id: 'gozluk', label: 'Gözlük', key: 'glasses', items: GLASSES, region: 'face', wear: true },
  { id: 'elde', label: 'Elde', key: 'hand', items: HANDS, region: 'hand' },
  { id: 'sirt', label: 'Sırt', key: 'back', items: BACKS, region: 'back', wear: true },
  { id: 'dost', label: 'Dost', key: 'pet', items: PETS, region: 'pet' },
  { id: 'fon', label: 'Yer', key: 'bg', items: BGS, region: 'full' },
];

const LockMark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10" width="14" height="11" rx="3" fill="#ffc83d" stroke="#3a2b27" strokeWidth="2" /><path d="M8,10 V7 a4,4 0 0,1 8,0 V10" fill="none" stroke="#3a2b27" strokeWidth="2" /></svg>
);
const SparkMark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12,2 l2.6,6.4 l6.4,2.6 l-6.4,2.6 l-2.6,6.4 l-2.6,-6.4 l-6.4,-2.6 l6.4,-2.6 Z" fill="#ffc83d" stroke="#3a2b27" strokeWidth="1.6" strokeLinejoin="round" /></svg>
);

/** Desen seçim düğmesi: mevcut giysi renginde küçük bir kumaş parçası. */
function PatternSwatch({ kind, color }: { kind: string; color: string }) {
  const id = `sw${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
      <defs><PatternDef id={id} kind={kind} color={color} /></defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill={color} />
      {kind !== 'duz' && <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${id})`} />}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="none" stroke="#3a2b27" strokeWidth="2.5" />
    </svg>
  );
}

/** Bir parçayı giyince tutarlılık: üst/alt seçilirse elbise çıkar. */
function wear(d: DollState, key: keyof DollState, value: string): DollState {
  const next = { ...d, [key]: value } as DollState;
  if (key === 'top' || key === 'bottom') next.dress = '';
  return next;
}

export default function DressUp() {
  const data = useProfileData();
  const [picking, setPicking] = useState(!data.doll);
  if (picking || !data.doll) return <Picker current={data.doll} onDone={() => setPicking(false)} />;
  return <Studio d={data.doll} onChangeCharacter={() => setPicking(true)} />;
}

// ------------------------------------------------------------------------------------------------
// Karakter seçimi
// ------------------------------------------------------------------------------------------------
function Picker({ current, onDone }: { current?: DollState; onDone: () => void }) {
  const setDoll = useApp((s) => s.setDoll);
  const [gender, setGender] = useState<Gender>(current?.gender ?? 'kiz');
  const list = PRESETS.filter((p) => p.gender === gender);
  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">Önce karakterini seç, sonra istediğin gibi giydir!</p>
          <h1 className="title-xl">Karakterini seç</h1>
        </div>
      </header>
      <div className="gender-toggle rise" role="radiogroup" aria-label="Karakter">
        {(['kiz', 'erkek'] as Gender[]).map((g) => (
          <button key={g} type="button" role="radio" aria-checked={gender === g} className={`gender-btn ${gender === g ? 'on' : ''}`} onClick={() => { sfx.tab(); setGender(g); }}>
            <span className="gender-btn__face"><Doll d={PRESETS.find((p) => p.gender === g)!} bg={false} viewBox={REGIONS.head} /></span>
            {g === 'kiz' ? 'Kız' : 'Erkek'}
          </button>
        ))}
      </div>
      <div className="preset-grid">
        {list.map((p, i) => (
          <button key={p.name} type="button" className="preset-card rise" style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => { sfx.wear(); setDoll({ ...p }); onDone(); }}>
            <Doll d={{ ...p, bg: '' }} bg={false} viewBox="20 0 260 440" className="preset-card__doll" />
            <b>{p.name}</b>
          </button>
        ))}
      </div>
      {current && (
        <div className="picker-back">
          <button type="button" className="btn-outline" onClick={onDone}>Vazgeç, {current.name} ile devam et</button>
        </div>
      )}
    </AppShell>
  );
}

// ------------------------------------------------------------------------------------------------
// Stüdyo
// ------------------------------------------------------------------------------------------------
function Studio({ d, onChangeCharacter }: { d: DollState; onChangeCharacter: () => void }) {
  const profile = useProfile()!;
  const data = useProfileData();
  const setDoll = useApp((s) => s.setDoll);
  const saveLook = useApp((s) => s.saveLook);
  const removeLook = useApp((s) => s.removeLook);
  const recordStyle = useApp((s) => s.recordStyle);
  const [cat, setCat] = useState(CATS[2]);
  const [toast, showToast] = useToast();
  const [shake, setShake] = useState(0);
  const [flash, setFlash] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const theme = todayTheme(profile.id);
  const matches = themeMatches(d, theme);
  const doneToday = data.styled?.includes(dayKey()) ?? false;

  const update = (next: DollState) => setDoll(next);

  const surprise = () => {
    sfx.pop();
    sfx.wear();
    setShake((n) => n + 1);
    update(randomOutfit(d));
  };

  const photo = async () => {
    const svg = stageRef.current?.querySelector('svg');
    if (!svg) return;
    sfx.shutter();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 450);
    const W = 600, H = 880;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(W));
    clone.setAttribute('height', String(H));
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
    try {
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      c.getContext('2d')!.drawImage(img, 0, 0, W, H);
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
      if (!blob) throw new Error('png');
      await saveArtwork({ id: uid(), profileId: profile.id, kind: 'style', createdAt: Date.now(), blob });
      showToast('📸 Fotoğraf Galerim\'e kaydedildi!');
    } catch {
      showToast('Fotoğraf kaydedilemedi.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const submitTheme = () => {
    if (doneToday || matches.length < THEME_GOAL) return;
    recordStyle();
    sfx.fanfare();
    void confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, disableForReducedMotion: true });
    showToast('Harika kombin! 2 yıldız kazandın ⭐⭐');
  };

  const sameAsCurrent = (x: DollState) => JSON.stringify(x) === JSON.stringify(d);

  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">{d.name} bugün ne giysin?</p>
          <h1 className="title-xl">Giydir</h1>
        </div>
      </header>

      <div className="studio">
        <section className="studio__left">
          <div ref={stageRef} className={`studio__stage ${flash ? 'flash' : ''}`}>
            <Doll key={shake} d={d} className={`studio__doll ${shake ? 'wiggle-once' : ''}`} />
          </div>
          <div className="studio__actions">
            <button type="button" className="studio-btn" onClick={surprise}><Shuffle size={20} /> Şaşırt beni</button>
            <button type="button" className="studio-btn" onClick={() => void photo()}><Camera size={20} /> Fotoğraf çek</button>
            <button type="button" className="studio-btn" disabled={(data.looks ?? []).some(sameAsCurrent)}
              onClick={() => { sfx.success(); saveLook({ ...d }); showToast('Kombin dolabına eklendi!'); }}>
              <Heart size={20} /> Kombini sakla
            </button>
            <button type="button" className="studio-btn studio-btn--ghost" onClick={onChangeCharacter}><RefreshCw size={18} /> Karakter</button>
          </div>
        </section>

        <section className="studio__right">
          {/* Günün stil görevi */}
          <div className={`style-quest ${doneToday ? 'done' : ''}`}>
            <span className="style-quest__art"><ThemeArt id={theme.id} /></span>
            <div className="style-quest__text">
              <span className="style-quest__label">Günün stil görevi</span>
              <b>{theme.title}</b>
              <span>{doneToday ? 'Bugünkü görevi tamamladın! Yarın yeni tema var.' : theme.desc}</span>
              {!doneToday && (
                <span className="style-quest__dots" aria-label={`${matches.length} / ${THEME_GOAL}`}>
                  {Array.from({ length: THEME_GOAL }, (_, i) => <i key={i} className={i < matches.length ? 'on' : ''} />)}
                  <small>{matches.length > 0 ? matches.slice(0, 4).join(', ') : 'Temaya uygun parçalar seç'}</small>
                </span>
              )}
            </div>
            {doneToday ? (
              <span className="style-quest__ok"><Check size={22} strokeWidth={3} /></span>
            ) : (
              <button type="button" className="pill pill--sm" disabled={matches.length < THEME_GOAL} onClick={submitTheme}>Göster ⭐⭐</button>
            )}
          </div>

          <div className="cat-tabs" role="tablist" aria-label="Giysi türleri">
            {CATS.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={cat.id === c.id} className={`cat-tab ${cat.id === c.id ? 'on' : ''}`} onClick={() => { sfx.tab(); setCat(c); }}>
                <span className="cat-tab__icon"><CatIcon id={c.id} /></span> {c.label}
              </button>
            ))}
          </div>

          {cat.id === 'yuz' && (
            <div className="swatches" aria-label="Ten rengi">
              {SKINS.map((s) => (
                <button key={s} type="button" className={`swatch ${d.skin === s ? 'on' : ''}`} style={{ background: s }} aria-label="Ten rengi" onClick={() => { sfx.select(); update({ ...d, skin: s }); }} />
              ))}
              <button type="button" className={`toggle-chip ${d.freckles ? 'on' : ''}`} onClick={() => { sfx.select(); update({ ...d, freckles: !d.freckles }); }}>Çiller</button>
            </div>
          )}

          <div className="item-grid">
            {cat.items.map((it) => {
              const preview = wear(d, cat.key, it.id);
              const on = (d[cat.key] ?? '') === it.id && (cat.key !== 'top' && cat.key !== 'bottom' ? true : !d.dress);
              const locked = !!it.rare && !ownsRare(data, cat.key, it.id);
              return (
                <button key={it.id || 'none'} type="button" className={`item-btn ${on ? 'on' : ''} ${it.rare ? 'rare' : ''} ${locked ? 'locked' : ''}`} title={it.title}
                  onClick={() => {
                    if (locked) {
                      sfx.soft();
                      showToast('Bu nadir eşya hazine sandığından çıkar! Görevleri yap, sandık kazan.');
                      return;
                    }
                    if (cat.wear && it.id) sfx.wear();
                    else sfx.select();
                    update(wear(d, cat.key, it.id));
                  }}>
                  <Doll d={preview} bg={cat.id === 'fon'} viewBox={REGIONS[cat.region]} className="item-btn__art" title={it.title} />
                  <span>{locked ? 'Sandıktan çıkar' : it.title}</span>
                  {it.rare && <span className="item-btn__rare" aria-hidden="true">{locked ? <LockMark /> : <SparkMark />}</span>}
                </button>
              );
            })}
          </div>

          {cat.color && cat.colors && (cat.key !== 'dress' || d.dress) && (cat.key !== 'hat' || d.hat) && (
            <div className="swatches" aria-label="Renk">
              {cat.colors.map((c) => (
                <button key={c} type="button" className={`swatch ${d[cat.color!] === c ? 'on' : ''}`} style={{ background: c }} aria-label="Renk"
                  onClick={() => { sfx.select(); update({ ...d, [cat.color!]: c }); }} />
              ))}
            </div>
          )}

          {cat.pattern && (cat.key !== 'dress' || d.dress) && (cat.key === 'dress' || !d.dress) && (
            <div className="patterns" aria-label="Desen">
              {PATTERNS.map((p) => (
                <button key={p.id} type="button" className={`pattern-btn ${(d[cat.pattern!] ?? 'duz') === p.id ? 'on' : ''}`} title={p.title}
                  onClick={() => { sfx.select(); update({ ...d, [cat.pattern!]: p.id }); }}>
                  <PatternSwatch kind={p.id} color={d[cat.color!] as string} />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          )}

          {(data.looks?.length ?? 0) > 0 && (
            <div className="looks">
              <b className="looks__title"><Heart size={16} /> Kombin dolabım</b>
              <div className="looks__row">
                {data.looks!.map((l, i) => (
                  <div key={i} className="look">
                    <button type="button" className="look__btn" aria-label="Bu kombini giy" onClick={() => { sfx.wear(); update({ ...l }); }}>
                      <Doll d={l} viewBox="20 0 260 440" />
                    </button>
                    <button type="button" className="look__del" aria-label="Kombini sil" onClick={() => removeLook(i)}><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      {toast}
    </AppShell>
  );
}
