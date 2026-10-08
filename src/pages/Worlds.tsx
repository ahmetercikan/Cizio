/**
 * Açılış: üç dünyadan birini seç — Çizim Atölyesi, Giydirme Stüdyosu, English Club.
 * Seçilen dünyanın kendi sekmeleri gelir; üst çubuktaki dünya adına dokununca buraya dönülür.
 */
import { Check, ChevronRight, Crown } from 'lucide-react';
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
import { usePlus } from '../world/plus';

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

function AdaArt() {
  const data = useProfileData();
  return (
    <div className="world-art world-art--ada">
      <svg viewBox="0 0 200 150" className="world-art__island" aria-hidden="true">
        <ellipse cx="100" cy="128" rx="96" ry="18" fill="#3fb7dd" />
        <ellipse cx="100" cy="120" rx="80" ry="17" fill="#f3dca2" stroke="#3a2b27" strokeWidth="3" />
        <ellipse cx="100" cy="114" rx="66" ry="13" fill="#8fd16f" stroke="#3a2b27" strokeWidth="3" />
        <rect x="36" y="80" width="30" height="28" fill="#ffd166" stroke="#3a2b27" strokeWidth="3" />
        <path d="M31,82 L51,64 L71,82 Z" fill="#e05a4f" stroke="#3a2b27" strokeWidth="3" strokeLinejoin="round" />
        <path d="M150,110 L154,78 L158,110" fill="none" stroke="#9b6b43" strokeWidth="4" />
        <circle cx="154" cy="74" r="14" fill="#5cc36b" stroke="#3a2b27" strokeWidth="3" />
      </svg>
      <span className="world-art__doll"><Doll d={data.doll ?? PRESETS[0]} bg={false} viewBox="20 -10 260 440" /></span>
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
  const plus = usePlus((s) => s.owned);
  return (
    <div className="bg app worlds">
      <Doodles variant={0} />
      <AppBar />
      <main className="worlds__main">
        <header className="worlds__head rise">
          <p className="sub">{greeting()}, {profile.name}!</p>
          <h1 className="title-xl">Bugün nereye gidelim?</h1>
        </header>
        <div className="worlds__grid worlds__grid--4">
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
          <Link to="/ada" className="world-card world-card--ada rise" style={{ animationDelay: '0.24s' }} onClick={() => sfx.pop()}>
            <AdaArt />
            <span className="world-card__text">
              <b>Çizio Adası</b>
              <small>Karakterinle 3B adada gez ve oyna</small>
              <span className={`world-card__status ${plus ? '' : 'world-card__status--plus'}`}>
                {plus ? 'Adada bugünkü görevler hazır' : <><Crown size={15} /> Çizio Plus</>}
              </span>
            </span>
            <span className="world-card__go" aria-hidden="true"><ChevronRight size={28} strokeWidth={3} /></span>
          </Link>
        </div>
      </main>
      <RewardsHost />
    </div>
  );
}
