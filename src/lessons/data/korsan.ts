import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 6: Şapkalı, göz bantlı, güler yüzlü minik bir korsan. */
const korsan: Lesson = {
  id: 'korsan',
  path: 'karakterler',
  title: 'Minik Korsan',
  emoji: '🏴‍☠️',
  order: 6,
  level: 2,
  skill: 'Bir yüzün üstüne şapka, bant ve küpe ekleyerek karaktere kılık giydirmeyi öğrendin!',
  palette: ['#ffd9b8', '#3b3b4f', '#ffffff', '#e8474c', '#ffd23f', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kâğıdın üstüne korsan şapkası çiz. İki yanı kalkık, ortası yuvarlak tepeli, altı düz olsun.',
      shapes: [
        {
          d: 'M84,150 Q92,104 136,116 Q150,46 200,46 Q250,46 264,116 Q308,104 316,150 Z',
          part: 'şapka',
          fill: '#3b3b4f',
        },
      ],
    },
    {
      say: 'Şapkanın altına kocaman, yuvarlak bir yüz çiz. Soldan başla, aşağıdan dolaş, sağa çık.',
      shapes: [{ d: 'M131,150 A95,95 0 1,0 269,150', part: 'yüz', fill: '#ffd9b8' }],
    },
    {
      say: 'Çenenin altına çizgili bir tişört çiz. Omuzlar yuvarlak olsun, içine iki çizgi çek.',
      shapes: [
        { d: 'M115,372 Q118,325 170,306 Q200,322 230,306 Q282,325 285,372 Z', part: 'tişört', fill: '#e8474c' },
        { d: 'M126,340 Q200,352 274,340', part: 'üst çizgi' },
        { d: 'M117,360 Q200,372 283,360', part: 'alt çizgi' },
      ],
    },
    {
      say: 'Yüzün iki yanına kulak çiz. Sağ kulağa da yuvarlak, altın bir küpe tak.',
      shapes: [
        { d: 'M108,195 Q82,198 84,222 Q88,242 110,236', part: 'sol kulak', fill: '#ffd9b8' },
        { d: 'M292,195 Q318,198 316,222 Q312,242 290,236', part: 'sağ kulak', fill: '#ffd9b8' },
        { d: circle(306, 252, 8), part: 'küpe', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Yüzün soluna kocaman bir göz çiz. İçine beyaz bir parıltı koy.',
      shapes: [
        { d: ellipse(162, 200, 16, 20), part: 'göz', fill: '#2d2d2d' },
        { d: circle(167, 192, 6), part: 'göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Sağ gözün yerine yuvarlak bir göz bandı çiz. Bandın ipini iki yana uzat.',
      shapes: [
        { d: ellipse(238, 200, 24, 20), part: 'göz bandı', fill: '#3b3b4f' },
        { d: 'M136,155 L216,191', part: 'sol ip' },
        { d: 'M260,210 L292,236', part: 'sağ ip' },
      ],
    },
    {
      say: 'Kocaman, neşeli bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M170,248 Q200,276 230,248', part: 'ağız' },
        { d: ellipse(140, 244, 14, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(262, 244, 14, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Şapkanın ortasına çarpı gibi duran iki ince kemik çiz. Uçları dışarı taşsın.',
      shapes: [
        { d: 'M176,86 L226,108 L222,116 L172,94 Z', part: 'sol kemik', fill: '#ffffff' },
        { d: 'M224,86 L174,108 L178,116 L228,94 Z', part: 'sağ kemik', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kemiklerin üstüne yuvarlak bir kafatası çiz. İçine iki minik göz koy.',
      shapes: [
        { d: circle(200, 88, 16), part: 'kafatası', fill: '#ffffff' },
        { d: circle(194, 87, 4), part: 'kafatasının sol gözü', fill: '#2d2d2d' },
        { d: circle(206, 87, 4), part: 'kafatasının sağ gözü', fill: '#2d2d2d' },
      ],
    },
  ],
};

export default korsan;
