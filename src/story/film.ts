/**
 * Sinemadaki film: çocuğun kendi çizimlerinden kurulan kısa masal.
 *
 * Cümleler Hikaye Kitabım'la aynıdır (src/story/data.ts); böylece film için yeni seslendirme gerekmez.
 * Burada yalnızca cümleler sahnelere bölünür ve her sahnenin kaç saniye süreceği tahmin edilir.
 * Perdeyi çizen kısım src/world/interiors.ts içindedir. React ve tarayıcı içermez.
 */
import { buildStory, THEMES, type StoryTheme } from './data';

/** Filmde en çok kaç çizim oynar (fazlası filmi çok uzatır). */
export const FILM_MAX = 3;
/** Film için en az kaç çizim gerekir (daha azsa çizgi film oynar). */
export const FILM_MIN = 2;

export interface FilmScene {
  /** Perdedeki çizim: sıra numarası ya da son sayfada hepsi birden. */
  art: number | 'all';
  /** Perdenin altında yazan ve Çizio'nun okuduğu cümle. */
  text: string;
  /** Filmin başından itibaren kaçıncı saniyede başlar. */
  at: number;
  dur: number;
}

/** Günün masal konusu: aynı gün hep aynı, ertesi gün başka bir masal. */
export const filmTheme = (now = new Date()): StoryTheme => THEMES[(now.getMonth() * 31 + now.getDate()) % THEMES.length];

/**
 * Cümleleri sahnelere böler. Süre cümlenin uzunluğundan tahmin edilir (Çizio saniyede yaklaşık
 * 12-13 harf okur); çocuk beklemede kalmasın diye en kısa 3,2 en uzun 13 saniye.
 */
export function filmScenes(arts: { lessonId?: string }[], theme: StoryTheme): FilmScene[] {
  const out: FilmScene[] = [];
  let at = 0;
  for (const page of buildStory(arts.slice(0, FILM_MAX), theme)) {
    for (const text of page.lines) {
      const dur = Math.min(13, Math.max(3.2, 1.4 + text.length / 12.5));
      out.push({ art: page.art, text, at, dur });
      at += dur;
    }
  }
  return out;
}

/** Filmin toplam süresi (saniye). */
export const filmLength = (s: FilmScene[]) => (s.length ? s[s.length - 1].at + s[s.length - 1].dur : 0);

/** t saniyesinde hangi sahne oynuyor; film bittiyse -1. */
export function sceneAt(s: FilmScene[], t: number): number {
  if (!s.length || t >= filmLength(s)) return -1;
  let i = 0;
  while (i + 1 < s.length && t >= s[i + 1].at) i++;
  return i;
}
