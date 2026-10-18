/**
 * Matematik Parkı'nın soruları.
 *
 * Dört oyun var: say (resimleri say), topla (toplama), cikar (çıkarma) ve saat (saati oku).
 * Sorular her seferinde yeniden üretilir ama hep çocuğun yapabileceği aralıkta kalır; yanlış cevapta
 * ceza yok, doğru cevap gösterilip bir daha denenir.
 *
 * React içermez; cümleleri `src/voice/lines.ts` toplar ve `npm run voice` seslendirir.
 */

export type MathGame = 'say' | 'topla' | 'cikar' | 'saat';

export interface MathGameDef {
  id: MathGame;
  name: string;
  hint: string;
  color: string;
  icon: string;
}

export const MATH_GAMES: MathGameDef[] = [
  { id: 'say', name: 'Say Bakalım', hint: 'Kaç tane olduğunu bul', color: '#5b8def', icon: 'sayi' },
  { id: 'topla', name: 'Toplama', hint: 'İkisini topla', color: '#2bb673', icon: 'desen' },
  { id: 'cikar', name: 'Çıkarma', hint: 'Kaç tane kaldı?', color: '#ff8a2b', icon: 'kutu' },
  { id: 'saat', name: 'Saat Kaç?', hint: 'Saati oku', color: '#9b6bff', icon: 'saat' },
];

export const mathGame = (id: string) => MATH_GAMES.find((g) => g.id === id);

export interface MathQuestion {
  /** Ekranda yazan soru. */
  text: string;
  /** Sesli okunan hâli (ekranla aynı olabilir). */
  say: string;
  /** Doğru cevap. */
  answer: number;
  /** Seçenekler (doğru olan içinde). */
  options: number[];
  /** Say ve toplama oyunlarında gösterilecek resim sayıları. */
  counts?: number[];
  /** Saat oyununda saat ve dakika. */
  clock?: [number, number];
}

const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

/** Doğru cevabın etrafında, aynısı olmayan seçenekler. */
function options(answer: number, spread = 3, min = 0): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 3 && guard++ < 60) {
    const v = answer + rnd(spread * 2 + 1) - spread;
    if (v >= min) set.add(v);
  }
  let v = min;
  while (set.size < 3) set.add(v++);
  return shuffle([...set]);
}

/** Saati çocuğun söylediği gibi yaz: 3:00 → "üç", 3:30 → "üç buçuk". */
const SAAT_AD = ['on iki', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir'];
export const clockText = (h: number, m: number) => (m === 30 ? `${SAAT_AD[h % 12]} buçuk` : `saat ${SAAT_AD[h % 12]}`);

/** Zorluk: 1 kolay (5 yaş), 2 orta, 3 zor. */
export function question(game: MathGame, level: 1 | 2 | 3): MathQuestion {
  if (game === 'say') {
    const max = level === 1 ? 5 : level === 2 ? 9 : 14;
    const n = 1 + rnd(max);
    return {
      text: 'Kaç tane var?',
      say: 'Kaç tane var? Say bakalım!',
      answer: n,
      options: options(n, level === 1 ? 2 : 3, 1),
      counts: [n],
    };
  }
  if (game === 'topla') {
    const max = level === 1 ? 4 : level === 2 ? 6 : 9;
    const a = 1 + rnd(max), b = 1 + rnd(max);
    return {
      text: `${a} + ${b} = ?`,
      say: `${a} artı ${b} kaç eder?`,
      answer: a + b,
      options: options(a + b, 3, 0),
      counts: [a, b],
    };
  }
  if (game === 'cikar') {
    const max = level === 1 ? 5 : level === 2 ? 9 : 14;
    const a = 2 + rnd(max);
    const b = 1 + rnd(a - 1);
    return {
      text: `${a} - ${b} = ?`,
      say: `${a} eksi ${b} kaç eder?`,
      answer: a - b,
      options: options(a - b, 3, 0),
      counts: [a, b],
    };
  }
  // saat: tam ve buçuk
  const h = 1 + rnd(12);
  const m = level === 1 ? 0 : rnd(2) * 30;
  const yanlis = new Set<number>([h]);
  while (yanlis.size < 3) yanlis.add(1 + rnd(12));
  return {
    text: 'Saat kaç?',
    say: 'Saat kaç?',
    answer: h,
    options: shuffle([...yanlis]),
    clock: [h, m],
  };
}

export const MATH_UI = {
  welcome: 'Matematik Parkı’na hoş geldin! Hangi oyunu oynayalım?',
  right: 'Doğru! Aferin!',
  wrong: 'Olsun, bir daha bakalım.',
  done: 'Hepsini bildin! Matematikte çok iyisin!',
};

/** Soru metni değişmeyen oyunların sesli hâli (toplama/çıkarma sayılarla değiştiği için cihazın sesiyle okunur). */
const SABIT_SORULAR = ['Kaç tane var? Say bakalım!', 'Saat kaç?'];

/** Seslendirilecek cümleler: oyun adları, ipuçları, sabit cümleler, sabit sorular ve saat okunuşları. */
export const MATH_LINES: string[] = [...new Set([
  ...MATH_GAMES.flatMap((g) => [g.name, g.hint]),
  ...Object.values(MATH_UI),
  ...SABIT_SORULAR,
  ...Array.from({ length: 12 }, (_, i) => clockText(i + 1, 0)),
  ...Array.from({ length: 12 }, (_, i) => clockText(i + 1, 30)),
])];
