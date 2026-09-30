/**
 * Ödüller: seviyeler, hazine sandıkları, nadir eşyalar ve günün hediyesi.
 *
 * - Seviye: toplam yıldızla (XP) yükselir; her seviye atlama bir sandık kazandırır.
 * - Sandık kazanma anları: günün görevi, stil görevi, macera durağı, lig kürsüsü, seviye atlama,
 *   günün hediyesinde 7 günlük seri. Store bu anları önceki/sonraki veriyi karşılaştırarak yakalar.
 * - Sandıktan önce henüz sahip olunmayan nadir bir eşya çıkar (Giydir'de kilitli duran), hepsi
 *   açıldıysa yıldız çıkar. Her sandık ayrıca 2 yıldız verir (lige sayılır).
 */
import type { ProfileData } from '../store/useApp';
import { chapterStates } from './adventure';
import { addDays, dayKey } from './util';

// ------------------------------------------------------------------------------------------------
// Seviyeler
// ------------------------------------------------------------------------------------------------
export const LEVEL_NAMES = ['Minik Kalem', 'Çırak Ressam', 'Renk Kâşifi', 'Çizgi Ustası', 'Renk Sihirbazı', 'Sanatçı', 'Büyük Ressam', 'Efsane Ressam'];

/** Günlük etkinliklere yazılmış (kazanılmış) yıldızların toplamı. */
export const earnedSum = (d: ProfileData) => Object.values(d.days).reduce((a, x) => a + (x.stars ?? 0), 0);

/**
 * Deneyim (seviye için, hiç azalmaz). Store her yıldız kazanımında `xp`'yi artırır; alan henüz yoksa
 * (eski kayıt) kazanılan yıldızlar ile en iyi ders yıldızlarından büyüğü başlangıç sayılır.
 */
export function xpOf(d: ProfileData): number {
  if (d.xp !== undefined) return d.xp;
  const best = Object.values(d.lessons).reduce((a, l) => a + l.bestStars, 0);
  return Math.max(earnedSum(d), best);
}

/** Harcanabilir yıldızlar (Yıldız Dükkanı). Eski kayıtta başlangıç bakiyesi deneyim kadardır. */
export const walletOf = (d: ProfileData) => d.wallet ?? xpOf(d);

/** n. seviyeye ulaşmak için gereken toplam yıldız (1. seviye 0'dan başlar): 0, 8, 24, 48, 80, 120… */
export const levelNeed = (n: number) => 4 * n * (n - 1);

export interface Level {
  n: number;
  name: string;
  xp: number;
  /** Bu seviyenin başı ve bir sonrakinin eşiği. */
  from: number;
  to: number;
}

export function levelOf(xp: number): Level {
  let n = 1;
  while (xp >= levelNeed(n + 1)) n++;
  const name = n <= LEVEL_NAMES.length ? LEVEL_NAMES[n - 1] : `${LEVEL_NAMES[LEVEL_NAMES.length - 1]} ${n - LEVEL_NAMES.length + 1}`;
  return { n, name, xp, from: levelNeed(n), to: levelNeed(n + 1) };
}

// ------------------------------------------------------------------------------------------------
// Nadir eşyalar (yalnızca sandıktan çıkar)
// ------------------------------------------------------------------------------------------------
export interface RareItem {
  /** DollState alanı */
  slot: 'back' | 'dress' | 'hat' | 'pet' | 'bg' | 'shoes';
  id: string;
  title: string;
}

export const RARE: RareItem[] = [
  { slot: 'back', id: 'kanat', title: 'Peri kanatları' },
  { slot: 'pet', id: 'ejderha', title: 'Bebek ejderha' },
  { slot: 'dress', id: 'gokkusagi', title: 'Gökkuşağı elbise' },
  { slot: 'pet', id: 'unicorn', title: 'Unicorn' },
  { slot: 'hat', id: 'yildiztac', title: 'Yıldız taç' },
  { slot: 'shoes', id: 'isikli', title: 'Işıklı ayakkabı' },
  { slot: 'back', id: 'jetpack', title: 'Jetpack' },
  { slot: 'bg', id: 'gokkusagi', title: 'Gökkuşağı diyarı' },
  { slot: 'pet', id: 'panda', title: 'Panda' },
  { slot: 'back', id: 'ejderhakanat', title: 'Ejderha kanatları' },
];

export const rareKey = (r: { slot: string; id: string }) => `${r.slot}:${r.id}`;
export const isRare = (slot: string, id: string) => RARE.some((r) => r.slot === slot && r.id === id);
export const ownsRare = (d: ProfileData, slot: string, id: string) => (d.owned ?? []).includes(`${slot}:${id}`);

// ------------------------------------------------------------------------------------------------
// Sandıklar
// ------------------------------------------------------------------------------------------------
export type ChestReason = 'quest' | 'style' | 'level' | 'adventure' | 'league' | 'gift' | 'shop';

export const CHEST_TEXT: Record<ChestReason, string> = {
  quest: 'Günün görevini tamamladın!',
  style: 'Stil görevini tamamladın!',
  level: 'Seviye atladın!',
  adventure: 'Bir macera durağını bitirdin!',
  league: 'Haftalık ligde kürsüye çıktın!',
  gift: '7 gün üst üste geldin!',
  shop: 'Yıldız Dükkanı\'ndan aldın!',
};

// ------------------------------------------------------------------------------------------------
// Yıldız Dükkanı
// ------------------------------------------------------------------------------------------------
export const RARE_PRICE = 30;
export const CHEST_PRICE = 20;

export interface Frame {
  id: string;
  title: string;
  price: number;
}

/** Avatar çerçeveleri (üst çubuktaki ve profil seçimindeki avatarın çevresi). */
export const FRAMES: Frame[] = [
  { id: 'altin', title: 'Altın çerçeve', price: 15 },
  { id: 'cicek', title: 'Çiçekli çerçeve', price: 20 },
  { id: 'yildiz', title: 'Yıldızlı çerçeve', price: 25 },
  { id: 'gokkusagi', title: 'Gökkuşağı çerçeve', price: 35 },
];

/** Günün fırsatı: sahip olunmayan nadir eşyalardan biri, yarı fiyatına (her gün değişir). */
export function dailyDeal(d: ProfileData, profileId: string, now = new Date()): { item: RareItem; price: number } | null {
  const left = RARE.filter((r) => !(d.owned ?? []).includes(rareKey(r)));
  if (!left.length) return null;
  let h = 2166136261;
  for (const ch of `${dayKey(now)}|${profileId}|firsat`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return { item: left[(h >>> 0) % left.length], price: Math.ceil(RARE_PRICE / 2) };
}

export type Reward = { kind: 'item'; item: RareItem } | { kind: 'stars'; n: number };

/** Sandığın içeriği: sahip olunmayan nadir eşyalardan biri, yoksa yıldız. */
export function pickReward(d: ProfileData, rnd = Math.random): Reward {
  const left = RARE.filter((r) => !(d.owned ?? []).includes(rareKey(r)));
  if (!left.length) return { kind: 'stars', n: 5 };
  return { kind: 'item', item: left[Math.floor(rnd() * left.length)] };
}

/**
 * Bir güncellemede kazanılan sandıklar (önceki ve sonraki veriyi karşılaştırır).
 * Store'daki her yıldız/görev değişikliğinden sonra çağrılır.
 */
export function chestsEarned(prev: ProfileData, next: ProfileData): ChestReason[] {
  const out: ChestReason[] = [];
  if ((next.quests?.length ?? 0) > (prev.quests?.length ?? 0)) out.push('quest');
  if ((next.styled?.length ?? 0) > (prev.styled?.length ?? 0)) out.push('style');
  const lv = levelOf(xpOf(next)).n - levelOf(xpOf(prev)).n;
  for (let i = 0; i < lv; i++) out.push('level');
  const done = (d: ProfileData) => chapterStates(d).filter((c) => c.complete).length;
  const adv = done(next) - done(prev);
  for (let i = 0; i < adv; i++) out.push('adventure');
  const podium = (d: ProfileData) => Object.values(d.leagues ?? {}).filter((r) => r <= 3).length;
  if (podium(next) > podium(prev)) out.push('league');
  return out;
}

// ------------------------------------------------------------------------------------------------
// Günün hediyesi (7 günlük takvim)
// ------------------------------------------------------------------------------------------------
export interface GiftState {
  last: string;
  streak: number;
}

/** Bugün hediye alınabilir mi, alınırsa seri kaç olur? */
export function giftStatus(g: GiftState | undefined, now = new Date()): { available: boolean; streak: number } {
  const today = dayKey(now);
  if (g?.last === today) return { available: false, streak: g.streak };
  const cont = g?.last === dayKey(addDays(now, -1));
  return { available: true, streak: cont ? (g!.streak % 7) + 1 : 1 };
}

/** Takvimin gün ödülü: 7. gün hazine sandığı, diğer günler yıldız. */
export const GIFT_DAYS = [2, 2, 3, 2, 3, 5, 0];

/**
 * Günün hediyesi penceresi gösterilsin mi? Günde bir kez; profil bugün oluşturulduysa (yeni kayıt, ilk gün)
 * hiç gösterilmez.
 */
export function giftEligible(createdAt: number, g: GiftState | undefined, now = new Date()): boolean {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return createdAt < startOfToday && giftStatus(g, now).available;
}
