import { ArrowRight, Check, Flame, Heart, Play, Sparkles, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SketchImg } from '../components/Sketch';
import { CHALLENGES, questDone, specialDay, todayQuest } from '../lib/daily';
import { questLink } from './Challenge';
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
          <p className="sub">Bugün ne çizelim?</p>
          <h1 className="title-xl">{greeting()}, {profile.name}!</h1>
        </div>
        <div className="chips">
          <span className="chip" title="Üst üste çizdiğin gün"><Flame size={20} color="#ffb13b" fill="#ff8a3d" /> {streakOf(data.days)}</span>
          <span className="chip" title="Toplam yıldız"><Star size={20} color="#f0a500" fill="#ffd43b" /> {totalStars(data)}</span>
        </div>
      </header>

      <DailyRow />

      <section className="hero rise" style={{ animationDelay: '0.05s' }}>
        <LessonCard lesson={today} size="xl" isNew={untouched.has(today.id)} />
        <div className="hero__side">
          <p className="row-section__title"><Sparkles size={20} /> Senin için</p>
          <div className="hero__grid">
            {forYou.map((l) => (
              <LessonCard key={l.id} lesson={l} size="lg" isNew={untouched.has(l.id)} />
            ))}
          </div>
        </div>
      </section>

      <section className="row-section">
        <h2 className="row-section__title"><Sparkles size={20} /> Mini meydan okumalar</h2>
        <div className="challenge-row">
          {CHALLENGES.map((c) => (
            <Link key={c.id} to={`/meydan/${c.id}`} className="challenge-card rise">
              <span className="challenge-card__emoji" aria-hidden="true">{c.emoji}</span>
              <span className="challenge-card__text">
                <b>{c.title}</b>
                <span>{c.desc}</span>
              </span>
              <span className="challenge-card__go" aria-hidden="true"><ArrowRight size={18} /></span>
            </Link>
          ))}
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

/** Özel gün kartı ve günün görevi. */
function DailyRow() {
  const profile = useProfile()!;
  const data = useProfileData();
  const sp = specialDay();
  const spLesson = sp ? getLesson(sp.lessonId) : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const quest = useMemo(() => todayQuest(profile, data, lessons), [profile.id]);
  const done = questDone(quest, data);
  const qLesson = getLesson(quest.lessonId);
  return (
    <div className="daily-row rise">
      {sp && spLesson && (
        <Link to={`/ders/${spLesson.id}`} className="special-card">
          <span className="special-card__emoji">{sp.emoji}</span>
          <div className="special-card__text">
            <b>{sp.title}</b>
            <span>{sp.message}</span>
          </div>
          <SketchImg lesson={spLesson} mode="color" paper pad={16} className="special-card__img" />
        </Link>
      )}
      <Link to={questLink(quest)} className={`quest-card ${done ? 'done' : ''}`}>
        <span className="quest-card__icon">{done ? <Check size={26} strokeWidth={3} /> : <Target size={26} />}</span>
        <div className="quest-card__text">
          <span className="quest-card__label">Günün görevi</span>
          <b>{quest.text}</b>
          <span className="quest-card__state">{done ? 'Tamamlandı! Yarın yeni görev seni bekliyor.' : 'Tamamlayınca seri devam eder'}</span>
        </div>
        {qLesson && <SketchImg lesson={qLesson} paper pad={16} className="quest-card__img" />}
        {!done && <span className="quest-card__go"><Play size={20} fill="currentColor" /></span>}
      </Link>
    </div>
  );
}
