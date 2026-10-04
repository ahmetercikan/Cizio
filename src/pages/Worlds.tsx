/**
 * Açılış: üç dünyadan birini seç — Çizim Atölyesi, Giydirme Stüdyosu, English Club.
 * Seçilen dünyanın kendi sekmeleri gelir; üst çubuktaki dünya adına dokununca buraya dönülür.
 */
import { Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppBar, WORLDS, type WorldId } from '../components/AppShell';
import { Doodles } from '../components/Doodles';
import { Mascot } from '../components/Mascot';
import { RewardsHost } from '../components/Rewards';
import { PRESETS } from '../dressup/catalog';
import { Doll } from '../dressup/Doll';
import { LessonArt } from '../english/Art';
import { lessons } from '../lessons';
import { sfx } from '../lib/sfx';
import { dayKey } from '../lib/util';
import { useProfile, useProfileData } from '../store/useApp';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Günaydın';
  if (h < 18) return 'Merhaba';
  return 'İyi akşamlar';
}

function AtolyeArt() {
  return (
    <div className="world-art world-art--atolye">
      <span className="world-art__paper"><LessonArt id="kedi" /></span>
      <span className="world-art__paper world-art__paper--2"><LessonArt id="gunes-bulut" /></span>
      <Mascot size={96} mood="cheer" outfit="none" className="world-art__mascot" />
    </div>
  );
}

function StudyoArt() {
  const data = useProfileData();
  return (
    <div className="world-art world-art--studyo">
      <Doll d={data.doll ?? PRESETS[0]} viewBox="20 -10 260 400" />
    </div>
  );
}

function EnglishArt() {
  const block = (x: number, y: number, c: string, ch: string, r = 0) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-26" y="-26" width="52" height="52" rx="8" fill={c} stroke="#3a2b27" strokeWidth="4" />
      <text y="13" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="36" fill="#fff" stroke="#3a2b27" strokeWidth="1.5">{ch}</text>
    </g>
  );
  return (
    <div className="world-art world-art--english">
      <svg className="world-art__blocks" viewBox="0 0 200 120" aria-hidden="true">
        {block(46, 88, '#ef4b4b', 'A', -6)}
        {block(102, 88, '#3f7fe0', 'B', 4)}
        {block(74, 36, '#2bb673', 'C', -3)}
      </svg>
      <span className="world-art__bubble">Hello!</span>
      <Mascot size={96} mood="happy" outfit="none" className="world-art__mascot en-wave" />
    </div>
  );
}

const CARDS: { id: WorldId; sub: string; Art: () => JSX.Element }[] = [
  { id: 'atolye', sub: 'Adım adım çiz, boya, maceraya çık', Art: AtolyeArt },
  { id: 'studyo', sub: 'Karakterini giydir, tarzını yarat', Art: StudyoArt },
  { id: 'english', sub: 'İngilizceyi oynayarak öğren', Art: EnglishArt },
];

export default function Worlds() {
  const profile = useProfile()!;
  const data = useProfileData();
  const today = dayKey();
  const status: Record<WorldId, { text: string; done?: boolean }> = {
    atolye: data.days[today]?.lessons ? { text: 'Bugün çizdin!', done: true } : { text: `${lessons.length} çizim dersi` },
    studyo: data.styled?.includes(today) ? { text: 'Bugünün stili tamam!', done: true } : { text: 'Günün stil görevi seni bekliyor' },
    english: data.english?.sessions.includes(today) ? { text: 'English Time tamam!', done: true } : { text: 'Bugünün English Time’ı hazır' },
  };
  return (
    <div className="bg app worlds">
      <Doodles variant={0} />
      <AppBar />
      <main className="worlds__main">
        <header className="worlds__head rise">
          <p className="sub">{greeting()}, {profile.name}!</p>
          <h1 className="title-xl">Bugün nereye gidelim?</h1>
        </header>
        <div className="worlds__grid">
          {CARDS.map(({ id, sub, Art }, i) => (
            <Link key={id} to={WORLDS[id].home} className={`world-card world-card--${id} rise`} style={{ animationDelay: `${0.08 * i}s` }} onClick={() => sfx.pop()}>
              <Art />
              <span className="world-card__text">
                <b>{WORLDS[id].title}</b>
                <small>{sub}</small>
                <span className={`world-card__status ${status[id].done ? 'done' : ''}`}>
                  {status[id].done && <Check size={16} strokeWidth={3.4} />} {status[id].text}
                </span>
              </span>
              <span className="world-card__go" aria-hidden="true"><ChevronRight size={28} strokeWidth={3} /></span>
            </Link>
          ))}
        </div>
      </main>
      <RewardsHost />
    </div>
  );
}
