import { useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setSfxEnabled } from './lib/sfx';
import { setNaturalVoice, unlockAudio } from './lib/speech';
import Adventure from './pages/Adventure';
import Challenge from './pages/Challenge';
import DressUp from './pages/DressUp';
import Duel from './pages/Duel';
import FreeDraw from './pages/FreeDraw';
import Journal from './pages/Journal';
import League from './pages/League';
import Learn, { CoursePage } from './pages/Learn';
import LessonPage from './pages/LessonPage';
import Onboarding from './pages/Onboarding';
import Parent from './pages/Parent';
import Playground from './pages/Playground';
import Profiles from './pages/Profiles';
import Shop from './pages/Shop';
import { useApp } from './store/useApp';

/** Profil yoksa karşılama akışına yönlendirir. */
function NeedsProfile({ children }: { children: ReactNode }) {
  const has = useApp((s) => !!s.activeId && s.profiles.some((p) => p.id === s.activeId));
  const any = useApp((s) => s.profiles.length > 0);
  if (!has) return <Navigate to={any ? '/profiller' : '/hosgeldin'} replace />;
  return <>{children}</>;
}

export default function App() {
  const sfxOn = useApp((s) => s.settings.sfx);
  const natural = useApp((s) => s.settings.naturalVoice);
  useEffect(() => setSfxEnabled(sfxOn), [sfxOn]);
  useEffect(() => setNaturalVoice(natural !== false), [natural]);
  // iOS: ses ancak bir dokunuştan sonra çalabilir; ilk dokunuşta ses öğesinin kilidini aç.
  useEffect(() => {
    const once = () => unlockAudio();
    window.addEventListener('pointerdown', once, { once: true });
    return () => window.removeEventListener('pointerdown', once);
  }, []);

  return (
    <HashRouter>
      <ErrorBoundary>
      <Routes>
        <Route path="/hosgeldin" element={<Onboarding />} />
        <Route path="/profiller" element={<Profiles />} />
        <Route path="/" element={<NeedsProfile><Playground /></NeedsProfile>} />
        <Route path="/ogren" element={<NeedsProfile><Learn /></NeedsProfile>} />
        <Route path="/yol/:id" element={<NeedsProfile><CoursePage /></NeedsProfile>} />
        <Route path="/dergi" element={<NeedsProfile><Journal /></NeedsProfile>} />
        <Route path="/ders/:id" element={<NeedsProfile><LessonPage /></NeedsProfile>} />
        <Route path="/ciz" element={<NeedsProfile><FreeDraw /></NeedsProfile>} />
        <Route path="/duello" element={<NeedsProfile><Duel /></NeedsProfile>} />
        <Route path="/macera" element={<NeedsProfile><Adventure /></NeedsProfile>} />
        <Route path="/lig" element={<NeedsProfile><League /></NeedsProfile>} />
        <Route path="/giydir" element={<NeedsProfile><DressUp /></NeedsProfile>} />
        <Route path="/dukkan" element={<NeedsProfile><Shop /></NeedsProfile>} />
        <Route path="/meydan/:kind" element={<NeedsProfile><Challenge /></NeedsProfile>} />
        <Route path="/meydan/:kind/:lessonId" element={<NeedsProfile><Challenge /></NeedsProfile>} />
        <Route path="/ebeveyn" element={<Parent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
