/**
 * Ücretsiz kullanıcının açık olan bölümleri (Premium'da hepsi açık). Saf hesap: arayüz ve testler çağırır.
 *
 * - Çizim: her konunun (yolun) ilk 2 dersi. Çocuğun daha önce bitirdiği dersler de açık kalır.
 * - English Club: English Time'ın ilk 5 günü, kelimelerde ilk 3 konu, ilk 2 hikaye ve ilk 2 şarkı.
 *   Oyunlar, ABC ve "Draw in English" ücretsiz.
 * - Çizio Adası: tamamen Premium.
 */
import { LESSON_META } from '../lessons/meta';

export const FREE_LESSONS_PER_PATH = 2;
export const FREE_EN_DAYS = 5;
export const FREE_EN_TOPICS = 3;
export const FREE_STORIES = 2;
export const FREE_SONGS = 2;

const FREE_LESSONS: ReadonlySet<string> = (() => {
  const byPath = new Map<string, { id: string; order: number }[]>();
  for (const m of LESSON_META) {
    const list = byPath.get(m.path) ?? [];
    list.push({ id: m.id, order: m.order ?? 99 });
    byPath.set(m.path, list);
  }
  const free = new Set<string>();
  for (const list of byPath.values()) list.sort((a, b) => a.order - b.order).slice(0, FREE_LESSONS_PER_PATH).forEach((x) => free.add(x.id));
  return free;
})();

export const FREE_LESSON_COUNT = FREE_LESSONS.size;

/** Ders ücretsiz mi (ya da çocuk zaten bitirmiş mi)? */
export const lessonFree = (id: string, done = false) => done || FREE_LESSONS.has(id);

/** English Time bugün ücretsiz açılabilir mi? (Bugün başlanmışsa ya da ilk 5 gün dolmadıysa.) */
export const englishTimeFree = (sessions: string[], today: string) => sessions.includes(today) || sessions.length < FREE_EN_DAYS;

/** Kelime konusu (TOPICS sırası) ücretsiz mi? */
export const topicFree = (index: number) => index >= 0 && index < FREE_EN_TOPICS;

/** Hikaye (STORIES sırası) ücretsiz mi? Okunmuş hikaye açık kalır. */
export const storyFree = (index: number, read = false) => read || (index >= 0 && index < FREE_STORIES);

export const songFree = (index: number) => index >= 0 && index < FREE_SONGS;
