import { Heart, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '../lessons/types';
import { sfx } from '../lib/sfx';
import { useApp, useProfileData } from '../store/useApp';
import { SketchImg } from './Sketch';
import { Stars } from './ui';

export function LessonCard({ lesson, size = 'md', isNew = false }: { lesson: Lesson; size?: 'md' | 'lg' | 'xl'; isNew?: boolean }) {
  const nav = useNavigate();
  const data = useProfileData();
  const toggle = useApp((s) => s.toggleFavorite);
  const fav = data.favorites.includes(lesson.id);
  const p = data.lessons[lesson.id];
  return (
    <div className={`lesson-card lesson-card--${size}`}>
      <button
        className="lesson-card__hit"
        aria-label={`${lesson.title} dersini aç`}
        onClick={() => {
          sfx.tap();
          nav(`/ders/${lesson.id}`);
        }}
      >
        <SketchImg lesson={lesson} pad={30} className="lesson-card__img" />
        <span className="lesson-card__title">{lesson.title}</span>
        {size === 'xl' && (
          <span className="lesson-card__play">
            <Play size={30} fill="currentColor" />
          </span>
        )}
        {p ? (
          <span className="lesson-card__stars">
            <Stars value={p.bestStars} size={size === 'md' ? 16 : 20} dim="rgba(47,47,54,0.15)" />
          </span>
        ) : (
          isNew && <span className="badge-new">YENİ</span>
        )}
      </button>
      <button
        className={`lesson-card__fav ${fav ? 'on' : ''}`}
        aria-label={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        aria-pressed={fav}
        onClick={() => {
          sfx.pop();
          toggle(lesson.id);
        }}
      >
        <Heart size={20} fill={fav ? 'currentColor' : 'none'} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/**
 * Öğe ekrana yaklaştığında (bir kez) true olur. Uzun sayfalarda (Atölye'de 10 yol × ~10 ders) bütün kartları
 * ve eskizlerini açılışta kurmak düşük donanımlı telefonlarda sayfa geçişini donduruyordu.
 */
function useNearViewport<T extends Element>(margin = '400px'): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);
  return [ref, near];
}

export function CardRow({ title, icon, lessons, isNewIds }: { title: string; icon?: React.ReactNode; lessons: Lesson[]; isNewIds?: Set<string> }) {
  const [ref, near] = useNearViewport<HTMLElement>();
  if (!lessons.length) return null;
  return (
    <section className="row-section" ref={ref}>
      <h2 className="row-section__title">
        {icon}
        {title}
      </h2>
      <div className={`card-row ${near ? '' : 'card-row--wait'}`}>
        {near && lessons.map((l) => <LessonCard key={l.id} lesson={l} isNew={isNewIds?.has(l.id)} />)}
      </div>
    </section>
  );
}
