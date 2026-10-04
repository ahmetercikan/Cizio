import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 7: Chibi prenses. Uzun saç, taç ve kabarık bir elbise. */
const prenses: Lesson = {
  id: 'prenses',
  path: 'karakterler',
  title: 'Prenses',
  emoji: '👸',
  order: 7,
  level: 3,
  skill: 'Uzun saç, taç ve kabarık elbiseyle chibi bir karakteri süslemeyi öğrendin! Küçük ayrıntılar onu özel yapar.',
  palette: ['#9a5b34', '#ffe1cc', '#ff8fc8', '#ffd23f', '#ffc2e2', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce uzun, yuvarlak bir saç çiz. Soldaki omuzdan başla, tepeden dolaş, sağdaki omuza in.',
      shapes: [
        {
          d: 'M140,268 Q100,268 100,226 C92,146 120,76 200,76 C280,76 308,146 300,226 Q300,268 260,268',
          part: 'saç',
          fill: '#9a5b34',
        },
      ],
    },
    {
      say: 'Saçın içine yüzü çiz. Üstte yuvarlak perçemler yap, sonra aşağıdan yuvarlak bir çene ile kapat.',
      shapes: [
        {
          d: 'M130,142 Q145,186 165,139 Q182,190 200,137 Q218,190 235,139 Q255,186 270,142 A72,72 0 1,1 130,142 Z',
          part: 'yüz',
          fill: '#ffe1cc',
        },
      ],
    },
    {
      say: 'Kafanın altına kabarık bir elbise çiz. Yukarıda dar başlasın, aşağıda iyice genişlesin.',
      shapes: [{ d: 'M182,232 L128,342 Q200,362 272,342 L218,232', part: 'elbise', fill: '#ff8fc8' }],
    },
    {
      say: 'Saçın tepesine sivri uçlu bir taç çiz. Ortadaki uç en uzunu olsun.',
      shapes: [
        {
          d: 'M152,92 L146,46 L174,68 L200,32 L226,68 L254,46 L248,92 Q200,80 152,92 Z',
          part: 'taç',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Elbisenin yanlarına iki minik kol, altına da iki yuvarlak ayakkabı çiz.',
      shapes: [
        { d: 'M178,244 L146,276 A9,9 0 0,0 159,288 L172,272', part: 'sol kol', fill: '#ffe1cc' },
        { d: 'M222,244 L254,276 A9,9 0 0,1 241,288 L228,272', part: 'sağ kol', fill: '#ffe1cc' },
        { d: ellipse(182, 362, 13, 8), part: 'sol ayakkabı', fill: '#ff5c8a' },
        { d: ellipse(218, 362, 13, 8), part: 'sağ ayakkabı', fill: '#ff5c8a' },
      ],
    },
    {
      say: 'Omuzlara iki kabarık kol çiz. Belinin üstüne de bir kemer çizgisi çek.',
      shapes: [
        { d: ellipse(177, 244, 14, 11), part: 'sol kabarık kol', fill: '#ffc2e2' },
        { d: ellipse(223, 244, 14, 11), part: 'sağ kabarık kol', fill: '#ffc2e2' },
        { d: 'M166,268 Q200,278 234,268', part: 'kemer' },
      ],
    },
    {
      say: 'Yüzün ortasına iki kocaman göz çiz. Beyaz parıltılarını da unutma.',
      shapes: [
        { d: ellipse(172, 186, 13, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(176, 179, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(228, 186, 13, 16), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(232, 179, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Minik bir gülümseme ve iki pembe yanak çiz. Gözlerin dış köşesine birer kirpik ekle.',
      shapes: [
        { d: 'M188,210 Q200,220 212,210', part: 'ağız' },
        { d: ellipse(160, 207, 9, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 207, 9, 6), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M160,176 L150,168 M240,176 L250,168', part: 'kirpikler' },
      ],
    },
    {
      say: 'Tacın ortasına yuvarlak bir mücevher, eteğe de bir kalp çiz. Prensesin hazır!',
      shapes: [
        { d: circle(200, 78, 7), part: 'mücevher', fill: '#ff5c8a' },
        { d: 'M200,322 L182,304 A10,10 0 0,1 200,290 A10,10 0 0,1 218,304 Z', part: 'elbise kalbi', fill: '#ffffff' },
      ],
    },
  ],
};

export default prenses;
