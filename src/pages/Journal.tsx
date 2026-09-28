/** Dergi: çocuğun çizimleri (panoya iğnelenmiş kâğıtlar gibi), çıkartma albümü ve istatistikler. */
import { Calendar, Download, Flame, Star, Trash2, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Mascot } from '../components/Mascot';
import { Confirm, Modal, Stars, useToast } from '../components/ui';
import { getLesson } from '../lessons';
import { deleteArtwork, listArtworks, type Artwork } from '../lib/gallery';
import { totalStars } from '../lib/recommend';
import { formatDate, streakOf } from '../lib/util';
import { allStickers } from '../stickers';
import { useProfile, useProfileData } from '../store/useApp';

type Tab = 'art' | 'stickers';

export default function Journal() {
  const profile = useProfile()!;
  const data = useProfileData();
  const [tab, setTab] = useState<Tab>('art');
  const [items, setItems] = useState<Artwork[] | null>(null);
  const [open, setOpen] = useState<Artwork | null>(null);
  const [del, setDel] = useState<Artwork | null>(null);
  const [toast, showToast] = useToast();

  const reload = () => listArtworks(profile.id).then(setItems);
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);
  const urls = useMemo(() => new Map((items ?? []).map((a) => [a.id, URL.createObjectURL(a.blob)])), [items]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const stickers = allStickers();
  const have = new Set(data.stickers);

  return (
    <AppShell flow={2}>
      <header className="page-head rise">
        <div>
          <p className="sub">{profile.name} için</p>
          <h1 className="title-xl">Dergi</h1>
        </div>
        <div className="seg-dark">
          <button className={tab === 'art' ? 'on' : ''} onClick={() => setTab('art')}>Çizimlerim</button>
          <button className={tab === 'stickers' ? 'on' : ''} onClick={() => setTab('stickers')}>Çıkartmalar</button>
        </div>
      </header>

      <div className="stats rise">
        <div className="stat"><Flame color="#ffb13b" fill="#ff8a3d" /><b>{streakOf(data.days)}</b><span>günlük seri</span></div>
        <div className="stat"><Star color="#f0a500" fill="#ffd43b" /><b>{totalStars(data)}</b><span>yıldız</span></div>
        <div className="stat"><Trophy color="#a58bff" /><b>{Object.keys(data.lessons).length}</b><span>ders</span></div>
        <div className="stat"><Calendar color="#7ee0ff" /><b>{Object.keys(data.days).length}</b><span>çizim günü</span></div>
      </div>

      {tab === 'art' && (
        <>
          {items && items.length === 0 && (
            <div className="empty rise">
              <Mascot size={90} mood="think" />
              <div>
                <p className="title-md">Dergin henüz boş.</p>
                <p className="sub">Bir ders bitirince çizimin burada sergilenecek.</p>
                <Link to="/" className="pill pill--sm" style={{ marginTop: 12 }}>Çizmeye başla</Link>
              </div>
            </div>
          )}
          <div className="board">
            {(items ?? []).map((a, i) => (
              <button key={a.id} className="pinned" style={{ ['--r' as string]: `${((i * 37) % 7) - 3}deg` }} onClick={() => setOpen(a)}>
                <span className="pinned__pin" />
                <img src={urls.get(a.id)} alt="" loading="lazy" />
                <span className="pinned__cap">{a.lessonId ? getLesson(a.lessonId)?.title : 'Serbest çizim'}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'stickers' && (
        <div className="sticker-grid rise">
          {stickers.map((s) => {
            const got = have.has(s.id);
            return (
              <button key={s.id} className={`sticker-card ${got ? 'got' : ''}`} onClick={() => showToast(got ? `${s.emoji} ${s.title}` : `Nasıl kazanılır: ${s.hint}`)}>
                <span className="sticker">{s.emoji}</span>
                <span className="sticker-card__title">{s.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpen(null)} className="modal--art">
          <div className="art-view">
            <div className="art-view__head">
              <div>
                <b className="title-md">{open.lessonId ? getLesson(open.lessonId)?.title : 'Serbest çizim'}</b>
                <p className="muted">{formatDate(open.createdAt)} · {open.kind === 'paper' ? 'Kâğıtta' : open.kind === 'free' ? 'Serbest' : 'Ekranda'}</p>
              </div>
              <button className="round-btn round-btn--light" aria-label="Kapat" onClick={() => setOpen(null)}><X /></button>
            </div>
            <img src={urls.get(open.id)} alt="Çizim" className="art-view__img" />
            {open.stars ? <Stars value={open.stars} size={30} dim="rgba(29,23,64,0.12)" /> : null}
            <div className="modal-actions">
              <a className="btn-outline" href={urls.get(open.id)} download={`ciziktir-${open.id}.${open.kind === 'paper' ? 'jpg' : 'png'}`}><Download size={20} /> İndir</a>
              <button className="btn-outline" style={{ color: 'var(--red)' }} onClick={() => setDel(open)}><Trash2 size={20} /> Sil</button>
            </div>
          </div>
        </Modal>
      )}
      {del && (
        <Confirm title="Bu resmi silelim mi?" text="Silinen resim geri gelmez." yes="Sil" danger onNo={() => setDel(null)}
          onYes={async () => { await deleteArtwork(del.id); setDel(null); setOpen(null); void reload(); }} />
      )}
      {toast}
    </AppShell>
  );
}
