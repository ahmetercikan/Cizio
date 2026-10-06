/** Çevrimiçi veri tipleri (Firestore belgeleri). Firebase'e bağımlı değil: her yerden içe aktarılabilir. */
import type { ChallengeKind } from '../lib/daily';

/** Cihazdaki bir profilin çevrimiçi kimliği (ProfileData.online). */
export interface OnlineIdentity {
  pid: string;
  code: string;
}

export interface PlayerInfo {
  pid: string;
  name: string;
  avatar: string;
  lastSeen?: number;
}

export interface Friendship {
  id: string;
  members: [string, string];
  owners: [string, string];
  requestedBy: string;
  status: 'pending' | 'accepted';
  createdAt: number;
}

/** Bir oyuncunun sonucu: benzerlik yüzdesi, yıldız ve küçük çizim resmi (data:image/webp). */
export interface PlayResult {
  percent: number;
  stars: number;
  image: string;
  at: number;
}

/** Hazır tepkiler (serbest metin yok). */
export const REACTIONS = ['clap', 'star', 'heart', 'wow', 'laugh'] as const;
export type Reaction = (typeof REACTIONS)[number];

interface Shared {
  id: string;
  pair: string;
  members: [string, string];
  owners: [string, string];
  from: string;
  lessonId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Challenge extends Shared {
  kind: ChallengeKind;
  results: Record<string, PlayResult>;
  reactions: Record<string, Reaction>;
}

export type DuelState = 'invited' | 'countdown' | 'done' | 'declined' | 'cancelled';
export interface Duel extends Shared {
  mode: 'look' | 'memory';
  state: DuelState;
  startAt: number | null;
  results: Record<string, PlayResult>;
}

export interface CoopMove {
  by: string;
  color: string;
  at: [number, number];
  pattern?: string;
}
export type CoopState = 'invited' | 'playing' | 'done' | 'declined';
export interface Coop extends Shared {
  state: CoopState;
  turnOf: string;
  moves: CoopMove[];
}

/** Birlikte boyamada bir sırada yapılabilecek boyama sayısı. */
export const COOP_MOVES_PER_TURN = 3;

export const pairOf = (a: string, b: string) => (a < b ? `${a}_${b}` : `${b}_${a}`);
export const otherOf = (d: { members: [string, string] }, me: string) => (d.members[0] === me ? d.members[1] : d.members[0]);
/** Arkadaş son 2 dakika içinde uygulamadaysa "çevrimiçi" sayılır. */
export const isOnlineNow = (p?: PlayerInfo, now = Date.now()) => !!p?.lastSeen && now - p.lastSeen < 2 * 60_000;
