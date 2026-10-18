/**
 * Read With Me: ilk okuma ve cümle kurma.
 *
 * Çocuk resmi görür, Çizio cümleyi okur, sonra karışık duran kelime kartlarına sırayla dokunarak
 * cümleyi kurar. Kelimeler bilerek azdır ve çok tekrar eder (I, can, see, a, the, is, big, little…):
 * bunlar İngilizcede en sık geçen "görür görmez tanınan" kelimelerdir, okumanın ilk basamağıdır.
 *
 * React içermez; cümleleri `englishLines()` toplar ve `npm run voice` seslendirir.
 */
import type { Art } from './data';

const L = (id: string, parts?: string[]): Art => ({ k: 'lesson', id, parts });
const APPLE = ['elma', 'sap', 'yaprak', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız', 'sol yanak', 'sağ yanak', 'parıltı'];

/** Sık geçen, görünce tanınacak kelimeler. */
export const SIGHT_WORDS = [
  'I', 'you', 'a', 'the', 'is', 'it', 'can', 'see', 'my', 'and',
  'big', 'little', 'look', 'this', 'here', 'go', 'like', 'yes', 'no', 'come',
];

export interface Sentence {
  id: string;
  /** Cümlenin kelimeleri (sırayla). */
  words: string[];
  /** Ebeveyn ekranı için Türkçesi (çocuğa gösterilmez). */
  tr: string;
  art: Art;
  /** Hangi yaş grubundan itibaren (mini en kolay). */
  level: 1 | 2 | 3;
}

export const SENTENCES: Sentence[] = [
  // 1. basamak: üç kelime
  { id: 'cat', words: ['I', 'see', 'a', 'cat'], tr: 'Bir kedi görüyorum.', art: L('kedi'), level: 1 },
  { id: 'dog', words: ['I', 'see', 'a', 'dog'], tr: 'Bir köpek görüyorum.', art: L('kopek'), level: 1 },
  { id: 'sun', words: ['Look', 'at', 'the', 'sun'], tr: 'Güneşe bak.', art: L('gunes-bulut'), level: 1 },
  { id: 'star', words: ['This', 'is', 'a', 'star'], tr: 'Bu bir yıldız.', art: L('yildiz'), level: 1 },
  { id: 'apple', words: ['I', 'like', 'the', 'apple'], tr: 'Elmayı seviyorum.', art: L('ogretmen-elma', APPLE), level: 1 },
  { id: 'fish', words: ['Here', 'is', 'a', 'fish'], tr: 'İşte bir balık.', art: L('balik'), level: 1 },

  // 2. basamak: sıfat eklenir
  { id: 'bigbear', words: ['The', 'bear', 'is', 'big'], tr: 'Ayı büyük.', art: L('ayi'), level: 2 },
  { id: 'littlebee', words: ['The', 'bee', 'is', 'little'], tr: 'Arı küçük.', art: L('ari'), level: 2 },
  { id: 'redheart', words: ['I', 'see', 'a', 'red', 'heart'], tr: 'Kırmızı bir kalp görüyorum.', art: L('kalpler'), level: 2 },
  { id: 'myhouse', words: ['This', 'is', 'my', 'house'], tr: 'Bu benim evim.', art: L('ev'), level: 2 },
  { id: 'bluefish', words: ['Look', 'at', 'the', 'big', 'whale'], tr: 'Kocaman balinaya bak.', art: L('balina'), level: 2 },
  { id: 'rocket', words: ['The', 'rocket', 'can', 'go', 'up'], tr: 'Roket yukarı gidebilir.', art: L('roket'), level: 2 },

  // 3. basamak: eylem ve bağlaç
  { id: 'birdfly', words: ['The', 'butterfly', 'can', 'fly'], tr: 'Kelebek uçabilir.', art: L('kelebek'), level: 3 },
  { id: 'frogjump', words: ['The', 'frog', 'can', 'jump', 'and', 'swim'], tr: 'Kurbağa zıplayabilir ve yüzebilir.', art: L('kurbaga'), level: 3 },
  { id: 'catdog', words: ['I', 'see', 'a', 'cat', 'and', 'a', 'dog'], tr: 'Bir kedi ve bir köpek görüyorum.', art: L('kedi'), level: 3 },
  { id: 'lion', words: ['The', 'lion', 'is', 'big', 'and', 'brave'], tr: 'Aslan büyük ve cesur.', art: L('aslan'), level: 3 },
  { id: 'icecream', words: ['I', 'like', 'my', 'ice', 'cream'], tr: 'Dondurmamı seviyorum.', art: L('dondurma'), level: 3 },
  { id: 'come', words: ['Come', 'and', 'play', 'with', 'me'], tr: 'Gel ve benimle oyna.', art: L('mascot'), level: 3 },
];

export const sentenceText = (s: Sentence) => `${s.words.join(' ')}.`;

export const READ_UI = {
  title: 'Read With Me',
  intro: 'Listen, then build the sentence!',
  tap: 'Tap the words in order.',
  wrong: 'Not that one. Try again!',
  good: 'You did it! Read it with me.',
};

export const READ_LINES: string[] = [...new Set([
  ...SENTENCES.map(sentenceText),
  ...Object.values(READ_UI),
])];
