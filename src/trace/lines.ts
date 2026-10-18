/**
 * Harf ve rakam yazma ekranının söylediği cümleler.
 *
 * Buradaki her cümle `npm run voice` ile doğal sesli MP3'e çevrilir (src/voice/lines.ts üzerinden toplanır).
 * Ses dosyası hazır değilken tarayıcının konuşma sentezi okur, yani ekran her zaman çalışır.
 */

/** Harfin alfabedeki okunuşu (ekranda da yazar). */
export const HARF_SES: Record<string, string> = {
  A: 'a', B: 'be', C: 'ce', Ç: 'çe', D: 'de', E: 'e', F: 'fe', G: 'ge', Ğ: 'yumuşak ge', H: 'he',
  I: 'ı', İ: 'i', J: 'je', K: 'ke', L: 'le', M: 'me', N: 'ne', O: 'o', Ö: 'ö', P: 'pe',
  R: 're', S: 'se', Ş: 'şe', T: 'te', U: 'u', Ü: 'ü', V: 've', Y: 'ye', Z: 'ze',
  // Türkçede olmayan ama İngilizce ABC'de kullanılan harfler
  Q: 'kü', W: 'çift ve', X: 'iks',
};

/** Harfin örnek kelimesi (çocuğun tanıdığı, çoğu Çizio'da çizilen şeyler). */
export const HARF_KELIME: Record<string, string> = {
  A: 'armut', B: 'balık', C: 'ceylan', Ç: 'çiçek', D: 'deniz', E: 'elma', F: 'fil', G: 'gemi',
  Ğ: 'ağaç', H: 'horoz', I: 'ıspanak', İ: 'inek', J: 'jeton', K: 'kedi', L: 'limon', M: 'maymun',
  N: 'nar', O: 'orman', Ö: 'ördek', P: 'papatya', R: 'robot', S: 'süt', Ş: 'şapka', T: 'top',
  U: 'uçak', Ü: 'üzüm', V: 'vazo', Y: 'yıldız', Z: 'zebra', Q: 'kuyruk', W: 'vagon', X: 'ksilofon',
};

/** Harfi tanıtan cümle: sesi, örnek kelimesi ve yazma çağrısı. */
export function harfCumlesi(ch: string): string {
  const ses = HARF_SES[ch] ?? ch;
  const kelime = HARF_KELIME[ch] ?? '';
  const bas = ses.charAt(0).toLocaleUpperCase('tr') + ses.slice(1);
  if (ch === 'Ğ') return `${bas}. ${kelime.charAt(0).toLocaleUpperCase('tr')}${kelime.slice(1)} kelimesinin ortasındaki harf. Hadi ${ch} yazalım!`;
  return `${bas}. ${kelime.charAt(0).toLocaleUpperCase('tr')}${kelime.slice(1)} kelimesinin ilk harfi. Hadi ${ch} yazalım!`;
}

/** Rakamın okunuşu. */
export const SAYI_SES: Record<string, string> = {
  '0': 'sıfır', '1': 'bir', '2': 'iki', '3': 'üç', '4': 'dört',
  '5': 'beş', '6': 'altı', '7': 'yedi', '8': 'sekiz', '9': 'dokuz',
};

/** Rakamı tanıtan cümle: kaç tane olduğunu da söyler. */
export const SAYI_KELIME: Record<string, string> = {
  '0': 'hiçbir şey yok demek', '1': 'bir elma', '2': 'iki göz', '3': 'üç top', '4': 'dört tekerlek',
  '5': 'beş parmak', '6': 'altı çiçek', '7': 'yedi yıldız', '8': 'sekiz balık', '9': 'dokuz boncuk',
};

export function sayiCumlesi(n: string): string {
  const ses = SAYI_SES[n];
  const k = SAYI_KELIME[n];
  return `${ses.charAt(0).toLocaleUpperCase('tr')}${ses.slice(1)}. ${k.charAt(0).toLocaleUpperCase('tr')}${k.slice(1)}. Hadi ${n} yazalım!`;
}

const HARFLER = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'Q', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'W', 'X', 'Y', 'Z'];

/** Ses üretimi için toplanan cümleler (src/voice/lines.ts). */
export const TRACE_VOICE_LINES: string[] = [
  ...HARFLER.map(harfCumlesi),
  ...Object.keys(SAYI_SES).map(sayiCumlesi),
  'Harika! Harfi yazdın.',
  'Az kaldı! Turuncu yolun üstünden geç.',
  'Şimdi küçük harfi yazalım.',
  'Bütün alfabeyi yazdın! Sen artık bir yazarsın.',
];
