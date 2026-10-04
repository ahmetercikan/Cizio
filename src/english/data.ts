/**
 * English Club içeriği.
 *
 * Yaklaşım (ebeveynin paylaştığı iki çalışmadan): anlaşılır girdi (resim + ses, çeviri yok), düşük kaygı
 * (yanlış yok; çocuk bir şeye dokununca Çizio doğru biçimi tekrar eder — "recasting"), TPR (komutla hareket:
 * Çizio Says), görev temelli oyunlar (boyama, hazine avı), içerikle öğrenme (hayvanlar, dinozorlar, şekiller,
 * sanat), tekrarlı kalıplı hikâyeler ve soru sorarak okuma, her gün 15–20 dakikalık kısa bir rutin.
 *
 * Bu dosya React içermez: scripts/generate-voice.ts buradan İngilizce cümleleri toplar (EN_LINES).
 * Seslendirilen metinde maskotun adı "Chizio" yazılır (İngilizce ses "Ç"yi okuyamaz); ekranda show() ile
 * "Çizio"ya çevrilir.
 */
import type { DollState } from '../dressup/catalog';

// ------------------------------------------------------------------------------------------------
// Resimler
// ------------------------------------------------------------------------------------------------
export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'heart';
export type FeelId = 'happy' | 'sad' | 'angry' | 'surprised' | 'sleepy' | 'scared';
export type BodyId = 'head' | 'hair' | 'eyes' | 'ears' | 'nose' | 'mouth' | 'arms' | 'hands' | 'tummy' | 'legs' | 'feet';
export type ActId = 'jump' | 'run' | 'clap' | 'dance' | 'swim' | 'fly' | 'spin' | 'sit' | 'sleep' | 'wave' | 'stomp' | 'stand' | 'hop' | 'roar' | 'waddle';

export type Art =
  /** Bir dersin boyalı çizimi; `parts` verilirse yalnızca o parçalar (resim kendi sınırına kırpılır). */
  | { k: 'lesson'; id: string; parts?: string[]; anim?: ActId }
  | { k: 'color'; c: string }
  | { k: 'num'; n: number }
  | { k: 'shape'; s: ShapeId; c: string }
  | { k: 'feel'; f: FeelId }
  | { k: 'body'; p: BodyId }
  | { k: 'cloth'; patch: Partial<DollState>; region: string }
  | { k: 'act'; a: ActId };

// ------------------------------------------------------------------------------------------------
// Kelimeler
// ------------------------------------------------------------------------------------------------
export interface Word {
  id: string;
  en: string;
  /** Yalnızca ebeveyn ekranı için (çocuğa çeviri gösterilmez). */
  tr: string;
  art: Art;
  plural?: boolean;
  /** Eylemler: "jumping". */
  ing?: string;
  /** Özel cümleler (konu kalıbının yerine). */
  ask?: string;
  is?: string;
}

export interface Topic {
  id: string;
  en: string;
  tr: string;
  /** Kart rengi. */
  color: string;
  words: Word[];
  ask: (w: Word) => string;
  is: (w: Word) => string;
}

export const COLORS: Record<string, string> = {
  red: '#ef4b4b',
  blue: '#3f7fe0',
  yellow: '#ffc83d',
  green: '#2bb673',
  orange: '#ff8a2b',
  purple: '#9b6bff',
  pink: '#ff8fb1',
  brown: '#8c5a2b',
  black: '#2d2d2d',
  white: '#ffffff',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const article = (s: string) => (/^[aeiou]/i.test(s) ? 'an' : 'a');
const where = (w: Word) => (w.plural ? `Where are the ${w.en}?` : `Where is the ${w.en}?`);
const itIs = (w: Word) => (w.plural ? `They are ${w.en}!` : `It's ${article(w.en)} ${w.en}!`);

const L = (id: string, parts?: string[]): Art => ({ k: 'lesson', id, parts });
const w = (topic: string, en: string, tr: string, art: Art, extra: Partial<Word> = {}): Word => ({
  id: `${topic}.${en.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`,
  en,
  tr,
  art,
  ...extra,
});

const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const NUMBERS_TR = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];
const COLORS_TR: Record<string, string> = {
  red: 'kırmızı', blue: 'mavi', yellow: 'sarı', green: 'yeşil', orange: 'turuncu', purple: 'mor', pink: 'pembe', brown: 'kahverengi', black: 'siyah', white: 'beyaz',
};

/** Konular, English Time'daki öğrenme sırasıyla (bir adım ötesi: bilinenden yeniye). */
export const TOPICS: Topic[] = [
  {
    id: 'colors', en: 'Colors', tr: 'Renkler', color: '#ffc83d',
    words: Object.entries(COLORS).map(([en, c]) => w('colors', en, COLORS_TR[en], { k: 'color', c })),
    ask: (x) => `Which one is ${x.en}?`,
    is: (x) => `This is ${x.en}!`,
  },
  {
    id: 'animals', en: 'Animals', tr: 'Hayvanlar', color: '#ff8a2b',
    words: [
      w('animals', 'cat', 'kedi', L('kedi')),
      w('animals', 'dog', 'köpek', L('kopek')),
      w('animals', 'rabbit', 'tavşan', L('tavsan')),
      w('animals', 'bear', 'ayı', L('ayi')),
      w('animals', 'lion', 'aslan', L('aslan')),
      w('animals', 'elephant', 'fil', L('fil')),
      w('animals', 'giraffe', 'zürafa', L('zurafa')),
      w('animals', 'fox', 'tilki', L('tilki')),
      w('animals', 'frog', 'kurbağa', L('kurbaga')),
      w('animals', 'owl', 'baykuş', L('baykus')),
      w('animals', 'panda', 'panda', L('panda')),
      w('animals', 'turtle', 'kaplumbağa', L('kaplumbaga')),
      w('animals', 'penguin', 'penguen', L('penguen')),
      w('animals', 'bee', 'arı', L('ari')),
      w('animals', 'butterfly', 'kelebek', L('kelebek')),
      w('animals', 'snail', 'salyangoz', L('spiral', ['gövde', 'kabuk', 'spiral', 'sol anten', 'sağ anten', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız'])),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'numbers', en: 'Numbers', tr: 'Sayılar', color: '#5b8def',
    words: NUMBERS.map((en, i) => w('numbers', en, NUMBERS_TR[i], { k: 'num', n: i + 1 })),
    ask: (x) => `Which one is ${x.en}?`,
    is: (x) => `This is ${x.en}!`,
  },
  {
    id: 'feelings', en: 'Feelings', tr: 'Duygular', color: '#ff8fb1',
    words: (
      [['happy', 'mutlu'], ['sad', 'üzgün'], ['angry', 'kızgın'], ['surprised', 'şaşkın'], ['sleepy', 'uykulu'], ['scared', 'korkmuş']] as [FeelId, string][]
    ).map(([en, tr]) => w('feelings', en, tr, { k: 'feel', f: en })),
    ask: (x) => `Who is ${x.en}?`,
    is: (x) => `This face is ${x.en}!`,
  },
  {
    id: 'body', en: 'My Body', tr: 'Vücudum', color: '#14a89a',
    words: (
      [
        ['head', 'baş', false], ['hair', 'saç', false], ['eyes', 'gözler', true], ['ears', 'kulaklar', true], ['nose', 'burun', false],
        ['mouth', 'ağız', false], ['arms', 'kollar', true], ['hands', 'eller', true], ['tummy', 'karın', false], ['legs', 'bacaklar', true],
        ['feet', 'ayaklar', true],
      ] as [BodyId, string, boolean][]
    ).map(([en, tr, plural]) => w('body', en, tr, { k: 'body', p: en }, { plural })),
    ask: where,
    is: (x) => (x.plural ? `These are the ${x.en}!` : `This is the ${x.en}!`),
  },
  {
    id: 'actions', en: 'Actions', tr: 'Hareketler', color: '#2bb673',
    words: (
      [
        ['jump', 'zıpla', 'jumping'], ['run', 'koş', 'running'], ['clap', 'el çırp', 'clapping'], ['dance', 'dans et', 'dancing'],
        ['swim', 'yüz', 'swimming'], ['fly', 'uç', 'flying'], ['spin', 'dön', 'spinning'], ['sit', 'otur', 'sitting'],
        ['sleep', 'uyu', 'sleeping'], ['wave', 'el salla', 'waving'],
      ] as [ActId, string, string][]
    ).map(([en, tr, ing]) => w('actions', en, tr, { k: 'act', a: en }, { ing })),
    ask: (x) => `Who is ${x.ing}?`,
    is: (x) => `Chizio is ${x.ing}!`,
  },
  {
    id: 'food', en: 'Food', tr: 'Yiyecekler', color: '#ef4b4b',
    words: [
      w('food', 'apple', 'elma', L('ogretmen-elma', ['elma', 'sap', 'yaprak', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız', 'sol yanak', 'sağ yanak', 'parıltı'])),
      w('food', 'cake', 'pasta', L('dogum-gunu')),
      w('food', 'cupcake', 'kek', L('cupcake')),
      w('food', 'ice cream', 'dondurma', L('dondurma'), { is: "It's an ice cream!" }),
      w('food', 'pumpkin', 'balkabağı', L('balkabagi')),
      w('food', 'mushroom', 'mantar', L('mantar')),
      w('food', 'hot chocolate', 'sıcak çikolata', L('kupa'), { is: "It's hot chocolate!" }),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'clothes', en: 'Clothes', tr: 'Kıyafetler', color: '#9b6bff',
    words: [
      w('clothes', 'hat', 'şapka', { k: 'cloth', patch: { hat: 'hasir', hatColor: '#ffc83d' }, region: 'hat' }),
      w('clothes', 'cap', 'kep', { k: 'cloth', patch: { hat: 'kep', hatColor: '#ef4b4b' }, region: 'hat' }),
      w('clothes', 'glasses', 'gözlük', { k: 'cloth', patch: { glasses: 'yuvarlak' }, region: 'face' }, { plural: true }),
      w('clothes', 'T-shirt', 'tişört', { k: 'cloth', patch: { top: 'tisort', topColor: '#ffc83d' }, region: 'top' }),
      w('clothes', 'sweater', 'kazak', { k: 'cloth', patch: { top: 'kazak', topColor: '#14a89a' }, region: 'top' }),
      w('clothes', 'pants', 'pantolon', { k: 'cloth', patch: { bottom: 'pantolon', bottomColor: '#5b8def' }, region: 'bottom' }, { plural: true }),
      w('clothes', 'skirt', 'etek', { k: 'cloth', patch: { bottom: 'etek', bottomColor: '#ff8fb1' }, region: 'bottom' }),
      w('clothes', 'dress', 'elbise', { k: 'cloth', patch: { dress: 'yazlik', dressColor: '#ff8fb1' }, region: 'dress' }),
      w('clothes', 'shoes', 'ayakkabılar', { k: 'cloth', patch: { shoes: 'spor', shoesColor: '#ef4b4b' }, region: 'shoes' }, { plural: true }),
      w('clothes', 'boots', 'botlar', { k: 'cloth', patch: { shoes: 'cizme', shoesColor: '#ffc83d' }, region: 'shoes' }, { plural: true }),
    ],
    ask: where,
    is: (x) => (x.plural ? `These are ${x.en}!` : `It's ${article(x.en)} ${x.en}!`),
  },
  {
    id: 'shapes', en: 'Shapes', tr: 'Şekiller', color: '#ff6b4a',
    words: (
      [['circle', 'daire', '#3f7fe0'], ['square', 'kare', '#ef4b4b'], ['triangle', 'üçgen', '#2bb673'], ['rectangle', 'dikdörtgen', '#9b6bff'], ['star', 'yıldız', '#ffc83d'], ['heart', 'kalp', '#ff8fb1']] as [ShapeId, string, string][]
    ).map(([en, tr, c]) => w('shapes', en, tr, { k: 'shape', s: en, c })),
    ask: where,
    is: itIs,
  },
  {
    id: 'nature', en: 'Nature', tr: 'Doğa', color: '#5cc56a',
    words: [
      w('nature', 'sun', 'güneş', L('gunes-bulut', ['güneş', 'üst ışın', 'sağ ışın', 'alt ışın', 'sol ışın', 'çapraz ışın', 'sol göz', 'sağ göz', 'sol parıltı', 'sağ parıltı', 'güneşin ağzı', 'güneşin yanağı'])),
      w('nature', 'cloud', 'bulut', L('gunes-bulut', ['bulut', 'bulutun gözü', 'bulutun ağzı'])),
      w('nature', 'rainbow', 'gökkuşağı', L('gokkusagi')),
      w('nature', 'flower', 'çiçek', L('cicek')),
      w('nature', 'tree', 'ağaç', L('agac')),
      w('nature', 'leaf', 'yaprak', L('yaprak')),
      w('nature', 'cactus', 'kaktüs', L('kaktus')),
      w('nature', 'sunflower', 'ayçiçeği', L('aycicegi')),
      w('nature', 'snowman', 'kardan adam', L('kardan-adam')),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'sea', en: 'Under the Sea', tr: 'Deniz', color: '#3f7fe0',
    words: [
      w('sea', 'fish', 'balık', L('balik')),
      w('sea', 'whale', 'balina', L('balina')),
      w('sea', 'shark', 'köpekbalığı', L('kopekbaligi')),
      w('sea', 'dolphin', 'yunus', L('yunus')),
      w('sea', 'octopus', 'ahtapot', L('ahtapot')),
      w('sea', 'crab', 'yengeç', L('yengec')),
      w('sea', 'jellyfish', 'denizanası', L('denizanasi')),
      w('sea', 'seahorse', 'denizatı', L('denizati')),
      w('sea', 'starfish', 'deniz yıldızı', L('denizyildizi')),
      w('sea', 'shell', 'deniz kabuğu', L('deniz-kabugu')),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'transport', en: 'On the Move', tr: 'Taşıtlar', color: '#ff8a2b',
    words: [
      w('transport', 'car', 'araba', L('araba')),
      w('transport', 'bus', 'otobüs', L('otobus')),
      w('transport', 'train', 'tren', L('tren')),
      w('transport', 'bike', 'bisiklet', L('bisiklet')),
      w('transport', 'plane', 'uçak', L('ucak')),
      w('transport', 'helicopter', 'helikopter', L('helikopter')),
      w('transport', 'boat', 'tekne', L('yelkenli')),
      w('transport', 'rocket', 'roket', L('roket')),
      w('transport', 'submarine', 'denizaltı', L('denizalti')),
      w('transport', 'hot air balloon', 'sıcak hava balonu', L('hava-balonu')),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'things', en: 'My Things', tr: 'Eşyalarım', color: '#e9487d',
    words: [
      w('things', 'balloon', 'balon', L('balon')),
      w('things', 'kite', 'uçurtma', L('ucurtma')),
      w('things', 'gift', 'hediye', L('hediye')),
      w('things', 'crayons', 'boya kalemleri', L('boya-kalemleri'), { plural: true }),
      w('things', 'school bag', 'okul çantası', L('canta')),
      w('things', 'house', 'ev', L('ev')),
      w('things', 'card', 'kart', L('anneler-gunu')),
      w('things', 'robot', 'robot', L('robot')),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'characters', en: 'Story Friends', tr: 'Masal Kahramanları', color: '#9b6bff',
    words: [
      w('characters', 'princess', 'prenses', L('prenses')),
      w('characters', 'knight', 'şövalye', L('sovalye')),
      w('characters', 'pirate', 'korsan', L('korsan')),
      w('characters', 'superhero', 'süper kahraman', L('kahraman')),
      w('characters', 'fairy', 'peri', L('peri')),
      w('characters', 'ghost', 'hayalet', L('hayalet')),
      w('characters', 'alien', 'uzaylı', L('uzayli', ['kafa', 'sol anten', 'sol anten topu', 'sağ anten', 'sağ anten topu', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız', 'sol yanak', 'sağ yanak'])),
      w('characters', 'monster', 'canavar', L('canavar')),
      w('characters', 'dragon', 'ejderha', L('ejderha')),
    ],
    ask: where,
    is: itIs,
  },
  {
    id: 'dinosaurs', en: 'Dinosaurs', tr: 'Dinozorlar', color: '#5cc56a',
    words: [
      w('dinosaurs', 'T. rex', 'T-Rex', L('trex'), { ask: 'Where is the T. rex?', is: "It's a T. rex! It has big teeth." }),
      w('dinosaurs', 'triceratops', 'triceratops', L('triceratops'), { is: "It's a triceratops! It has three horns." }),
      w('dinosaurs', 'stegosaurus', 'stegozor', L('stegozor'), { is: "It's a stegosaurus! It has plates on its back." }),
      w('dinosaurs', 'long neck', 'uzun boyunlu dinozor', L('uzun-boyun'), { ask: 'Where is the long neck dinosaur?', is: 'It has a very long neck!' }),
      w('dinosaurs', 'pterosaur', 'uçan dinozor', L('ucan-dinozor'), { is: "It's a pterosaur! It can fly." }),
      w('dinosaurs', 'egg', 'yumurta', L('dino-yumurta'), { is: "It's an egg! A baby dinosaur is inside." }),
      w('dinosaurs', 'volcano', 'yanardağ', L('volkan')),
    ],
    ask: where,
    is: itIs,
  },
];

export const ALL_WORDS: Word[] = TOPICS.flatMap((t) => t.words);
const BY_ID = new Map(ALL_WORDS.map((x) => [x.id, x]));
const TOPIC_OF = new Map(TOPICS.flatMap((t) => t.words.map((x) => [x.id, t] as const)));
export const getWord = (id: string) => BY_ID.get(id);
export const getTopic = (id: string) => TOPICS.find((t) => t.id === id);
export const topicOf = (wordId: string) => TOPIC_OF.get(wordId)!;

/** Kelimenin tek başına okunuşu ("Cat."). */
export const wordLine = (x: Word) => `${cap(x.en)}.`;
export const askLine = (x: Word) => x.ask ?? topicOf(x.id).ask(x);
export const isLine = (x: Word) => x.is ?? topicOf(x.id).is(x);

/** Ekranda gösterim: seslendirme için yazılan "Chizio" → "Çizio". */
export const show = (t: string) => t.replace(/Chizio/g, 'Çizio');

// ------------------------------------------------------------------------------------------------
// Yaş grupları (çalışmalardaki tablo: 5–6 hareket ve ses, yazı yok; 7–8 resimli kitap ve kısa görev;
// 8–9 içerikle öğrenme, daha uzun cümleler ve kurallı oyunlar)
// ------------------------------------------------------------------------------------------------
export type Age = 'mini' | 'junior' | 'star';
export const AGES: { id: Age; label: string; years: string; note: string }[] = [
  { id: 'mini', label: 'Minik', years: '5–6 yaş', note: 'Dinle, hareket et, dokun. Yazı yok.' },
  { id: 'junior', label: 'Kâşif', years: '7–8 yaş', note: 'Resimli hikâyeler, kelimeler yazıyla.' },
  { id: 'star', label: 'Yıldız', years: '8–9 yaş', note: 'Daha uzun cümleler, kurallı oyunlar.' },
];
export const optionCount = (age: Age) => (age === 'mini' ? 3 : age === 'junior' ? 4 : 6);
export const showText = (age: Age) => age !== 'mini';

// ------------------------------------------------------------------------------------------------
// Sık kullanılan cümleler
// ------------------------------------------------------------------------------------------------
export const PRAISE = ['Great job!', 'Well done!', 'Yes! You got it!', 'Super!', 'Awesome!', 'Fantastic!'];
export const TRY_AGAIN = "Let's try again!";
export const UI = {
  hello: "Hello, friend! It's English time!",
  howAreYou: 'How are you today?',
  newWords: "New words! Listen and look.",
  sayWithMe: 'Say it with me!',
  letsMove: "Let's move! Listen to Chizio.",
  letsPlay: "Let's play! Listen and find.",
  storyTime: 'Story time!',
  letsColor: "Let's color! Listen to Chizio.",
  mission: 'Home mission!',
  bye: 'Great job today! See you tomorrow. Bye-bye!',
  pickColor: 'Pick a color!',
  timesUp: "Time's up! Great hunting!",
  foundAll: 'You found them all!',
  beautiful: 'Beautiful! What a colorful picture!',
  didYouMove: "Oops! I didn't say Chizio says! Did you move?",
  movedOk: "That's okay! It's a tricky game!",
  stillGreat: 'Wow! Great listening!',
  didYouFind: 'Did you find it? Show it to Chizio!',
  foundIt: 'Great finding! Thank you!',
  tapIt: 'Tap it!',
};

/** "Nasılsın?" cevapları (English Time açılışı): duyguyu söyler, Çizio onu yansıtır. */
export const HELLO_FEELINGS: { f: FeelId; reply: string }[] = [
  { f: 'happy', reply: 'You are happy! I am happy too!' },
  { f: 'sleepy', reply: "You are sleepy. Yawn! Let's wake up together!" },
  { f: 'sad', reply: 'Oh, you are sad. Here is a big hug!' },
  { f: 'angry', reply: "You are angry. Let's take a big breath. In... and out." },
  { f: 'surprised', reply: 'Wow! You are surprised!' },
];

// ------------------------------------------------------------------------------------------------
// Çizio Says (TPR: komutu duy, bedeninle yap)
// ------------------------------------------------------------------------------------------------
export interface Command {
  id: string;
  /** Seslendirilen ve ekranda gösterilen komut. */
  en: string;
  art: Art;
  /** Komut gerçek dünyaya mı dönük (ör. "Touch something blue!"). */
  real?: boolean;
}
const act = (a: ActId): Art => ({ k: 'act', a });
const animal = (id: string, a: ActId): Art => ({ k: 'lesson', id, anim: a });
export const COMMANDS: Command[] = [
  { id: 'jump', en: 'Jump!', art: act('jump') },
  { id: 'clap', en: 'Clap your hands!', art: act('clap') },
  { id: 'spin', en: 'Spin around!', art: act('spin') },
  { id: 'wave', en: 'Wave hello!', art: act('wave') },
  { id: 'stomp', en: 'Stomp your feet!', art: act('stomp') },
  { id: 'sit', en: 'Sit down!', art: act('sit') },
  { id: 'stand', en: 'Stand up!', art: act('stand') },
  { id: 'dance', en: 'Dance!', art: act('dance') },
  { id: 'run', en: 'Run in place!', art: act('run') },
  { id: 'sleep', en: 'Go to sleep! Shhh!', art: act('sleep') },
  { id: 'nose', en: 'Touch your nose!', art: { k: 'body', p: 'nose' } },
  { id: 'head', en: 'Touch your head!', art: { k: 'body', p: 'head' } },
  { id: 'ears', en: 'Touch your ears!', art: { k: 'body', p: 'ears' } },
  { id: 'tummy', en: 'Touch your tummy!', art: { k: 'body', p: 'tummy' } },
  { id: 'feet', en: 'Touch your feet!', art: { k: 'body', p: 'feet' } },
  { id: 'frog', en: 'Hop like a frog!', art: animal('kurbaga', 'hop') },
  { id: 'bunny', en: 'Hop like a bunny!', art: animal('tavsan', 'hop') },
  { id: 'butterfly', en: 'Fly like a butterfly!', art: animal('kelebek', 'fly') },
  { id: 'fish', en: 'Swim like a fish!', art: animal('balik', 'swim') },
  { id: 'lion', en: 'Roar like a lion!', art: animal('aslan', 'roar') },
  { id: 'dino', en: 'Stomp like a dinosaur!', art: animal('trex', 'stomp') },
  { id: 'penguin', en: 'Walk like a penguin!', art: animal('penguen', 'waddle') },
  { id: 'happy', en: 'Show me a happy face!', art: { k: 'feel', f: 'happy' } },
  { id: 'sad', en: 'Show me a sad face!', art: { k: 'feel', f: 'sad' } },
  { id: 'surprised', en: 'Show me a surprised face!', art: { k: 'feel', f: 'surprised' } },
  { id: 'angry', en: 'Show me an angry face!', art: { k: 'feel', f: 'angry' } },
  { id: 'sleepy', en: 'Show me a sleepy face!', art: { k: 'feel', f: 'sleepy' } },
  { id: 'blue', en: 'Touch something blue!', art: { k: 'color', c: COLORS.blue }, real: true },
  { id: 'red', en: 'Touch something red!', art: { k: 'color', c: COLORS.red }, real: true },
  { id: 'yellow', en: 'Touch something yellow!', art: { k: 'color', c: COLORS.yellow }, real: true },
  { id: 'green', en: 'Touch something green!', art: { k: 'color', c: COLORS.green }, real: true },
];
/** Seslendirilen komut: "Chizio says: jump!" ya da hileli turda yalnızca "Jump!". */
export const saysLine = (c: Command) => `Chizio says: ${c.en.charAt(0).toLowerCase()}${c.en.slice(1)}`;

// ------------------------------------------------------------------------------------------------
// Color Me (görev: söylenen parçayı söylenen renge boya)
// ------------------------------------------------------------------------------------------------
export interface PaintTarget {
  en: string;
  parts: string[];
  plural?: boolean;
}
export interface PaintPage {
  lesson: string;
  /** "What a beautiful house!" */
  name: string;
  targets: PaintTarget[];
}
export const PAINT_COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'];
export const PAINT_PAGES: PaintPage[] = [
  { lesson: 'ev', name: 'house', targets: [
    { en: 'roof', parts: ['çatı'] }, { en: 'door', parts: ['kapı'] }, { en: 'wall', parts: ['duvar'] },
    { en: 'windows', parts: ['sol pencere', 'sağ pencere', 'yuvarlak pencere'], plural: true }, { en: 'bushes', parts: ['sol çalı', 'sağ çalı'], plural: true },
  ] },
  { lesson: 'gunes-bulut', name: 'sky', targets: [{ en: 'sun', parts: ['güneş'] }, { en: 'cloud', parts: ['bulut'] }] },
  { lesson: 'balik', name: 'fish', targets: [
    { en: 'body', parts: ['gövde'] }, { en: 'tail', parts: ['kuyruk'] }, { en: 'fins', parts: ['sırt yüzgeci', 'yan yüzgeç'], plural: true },
    { en: 'bubbles', parts: ['büyük baloncuk', 'orta baloncuk', 'minik baloncuk'], plural: true },
  ] },
  { lesson: 'araba', name: 'car', targets: [
    { en: 'car', parts: ['gövde'] }, { en: 'top', parts: ['kabin'] }, { en: 'wheels', parts: ['arka tekerlek', 'ön tekerlek'], plural: true },
    { en: 'windows', parts: ['arka cam', 'ön cam'], plural: true },
  ] },
  { lesson: 'roket', name: 'rocket', targets: [
    { en: 'rocket', parts: ['gövde'] }, { en: 'top', parts: ['burun'] }, { en: 'fins', parts: ['sol kanatçık', 'sağ kanatçık'], plural: true },
    { en: 'fire', parts: ['alev'] }, { en: 'stars', parts: ['sol yıldız', 'sağ yıldız'], plural: true },
  ] },
  { lesson: 'kardan-adam', name: 'snowman', targets: [
    { en: 'hat', parts: ['şapka', 'şapka kenarı'] }, { en: 'scarf', parts: ['atkı', 'atkının ucu'] }, { en: 'nose', parts: ['havuç burun'] },
    { en: 'buttons', parts: ['üst düğme', 'orta düğme', 'alt düğme'], plural: true },
  ] },
  { lesson: 'agac', name: 'tree', targets: [
    { en: 'leaves', parts: ['yapraklar'], plural: true }, { en: 'trunk', parts: ['gövde'] }, { en: 'apples', parts: ['elma'], plural: true },
    { en: 'grass', parts: ['sol çimen', 'sağ çimen'] },
  ] },
  { lesson: 'mantar', name: 'mushroom', targets: [
    { en: 'cap', parts: ['şapka'] }, { en: 'stem', parts: ['sap'] }, { en: 'spots', parts: ['büyük benek', 'küçük benek', 'orta benek'], plural: true },
    { en: 'grass', parts: ['sol çimen', 'sağ çimen'] },
  ] },
  { lesson: 'dondurma', name: 'ice cream', targets: [
    { en: 'cone', parts: ['külah'] }, { en: 'ice cream', parts: ['dondurma topu', 'eriyen kenar'] }, { en: 'cherry', parts: ['kiraz'] },
  ] },
  { lesson: 'ucak', name: 'plane', targets: [
    { en: 'plane', parts: ['gövde'] }, { en: 'wings', parts: ['ön kanat', 'arka kanat'], plural: true }, { en: 'tail', parts: ['kuyruk'] },
    { en: 'clouds', parts: ['üst bulut', 'alt bulut'], plural: true },
  ] },
  { lesson: 'baykus', name: 'owl', targets: [
    { en: 'body', parts: ['gövde'] }, { en: 'wings', parts: ['sol kanat', 'sağ kanat'], plural: true }, { en: 'tummy', parts: ['karın'] },
    { en: 'beak', parts: ['gaga'] }, { en: 'branch', parts: ['dal'] },
  ] },
  { lesson: 'yelkenli', name: 'boat', targets: [
    { en: 'boat', parts: ['gövde'] }, { en: 'big sail', parts: ['büyük yelken'] }, { en: 'small sail', parts: ['küçük yelken'] }, { en: 'flag', parts: ['bayrak'] },
  ] },
];
export const paintAsk = (t: PaintTarget) => `Color the ${t.en}.`;
export const paintIs = (t: PaintTarget) => (t.plural ? `Those are the ${t.en}.` : `That's the ${t.en}.`);
export const paintDone = (p: PaintPage) => `Beautiful! What a colorful ${p.name}!`;

// ------------------------------------------------------------------------------------------------
// Treasure Hunt (ekranda renk + şekil avı) ve Home Hunt (evde gerçek nesne avı)
// ------------------------------------------------------------------------------------------------
export const HUNT_SHAPES: ShapeId[] = ['star', 'heart', 'circle', 'square', 'triangle'];
export const HUNT_COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'];
export const plural = (s: ShapeId) => `${s}s`;
export const huntLine = (age: Age, color: string, shape: ShapeId) =>
  age === 'mini' ? `Find a ${shape}!` : age === 'junior' ? `Find the ${color} ${shape}!` : `Find all the ${color} ${plural(shape)}!`;

export const HOME_HUNTS: { en: string; art: Art }[] = [
  ...['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'white'].map((c) => ({ en: `Find something ${c} in your room!`, art: { k: 'color', c: COLORS[c] } as Art })),
  { en: 'Find something round!', art: { k: 'shape', s: 'circle', c: '#3f7fe0' } },
  { en: 'Find something square!', art: { k: 'shape', s: 'square', c: '#ef4b4b' } },
  { en: 'Find something soft!', art: L('ayi') },
  { en: 'Find a book!', art: L('ogretmen-elma', ['alttaki kitap', 'üstteki kitap', 'üst kitap etiketi', 'alt kitap etiketi']) },
  { en: 'Find a spoon!', art: L('kupa') },
];

// ------------------------------------------------------------------------------------------------
// Evdeki mini rutinler (ebeveyn ekranı ve English Time'daki "home mission" kartı)
// ------------------------------------------------------------------------------------------------
export const HOME_PHRASES: { en: string; tr: string; when: string }[] = [
  { en: 'Good morning!', tr: 'Günaydın!', when: 'Sabah uyanınca' },
  { en: 'Wash your hands, please.', tr: 'Ellerini yıka, lütfen.', when: 'Yemekten önce' },
  { en: 'Pass the milk, please.', tr: 'Sütü uzatır mısın?', when: 'Kahvaltıda' },
  { en: 'Put on your shoes.', tr: 'Ayakkabılarını giy.', when: 'Dışarı çıkarken' },
  { en: "Let's go!", tr: 'Hadi gidelim!', when: 'Kapıdan çıkarken' },
  { en: 'Thank you!', tr: 'Teşekkürler!', when: 'Bir şey alınca' },
  { en: 'Time to eat!', tr: 'Yemek zamanı!', when: 'Sofrada' },
  { en: "Let's clean up!", tr: 'Hadi toplayalım!', when: 'Oyundan sonra' },
  { en: 'Brush your teeth.', tr: 'Dişlerini fırçala.', when: 'Yatmadan önce' },
  { en: 'Good night! I love you.', tr: 'İyi geceler! Seni seviyorum.', when: 'Uyurken' },
];

// ------------------------------------------------------------------------------------------------
// Hikâyeler (tekrarlı kalıplar + soru sorarak okuma)
// ------------------------------------------------------------------------------------------------
export interface SceneItem {
  /** Ders kimliği ya da 'mascot'. */
  lesson: string;
  id?: string;
  /** 1000×600 sahnede merkez ve genişlik. */
  x: number;
  y: number;
  s: number;
  parts?: string[];
  /** Bir şeyin arkasında saklanıyor (reveal ile çıkar). */
  hidden?: boolean;
  /** Uyuyor (soluk ve "z z"). */
  asleep?: boolean;
  /** Boyanmamış (paint etkileşimi ile renklenir). */
  bare?: boolean;
}
export type Interaction =
  | { kind: 'tap'; target: string; ask: string; yes: string }
  | { kind: 'reveal'; cover: string; hidden: string; ask: string; yes: string }
  | { kind: 'choose'; ask: string; options: number[]; answer: number; yes: string }
  | { kind: 'paint'; target: string; ask: string; options: string[]; answer: string; yes: string };
export interface StoryPage {
  say: string[];
  bg: 'day' | 'night' | 'sea' | 'sky';
  items: SceneItem[];
  act?: Interaction;
}
export interface Story {
  id: string;
  title: string;
  tr: string;
  cover: SceneItem[];
  bg: StoryPage['bg'];
  pages: StoryPage[];
}

const SUN = ['güneş', 'üst ışın', 'sağ ışın', 'alt ışın', 'sol ışın', 'çapraz ışın', 'sol göz', 'sağ göz', 'sol parıltı', 'sağ parıltı', 'güneşin ağzı', 'güneşin yanağı'];
const CLOUD = ['bulut', 'bulutun gözü', 'bulutun ağzı'];
const APPLE = ['elma', 'sap', 'yaprak', 'sol göz', 'sol göz parıltısı', 'sağ göz', 'sağ göz parıltısı', 'ağız', 'sol yanak', 'sağ yanak', 'parıltı'];
const row = (lesson: string, n: number, y: number, s: number, parts?: string[]): SceneItem[] =>
  Array.from({ length: n }, (_, i) => ({ lesson, parts, x: 640 + (i - (n - 1) / 2) * (s * 0.95), y, s }));

export const STORIES: Story[] = [
  {
    id: 'hide', title: 'Who Is Hiding?', tr: 'Kim saklanıyor?', bg: 'day',
    cover: [{ lesson: 'agac', x: 420, y: 300, s: 420 }, { lesson: 'kedi', x: 640, y: 400, s: 220 }],
    pages: [
      { bg: 'day', say: ['This is a big tree.', 'This is a little house.'], items: [{ lesson: 'agac', x: 320, y: 300, s: 440 }, { lesson: 'ev', x: 720, y: 330, s: 360 }] },
      {
        bg: 'day', say: ['Who is hiding behind the tree?'],
        items: [{ lesson: 'kedi', id: 'cat', x: 470, y: 420, s: 200, hidden: true }, { lesson: 'agac', id: 'tree', x: 420, y: 300, s: 440 }],
        act: { kind: 'reveal', cover: 'tree', hidden: 'cat', ask: 'Tap the tree!', yes: "It's a cat! Hello, cat!" },
      },
      {
        bg: 'day', say: ['Who is hiding behind the house?'],
        items: [{ lesson: 'kopek', id: 'dog', x: 640, y: 400, s: 220, hidden: true }, { lesson: 'ev', id: 'house', x: 560, y: 320, s: 400 }],
        act: { kind: 'reveal', cover: 'house', hidden: 'dog', ask: 'Tap the house!', yes: "It's a dog! Hello, dog!" },
      },
      {
        bg: 'sea', say: ['Who is hiding behind the sand castle?'],
        items: [{ lesson: 'yengec', id: 'crab', x: 600, y: 440, s: 200, hidden: true }, { lesson: 'kumdan-kale', id: 'castle', x: 520, y: 330, s: 400 }],
        act: { kind: 'reveal', cover: 'castle', hidden: 'crab', ask: 'Tap the sand castle!', yes: "It's a crab! Hello, crab!" },
      },
      {
        bg: 'sky', say: ['Who is hiding behind the cloud?'],
        items: [{ lesson: 'uzayli', id: 'alien', x: 560, y: 300, s: 260, hidden: true }, { lesson: 'gunes-bulut', parts: CLOUD, id: 'cloud', x: 500, y: 300, s: 520 }],
        act: { kind: 'reveal', cover: 'cloud', hidden: 'alien', ask: 'Tap the cloud!', yes: "It's an alien! Hello, alien!" },
      },
      {
        bg: 'day', say: ['Everybody is here!'],
        items: [
          { lesson: 'kedi', id: 'cat', x: 170, y: 380, s: 220 }, { lesson: 'kopek', id: 'dog', x: 400, y: 380, s: 230 },
          { lesson: 'yengec', id: 'crab', x: 620, y: 420, s: 200 }, { lesson: 'uzayli', id: 'alien', x: 840, y: 330, s: 260 },
        ],
        act: { kind: 'tap', target: 'crab', ask: 'Where is the crab?', yes: "Yes! That's the crab!" },
      },
      { bg: 'day', say: ["Let's play together!", 'The end.'], items: [{ lesson: 'mascot', x: 500, y: 330, s: 230 }, { lesson: 'kedi', x: 250, y: 400, s: 190 }, { lesson: 'kopek', x: 760, y: 400, s: 200 }] },
    ],
  },
  {
    id: 'paint', title: 'Chizio Paints the World', tr: 'Çizio dünyayı boyuyor', bg: 'day',
    cover: [{ lesson: 'mascot', x: 360, y: 330, s: 220 }, { lesson: 'gokkusagi', x: 660, y: 300, s: 380 }],
    pages: [
      {
        bg: 'day', say: ['Oh no! The world has no colors!', "Let's help Chizio paint it."],
        items: [{ lesson: 'mascot', x: 250, y: 340, s: 220 }, { lesson: 'agac', x: 560, y: 320, s: 360, bare: true }, { lesson: 'gunes-bulut', parts: SUN, x: 830, y: 170, s: 220, bare: true }],
      },
      {
        bg: 'day', say: ['Look at the sun.'],
        items: [{ lesson: 'gunes-bulut', parts: SUN, id: 'sun', x: 500, y: 300, s: 380, bare: true }],
        act: { kind: 'paint', target: 'sun', ask: 'What color is the sun?', options: ['blue', 'yellow', 'green'], answer: 'yellow', yes: 'Yes! The sun is yellow!' },
      },
      {
        bg: 'day', say: ['Look at the tree.'],
        items: [{ lesson: 'agac', id: 'tree', x: 500, y: 300, s: 440, bare: true }],
        act: { kind: 'paint', target: 'tree', ask: 'What color is the tree?', options: ['green', 'pink', 'blue'], answer: 'green', yes: 'Yes! The tree is green!' },
      },
      {
        bg: 'sea', say: ['Look at the fish.'],
        items: [{ lesson: 'balik', id: 'fish', x: 500, y: 300, s: 420, bare: true }],
        act: { kind: 'paint', target: 'fish', ask: 'What color is the fish?', options: ['purple', 'black', 'orange'], answer: 'orange', yes: 'Yes! The fish is orange!' },
      },
      {
        bg: 'day', say: ['Look at the leaf.'],
        items: [{ lesson: 'yaprak', id: 'leaf', x: 500, y: 300, s: 400, bare: true }],
        act: { kind: 'paint', target: 'leaf', ask: 'What color is the leaf?', options: ['orange', 'blue', 'pink'], answer: 'orange', yes: "Yes! The leaf is orange! It's autumn." },
      },
      { bg: 'sky', say: ['Look! A rainbow!', 'Red, orange, yellow, green, blue and purple!'], items: [{ lesson: 'gokkusagi', x: 500, y: 300, s: 520 }] },
      {
        bg: 'day', say: ['Thank you! Now the world is colorful!', 'The end.'],
        items: [{ lesson: 'mascot', x: 250, y: 340, s: 220 }, { lesson: 'agac', x: 560, y: 320, s: 360 }, { lesson: 'gunes-bulut', parts: SUN, x: 830, y: 170, s: 220 }],
      },
    ],
  },
  {
    id: 'night', title: 'Good Night, Friends', tr: 'İyi geceler, arkadaşlar', bg: 'night',
    cover: [{ lesson: 'baykus', x: 500, y: 300, s: 360 }],
    pages: [
      { bg: 'night', say: ['It is night.', 'The stars are out.'], items: [{ lesson: 'ev', x: 500, y: 350, s: 380 }, { lesson: 'yildiz', x: 170, y: 140, s: 150 }, { lesson: 'yildiz', x: 830, y: 120, s: 120 }] },
      { bg: 'night', say: ['Good night, cat.'], items: [{ lesson: 'kedi', x: 500, y: 320, s: 340, asleep: true }] },
      { bg: 'night', say: ['Good night, dog.'], items: [{ lesson: 'kopek', x: 500, y: 320, s: 360, asleep: true }] },
      { bg: 'night', say: ['Good night, bear.'], items: [{ lesson: 'ayi', x: 500, y: 320, s: 360, asleep: true }] },
      {
        bg: 'night', say: ['Shhh! Everybody is sleeping.'],
        items: [
          { lesson: 'kedi', id: 'cat', x: 170, y: 400, s: 220, asleep: true }, { lesson: 'kopek', id: 'dog', x: 410, y: 400, s: 230, asleep: true },
          { lesson: 'ayi', id: 'bear', x: 640, y: 400, s: 230, asleep: true }, { lesson: 'baykus', id: 'owl', x: 860, y: 260, s: 220 },
        ],
        act: { kind: 'tap', target: 'owl', ask: 'Who is not sleeping?', yes: 'The owl! The owl says: hoo, hoo!' },
      },
      { bg: 'night', say: ['Good night, owl.', 'Good night, Chizio.'], items: [{ lesson: 'baykus', x: 340, y: 300, s: 300 }, { lesson: 'mascot', x: 680, y: 330, s: 220 }] },
      { bg: 'night', say: ['Sweet dreams!', 'The end.'], items: [{ lesson: 'yildiz', x: 500, y: 300, s: 340 }] },
    ],
  },
  {
    id: 'size', title: 'Big and Small', tr: 'Büyük ve küçük', bg: 'day',
    cover: [{ lesson: 'fil', x: 420, y: 320, s: 400 }, { lesson: 'ari', x: 720, y: 360, s: 160 }],
    pages: [
      { bg: 'day', say: ['This is an elephant.', 'The elephant is big.'], items: [{ lesson: 'fil', x: 500, y: 310, s: 480 }] },
      { bg: 'day', say: ['This is a bee.', 'The bee is small.'], items: [{ lesson: 'ari', x: 500, y: 330, s: 170 }] },
      {
        bg: 'day', say: ['The elephant and the bee.'],
        items: [{ lesson: 'fil', id: 'elephant', x: 360, y: 310, s: 440 }, { lesson: 'ari', id: 'bee', x: 760, y: 360, s: 150 }],
        act: { kind: 'tap', target: 'elephant', ask: 'Which one is big?', yes: 'Yes! The elephant is big!' },
      },
      { bg: 'day', say: ['This is a giraffe.', 'The giraffe is tall. It has a long neck!'], items: [{ lesson: 'zurafa', x: 500, y: 300, s: 480 }] },
      { bg: 'sea', say: ['The whale is very, very big!', 'The fish is very small.'], items: [{ lesson: 'balina', x: 400, y: 300, s: 560 }, { lesson: 'balik', x: 830, y: 380, s: 130 }] },
      {
        bg: 'sea', say: ['The whale and the fish.'],
        items: [{ lesson: 'balina', id: 'whale', x: 400, y: 300, s: 520 }, { lesson: 'balik', id: 'fish', x: 830, y: 380, s: 130 }],
        act: { kind: 'tap', target: 'fish', ask: 'Which one is small?', yes: 'Yes! The fish is small!' },
      },
      { bg: 'day', say: ['And you?', 'You are just right!', 'The end.'], items: [{ lesson: 'mascot', x: 500, y: 330, s: 240 }] },
    ],
  },
  {
    id: 'dino', title: 'The Hungry Dinosaur', tr: 'Aç dinozor', bg: 'day',
    cover: [{ lesson: 'trex', x: 420, y: 320, s: 380 }, { lesson: 'ogretmen-elma', parts: APPLE, x: 720, y: 380, s: 150 }],
    pages: [
      { bg: 'day', say: ['This is Rex.', 'Rex is a little dinosaur.'], items: [{ lesson: 'trex', x: 500, y: 310, s: 440 }] },
      { bg: 'day', say: ['Rex is hungry.', '"I am hungry!"'], items: [{ lesson: 'trex', x: 500, y: 310, s: 440 }] },
      { bg: 'day', say: ['Rex eats one apple. Crunch!'], items: [{ lesson: 'trex', x: 260, y: 310, s: 380 }, ...row('ogretmen-elma', 1, 360, 170, APPLE)] },
      {
        bg: 'day', say: ['Rex is still hungry!', 'Rex eats cupcakes. Yum!'],
        items: [{ lesson: 'trex', x: 230, y: 310, s: 360 }, ...row('cupcake', 2, 360, 190)],
        act: { kind: 'choose', ask: 'How many cupcakes?', options: [1, 2, 3], answer: 2, yes: 'Two! Rex eats two cupcakes.' },
      },
      {
        bg: 'day', say: ['Rex is still hungry!', 'Rex eats ice creams. Brrr! Cold!'],
        items: [{ lesson: 'trex', x: 200, y: 310, s: 340 }, ...row('dondurma', 3, 360, 170)],
        act: { kind: 'choose', ask: 'How many ice creams?', options: [2, 3, 4], answer: 3, yes: 'Three! Rex eats three ice creams.' },
      },
      { bg: 'day', say: ['Now Rex is full.', 'Rex is a happy dinosaur!'], items: [{ lesson: 'trex', x: 500, y: 310, s: 440 }] },
      { bg: 'day', say: ['"Thank you! Bye-bye!"', 'Now brush your teeth, Rex!', 'The end.'], items: [{ lesson: 'trex', x: 380, y: 310, s: 400 }, { lesson: 'mascot', x: 760, y: 340, s: 200 }] },
    ],
  },
];
export const getStory = (id: string) => STORIES.find((s) => s.id === id);

// ------------------------------------------------------------------------------------------------
// İlerleme ve English Time planı
// ------------------------------------------------------------------------------------------------
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

/** Bugünün konusu: sırayla, görülmemiş kelimesi kalan ilk konu (hepsi görüldüyse en az bilinen). */
export function topicOfDay(e: EnglishData): Topic {
  const open = TOPICS.find((t) => t.words.some((x) => !seen(e, x.id)));
  if (open) return open;
  const score = (t: Topic) => t.words.filter((x) => known(e, x.id)).length / t.words.length;
  return [...TOPICS].sort((a, b) => score(a) - score(b))[0];
}

/** Bugünün yeni kelimeleri (en çok 3; i+1: konunun görülmemiş ilk kelimeleri, yoksa en az bilinenler). */
export function newWordsOfDay(e: EnglishData, topic = topicOfDay(e)): Word[] {
  const fresh = topic.words.filter((x) => !seen(e, x.id));
  const pool = fresh.length ? fresh : [...topic.words].sort((a, b) => (e.words[a.id]?.got ?? 0) - (e.words[b.id]?.got ?? 0));
  return pool.slice(0, 3);
}

/** Tekrar için daha önce görülmüş (henüz tam bilinmeyen öncelikli) kelimeler. */
export function reviewWords(e: EnglishData, n: number, exclude: string[] = []): Word[] {
  const pool = ALL_WORDS.filter((x) => seen(e, x.id) && !exclude.includes(x.id));
  pool.sort((a, b) => Number(known(e, a.id)) - Number(known(e, b.id)) || (e.words[a.id]?.got ?? 0) - (e.words[b.id]?.got ?? 0));
  return pool.slice(0, n);
}

/** Gün sırasına göre tekrar eden seçimler (aynı gün aynı içerik). */
export function pickByDay<T>(list: T[], day: string, salt = 0): T {
  let h = salt;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

// ------------------------------------------------------------------------------------------------
// Seslendirilecek tüm İngilizce cümleler (scripts/generate-voice.ts)
// ------------------------------------------------------------------------------------------------
export function englishLines(): string[] {
  const out: string[] = [];
  for (const x of ALL_WORDS) out.push(wordLine(x), askLine(x), isLine(x));
  out.push(...PRAISE, TRY_AGAIN, ...Object.values(UI), ...HELLO_FEELINGS.map((h) => h.reply));
  for (const c of COMMANDS) out.push(c.en, saysLine(c));
  for (const p of PAINT_PAGES) {
    out.push(paintDone(p));
    for (const t of p.targets) out.push(paintAsk(t), paintIs(t));
  }
  for (const age of ['mini', 'junior', 'star'] as Age[]) for (const c of HUNT_COLORS) for (const s of HUNT_SHAPES) out.push(huntLine(age, c, s));
  out.push(...HOME_HUNTS.map((h) => h.en), ...HOME_PHRASES.map((p) => p.en));
  for (const s of STORIES) {
    out.push(s.title);
    for (const p of s.pages) {
      out.push(...p.say);
      if (p.act) out.push(p.act.ask, p.act.yes);
    }
  }
  return [...new Set(out)];
}
