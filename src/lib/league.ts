/**
 * Haftalık lig: çocuk bu hafta topladığı yıldızlarla Çizio'nun dört arkadaşına (bot) karşı yarışır.
 * Botların haftalık hedefi çocuğun geçen haftaki temposuna göre ayarlanır, böylece yarış hep çekişmeli kalır.
 * Botların ilerlemesi tarih + profil anahtarından türetilir (her açılışta aynı sonuç, sunucu gerekmez).
 */
import { AVATARS } from '../components/Avatars';
import type { Profile, ProfileData } from '../store/useApp';
import { addDays, dayKey, hashStr, weekKey, weekStart } from './util';

export interface Rival {
  id: string;
  name: string;
  avatar: string;
  /** Haftalık hedefin çocuğun temposuna oranı. */
  pace: number;
}

export const RIVALS: Rival[] = [
  { id: 'kaya', name: 'Kaya', avatar: 'kaplumbaga', pace: 0.55 },
  { id: 'bilge', name: 'Bilge', avatar: 'baykus', pace: 0.85 },
  { id: 'rifki', name: 'Rıfkı', avatar: 'robot', pace: 1.1 },
  { id: 'zipzip', name: 'Zıpzıp', avatar: 'uzayli', pace: 1.4 },
];

export interface Standing {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  you?: boolean;
}

/** Verilen haftanın (pazartesi anahtarı) toplam yıldızı. */
export function weekStars(data: ProfileData, wk: string): number {
  const start = new Date(`${wk}T00:00:00`);
  let n = 0;
  for (let i = 0; i < 7; i++) n += data.days[dayKey(addDays(start, i))]?.stars ?? 0;
  return n;
}

/** Botların hedefi için taban: geçen haftanın yıldızı (en az 10), çok aktif çocukta da yarış sürsün. */
function baseline(data: ProfileData, wk: string): number {
  const prev = dayKey(addDays(new Date(`${wk}T00:00:00`), -7));
  return Math.max(10, weekStars(data, prev));
}

/** Botun o hafta `now` anına kadar topladığı yıldız (hafta bittiyse hedefin tamamı). */
function rivalStars(r: Rival, profileId: string, data: ProfileData, wk: string, now: Date): number {
  const start = new Date(`${wk}T00:00:00`);
  const target = Math.round(baseline(data, wk) * r.pace);
  const weights = Array.from({ length: 7 }, (_, i) => 0.4 + (hashStr(`${wk}|${profileId}|${r.id}|${i}`) % 100) / 100);
  const total = weights.reduce((a, b) => a + b, 0);
  const elapsed = Math.max(0, Math.min(7, (now.getTime() - start.getTime()) / 86400000));
  let got = 0;
  for (let i = 0; i < 7; i++) got += weights[i] * Math.max(0, Math.min(1, elapsed - i));
  if (elapsed >= 7) return target;
  return Math.floor((target * got) / total + 1e-9);
}

/** Avatarı çocuğunkiyle aynı olan botun avatarını değiştir (karışmasın). */
function rivalAvatar(r: Rival, profile: Profile): string {
  if (r.avatar !== profile.avatar) return r.avatar;
  return AVATARS.find((a) => a.id !== profile.avatar && !RIVALS.some((x) => x.avatar === a.id))?.id ?? r.avatar;
}

/** Sıralama (yüksekten düşüğe). Eşitlikte çocuk öne geçer. */
export function standings(profile: Profile, data: ProfileData, now = new Date(), wk = weekKey(now)): Standing[] {
  const rows: Standing[] = [
    { id: 'you', name: profile.name, avatar: profile.avatar, stars: weekStars(data, wk), you: true },
    ...RIVALS.map((r) => ({ id: r.id, name: r.name, avatar: rivalAvatar(r, profile), stars: rivalStars(r, profile.id, data, wk, now) })),
  ];
  return rows.sort((a, b) => b.stars - a.stars || Number(!!b.you) - Number(!!a.you));
}

/** Haftanın bitmesine kalan gün (bugün dahil). */
export const daysLeft = (now = new Date()) => 7 - Math.floor((now.getTime() - weekStart(now).getTime()) / 86400000);

/** Geçen haftanın kesin sıralaması (hafta tamamen bittiği için botlar hedeflerinde). */
export function lastWeekResult(profile: Profile, data: ProfileData, now = new Date()): { wk: string; rank: number; played: boolean } {
  const wk = weekKey(addDays(weekStart(now), -1));
  const end = weekStart(now);
  const rows = standings(profile, data, end, wk);
  return { wk, rank: rows.findIndex((r) => r.you) + 1, played: weekStars(data, wk) > 0 };
}
