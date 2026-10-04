import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 5: Hiç korkutucu olmayan, el sallayan sevimli bir hayalet. */
const hayalet: Lesson = {
  id: 'hayalet',
  path: 'karakterler',
  title: 'Sevimli Hayalet',
  emoji: '👻',
  order: 5,
  level: 1,
  skill: 'Yuvarlak bir tepe ve dalgalı bir etekle yumuşak, sevimli bir karakter çizmeyi öğrendin!',
  palette: ['#f1ecff', '#d9ccff', '#ff8fc8', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir kubbe çiz. Soldan yukarı çık, tepeden yuvarlakça dön, sağdan aşağı in.',
      shapes: [
        {
          d: 'M105,300 L105,165 C105,98 148,58 200,58 C252,58 295,98 295,165 L295,300',
          part: 'gövde',
          fill: '#f1ecff',
        },
      ],
    },
    {
      say: 'Alttan dalgalı bir etek çiz. Sağ köşeden sola doğru dört yuvarlak dalga yap.',
      shapes: [
        {
          d: 'M295,300 Q271,334 248,300 Q224,334 200,300 Q176,334 153,300 Q129,334 105,300',
          part: 'dalgalı etek',
          fill: '#f1ecff',
        },
      ],
    },
    {
      say: 'İki yana minik kollar çiz. Soldaki aşağı baksın, sağdaki el sallasın.',
      shapes: [
        { d: 'M105,205 Q72,212 66,244 Q90,250 105,236', part: 'sol kol', fill: '#f1ecff' },
        { d: 'M295,214 Q326,200 334,166 Q352,180 340,206 Q326,230 295,240', part: 'sağ kol', fill: '#f1ecff' },
      ],
    },
    {
      say: 'Yüzün ortasına iki kocaman oval göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: ellipse(168, 168, 16, 21), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(173, 160, 6), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(232, 168, 16, 21), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(237, 160, 6), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına minik bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M182,210 Q200,228 218,210', part: 'ağız' },
        { d: ellipse(142, 204, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(258, 204, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Başının sağ üstüne iki yapraklı bir fiyonk çiz. Ortasına küçük bir düğüm koy.',
      shapes: [
        { d: 'M252,78 L228,62 Q222,80 228,98 Z', part: 'sol fiyonk', fill: '#ff8fc8' },
        { d: 'M252,78 L276,62 Q282,80 276,98 Z', part: 'sağ fiyonk', fill: '#ff8fc8' },
        { d: circle(252, 78, 7), part: 'fiyonk düğümü', fill: '#ff5c8a' },
      ],
    },
  ],
};

export default hayalet;
