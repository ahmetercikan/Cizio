import { Flame, Heart, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { CardRow, LessonCard } from '../components/LessonCard';
import { Mascot } from '../components/Mascot';
import { Modal } from '../components/ui';
import { getLesson, lessons, lessonsByPath, paths } from '../lessons';
import { recommendLesson, totalStars } from '../lib/recommend';
import { speak } from '../lib/speech';
import { streakOf } from '../lib/util';
import { getSticker } from '../stickers';
import { useApp, useProfile, useProfileData } from '../store/useApp';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Günaydın';
  if (h < 18) return 'Merhaba';
  return 'İyi akşamlar';
}

export default function Playground() {
  const profile = useProfile()!;
  const data = useProfileData();
  const settings = useApp((s) => s.settings);
  const consume = useApp((s) => s.consumeNewStickers);
  const [pending] = useState(() => data.newStickers.filter((id) => !id.startsWith('lesson:') && id !== 'first-lesson'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today = useMemo(() => recommendLesson(profile, data), [profile.id]);
  const forYou = useMemo(() => {
    const fav = lessonsByPath(profile.favoritePath).filter((l) => l.id !== today.id);
    const rest = lessons.filter((l) => l.path !== profile.favoritePath && !data.lessons[l.id] && l.level === 1);
    return [...fav, ...rest].slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);
  const untouched = useMemo(() => new Set(lessons.filter((l) => !data.lessons[l.id]).map((l) => l.id)), [data.lessons]);
  const favorites = data.favorites.map(getLesson).filter((l): l is NonNullable<typeof l> => !!l);

  useEffect(() => {
    if (data.newStickers.length) consume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell flow={1}>
      <header className="page-head rise">
        <div>
          <p className="sub">{greeting()}, {profile.name}!</p>
          <h1 className="title-xl">Oyun alanı</h1>
        </div>
        <div className="chips">
          <span className="chip" title="Üst üste çizdiğin gün"><Flame size={20} color="#ffb13b" fill="#ff8a3d" /> {streakOf(data.days)}</span>
          <span className="chip" title="Toplam yıldız"><Star size={20} color="#f0a500" fill="#ffd43b" /> {totalStars(data)}</span>
        </div>
      </header>

      <section className="hero rise" style={{ animationDelay: '0.05s' }}>
        <LessonCard lesson={today} size="xl" isNew={untouched.has(today.id)} />
        <div className="hero__side">
          <p className="row-section__title"><Sparkles size={20} /> Sizin için</p>
          <div className="hero__grid">
            {forYou.map((l) => (
              <LessonCard key={l.id} lesson={l} size="lg" isNew={untouched.has(l.id)} />
            ))}
          </div>
        </div>
      </section>

      {favorites.length > 0 ? (
        <CardRow title="Favorilerim" icon={<Heart size={20} fill="currentColor" />} lessons={favorites} />
      ) : (
        <p className="hint rise"><Heart size={18} /> Beğendiğin derslerin kalbine dokun, burada toplansın.</p>
      )}

      {paths.map((p) => (
        <CardRow key={p.id} title={p.title} lessons={lessonsByPath(p.id)} isNewIds={untouched} />
      ))}

      {pending.length > 0 && (
        <NewStickers ids={pending} onOpen={() => settings.narration && speak('Yeni bir çıkartma kazandın!', { rate: settings.rate })} />
      )}
    </AppShell>
  );
}

function NewStickers({ ids, onOpen }: { ids: string[]; onOpen: () => void }) {
  const [open, setOpen] = useState(true);
  useEffect(onOpen, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  return (
    <Modal onClose={() => setOpen(false)}>
      <div style={{ textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
        <Mascot size={90} mood="wow" />
        <h2 className="title-lg">Yeni çıkartma!</h2>
        <div className="sticker-row">
          {ids.map((id) => {
            const s = getSticker(id);
            return s ? (
              <div key={id} className="sticker-win">
                <span className="sticker sticker--new">{s.emoji}</span>
                <b>{s.title}</b>
              </div>
            ) : null;
          })}
        </div>
        <button className="btn-dark" onClick={() => setOpen(false)}>Süper!</button>
      </div>
    </Modal>
  );
}
