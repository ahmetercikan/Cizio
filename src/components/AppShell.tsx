import { BookHeart, Brush, GraduationCap, Palette, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useProfile } from '../store/useApp';
import { AvatarArt } from './Avatars';
import { FlowLine } from './FlowLine';

const ITEMS = [
  { to: '/', label: 'Oyun alanı', Icon: Palette },
  { to: '/ogren', label: 'Öğrenmek', Icon: GraduationCap },
  { to: '/ciz', label: 'Serbest', Icon: Brush },
  { to: '/dergi', label: 'Dergi', Icon: BookHeart },
];

export function AppShell({ children, flow = 0 }: { children: ReactNode; flow?: number }) {
  const profile = useProfile();
  return (
    <div className="bg shell">
      <FlowLine variant={flow} />
      <nav className="rail" aria-label="Ana menü">
        <Link to="/profiller" className="rail__avatar" aria-label="Profil değiştir">
          {profile && <AvatarArt id={profile.avatar} size={52} />}
        </Link>
        <div className="rail__items">
          {ITEMS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="rail__item">
              <span className="rail__icon">
                <Icon size={26} strokeWidth={2.2} />
              </span>
              <span className="rail__label">{label}</span>
            </NavLink>
          ))}
        </div>
        <Link to="/ebeveyn" className="rail__item rail__parent" aria-label="Ebeveyn bölümü">
          <span className="rail__icon">
            <Settings size={24} strokeWidth={2.2} />
          </span>
          <span className="rail__label">Ebeveyn</span>
        </Link>
      </nav>
      <main className="shell__main">{children}</main>
    </div>
  );
}
