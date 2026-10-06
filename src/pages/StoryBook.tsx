/**
 * Hikaye kitabım: çocuk galerisinden 2-5 resim ve bir masal konusu seçer; Çizio bunlardan bir masal kurar,
 * sayfa sayfa sesli okur. Kitap PDF olarak kaydedilip paylaşılabilir (büyükanneye hediye!).
 */
import { ArrowLeft, ArrowRight, BookOpen, Check, Download, Loader2, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Doodles } from '../components/Doodles';
import { Mascot } from '../components/Mascot';
import { Confirm, useToast } from '../components/ui';
import { getLesson } from '../lessons';
import { saveFile } from '../lib/files';
import { getArtwork, listArtworks, type Artwork } from '../lib/gallery';
import { canvasToJpeg, makePdf } from '../lib/pdf';
import { sfx } from '../lib/sfx';
import { speak, stopSpeaking } from '../lib/speech';
import { genitive, uid } from '../lib/util';
import { buildStory, STORY_PICK, STORY_START, STORY_THEME_PICK, THEMES, type StoryTheme } from '../story/data';
import { useApp, useProfile, useProfileData, type StoryBookData } from '../store/useApp';

const MAX_ARTS = 5;
const artTitle = (a: Artwork) => (a.lessonId ? getLesson(a.lessonId)?.title ?? 'Çizim' : a.kind === 'style' ? 'Kombinim' : 'Serbest çizim');
const themeOf = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];

function useArtUrls(items: Artwork[]) {
  const urls = useMemo(() => new Map(items.map((a) => [a.id, URL.createObjectURL(a.blob)])), [items]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

// ------------------------------------------------------------------------------------------------
// Kitaplık ve yeni masal (/hikaye)
// ------------------------------------------------------------------------------------------------
export default function StoryShelf() {
  const profile = useProfile()!;
  const data = useProfileData();
  const settings = useApp((s) => s.settings);
  const addBook = useApp((s) => s.addBook);
  const removeBook = useApp((s) => s.removeBook);
  const nav = useNavigate();
  const [items, setItems] = useState<Artwork[] | null>(null);
  const [step, setStep] = useState<'shelf' | 'pick' | 'theme'>('shelf');
  const [picked, setPicked] = useState<string[]>([]);
  const [del, setDel] = useState<StoryBookData | null>(null);
  const urls = useArtUrls(items ?? []);
  const books = data.books ?? [];

  useEffect(() => {
    void listArtworks(profile.id).then(setItems);
  }, [profile.id]);
  useEffect(() => {
    if (!settings.narration) return;
    if (step === 'pick') speak(STORY_PICK, { rate: settings.rate });
    if (step === 'theme') speak(STORY_THEME_PICK, { rate: settings.rate });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => {
    sfx.tap();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_ARTS ? p : [...p, id]));
  };
  const create = (t: StoryTheme) => {
    const id = uid();
    addBook({ id, theme: t.id, arts: picked, createdAt: Date.now() });
    sfx.success();
    nav(`/hikaye/${id}`);
  };
  const byId = new Map((items ?? []).map((a) => [a.id, a]));

  return (
    <AppShell flow={2}>
      <header className="page-head rise">
        <div>
          <p className="sub">{step === 'shelf' ? 'Çizimlerinden masallar' : step === 'pick' ? `1. adım: resimleri seç (${picked.length}/${MAX_ARTS})` : '2. adım: masalın konusu'}</p>
          <h1 className="title-xl">{step === 'shelf' ? 'Hikaye kitabım' : step === 'pick' ? 'Masalına kimler girsin?' : 'Masalımız nerede geçsin?'}</h1>
        </div>
        {step !== 'shelf' && <button className="pill pill--ghost pill--sm" onClick={() => setStep(step === 'theme' ? 'pick' : 'shelf')}><ArrowLeft size={18} /> Geri</button>}
      </header>

      {step === 'shelf' && (
        <>
          {items && items.length < 2 ? (
            <div className="empty rise">
              <Mascot size={90} mood="think" />
              <div>
                <p className="title-md">Masal için en az iki resim gerekiyor.</p>
                <p className="sub">Birkaç ders bitir, çizimlerinden bir masal yapalım!</p>
                <Link to="/ogren" className="pill pill--sm" style={{ marginTop: 12 }}>Derslere git</Link>
              </div>
            </div>
          ) : (
            <button className="story-new rise" onClick={() => { setPicked([]); setStep('pick'); }}>
              <Plus size={30} /> <span><b>Yeni masal yap</b><small>2-5 resmini seç, Çizio masalını yazsın ve okusun</small></span>
            </button>
          )}
          {books.length > 0 && (
            <div className="shelf">
              {books.map((b) => {
                const t = themeOf(b.theme);
                const first = b.arts.map((x) => byId.get(x)).find(Boolean);
                return (
                  <div key={b.id} className="shelf__book rise" style={{ ['--book' as string]: t.color }}>
                    <Link to={`/hikaye/${b.id}`} className="shelf__cover">
                      {first && <img src={urls.get(first.id)} alt="" />}
                      <b>{t.title}</b>
                    </Link>
                    <button className="round-btn round-btn--soft shelf__del" aria-label="Kitabı sil" onClick={() => setDel(b)}><Trash2 size={18} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {step === 'pick' && (
        <>
          <div className="board board--pick">
            {(items ?? []).map((a, i) => {
              const n = picked.indexOf(a.id);
              return (
                <button key={a.id} className={`pinned ${n >= 0 ? 'pinned--on' : ''}`} style={{ ['--r' as string]: `${((i * 37) % 7) - 3}deg` }} onClick={() => toggle(a.id)} aria-pressed={n >= 0}>
                  <span className="pinned__pin" />
                  <img src={urls.get(a.id)} alt="" loading="lazy" />
                  <span className="pinned__cap">{artTitle(a)}</span>
                  {n >= 0 && <span className="pinned__num">{n + 1}</span>}
                </button>
              );
            })}
          </div>
          <div className="story-next">
            <span>{picked.length === 0 ? 'İlk seçtiğin resim masalın kahramanı olur.' : `Kahraman: ${artTitle(byId.get(picked[0])!)}`}</span>
            <button className="pill" disabled={picked.length < 2} onClick={() => setStep('theme')}>Devam <ArrowRight size={20} /></button>
          </div>
        </>
      )}

      {step === 'theme' && (
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button key={t.id} className="theme-card rise" style={{ ['--book' as string]: t.color }} onClick={() => create(t)}>
              <ThemeArt id={t.id} />
              <b>{t.title}</b>
            </button>
          ))}
        </div>
      )}

      {del && (
        <Confirm title="Bu kitabı silelim mi?" text="Resimler galeride kalır, yalnızca kitap silinir." yes="Sil" danger onNo={() => setDel(null)}
          onYes={() => { removeBook(del.id); setDel(null); }} />
      )}
    </AppShell>
  );
}

/** Masal konularının küçük el çizimleri. */
function ThemeArt({ id }: { id: string }) {
  const INK = '#3a2b27';
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 120 90" className="theme-card__art" aria-hidden="true">
      {id === 'piknik' && (
        <>
          <path d="M18,70 L102,70 L92,82 L28,82 Z" fill="#ff6b4a" {...s} />
          <path d="M30,48 H90 L84,70 H36 Z" fill="#ffc89a" {...s} />
          <path d="M40,48 Q60,22 80,48" fill="none" {...s} />
          <circle cx="50" cy="44" r="7" fill="#ff4d4d" {...s} />
          <circle cx="70" cy="44" r="7" fill="#7fcf63" {...s} />
        </>
      )}
      {id === 'hazine' && (
        <>
          <rect x="26" y="40" width="68" height="38" rx="5" fill="#c98a4b" {...s} />
          <path d="M26,52 Q60,22 94,52" fill="#e2a868" {...s} />
          <rect x="54" y="48" width="12" height="14" rx="2" fill="#ffc83d" {...s} />
          <path d="M14,24 L22,28 M106,22 L98,28 M60,8 V16" fill="none" {...s} stroke="#e8a200" />
        </>
      )}
      {id === 'uzay' && (
        <>
          <path d="M60,10 Q78,30 74,62 H46 Q42,30 60,10 Z" fill="#fff" {...s} />
          <circle cx="60" cy="36" r="7" fill="#7ee0ff" {...s} />
          <path d="M46,52 L34,70 L46,64 M74,52 L86,70 L74,64" fill="#ff6b4a" {...s} />
          <path d="M52,66 Q60,84 68,66" fill="#ffc83d" {...s} />
          <path d="M18,20 l3,6 6,1 -5,4 1,6 -5,-3 -5,3 1,-6 -5,-4 6,-1 Z" fill="#ffc83d" {...s} strokeWidth={2} />
        </>
      )}
      {id === 'parti' && (
        <>
          <path d="M30,78 H90 V56 H30 Z" fill="#ffb3c7" {...s} />
          <path d="M36,56 H84 V40 H36 Z" fill="#fff1c7" {...s} />
          <path d="M52,40 V28 M68,40 V28" {...s} />
          <path d="M52,22 q-3,4 0,6 q3,-2 0,-6 M68,22 q-3,4 0,6 q3,-2 0,-6" fill="#ffc83d" {...s} strokeWidth={2} />
          <circle cx="18" cy="26" r="9" fill="#14a89a" {...s} />
          <circle cx="102" cy="22" r="9" fill="#e9487d" {...s} />
        </>
      )}
    </svg>
  );
}

// ------------------------------------------------------------------------------------------------
// Okuma (/hikaye/:id)
// ------------------------------------------------------------------------------------------------
export function StoryReader() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const profile = useProfile()!;
  const data = useProfileData();
  const settings = useApp((s) => s.settings);
  const book = (data.books ?? []).find((b) => b.id === id);
  const [arts, setArts] = useState<Artwork[] | null>(null);
  const [page, setPage] = useState(0); // 0 = kapak
  const [reading, setReading] = useState(settings.narration);
  const [busy, setBusy] = useState(false);
  const [toast, showToast] = useToast();
  const urls = useArtUrls(arts ?? []);
  const theme = themeOf(book?.theme ?? '');
  const pages = useMemo(() => (arts ? buildStory(arts, theme) : []), [arts, theme]);
  const title = `${genitive(profile.name)} Masalı`;
  const seq = useRef(0);

  useEffect(() => {
    if (!book) return;
    void Promise.all(book.arts.map((a) => getArtwork(a))).then((xs) => setArts(xs.filter((x): x is Artwork => !!x)));
  }, [book?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sayfayı sırayla oku; okuma açıksa bitince sonraki sayfaya geç
  useEffect(() => {
    const my = ++seq.current;
    stopSpeaking();
    if (!reading || !arts) return;
    const lines = page === 0 ? [STORY_START] : pages[page - 1]?.lines ?? [];
    let i = 0;
    const next = () => {
      if (my !== seq.current) return;
      if (i >= lines.length) {
        if (page < pages.length) setTimeout(() => my === seq.current && setPage((p) => p + 1), 900);
        else setReading(false);
        return;
      }
      speak(lines[i++], { rate: settings.rate, onEnd: next });
    };
    const tm = setTimeout(next, 500);
    return () => clearTimeout(tm);
  }, [page, reading, arts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { seq.current++; stopSpeaking(); }, []);

  if (!book) return <AppShell><div className="empty rise"><Mascot size={90} mood="think" /><div><p className="title-md">Bu kitap bulunamadı.</p><Link to="/hikaye" className="pill pill--sm">Kitaplarım</Link></div></div></AppShell>;
  if (!arts) return <div className="bg live-center"><div className="live-center__body"><Loader2 className="spin" size={40} /></div></div>;
  if (arts.length < 1) return <AppShell><div className="empty rise"><Mascot size={90} mood="think" /><div><p className="title-md">Bu kitabın resimleri galeriden silinmiş.</p><Link to="/hikaye" className="pill pill--sm">Kitaplarım</Link></div></div></AppShell>;

  const go = (p: number) => {
    sfx.tab();
    setPage(Math.max(0, Math.min(pages.length, p)));
  };
  const pdf = async () => {
    setBusy(true);
    try {
      await document.fonts?.load('600 40px Fredoka').catch(() => {});
      const bitmaps = await Promise.all(arts.map((a) => createImageBitmap(a.blob)));
      const out = [];
      out.push(await canvasToJpeg(renderPdfPage({ kind: 'cover', title, theme, images: bitmaps })));
      for (const p of pages) out.push(await canvasToJpeg(renderPdfPage({ kind: 'page', theme, images: p.art === 'all' ? bitmaps : [bitmaps[p.art]], text: p.lines.join(' '), end: p.art === 'all' })));
      bitmaps.forEach((b) => b.close?.());
      await saveFile(makePdf(out), `cizio-masal-${book.id}.pdf`, title);
    } catch {
      showToast('Kitap kaydedilemedi, tekrar dener misin?');
    } finally {
      setBusy(false);
    }
  };

  const cur = page === 0 ? null : pages[page - 1];
  return (
    <div className="bg storybook" style={{ ['--book' as string]: theme.color }}>
      <Doodles variant={3} />
      <header className="storybook__top">
        <button className="round-btn round-btn--light" aria-label="Kitaplarım" onClick={() => nav('/hikaye')}><ArrowLeft size={26} strokeWidth={2.6} /></button>
        <span className="storybook__title"><BookOpen size={20} /> {theme.title}</span>
        <button className="round-btn round-btn--light" aria-label={reading ? 'Okumayı durdur' : 'Çizio okusun'} onClick={() => setReading((r) => !r)}>
          {reading ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </header>

      <div className="book" key={page}>
        {cur === null ? (
          <div className="book__page book__cover">
            <div className="book__collage">
              {arts.slice(0, 5).map((a, i) => <img key={a.id} src={urls.get(a.id)} alt="" style={{ ['--i' as string]: i }} />)}
            </div>
            <h1 className="book__name">{title}</h1>
            <p className="book__theme">{theme.title}</p>
          </div>
        ) : (
          <div className={`book__page ${cur.art === 'all' ? 'book__page--end' : ''}`}>
            <div className="book__pic">
              {cur.art === 'all'
                ? <div className="book__collage">{arts.map((a, i) => <img key={a.id} src={urls.get(a.id)} alt="" style={{ ['--i' as string]: i }} />)}</div>
                : <img src={urls.get(arts[cur.art].id)} alt={artTitle(arts[cur.art])} />}
            </div>
            <div className="book__text">
              <p>{cur.lines.join(' ')}</p>
              {cur.art === 'all' && <span className="book__end">Son</span>}
              <span className="book__num">{page}</span>
            </div>
          </div>
        )}
      </div>

      <footer className="storybook__nav">
        <button className="round-btn round-btn--light" aria-label="Önceki sayfa" disabled={page === 0} onClick={() => go(page - 1)}><ArrowLeft size={26} /></button>
        <div className="storybook__dots">{[0, ...pages.map((_, i) => i + 1)].map((i) => <span key={i} className={i === page ? 'on' : ''} />)}</div>
        {page < pages.length ? (
          <button className="round-btn round-btn--light" aria-label="Sonraki sayfa" onClick={() => go(page + 1)}><ArrowRight size={26} /></button>
        ) : (
          <button className="pill pill--sm" disabled={busy} onClick={() => void pdf()}>{busy ? <Loader2 className="spin" size={18} /> : <Download size={18} />} Kitabı kaydet</button>
        )}
      </footer>
      {page === pages.length && !busy && <p className="storybook__hint"><Check size={16} /> Kitabını PDF olarak kaydedip yazdırabilir ya da paylaşabilirsin.</p>}
      {toast}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// PDF sayfası (tuval)
// ------------------------------------------------------------------------------------------------
const PW = 1754, PH = 1240; // A4 yatay, 150 dpi

function renderPdfPage(p: { kind: 'cover'; title: string; theme: StoryTheme; images: ImageBitmap[] } | { kind: 'page'; theme: StoryTheme; images: ImageBitmap[]; text: string; end: boolean }) {
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, 0, PW, PH);
  ctx.fillStyle = p.theme.color;
  ctx.fillRect(0, 0, PW, 26);
  ctx.fillRect(0, PH - 26, PW, 26);
  const fit = (img: ImageBitmap, x: number, y: number, w: number, h: number, rot = 0) => {
    const k = Math.min(w / img.width, h / img.height);
    const iw = img.width * k, ih = img.height * k;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(80,50,30,0.25)';
    ctx.shadowBlur = 24;
    ctx.fillRect(-iw / 2 - 18, -ih / 2 - 18, iw + 36, ih + 36);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();
  };
  const collage = (imgs: ImageBitmap[], x: number, y: number, w: number, h: number) => {
    const n = imgs.length, cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols);
    const cw = w / cols, ch = h / rows;
    imgs.forEach((img, i) => fit(img, x + (i % cols) * cw + 20, y + Math.floor(i / cols) * ch + 20, cw - 40, ch - 40, ((i * 37) % 7 - 3) * 0.012));
  };
  ctx.fillStyle = '#3a2b27';
  ctx.textAlign = 'center';
  if (p.kind === 'cover') {
    collage(p.images.slice(0, 6), 140, 110, PW - 280, PH - 520);
    ctx.font = '600 104px Fredoka, Nunito, sans-serif';
    ctx.fillText(p.title, PW / 2, PH - 250);
    ctx.font = '600 56px Fredoka, Nunito, sans-serif';
    ctx.fillStyle = p.theme.color;
    ctx.fillText(p.theme.title, PW / 2, PH - 160);
    ctx.font = '600 30px Fredoka, Nunito, sans-serif';
    ctx.fillStyle = '#8c766e';
    ctx.fillText('Çizio ile çizildi', PW / 2, PH - 80);
    return c;
  }
  if (p.end) collage(p.images, 80, 80, PW * 0.55, PH - 160);
  else fit(p.images[0], 110, 110, PW * 0.5, PH - 220, -0.015);
  // Metin (sağ sütun)
  const tx = PW * 0.62, tw = PW * 0.33;
  ctx.textAlign = 'left';
  ctx.font = '500 50px Fredoka, Nunito, sans-serif';
  const words = p.text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > tw && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  const lh = 72, top = PH / 2 - (lines.length * lh) / 2 + 40;
  lines.forEach((l, i) => ctx.fillText(l, tx, top + i * lh));
  if (p.end) {
    ctx.font = '600 64px Fredoka, Nunito, sans-serif';
    ctx.fillStyle = p.theme.color;
    ctx.fillText('Son', tx, top + lines.length * lh + 70);
  }
  return c;
}
