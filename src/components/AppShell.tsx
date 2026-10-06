import { BookA, BookOpen, Brush, Gamepad2, Images, LayoutGrid, LibraryBig, Settings, Shirt, Store, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FriendsButton } from '../online/OnlineHost';
import { useApp, useProfile } from '../store/useApp';
import { AvatarArt } from './Avatars';
import { Doodles } from './Doodles';
import { Mascot } from './Mascot';
import { ChestButton, RewardsHost, StarCounter } from './Rewards';

export type WorldId = 'atolye' | 'studyo' | 'english';

/** Uygulamanın üç dünyası: her birinin kendi sekmeleri ve rengi var. Açılışta "/" dünya seçimidir. */
export const WORLDS: Record<WorldId, { title: string; home: string; tabs: { to: string; label: string; Icon: typeof Sun }[] }> = {
  atolye: {
    title: 'Çizim Atölyesi',
    home: '/atolye',
    tabs: [
      { to: '/atolye', label: 'Bugün', Icon: Sun },
      { to: '/ogren', label: 'Dersler', Icon: LibraryBig },
      { to: '/ciz', label: 'Çiz', Icon: Brush },
      { to: '/dergi', label: 'Galerim', Icon: Images },
    ],
  },
  studyo: {
    title: 'Giydirme Stüdyosu',
    home: '/giydir',
    tabs: [
      { to: '/giydir', label: 'Stüdyo', Icon: Shirt },
      { to: '/dukkan', label: 'Dükkan', Icon: Store },
    ],
  },
  english: {
    title: 'English Club',
    home: '/english',
    tabs: [
      { to: '/english', label: 'Bugün', Icon: Sun },
      { to: '/english/kelimeler', label: 'Kelimeler', Icon: BookA },
      { to: '/english/oyunlar', label: 'Oyunlar', Icon: Gamepad2 },
      { to: '/english/hikayeler', label: 'Hikayeler', Icon: BookOpen },
    ],
  },
};

export function worldOf(path: string): WorldId {
  if (path.startsWith('/english')) return 'english';
  if (path.startsWith('/giydir') || path.startsWith('/dukkan')) return 'studyo';
  return 'atolye';
}

/** Üst çubuk: dünya adı (dokununca dünya seçimine döner), sandık, yıldızlar, ebeveyn, profil. */
export function AppBar({ world }: { world?: WorldId }) {
  const profile = useProfile();
  const frame = useApp((s) => (s.activeId ? s.data[s.activeId]?.frame : undefined));
  return (
    <header className="appbar">
      {world ? (
        <Link to="/" className={`appbar__brand appbar__brand--world world-${world}`} aria-label="Dünyalar">
          <span className="appbar__worlds"><LayoutGrid size={20} strokeWidth={2.6} /></span>
          <span>{WORLDS[world].title}</span>
        </Link>
      ) : (
        <span className="appbar__brand">
          <Mascot size={34} />
          <span>Çizio</span>
        </span>
      )}
      <span className="appbar__spacer" />
      <FriendsButton />
      <ChestButton />
      <StarCounter />
      <Link to="/ebeveyn" className="round-btn round-btn--soft" aria-label="Ebeveyn bölümü" title="Ebeveyn bölümü">
        <Settings size={22} />
      </Link>
      <Link to="/profiller" className={`appbar__avatar ${frame ? `frame frame--${frame}` : ''}`} aria-label="Profil değiştir">
        {profile && <AvatarArt id={profile.avatar} size={46} />}
      </Link>
    </header>
  );
}

/** Uygulama kabuğu: üstte marka çubuğu, altta bulunulan dünyanın sekmeleri, zeminde boya lekeleri. */
export function AppShell({ children, flow = 0 }: { children: ReactNode; flow?: number }) {
  const world = worldOf(useLocation().pathname);
  const { tabs } = WORLDS[world];
  return (
    <div className={`bg app world-${world}`}>
      <Doodles variant={flow} />
      <AppBar world={world} />
      <main className="app__main">{children}</main>
      <RewardsHost />
      <nav className={`tabbar tabbar--${tabs.length}`} aria-label="Ana menü">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === WORLDS[world].home} className="tabbar__item">
            <Icon size={24} strokeWidth={2.3} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
