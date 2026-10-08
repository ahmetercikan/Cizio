/** Çizio Adası'nın günlük görevleri ve Çizio'nun cümleleri (seslendirilir: src/voice/lines.ts). */
import { hashStr } from '../lib/util';

export type QuestId =
  | 'stars' | 'slide' | 'swing' | 'dance' | 'boat' | 'gallery' | 'home' | 'ferris' | 'carousel' | 'trampoline'
  | 'balloon' | 'fish' | 'icecream' | 'flowers' | 'lighthouse' | 'treasure' | 'goal' | 'music';

export const STARS_GOAL = 5;
/** Yıldız avı dışında her gün kaç görev. */
export const DAILY_EXTRA = 3;

export const QUESTS: Record<QuestId, string> = {
  stars: `Adada ${STARS_GOAL} yıldız topla`,
  slide: 'Kaydıraktan kay',
  swing: 'Salıncakta sallan',
  dance: 'Dans pistinde dans et',
  boat: 'Tekneyle adanın etrafını gez',
  gallery: 'Sanat galerisinde resimlerine bak',
  home: 'Evine gidip kıyafetini değiştir',
  ferris: 'Dönme dolaba bin',
  carousel: 'Atlıkarıncaya bin',
  trampoline: 'Trambolinde zıpla',
  balloon: 'Sıcak hava balonuyla uç',
  fish: 'İskelede balık tut',
  icecream: 'Dondurma arabasından dondurma al',
  flowers: 'Bahçedeki çiçekleri sula',
  lighthouse: 'Deniz fenerini yak',
  treasure: 'Kumsalda bir hazine kaz',
  goal: 'Futbol sahasında gol at',
  music: 'Müzik karolarında bir şarkı çal',
};

/** Bugünün görevleri: yıldız avı hep var, diğer üçü güne göre değişir. */
export function todayQuests(profileId: string, day: string): QuestId[] {
  const rest = (Object.keys(QUESTS) as QuestId[]).filter((q) => q !== 'stars');
  let h = hashStr(`${day}|${profileId}|ada`);
  const out: QuestId[] = ['stars'];
  while (out.length < DAILY_EXTRA + 1) {
    const pool = rest.filter((q) => !out.includes(q));
    out.push(pool[h % pool.length]);
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
  }
  return out;
}

export const ISLAND_LINES = {
  welcome: 'Çizio Adası’na hoş geldin! Gel, bugünkü görevlerine bakalım.',
  hello: 'Merhaba! Bugün seni bekleyen görevler var. Hepsini bitirirsen sana yıldız vereceğim!',
  allDone: 'Bütün görevleri bitirdin! İşte yıldızların!',
  doneToday: 'Bugünkü görevlerin hepsi tamam. Yarın yeni görevler gelecek!',
  questDone: 'Görev tamam! Harikasın!',
  star: 'Bir yıldız buldun!',
};

export const ISLAND_VOICE_LINES = [...Object.values(ISLAND_LINES), ...Object.values(QUESTS)];
