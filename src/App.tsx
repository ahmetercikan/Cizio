import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScreenTimeGuard } from './components/ScreenTime';
import { MUZIK_MATEMATIK_ACIK } from './lib/flags';
import { setSfxEnabled } from './lib/sfx';
import { setNaturalVoice, unlockAudio } from './lib/speech';
import Learn, { CoursePage } from './pages/Learn';
import Onboarding from './pages/Onboarding';
import Playground from './pages/Playground';
import Profiles from './pages/Profiles';
import Worlds from './pages/Worlds';

// Ağır sayfalar ilk açıldıklarında yüklenir (uygulama daha hızlı açılır); sık kullanılanlar boşta önceden yüklenir.
const named = <M extends Record<string, unknown>, K extends keyof M>(load: () => Promise<M>, key: K) =>
  lazy(() => load().then((m) => ({ default: m[key] as ComponentType })));
const loadEnglish = () => import('./pages/English');
const loadWorld = () => import('./pages/World');
const loadLesson = () => import('./pages/LessonPage');
const loadFree = () => import('./pages/FreeDraw');
const loadDress = () => import('./pages/DressUp');
const Adventure = lazy(() => import('./pages/Adventure'));
const Challenge = lazy(() => import('./pages/Challenge'));
const Coop = lazy(() => import('./pages/Coop'));
const DrawGame = lazy(() => import('./pages/DrawGame'));
const DrawGamePicker = named(() => import('./pages/DrawGame'), 'DrawGamePicker');
const DressUp = lazy(loadDress);
const Duel = lazy(() => import('./pages/Duel'));
const EnglishHome = lazy(loadEnglish);
const EnglishAbc = lazy(() => import('./english/AbcPage'));
const EnglishSongs = lazy(() => import('./english/SongsPage'));
const EnglishDraw = lazy(() => import('./english/DrawPage'));
const EnglishGames = named(loadEnglish, 'EnglishGames');
const EnglishPlay = named(loadEnglish, 'EnglishPlay');
const EnglishStories = named(loadEnglish, 'EnglishStories');
const EnglishStoryPage = named(loadEnglish, 'EnglishStoryPage');
const EnglishTime = named(loadEnglish, 'EnglishTime');
const EnglishTopic = named(loadEnglish, 'EnglishTopic');
const EnglishWords = named(loadEnglish, 'EnglishWords');
const FreeDraw = lazy(loadFree);
const Friends = lazy(() => import('./pages/Friends'));
const Journal = lazy(() => import('./pages/Journal'));
const Letters = lazy(() => import('./pages/Letters'));
const MusicRoom = lazy(() => import('./pages/MusicRoom'));
const MathPark = lazy(() => import('./pages/MathPark'));
const League = lazy(() => import('./pages/League'));
const LiveDuel = lazy(() => import('./pages/LiveDuel'));
const LessonPage = lazy(loadLesson);
const Parent = lazy(() => import('./pages/Parent'));
const Shop = lazy(() => import('./pages/Shop'));
const StoryShelf = lazy(() => import('./pages/StoryBook'));
const StoryReader = named(() => import('./pages/StoryBook'), 'StoryReader');
const World = lazy(loadWorld);

import { initPlus } from './world/plus';
import { initPremium } from './world/premium';
import { OnlineSync } from './online/OnlineHost';
import { HomeReturn } from './components/HomeReturn';
import { useApp } from './store/useApp';

/** Profil yoksa karşılama akışına yönlendirir. */
function NeedsProfile({ children }: { children: ReactNode }) {
  const has = useApp((s) => !!s.activeId && s.profiles.some((p) => p.id === s.activeId));
  const any = useApp((s) => s.profiles.length > 0);
  if (!has) return <Navigate to={any ? '/profiller' : '/hosgeldin'} replace />;
  // günlük ekran süresi sınırı dolduysa mola ekranı (ebeveyn bölümü sınırın dışında kalır)
  return <ScreenTimeGuard>{children}</ScreenTimeGuard>;
}

export default function App() {
  const sfxOn = useApp((s) => s.settings.sfx);
  const natural = useApp((s) => s.settings.naturalVoice);
  const zoom = useApp((s) => s.settings.zoom ?? 0);
  const contrast = useApp((s) => s.settings.contrast ?? false);
  useEffect(() => setSfxEnabled(sfxOn), [sfxOn]);
  // erişilebilirlik: yazı büyüklüğü ve yüksek karşıtlık belgeye işlenir (CSS theme.css'te)
  useEffect(() => {
    const r = document.documentElement;
    if (zoom) r.dataset.zoom = String(zoom);
    else delete r.dataset.zoom;
    if (contrast) r.dataset.contrast = '1';
    else delete r.dataset.contrast;
  }, [zoom, contrast]);
  useEffect(() => setNaturalVoice(natural !== false), [natural]);
  // Çizio Plus (Google Play aboneliği) yalnızca Android uygulamasında başlatılır
  useEffect(() => void initPlus().catch(() => {}), []);
  useEffect(() => void initPremium().catch(() => {}), []);
  // sık açılan sayfaları uygulama boştayken hazırla (ilk dokunuşta bekletmesin).
  // Ada burada yok: paketi ağır, kartına dokununca hazırlanıyor (src/lib/preload.ts).
  useEffect(() => {
    const idle = (f: () => void) => ('requestIdleCallback' in window ? (window as Window & { requestIdleCallback: (f: () => void) => number }).requestIdleCallback(f) : setTimeout(f, 1500));
    const t = setTimeout(() => idle(() => void Promise.all([loadLesson(), loadFree(), loadDress(), loadEnglish()]).catch(() => {})), 2500);
    return () => clearTimeout(t);
  }, []);
  // iOS: ses ancak bir dokunuştan sonra çalabilir; ilk dokunuşta ses öğesinin kilidini aç.
  useEffect(() => {
    const once = () => unlockAudio();
    window.addEventListener('pointerdown', once, { once: true });
    return () => window.removeEventListener('pointerdown', once);
  }, []);

  return (
    <HashRouter>
      <ErrorBoundary>
      <Suspense fallback={<div className="bg page-wait" />}>
      <Routes>
        <Route path="/hosgeldin" element={<Onboarding />} />
        <Route path="/profiller" element={<Profiles />} />
        <Route path="/" element={<NeedsProfile><Worlds /></NeedsProfile>} />
        <Route path="/atolye" element={<NeedsProfile><Playground /></NeedsProfile>} />
        <Route path="/english" element={<NeedsProfile><EnglishHome /></NeedsProfile>} />
        <Route path="/english/zaman" element={<NeedsProfile><EnglishTime /></NeedsProfile>} />
        <Route path="/english/abc" element={<NeedsProfile><EnglishAbc /></NeedsProfile>} />
        <Route path="/english/sarkilar" element={<NeedsProfile><EnglishSongs /></NeedsProfile>} />
        <Route path="/english/ciz" element={<NeedsProfile><EnglishDraw /></NeedsProfile>} />
        <Route path="/english/kelimeler" element={<NeedsProfile><EnglishWords /></NeedsProfile>} />
        <Route path="/english/kelimeler/:id" element={<NeedsProfile><EnglishTopic /></NeedsProfile>} />
        <Route path="/english/oyunlar" element={<NeedsProfile><EnglishGames /></NeedsProfile>} />
        <Route path="/english/oyna/:game" element={<NeedsProfile><EnglishPlay /></NeedsProfile>} />
        <Route path="/english/hikayeler" element={<NeedsProfile><EnglishStories /></NeedsProfile>} />
        <Route path="/english/hikaye/:id" element={<NeedsProfile><EnglishStoryPage /></NeedsProfile>} />
        <Route path="/ogren" element={<NeedsProfile><Learn /></NeedsProfile>} />
        <Route path="/yol/:id" element={<NeedsProfile><CoursePage /></NeedsProfile>} />
        <Route path="/dergi" element={<NeedsProfile><Journal /></NeedsProfile>} />
        <Route path="/harfler" element={<NeedsProfile><Letters /></NeedsProfile>} />
        {/* Şimdilik kapalı (src/lib/flags.ts) */}
        {MUZIK_MATEMATIK_ACIK && <Route path="/muzik" element={<NeedsProfile><MusicRoom /></NeedsProfile>} />}
        {MUZIK_MATEMATIK_ACIK && <Route path="/matematik" element={<NeedsProfile><MathPark /></NeedsProfile>} />}
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
      </Suspense>
      <HomeReturn />
      </ErrorBoundary>
      <OnlineSync />
    </HashRouter>
  );
}
