/**
 * English Club şarkıları: geleneksel (telifsiz) çocuk şarkıları.
 *
 * Her şarkı sözlerin heceleriyle hizalanmış bir melodidir: `line('Twin-kle twin-kle', 'C4 C4 G4 G4')`.
 * Çalarken o anki hece ışıldar, çocuk takip ederek söyler. Melodi Web Audio ile çalınır (ses dosyası
 * gerekmez); `public/song/<id>.mp3` konursa onun yerine gerçek kayıt çalar.
 *
 * Bu dosya React içermez: sözleri `englishLines()` toplar ve `npm run voice` seslendirir.
 */

export interface Syl {
  /** Hece metni. */
  s: string;
  /** Hangi kelimenin parçası (0'dan başlar). */
  w: number;
  /** Nota adı ("C4") ya da '' (sus). */
  note: string;
  /** Kaç vuruş sürer. */
  beats: number;
}

export interface SongLine {
  /** Ekranda görünen kelimeler. */
  words: string[];
  syls: Syl[];
  /** Satırın toplam süresi (vuruş). */
  beats: number;
}

export interface Song {
  id: string;
  title: string;
  titleTr: string;
  /** Kart rengi. */
  color: string;
  bpm: number;
  lines: SongLine[];
  /** Çocuğa söylenen hareket önerisi (TPR). */
  move: string;
  /** Şarkının öğrettiği konu. */
  about: string;
}

/**
 * Bir satır: sözler ve notalar.
 * Sözlerde heceler `-` ile ayrılır ("Twin-kle"), notalar boşlukla. `*2` notayı iki vuruş uzatır,
 * `.` bir vuruşluk sus demektir.
 */
export function line(text: string, notes: string): SongLine {
  const parcali = text.trim().split(/\s+/);
  // ekranda kelimeler bütün görünür ("Twinkle"), heceler yalnızca melodiyi hizalamak için ayrılır
  const words = parcali.map((w) => w.replace(/-/g, ''));
  const syls: Syl[] = [];
  parcali.forEach((word, w) => {
    for (const s of word.split('-')) syls.push({ s, w, note: '', beats: 1 });
  });
  const ns = notes.trim().split(/\s+/);
  let beats = 0;
  syls.forEach((syl, i) => {
    const n = ns[i] ?? 'C4';
    const [name, mul] = n.split('*');
    syl.note = name === '.' ? '' : name;
    syl.beats = mul ? Number(mul) : 1;
    beats += syl.beats;
  });
  // notalar hecelerden fazlaysa kalanlar sustur (satır sonu nefesi)
  for (let i = syls.length; i < ns.length; i++) {
    const [name, mul] = ns[i].split('*');
    syls.push({ s: '', w: -1, note: name === '.' ? '' : name, beats: mul ? Number(mul) : 1 });
    beats += mul ? Number(mul) : 1;
  }
  return { words, syls, beats };
}

export const SONGS: Song[] = [
  {
    id: 'abc', title: 'The Alphabet Song', titleTr: 'Alfabe Şarkısı', color: '#5b8def', bpm: 104,
    move: 'Point to each letter as you sing!', about: 'letters',
    lines: [
      line('A B C D E F G', 'C4 C4 G4 G4 A4 A4 G4*2'),
      line('H I J K L-M-N-O P', 'F4 F4 E4 E4 D4 D4 D4 D4 C4*2'),
      line('Q R S T U V', 'G4 G4 F4 F4 E4 E4*2'),
      line('W X Y and Z', 'G4 G4 F4 E4 E4*2'),
      line('Now I know my A B C', 'C4 C4 G4 G4 A4 A4 G4*2'),
      line('Next time won\'t you sing with me', 'F4 F4 E4 E4 D4 D4 C4*2'),
    ],
  },
  {
    id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', titleTr: 'Parla Parla Küçük Yıldız', color: '#9b6bff', bpm: 96,
    move: 'Open and close your hands like stars!', about: 'the sky',
    lines: [
      line('Twin-kle twin-kle lit-tle star', 'C4 C4 G4 G4 A4 A4 G4*2'),
      line('How I won-der what you are', 'F4 F4 E4 E4 D4 D4 C4*2'),
      line('Up a-bove the world so high', 'G4 G4 F4 F4 E4 E4 D4*2'),
      line('Like a dia-mond in the sky', 'G4 G4 F4 F4 E4 E4 D4*2'),
      line('Twin-kle twin-kle lit-tle star', 'C4 C4 G4 G4 A4 A4 G4*2'),
      line('How I won-der what you are', 'F4 F4 E4 E4 D4 D4 C4*2'),
    ],
  },
  {
    id: 'head', title: 'Head, Shoulders, Knees and Toes', titleTr: 'Baş, Omuz, Diz ve Ayak', color: '#14a89a', bpm: 112,
    move: 'Touch each part as you sing!', about: 'the body',
    lines: [
      line('Head shoul-ders knees and toes', 'G4 E4 C4 C4 D4 E4*2'),
      line('knees and toes', 'D4 E4 F4*2'),
      line('Head shoul-ders knees and toes', 'G4 E4 C4 C4 D4 E4*2'),
      line('knees and toes', 'D4 E4 C4*2'),
      line('Eyes and ears and mouth and nose', 'G4 G4 A4 A4 G4 G4 F4*2'),
      line('Head shoul-ders knees and toes', 'G4 E4 C4 C4 D4 C4*2'),
    ],
  },
  {
    id: 'happy', title: "If You're Happy and You Know It", titleTr: 'Mutluysan Alkış Çal', color: '#ffc83d', bpm: 116,
    move: 'Clap, stomp and shout hooray!', about: 'feelings',
    lines: [
      line("If you're hap-py and you know it clap your hands", 'C4 C4 F4 F4 F4 F4 F4 F4 F4 A4 G4 F4*2'),
      line("If you're hap-py and you know it clap your hands", 'C4 C4 G4 G4 G4 G4 G4 G4 G4 C5 B4 G4*2'),
      line("If you're hap-py and you know it and you real-ly want to show it", 'C4 C4 F4 F4 F4 F4 F4 A4 A4 A4 A4 B4 B4 B4 B4 C5'),
      line("If you're hap-py and you know it clap your hands", 'C5 C5 C5 A4 A4 F4 F4 G4 G4 A4 G4 F4*2'),
    ],
  },
  {
    id: 'bus', title: 'The Wheels on the Bus', titleTr: 'Otobüsün Tekerlekleri', color: '#ff8a2b', bpm: 118,
    move: 'Roll your arms like big wheels!', about: 'the city',
    lines: [
      line('The wheels on the bus go round and round', 'C4 F4 F4 F4 F4 A4 F4 D4 F4*2'),
      line('round and round round and round', 'C4 D4 E4 F4 G4 A4*2'),
      line('The wheels on the bus go round and round', 'C4 F4 F4 F4 F4 A4 F4 D4 F4*2'),
      line('all through the town', 'C4 D4 C4 F4*2'),
    ],
  },
  {
    id: 'row', title: 'Row, Row, Row Your Boat', titleTr: 'Çek Çek Kürekleri', color: '#3f7fe0', bpm: 104,
    move: 'Pull the oars with both hands!', about: 'the sea',
    lines: [
      line('Row row row your boat', 'C4 C4 C4 D4 E4*2'),
      line('gen-tly down the stream', 'E4 D4 E4 F4 G4*2'),
      line('Mer-ri-ly mer-ri-ly mer-ri-ly mer-ri-ly', 'C5 C5 C5 G4 G4 G4 E4 E4 E4 C4 C4 C4'),
      line('life is but a dream', 'G4 F4 E4 D4 C4*2'),
    ],
  },
  {
    id: 'macdonald', title: 'Old MacDonald Had a Farm', titleTr: 'Ali Baba\'nın Çiftliği', color: '#2bb673', bpm: 112,
    move: 'Make the animal sounds!', about: 'farm animals',
    lines: [
      line('Old Mac-Don-ald had a farm', 'C4 C4 C4 G3 A3 A3 G3*2'),
      line('E I E I O', 'E4 E4 D4 D4 C4*2'),
      line('And on that farm he had a cow', 'G3 C4 C4 C4 G3 A3 A3 G3*2'),
      line('E I E I O', 'E4 E4 D4 D4 C4*2'),
      line('With a moo moo here and a moo moo there', 'C4 C4 C4 C4 C4 C4 C4 C4 C4 C4 C4'),
      line('Old Mac-Don-ald had a farm E I E I O', 'C4 C4 C4 G3 A3 A3 G3 E4 E4 D4 D4 C4*2'),
    ],
  },
  {
    id: 'baa', title: 'Baa, Baa, Black Sheep', titleTr: 'Mee Mee Kara Koyun', color: '#8c766e', bpm: 100,
    move: 'Hold up three fingers for three bags!', about: 'colors and numbers',
    lines: [
      line('Baa baa black sheep', 'C4 C4 G4 G4'),
      line('have you a-ny wool', 'A4 A4 A4 A4 G4*2'),
      line('Yes sir yes sir', 'F4 F4 E4 E4'),
      line('three bags full', 'D4 D4 C4*2'),
    ],
  },
  {
    id: 'rain', title: 'Rain, Rain, Go Away', titleTr: 'Yağmur Yağmur Dinsene', color: '#4dc3e8', bpm: 100,
    move: 'Wiggle your fingers like falling rain!', about: 'the weather',
    lines: [
      line('Rain rain go a-way', 'G4 E4 G4 G4 E4*2'),
      line('come a-gain an-o-ther day', 'G4 G4 E4 G4 G4 E4 A4*2'),
      line('lit-tle child-ren want to play', 'G4 G4 E4 G4 G4 E4 C4*2'),
      line('Rain rain go a-way', 'G4 E4 G4 G4 E4*2'),
    ],
  },
  {
    id: 'mary', title: 'Mary Had a Little Lamb', titleTr: 'Mary\'nin Küçük Kuzusu', color: '#ff8fb1', bpm: 108,
    move: 'Walk in place like a little lamb!', about: 'animals',
    lines: [
      line('Ma-ry had a lit-tle lamb', 'E4 D4 C4 D4 E4 E4 E4*2'),
      line('lit-tle lamb lit-tle lamb', 'D4 D4 D4*2 E4 G4 G4*2'),
      line('Ma-ry had a lit-tle lamb', 'E4 D4 C4 D4 E4 E4 E4*2'),
      line('its fleece was white as snow', 'E4 D4 D4 E4 D4 C4*2'),
    ],
  },
  {
    id: 'ducks', title: 'Five Little Ducks', titleTr: 'Beş Küçük Ördek', color: '#ffb100', bpm: 108,
    move: 'Count down on your fingers!', about: 'counting',
    lines: [
      line('Five lit-tle ducks went out one day', 'C4 C4 C4 E4 G4 G4 E4 C4*2'),
      line('o-ver the hills and far a-way', 'D4 D4 D4 F4 A4 A4 F4 D4*2'),
      line('Mo-ther duck said quack quack quack quack', 'E4 E4 E4 G4 C5 C5 C5 B4*2'),
      line('but on-ly four lit-tle ducks came back', 'A4 A4 G4 F4 E4 E4 D4 C4*2'),
    ],
  },
  {
    id: 'colorsong', title: 'What Color Is It?', titleTr: 'Hangi Renk?', color: '#ef4b4b', bpm: 112,
    move: 'Point to something with that color!', about: 'colors',
    lines: [
      line('Red and yel-low green and blue', 'C4 C4 E4 E4 G4 G4 E4*2'),
      line('what a love-ly rain-bow too', 'F4 F4 D4 D4 E4 E4 C4*2'),
      line('Pink and pur-ple orange and brown', 'C4 C4 E4 E4 G4 G4 E4*2'),
      line('co-lors all a-round the town', 'F4 F4 D4 D4 E4 E4 C4*2'),
    ],
  },
];

export const song = (id: string) => SONGS.find((s) => s.id === id);

/** Satırın okunabilir sözü (seslendirme ve ekran altyazısı için). */
export const lineText = (l: SongLine) => l.words.join(' ');
/** Şarkının bütün sözü. */
export const songText = (s: Song) => s.lines.map(lineText).join(' ');

export const SONG_UI = {
  title: 'Sing with me!',
  pick: 'Pick a song and sing along!',
  play: 'Sing',
  again: 'Again',
  stop: 'Stop',
  done: 'You sang the whole song! Amazing!',
};

/** Seslendirilecek cümleler (nakaratlar tekrar ettiği için benzersizleştirilir). */
export const SONG_LINES: string[] = [...new Set([
  ...SONGS.map((s) => s.title),
  ...SONGS.flatMap((s) => s.lines.map(lineText)),
  ...SONGS.map((s) => s.move),
  ...Object.values(SONG_UI),
])];
