/**
 * Çevrimiçi durum (kalıcı değil): canlı arkadaşlıklar, meydan okumalar, düellolar, ortak boyamalar ve arkadaşların
 * görünen bilgileri. OnlineSync (src/online/OnlineHost.tsx) doldurur; seçiciler aktif profile göre süzer.
 */
import { create } from 'zustand';
import type { Challenge, Coop, Duel, Friendship, PlayerInfo } from './types';
import { otherOf } from './types';

export type OnlineStatus = 'off' | 'connecting' | 'on' | 'error';

interface OnlineState {
  status: OnlineStatus;
  friendships: Friendship[];
  challenges: Challenge[];
  duels: Duel[];
  coops: Coop[];
  players: Record<string, PlayerInfo>;
}

export const useOnline = create<OnlineState>(() => ({
  status: 'off',
  friendships: [],
  challenges: [],
  duels: [],
  coops: [],
  players: {},
}));

const DAY = 86_400_000;

/** Aktif profilin (pid) bakış açısından süzülmüş liste. */
export function viewFor(s: OnlineState, me: string | undefined, now = Date.now()) {
  if (!me) return null;
  const mine = <T extends { members: [string, string] }>(xs: T[]) => xs.filter((x) => x.members.includes(me));
  const fr = mine(s.friendships);
  const friends = fr.filter((f) => f.status === 'accepted').map((f) => ({ f, pid: otherOf(f, me) }));
  const incoming = fr.filter((f) => f.status === 'pending' && f.requestedBy !== me).map((f) => ({ f, pid: otherOf(f, me) }));
  const outgoing = fr.filter((f) => f.status === 'pending' && f.requestedBy === me).map((f) => ({ f, pid: otherOf(f, me) }));
  const ch = mine(s.challenges).filter((c) => now - c.updatedAt < 30 * DAY).sort((a, b) => b.updatedAt - a.updatedAt);
  const toPlay = ch.filter((c) => c.from !== me && !c.results[me]);
  const waiting = ch.filter((c) => c.from === me && !c.results[otherOf(c, me)]);
  const finished = ch.filter((c) => Object.keys(c.results).length === 2);
  // Düello daveti 2 dakika geçerli; eski davetler gösterilmez.
  const duelInvites = mine(s.duels).filter((d) => d.state === 'invited' && d.from !== me && now - d.createdAt < 2 * 60_000);
  const coops = mine(s.coops).filter((c) => c.state !== 'declined' && now - c.updatedAt < 14 * DAY).sort((a, b) => b.updatedAt - a.updatedAt);
  const myTurn = coops.filter((c) => c.state !== 'done' && c.turnOf === me);
  const badge = incoming.length + toPlay.length + duelInvites.length + myTurn.length;
  return { me, friends, incoming, outgoing, toPlay, waiting, finished, duelInvites, coops, myTurn, badge };
}

export type OnlineView = NonNullable<ReturnType<typeof viewFor>>;
