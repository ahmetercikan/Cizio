/**
 * Harf ve rakam şekilleri: her harf, sırayla çizilen kalem hareketlerinden (stroke) oluşur.
 *
 * Koordinatlar derslerle aynı 400x400 alanda. Yazı çizgileri: büyük harf tepesi y=80, taban y=320,
 * küçük harf gövde tepesi y=170, üst uzantı y=80, alt uzantı y=382. Harf ortası x=200.
 *
 * Şapkalı harfler (Ç, Ğ, İ, Ö, Ş, Ü, ı, i, ö, ü, ç, ş, ğ) temel harften türetilir: aynı gövde + işaret.
 * Böylece hem veri küçük kalır hem de çocuk aynı gövdeyi iki kez öğrenmiş olur.
 */

export type GlyphKind = 'buyuk' | 'kucuk' | 'sayi';

export interface Glyph {
  /** Benzersiz anahtar: 'A', 'a', 'cedil-C', '7'... */
  id: string;
  /** Ekranda görünen karakter. */
  ch: string;
  kind: GlyphKind;
  /** Sırayla çizilecek kalem hareketleri (SVG path). */
  strokes: string[];
}

// ------------------------------------------------------------------------------------------------
// İşaretler (şapka, nokta, kuyruk)
// ------------------------------------------------------------------------------------------------
/** Ç, Ş gibi harflerin altındaki kuyruk. */
const kuyruk = (x: number, y: number) => `M${x},${y} c0,26 -6,34 -24,33`;
/** İ, ö, ü gibi harflerin üstündeki nokta. */
const nokta = (x: number, y: number) => `M${x},${y} a9,9 0 1,0 0.1,0`;
/** Ğ, ğ'nin üstündeki yumuşatma işareti. */
const sapka = (x: number, y: number, w = 34) => `M${x - w},${y} a${w},${w * 0.62} 0 0,0 ${w * 2},0`;

// ------------------------------------------------------------------------------------------------
// Büyük harfler
// ------------------------------------------------------------------------------------------------
const BUYUK: Record<string, string[]> = {
  A: ['M200,82 L132,320', 'M200,82 L268,320', 'M158,240 L242,240'],
  B: ['M142,80 L142,320', 'M142,80 H208 A60,60 0 0,1 208,200 H142', 'M142,200 H218 A60,60 0 0,1 218,320 H142'],
  C: ['M256,126 A82,120 0 1,0 256,274'],
  D: ['M142,80 L142,320', 'M142,80 H196 A78,120 0 0,1 196,320 H142'],
  E: ['M150,80 L150,320', 'M150,80 H260', 'M150,200 H238', 'M150,320 H260'],
  F: ['M152,80 L152,320', 'M152,80 H258', 'M152,196 H234'],
  G: ['M256,126 A82,120 0 1,0 256,274', 'M256,274 V198 H206'],
  H: ['M146,80 L146,320', 'M254,80 L254,320', 'M146,200 H254'],
  I: ['M200,80 L200,320'],
  J: ['M244,80 V248 A56,56 0 1,1 132,248'],
  K: ['M150,80 L150,320', 'M254,80 L150,206', 'M152,206 L258,320'],
  L: ['M152,80 L152,320', 'M152,320 H258'],
  M: ['M138,80 L138,320', 'M138,80 L200,232 L262,80', 'M262,80 L262,320'],
  N: ['M146,80 L146,320', 'M146,80 L254,320', 'M254,80 L254,320'],
  O: ['M200,80 A78,120 0 1,0 200.1,80'],
  P: ['M146,80 L146,320', 'M146,80 H214 A62,62 0 0,1 214,204 H146'],
  Q: ['M200,80 A78,120 0 1,0 200.1,80', 'M232,262 L282,332'],
  R: ['M146,80 L146,320', 'M146,80 H214 A62,62 0 0,1 214,204 H146', 'M212,204 L260,320'],
  S: ['M254,122 A56,56 0 1,0 200,202 A58,58 0 1,1 144,282'],
  T: ['M200,80 L200,320', 'M132,80 H268'],
  U: ['M146,80 V228 A54,92 0 0,0 254,228 V80'],
  V: ['M140,80 L200,320', 'M200,320 L260,80'],
  W: ['M122,80 L156,320', 'M156,320 L200,156', 'M200,156 L244,320', 'M244,320 L278,80'],
  X: ['M146,80 L254,320', 'M254,80 L146,320'],
  Y: ['M146,80 L200,198', 'M254,80 L200,198', 'M200,198 V320'],
  Z: ['M140,80 H260', 'M260,80 L140,320', 'M140,320 H262'],
};

// ------------------------------------------------------------------------------------------------
// Küçük harfler
// ------------------------------------------------------------------------------------------------
const KUCUK: Record<string, string[]> = {
  a: ['M248,214 A52,52 0 1,0 248,288', 'M248,172 V320'],
  b: ['M150,80 V320', 'M150,246 a58,54 0 1,0 116,0 a58,54 0 1,0 -116,0'],
  c: ['M250,212 A54,54 0 1,0 250,288'],
  d: ['M250,246 a58,54 0 1,0 -116,0 a58,54 0 1,0 116,0', 'M250,80 V320'],
  e: ['M146,252 H252 A54,52 0 1,0 240,292'],
  f: ['M250,118 A42,42 0 0,0 186,150 V320', 'M142,188 H240'],
  g: ['M250,246 a58,54 0 1,0 -116,0 a58,54 0 1,0 116,0', 'M250,192 V340 A48,46 0 0,1 162,362'],
  h: ['M152,80 V320', 'M152,238 a54,52 0 0,1 108,0 V320'],
  i: ['M200,172 V320', nokta(200, 128)],
  j: ['M216,172 V334 A46,46 0 0,1 136,334', nokta(216, 128)],
  k: ['M152,80 V320', 'M252,172 L160,256', 'M190,230 L256,320'],
  l: ['M196,80 V294 A28,28 0 0,0 240,312'],
  m: ['M138,172 V320', 'M138,232 a44,44 0 0,1 88,0 V320', 'M226,232 a44,44 0 0,1 88,0 V320'],
  n: ['M154,172 V320', 'M154,236 a52,50 0 0,1 104,0 V320'],
  o: ['M200,172 a56,54 0 1,0 0.1,0'],
  p: ['M150,172 V382', 'M150,246 a58,54 0 1,0 116,0 a58,54 0 1,0 -116,0'],
  q: ['M250,246 a58,54 0 1,0 -116,0 a58,54 0 1,0 116,0', 'M250,172 V382'],
  r: ['M164,172 V320', 'M164,238 a56,54 0 0,1 90,-50'],
  s: ['M246,196 A42,38 0 1,0 200,248 A44,40 0 1,1 154,296'],
  t: ['M196,108 V276 A40,40 0 0,0 252,302', 'M150,180 H244'],
  u: ['M150,172 V262 a52,52 0 0,0 104,0 V172', 'M254,262 V320'],
  v: ['M150,172 L200,320', 'M200,320 L250,172'],
  w: ['M128,172 L160,320', 'M160,320 L200,218', 'M200,218 L240,320', 'M240,320 L272,172'],
  x: ['M150,172 L250,320', 'M250,172 L150,320'],
  y: ['M150,172 L206,308', 'M254,172 L172,382'],
  z: ['M152,180 H250', 'M250,180 L154,314', 'M154,314 H250'],
};

// ------------------------------------------------------------------------------------------------
// Rakamlar
// ------------------------------------------------------------------------------------------------
const SAYI: Record<string, string[]> = {
  '0': ['M200,80 A68,120 0 1,0 200.1,80'],
  '1': ['M156,128 L200,80', 'M200,80 V320', 'M152,320 H250'],
  '2': ['M146,138 A56,56 0 1,1 244,186 L146,320', 'M146,320 H258'],
  '3': ['M150,124 A54,50 0 1,1 202,198', 'M202,198 A60,60 0 1,1 148,282'],
  '4': ['M226,86 L128,246', 'M128,246 H272', 'M226,86 L226,320'],
  '5': ['M156,84 L148,186', 'M148,186 A70,70 0 1,1 150,290', 'M156,84 H252'],
  '6': ['M250,100 C182,112 142,172 142,252', 'M142,252 a58,58 0 1,0 116,0 a58,58 0 1,0 -116,0'],
  '7': ['M138,82 H262', 'M262,82 L178,320'],
  '8': ['M200,80 a54,56 0 1,0 0.1,0', 'M200,192 a62,64 0 1,0 0.1,0'],
  '9': ['M258,164 a58,58 0 1,0 -116,0 a58,58 0 1,0 116,0', 'M258,164 C258,262 220,302 158,318'],
};

// ------------------------------------------------------------------------------------------------
// Alfabeler
// ------------------------------------------------------------------------------------------------
const g = (id: string, ch: string, kind: GlyphKind, strokes: string[]): Glyph => ({ id, ch, kind, strokes });

/** Türk alfabesi sırası (29 harf). */
export const TR_HARFLER = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'] as const;
/** İngiliz alfabesi (26 harf). */
export const EN_HARFLER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] as const;

/** Büyük harfin kalem hareketleri (şapkalılar temel harften türer). */
function buyukStrokes(ch: string): string[] {
  switch (ch) {
    case 'Ç': return [...BUYUK.C, kuyruk(206, 318)];
    case 'Ğ': return [...BUYUK.G, sapka(198, 58)];
    case 'İ': return [...BUYUK.I, nokta(200, 46)];
    case 'Ö': return [...BUYUK.O, nokta(172, 44), nokta(228, 44)];
    case 'Ş': return [...BUYUK.S, kuyruk(200, 318)];
    case 'Ü': return [...BUYUK.U, nokta(172, 44), nokta(228, 44)];
    default: return BUYUK[ch];
  }
}

/** Küçük harfin kalem hareketleri. */
function kucukStrokes(ch: string): string[] {
  switch (ch) {
    case 'ç': return [...KUCUK.c, kuyruk(202, 318)];
    case 'ğ': return [...KUCUK.g, sapka(192, 146, 30)];
    case 'ı': return ['M200,172 V320'];
    case 'ö': return [...KUCUK.o, nokta(176, 130), nokta(224, 130)];
    case 'ş': return [...KUCUK.s, kuyruk(200, 316)];
    case 'ü': return [...KUCUK.u, nokta(176, 130), nokta(228, 130)];
    default: return KUCUK[ch];
  }
}

/** Türkçede küçük harf karşılığı (I→ı, İ→i). */
export const kucukHarf = (ch: string) => (ch === 'I' ? 'ı' : ch === 'İ' ? 'i' : ch.toLocaleLowerCase('tr'));

export function buyuk(ch: string): Glyph {
  return g(ch, ch, 'buyuk', buyukStrokes(ch));
}
export function kucuk(ch: string): Glyph {
  const k = kucukHarf(ch);
  return g(`k-${ch}`, k, 'kucuk', kucukStrokes(k));
}
export function sayi(n: string): Glyph {
  return g(`s-${n}`, n, 'sayi', SAYI[n]);
}

export const SAYILAR = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/** Bir harfin hem büyük hem küçük hâli (izleme ekranı ikisini arka arkaya gösterir). */
export function harfCifti(ch: string): Glyph[] {
  return [buyuk(ch), kucuk(ch)];
}
