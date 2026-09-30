import { Brush, Images, LibraryBig, Settings, Shirt, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useProfile } from '../store/useApp';
import { AvatarArt } from './Avatars';
import { Doodles } from './Doodles';
import { Mascot } from './Mascot';
import { ChestButton, RewardsHost } from './Rewards';

const ITEMS = [
  { to: '/', label: 'Bugün', Icon: Sun },
  { to: '/ogren', label: 'Dersler', Icon: LibraryBig },
  { to: '/ciz', label: 'Atölye', Icon: Brush },
  { to: '/giydir', label: 'Giydir', Icon: Shirt },
  { to: '/dergi', label: 'Galerim', Icon: Images },
];

/** Uygulama kabuğu: üstte marka çubuğu, altta yüzen sekme çubuğu, zeminde boya lekeleri. */
export function AppShell({ children, flow = 0 }: { children: ReactNode; flow?: number }) {
  const profile = useProfile();
  return (
    <div className="bg app">
      <Doodles variant={flow} />
      <header className="appbar">
        <Link to="/" className="appbar__brand" aria-label="Çizio">
          <Mascot size={34} />
          <span>Çizio</span>
        </Link>
        <span className="appbar__spacer" />
        <ChestButton />
        <Link to="/ebeveyn" className="round-btn round-btn--soft" aria-label="Ebeveyn bölümü" title="Ebeveyn bölümü">
          <Settings size={22} />
        </Link>
        <Link to="/profiller" className="appbar__avatar" aria-label="Profil değiştir">
          {profile && <AvatarArt id={profile.avatar} size={46} />}
        </Link>
      </header>
      <main className="app__main">{children}</main>
      <RewardsHost />
      <nav className="tabbar" aria-label="Ana menü">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="tabbar__item">
            <Icon size={24} strokeWidth={2.3} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
