/**
 * Çocuğun gördüğü kilit: fiyat ya da "satın al" yok; yalnızca "bir büyüğüne göster". Düğme ebeveyn kapısından
 * geçip Premium sayfasına götürür (Google Play Aileler, App Store Kids: satın alma ebeveyn kilidinin arkasında).
 */
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { Modal } from '../components/ui';
import { sfx } from '../lib/sfx';

export type LockKind = 'lesson' | 'english' | 'island' | 'story' | 'song';

const TEXT: Record<LockKind, string> = {
  lesson: 'Bu çizim dersi Çizio Premium ile açılıyor.',
  english: "English Club'ın bu bölümü Çizio Premium ile açılıyor.",
  island: 'Çizio Adası Çizio Premium ile açılıyor.',
  story: 'Bu hikaye Çizio Premium ile açılıyor.',
  song: 'Bu şarkı Çizio Premium ile açılıyor.',
};

function LockBody({ kind, onClose }: { kind: LockKind; onClose?: () => void }) {
  const nav = useNavigate();
  return (
    <div className="locked">
      <span className="locked__art">
        <Mascot size={120} mood="happy" className="float" />
        <span className="locked__crown"><Crown size={30} strokeWidth={2.4} /></span>
      </span>
      <h2 className="title-lg">Çizio Premium</h2>
      <p className="sub">{TEXT[kind]}</p>
      <p className="locked__hint">Bir büyüğüne göster, birlikte bakın!</p>
      <button className="pill pill--big locked__go" onClick={() => { sfx.pop(); nav(`/premium?neden=${kind}`); }}>
        <Lock size={22} strokeWidth={2.6} /> Büyüğüme göster
      </button>
      {onClose && <button className="btn-outline btn-outline--sm" onClick={onClose}>Geri dön</button>}
    </div>
  );
}

/** Kilitli bir şeye dokununca açılan pencere. */
export function LockedModal({ kind, onClose }: { kind: LockKind; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <LockBody kind={kind} onClose={onClose} />
    </Modal>
  );
}

/** Kilitli bir sayfaya doğrudan gelinince (bağlantı, günün görevi) sayfanın yerine gösterilir. */
export function LockedPage({ kind, back }: { kind: LockKind; back: () => void }) {
  return (
    <div className="bg locked-page">
      <main className="locked-page__card paper-card rise">
        <LockBody kind={kind} onClose={back} />
      </main>
    </div>
  );
}

/** Kartların köşesindeki küçük taç. */
export function LockBadge() {
  return (
    <span className="lock-badge" aria-label="Çizio Premium">
      <Crown size={15} strokeWidth={2.6} />
    </span>
  );
}
