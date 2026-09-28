/** Öğrenmek: çizim yolları (kurslar) ve her yolun ders haritası. */
import { ArrowRight, Check, Lock } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { SketchImg } from '../components/Sketch';
import { BackButton, Stars } from '../components/ui';
import { getPath, lessonsByPath, paths } from '../lessons';
import { useProfileData } from '../store/useApp';

export default function Learn() {
  const data = useProfileData();
  return (
    <AppShell flow={3}>
      <header className="page-head rise">
        <div>
          <p className="sub">Adım adım ustalaş</p>
          <h1 className="title-xl">Öğrenmek</h1>
        </div>
      </header>
      <div className="course-grid">
        {paths.map((p, i) => {
          const ls = lessonsByPath(p.id);
          const done = ls.filter((l) => data.lessons[l.id]).length;
          const next = ls.find((l) => !data.lessons[l.id]);
          return (
            <Link key={p.id} to={`/yol/${p.id}`} className="course rise" style={{ animationDelay: `${i * 0.05}s`, ['--pc' as string]: p.color }}>
              <div className="course__collage">
                {ls.slice(0, 3).map((l, k) => (
                  <SketchImg key={l.id} lesson={l} paper pad={24} className={`course__img course__img--${k}`} />
                ))}
              </div>
              <div className="course__body">
                <h2 className="title-md">{p.title}</h2>
                <p className="course__desc">{p.description}</p>
                <div className="course__bar"><span style={{ width: `${(done / Math.max(1, ls.length)) * 100}%` }} /></div>
                <p className="course__meta">
                  {done}/{ls.length} ders
                  <span className="course__go">{done === 0 ? 'Başla' : next ? 'Devam et' : 'Tamamlandı'} <ArrowRight size={16} /></span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

export function CoursePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const path = id ? getPath(id) : undefined;
  const data = useProfileData();
  if (!path) return <Navigate to="/ogren" replace />;
  const ls = lessonsByPath(path.id);
  const nextIdx = ls.findIndex((l) => !data.lessons[l.id]);

  return (
    <AppShell flow={0}>
      <header className="page-head rise">
        <div className="row-gap">
          <BackButton onBack={() => nav('/ogren')} />
          <div>
            <p className="sub">{path.description}</p>
            <h1 className="title-xl">{path.title}</h1>
          </div>
        </div>
      </header>
      <ol className="trail">
        {ls.map((l, i) => {
          const p = data.lessons[l.id];
          const isNext = i === nextIdx;
          const locked = nextIdx !== -1 && i > nextIdx + 1;
          return (
            <li key={l.id} className={`trail__item rise ${i % 2 ? 'down' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <Link to={`/ders/${l.id}`} className={`trail__card ${p ? 'done' : ''} ${isNext ? 'next' : ''} ${locked ? 'later' : ''}`}>
                <span className="trail__num">{p ? <Check size={18} strokeWidth={3} /> : locked ? <Lock size={14} /> : i + 1}</span>
                <SketchImg lesson={l} paper pad={24} className="trail__img" />
                <b>{l.title}</b>
                {p ? <Stars value={p.bestStars} size={18} dim="rgba(29,23,64,0.12)" /> : <span className="trail__lvl">{['', 'Kolay', 'Orta', 'Zor'][l.level]}</span>}
                {isNext && <span className="badge-new">SIRADAKİ</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
