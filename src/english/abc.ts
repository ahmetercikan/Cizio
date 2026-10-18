/**
 * ABC ve harf sesleri (phonics).
 *
 * Her harf için üç şey var: harfin adı ("ay"), çıkardığı ses ("a") ve o sesle başlayan bir kelime.
 * Kelimelerin çoğu English Club'da zaten öğrenilen kelimeler, resimleri de oradan gelir; birkaçı için
 * (kite, rocket, whale...) ders çizimleri kullanılır.
 *
 * Bu dosya React içermez: cümleleri `englishLines()` toplar ve `npm run voice` seslendirir.
 */
import type { Art } from './data';

export interface AbcLetter {
  ch: string;
  /** Harfin adı, çocuğun duyacağı gibi yazılır: A → "ay". */
  name: string;
  /** Harfin çıkardığı ses: A → "a". */
  sound: string;
  /** O sesle başlayan örnek kelime. */
  word: string;
  wordTr: string;
  /** Resim: ders çiziminden ya da English Club kelimesinden. */
  art: Art;
}

const L = (id: string, parts?: string[]): Art => ({ k: 'lesson', id, parts });

/** Elma resmi (food:apple ile aynı parçalar). */
const ELMA = L('ogretmen-elma', ['elma', 'sap', 'yaprak', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız', 'sol yanak', 'sağ yanak', 'parıltı']);

export const ABC: AbcLetter[] = [
  { ch: 'A', name: 'ay', sound: 'a', word: 'apple', wordTr: 'elma', art: ELMA },
  { ch: 'B', name: 'bee', sound: 'b', word: 'bear', wordTr: 'ayı', art: L('ayi') },
  { ch: 'C', name: 'see', sound: 'k', word: 'cat', wordTr: 'kedi', art: L('kedi') },
  { ch: 'D', name: 'dee', sound: 'd', word: 'dog', wordTr: 'köpek', art: L('kopek') },
  { ch: 'E', name: 'ee', sound: 'e', word: 'elephant', wordTr: 'fil', art: L('fil') },
  { ch: 'F', name: 'eff', sound: 'f', word: 'fish', wordTr: 'balık', art: L('balik') },
  { ch: 'G', name: 'jee', sound: 'g', word: 'giraffe', wordTr: 'zürafa', art: L('zurafa') },
  { ch: 'H', name: 'aitch', sound: 'h', word: 'house', wordTr: 'ev', art: L('ev') },
  { ch: 'I', name: 'eye', sound: 'i', word: 'ice cream', wordTr: 'dondurma', art: L('dondurma') },
  { ch: 'J', name: 'jay', sound: 'j', word: 'jellyfish', wordTr: 'denizanası', art: L('denizanasi') },
  { ch: 'K', name: 'kay', sound: 'k', word: 'kite', wordTr: 'uçurtma', art: L('ucurtma') },
  { ch: 'L', name: 'ell', sound: 'l', word: 'lion', wordTr: 'aslan', art: L('aslan') },
  { ch: 'M', name: 'em', sound: 'm', word: 'monkey', wordTr: 'maymun', art: L('maymun') },
  { ch: 'N', name: 'en', sound: 'n', word: 'ninja', wordTr: 'ninja', art: L('ninja') },
  { ch: 'O', name: 'oh', sound: 'o', word: 'octopus', wordTr: 'ahtapot', art: L('ahtapot') },
  { ch: 'P', name: 'pee', sound: 'p', word: 'penguin', wordTr: 'penguen', art: L('penguen') },
  { ch: 'Q', name: 'cue', sound: 'kw', word: 'queen', wordTr: 'kraliçe', art: L('prenses') },
  { ch: 'R', name: 'ar', sound: 'r', word: 'rocket', wordTr: 'roket', art: L('roket') },
  { ch: 'S', name: 'ess', sound: 's', word: 'star', wordTr: 'yıldız', art: L('yildiz') },
  { ch: 'T', name: 'tee', sound: 't', word: 'turtle', wordTr: 'kaplumbağa', art: L('kaplumbaga') },
  { ch: 'U', name: 'you', sound: 'u', word: 'umbrella', wordTr: 'şemsiye', art: { k: 'abc', ch: 'U' } },
  { ch: 'V', name: 'vee', sound: 'v', word: 'volcano', wordTr: 'yanardağ', art: L('volkan') },
  { ch: 'W', name: 'double you', sound: 'w', word: 'whale', wordTr: 'balina', art: L('balina') },
  { ch: 'X', name: 'ex', sound: 'ks', word: 'xylophone', wordTr: 'ksilofon', art: { k: 'abc', ch: 'X' } },
  { ch: 'Y', name: 'why', sound: 'y', word: 'yacht', wordTr: 'yelkenli', art: L('yelkenli') },
  { ch: 'Z', name: 'zed', sound: 'z', word: 'zebra', wordTr: 'zebra', art: { k: 'abc', ch: 'Z' } },
];

export const abcLetter = (ch: string) => ABC.find((a) => a.ch === ch);

/** Harfi tanıtan cümle: adı, sesi ve örnek kelimesi. */
export const abcLine = (a: AbcLetter) => `The letter ${a.ch}. ${a.ch} says ${a.sound}. ${a.sound}, ${a.sound}, ${a.word}!`;
/** Yalnızca ses ve kelime (tekrar dinlerken). */
export const abcSoundLine = (a: AbcLetter) => `${a.sound}, ${a.sound}, ${a.word}.`;
/** Harf yazılınca. */
export const abcDoneLine = (a: AbcLetter) => `You wrote the letter ${a.ch}! ${a.word.charAt(0).toUpperCase()}${a.word.slice(1)} starts with ${a.ch}.`;

export const ABC_UI = {
  title: 'The Alphabet',
  pick: 'Pick a letter!',
  big: 'Now the big letter.',
  small: 'Now the small letter.',
  again: 'Listen again',
  allDone: 'You know the whole alphabet! Amazing!',
};

export const ABC_LINES: string[] = [
  ...ABC.map(abcLine),
  ...ABC.map(abcSoundLine),
  ...ABC.map(abcDoneLine),
  ...Object.values(ABC_UI),
];
