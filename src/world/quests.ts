/** Çizio Adası'nın günlük görevleri ve Çizio'nun cümleleri (seslendirilir: src/voice/lines.ts). */
import { hashStr } from '../lib/util';

export type QuestId = 'stars' | 'slide' | 'swing' | 'dance' | 'boat' | 'gallery' | 'home';

export const STARS_GOAL = 5;

export const QUESTS: Record<QuestId, string> = {
  stars: `Adada ${STARS_GOAL} yıldız topla`,
  slide: 'Kaydıraktan kay',
  swing: 'Salıncakta sallan',
  dance: 'Dans pistinde dans et',
  boat: 'Tekneyle adanın etrafını gez',
  gallery: 'Sanat galerisinde resimlerine bak',
  home: 'Evine gidip kıyafetini değiştir',
};

/** Bugünün 3 görevi: yıldız toplama hep var, diğer ikisi güne göre değişir. */
export function todayQuests(profileId: string, day: string): QuestId[] {
  const rest: QuestId[] = ['slide', 'swing', 'dance', 'boat', 'gallery', 'home'];
  const h = hashStr(`${day}|${profileId}|ada`);
  const a = rest[h % rest.length];
  const b = rest.filter((x) => x !== a)[(h >>> 4) % (rest.length - 1)];
  return ['stars', a, b];
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
