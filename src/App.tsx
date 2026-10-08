import { useEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setSfxEnabled } from './lib/sfx';
import { setNaturalVoice, unlockAudio } from './lib/speech';
import Adventure from './pages/Adventure';
import Challenge from './pages/Challenge';
import Coop from './pages/Coop';
import DrawGame, { DrawGamePicker } from './pages/DrawGame';
import DressUp from './pages/DressUp';
import Duel from './pages/Duel';
import EnglishHome, { EnglishGames, EnglishPlay, EnglishStories, EnglishStoryPage, EnglishTime, EnglishTopic, EnglishWords } from './pages/English';
import FreeDraw from './pages/FreeDraw';
import Friends from './pages/Friends';
import Journal from './pages/Journal';
import League from './pages/League';
import LiveDuel from './pages/LiveDuel';
import Learn, { CoursePage } from './pages/Learn';
import LessonPage from './pages/LessonPage';
import Onboarding from './pages/Onboarding';
import Parent from './pages/Parent';
import Playground from './pages/Playground';
import Profiles from './pages/Profiles';
import Shop from './pages/Shop';
import StoryShelf, { StoryReader } from './pages/StoryBook';
import Worlds from './pages/Worlds';
import World from './pages/World';
import { initPlus } from './world/plus';
import { OnlineSync } from './online/OnlineHost';
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
  // Çizio Plus (Google Play aboneliği) yalnızca Android uygulamasında başlatılır
  useEffect(() => void initPlus().catch(() => {}), []);
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
        <Route path="/" element={<NeedsProfile><Worlds /></NeedsProfile>} />
        <Route path="/atolye" element={<NeedsProfile><Playground /></NeedsProfile>} />
        <Route path="/english" element={<NeedsProfile><EnglishHome /></NeedsProfile>} />
        <Route path="/english/zaman" element={<NeedsProfile><EnglishTime /></NeedsProfile>} />
        <Route path="/english/kelimeler" element={<NeedsProfile><EnglishWords /></NeedsProfile>} />
        <Route path="/english/kelimeler/:id" element={<NeedsProfile><EnglishTopic /></NeedsProfile>} />
        <Route path="/english/oyunlar" element={<NeedsProfile><EnglishGames /></NeedsProfile>} />
        <Route path="/english/oyna/:game" element={<NeedsProfile><EnglishPlay /></NeedsProfile>} />
        <Route path="/english/hikayeler" element={<NeedsProfile><EnglishStories /></NeedsProfile>} />
        <Route path="/english/hikaye/:id" element={<NeedsProfile><EnglishStoryPage /></NeedsProfile>} />
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
        <Route path="/ada" element={<NeedsProfile><World /></NeedsProfile>} />
        <Route path="/oyun" element={<NeedsProfile><DrawGamePicker /></NeedsProfile>} />
        <Route path="/oyun/:id" element={<NeedsProfile><DrawGame /></NeedsProfile>} />
        <Route path="/hikaye" element={<NeedsProfile><StoryShelf /></NeedsProfile>} />
        <Route path="/hikaye/:id" element={<NeedsProfile><StoryReader /></NeedsProfile>} />
        <Route path="/arkadaslar" element={<NeedsProfile><Friends /></NeedsProfile>} />
        <Route path="/canli/:id" element={<NeedsProfile><LiveDuel /></NeedsProfile>} />
        <Route path="/birlikte/:id" element={<NeedsProfile><Coop /></NeedsProfile>} />
        <Route path="/ebeveyn" element={<Parent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
      <OnlineSync />
    </HashRouter>
  );
}
