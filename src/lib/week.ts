/**
 * Haftalık karne: bir çocuğun bu hafta ne yaptığının özeti.
 *
 * Hem çocuğa gösterilen sertifikayı hem de ebeveyn bölümündeki özeti besler. Hiçbir şey tahmin
 * edilmez; hepsi kayıtlı verilerden sayılır (günlük etkinlik, English Club, harf izleme, galeri).
 */
import type { ProfileData } from '../store/useApp';
import { ALL_WORDS, emptyEnglish, known, STORIES } from '../english/data';
import { addDays, dayKey, weekStart } from './util';

export interface WeekReport {
  /** Haftanın günleri (Pazartesi'den Pazar'a) ve o gün etkin miydi. */
  days: { key: string; active: boolean; lessons: number; minutes: number }[];
  /** Kaç gün uygulamayı açtı. */
  activeDays: number;
  lessons: number;
  minutes: number;
  drawings: number;
  stars: number;
  /** English Club: bu hafta kaç gün English Time yapıldı. */
  englishDays: number;
  /** Toplam öğrenilen kelime (hafta sonu durumu). */
  words: number;
  /** Okunan İngilizce hikâye sayısı. */
  stories: number;
  /** Yazılan harf ve rakam sayısı (en az bir yıldız alınmış). */
  letters: number;
  /** Hafta başlangıç ve bitiş günü (gg.aa). */
  range: string;
}

const gun = (k: string) => {
  const [, m, d] = k.split('-');
  return `${d}.${m}`;
};

/** Bu haftanın (ya da verilen tarihin haftasının) karnesi. */
export function weekReport(d: ProfileData, now = new Date()): WeekReport {
  const start = weekStart(now);
  const keys = Array.from({ length: 7 }, (_, i) => dayKey(addDays(start, i)));
  const days = keys.map((key) => {
    const a = d.days?.[key];
    return { key, active: !!a, lessons: a?.lessons ?? 0, minutes: a?.minutes ?? 0 };
  });
  const en = { ...emptyEnglish(), ...d.english };
  const toplam = (f: (x: { lessons: number; minutes: number }) => number) => days.reduce((s, x) => s + f(x), 0);
  return {
    days,
    activeDays: days.filter((x) => x.active).length,
    lessons: toplam((x) => x.lessons),
    minutes: toplam((x) => x.minutes),
    drawings: keys.reduce((s, k) => s + (d.days?.[k]?.drawings ?? 0), 0),
    stars: keys.reduce((s, k) => s + (d.days?.[k]?.stars ?? 0), 0),
    englishDays: keys.filter((k) => en.sessions.includes(k)).length,
    words: ALL_WORDS.filter((w) => known(en, w.id)).length,
    stories: en.stories.filter((id: string) => STORIES.some((s) => s.id === id)).length,
    letters: Object.values(d.trace ?? {}).filter((v) => v > 0).length,
    range: `${gun(keys[0])} – ${gun(keys[6])}`,
  };
}

/** Karnede gösterilecek satırlar (sıfır olanlar atlanır). */
export function weekRows(r: WeekReport): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if (r.lessons) out.push({ label: 'Bitirilen çizim dersi', value: `${r.lessons}` });
  if (r.drawings) out.push({ label: 'Yapılan çizim', value: `${r.drawings}` });
  if (r.letters) out.push({ label: 'Yazılan harf ve rakam', value: `${r.letters}` });
  if (r.englishDays) out.push({ label: 'English Time yapılan gün', value: `${r.englishDays}` });
  if (r.words) out.push({ label: 'Bilinen İngilizce kelime', value: `${r.words}` });
  if (r.stories) out.push({ label: 'Okunan İngilizce hikâye', value: `${r.stories}` });
  if (r.minutes) out.push({ label: 'Uygulamada geçen süre', value: `${r.minutes} dakika` });
  if (r.stars) out.push({ label: 'Kazanılan yıldız', value: `${r.stars}` });
  return out;
}

/** Çocuğa söylenen kısa övgü (haftanın en güçlü yanına göre). */
export function weekPraise(r: WeekReport, name: string): string {
  if (r.activeDays >= 6) return `${name}, bu hafta neredeyse her gün çalıştın. Harikasın!`;
  if (r.lessons >= 5) return `${name}, bu hafta ${r.lessons} ders bitirdin. Kalemin çok iyi!`;
  if (r.letters >= 5) return `${name}, bu hafta ${r.letters} harf yazdın. Artık yazı yazıyorsun!`;
  if (r.englishDays >= 3) return `${name}, bu hafta ${r.englishDays} gün İngilizce çalıştın. Bravo!`;
  if (r.drawings >= 3) return `${name}, bu hafta ${r.drawings} resim çizdin. Çok üretkensin!`;
  return `${name}, bu hafta Çizio'yla vakit geçirdin. Haftaya devam!`;
}
