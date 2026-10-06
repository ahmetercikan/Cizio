/**
 * Çevrimiçi eşitleme ve genel bildirimler:
 * - OnlineSync: cihazda çevrimiçi açık bir profil varsa Firebase'e bağlanır, kayıtları canlı izler,
 *   arkadaşların görünen bilgilerini getirir ve aktif profil için "çevrimiçiyim" sinyali gönderir.
 * - Canlı düello daveti uygulamanın her yerinde açılır pencere olarak çıkar.
 * - FriendsButton: üst çubukta, bekleyen işler sayısıyla.
 */
import { Swords, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AvatarArt } from '../components/Avatars';
import { Modal } from '../components/ui';
import { sfx } from '../lib/sfx';
import { useApp } from '../store/useApp';
import { ONLINE_AVAILABLE, online } from './index';
import { useOnline, viewFor, type OnlineView } from './store';
import type { PlayerInfo } from './types';

/** Aktif profilin çevrimiçi görünümü (çevrimiçi kapalıysa null). */
export function useOnlineView(): (OnlineView & { players: Record<string, PlayerInfo> }) | null {
  const me = useApp((s) => (s.activeId ? s.data[s.activeId]?.online?.pid : undefined));
  const st = useOnline();
  return useMemo(() => {
    const v = viewFor(st, me);
    return v ? { ...v, players: st.players } : null;
  }, [st, me]);
}

export function OnlineSync() {
  const ids = useApp((s) => Object.values(s.data).map((d) => d.online?.pid).filter(Boolean).join(','));
  const activePid = useApp((s) => (s.activeId ? s.data[s.activeId]?.online?.pid : undefined));

  // Canlı izleme
  useEffect(() => {
    if (!ONLINE_AVAILABLE || !ids) {
      useOnline.setState({ status: 'off', friendships: [], challenges: [], duels: [], coops: [] });
      return;
    }
    let off: (() => void) | undefined;
    let alive = true;
    useOnline.setState({ status: 'connecting' });
    online()
      .then((c) => {
        void c.prune().catch(() => {});
        return c.watchAll((s) => alive && useOnline.setState({ ...s, status: 'on' }));
      })
      .then((o) => {
        if (alive) off = o;
        else o();
      })
      .catch(() => alive && useOnline.setState({ status: 'error' }));
    return () => {
      alive = false;
      off?.();
    };
  }, [ids]);

  // Arkadaşların ad/avatar/son görülme bilgisi (dakikada bir tazelenir)
  const others = useOnline((s) =>
    [...new Set(s.friendships.flatMap((f) => f.members))].filter((p) => !ids.split(',').includes(p)).sort().join(','),
  );
  useEffect(() => {
    if (!others) return;
    let alive = true;
    const load = () =>
      online().then(async (c) => {
        const list = await Promise.all(others.split(',').map((p) => c.getPlayer(p).catch(() => null)));
        if (!alive) return;
        const players: Record<string, PlayerInfo> = {};
        for (const p of list) if (p) players[p.pid] = p;
        useOnline.setState((s) => ({ players: { ...s.players, ...players } }));
      });
    void load();
    const t = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [others]);

  // "Çevrimiçiyim" sinyali (uygulama açıkken 90 sn'de bir)
  useEffect(() => {
    if (!activePid) return;
    const beat = () => document.visibilityState === 'visible' && online().then((c) => c.heartbeat(activePid)).catch(() => {});
    void beat();
    const t = window.setInterval(beat, 90_000);
    document.addEventListener('visibilitychange', beat);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', beat);
    };
  }, [activePid]);

  return <DuelInvitePopup />;
}

/** Canlı düello daveti: her ekranda (düello/çizim ekranlarında değil) açılır. */
function DuelInvitePopup() {
  const v = useOnlineView();
  const nav = useNavigate();
  const path = useLocation().pathname;
  const [dismissed, setDismissed] = useState<string[]>([]);
  const invite = v?.duelInvites.find((d) => !dismissed.includes(d.id));
  const busy = /^\/(canli|ders|meydan|duello|birlikte|hosgeldin|ebeveyn)/.test(path);
  useEffect(() => {
    if (invite && !busy) sfx.fanfare();
  }, [invite?.id, busy]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!invite || busy || !v) return null;
  const friend = v.players[invite.from];
  const later = () => {
    setDismissed((d) => [...d, invite.id]);
    void online().then((c) => c.setDuelState(invite.id, 'declined'));
  };
  return (
    <Modal onClose={() => setDismissed((d) => [...d, invite.id])} className="online-invite">
      <div className="online-invite__art">
        <AvatarArt id={friend?.avatar ?? 'kedi'} size={84} />
        <Swords size={40} />
      </div>
      <h2 className="title-lg">{friend?.name ?? 'Arkadaşın'} seni canlı düelloya çağırıyor!</h2>
      <p className="sub">Aynı resmi aynı anda çizeceksiniz. Kim daha benzer çizecek?</p>
      <div className="modal-actions">
        <button className="btn-outline" onClick={later}>Şimdi değil</button>
        <button className="btn-dark" onClick={() => { setDismissed((d) => [...d, invite.id]); nav(`/canli/${invite.id}?kabul=1`); }}>Kabul et</button>
      </div>
    </Modal>
  );
}

/** Üst çubukta arkadaşlar düğmesi (aktif profilde çevrimiçi açıksa). */
export function FriendsButton() {
  const v = useOnlineView();
  if (!v) return null;
  return (
    <Link to="/arkadaslar" className="round-btn round-btn--soft friends-btn" aria-label="Arkadaşlarım">
      <Users size={22} />
      {v.badge > 0 && <span className="friends-btn__badge">{v.badge}</span>}
    </Link>
  );
}
