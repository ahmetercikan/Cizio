/**
 * English Club ilerlemesi: çocuğun hangi kelimeyi kaç kez gördüğü, hangi günleri tamamladığı ve yıldızlar.
 *
 * Bu küçük parça `data.ts`ten ayrı duruyor: uygulamanın kayıt dosyası (store/useApp.ts) yalnızca buna
 * ihtiyaç duyuyor, bütün kelime/hikaye listelerine değil. Böylece açılışta onlar indirilmiyor.
 */

/** Yaş grupları (çalışmalardaki tablo: 5–6 hareket ve ses, 7–8 resimli kitap, 8–9 içerikle öğrenme). */
export type Age = 'mini' | 'junior' | 'star';

export interface EnglishData {
  age?: Age;
  /** Kelime: kaç kez görüldü, kaç kez ilk denemede bulundu. */
  words: Record<string, { seen: number; got: number }>;
  /** English Time'ın tamamlandığı günler. */
  sessions: string[];
  stories: string[];
  /** Gün → İngilizce'den kazanılan yıldız (günlük üst sınır için). */
  stars: Record<string, number>;
}

export const emptyEnglish = (): EnglishData => ({ words: {}, sessions: [], stories: [], stars: {} });

/** Bir kelime "biliniyor": en az iki kez ilk denemede bulundu. */
export const known = (e: EnglishData, id: string) => (e.words[id]?.got ?? 0) >= 2;
export const seen = (e: EnglishData, id: string) => (e.words[id]?.seen ?? 0) > 0;

/** English Time'dan günde bir kez kazanılan yıldız; oyunlardan günlük üst sınır. */
export const SESSION_STARS = 5;
export const GAME_STARS = 2;
export const DAILY_GAME_CAP = 10;
