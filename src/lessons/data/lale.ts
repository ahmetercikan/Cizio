import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Doğa 5: Lale. Kupa gibi bir çanak, tepesinde üç sivri uç. */
const lale: Lesson = {
  id: 'lale',
  path: 'doga',
  title: 'Lale',
  emoji: '🌷',
  order: 5,
  level: 1,
  skill: 'Lalenin çanağını bir kupa gibi çizip tepesine üç sivri uç koydun. Basit şekiller güzel çiçek olur!',
  palette: ['#ff5a7a', '#ff8fa8', '#5cc56a', '#3f9e4d', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Soldaki uçtan başla, aşağı inip kupa gibi kocaman bir çanak çiz. Tepesine üç sivri uç yap.',
      shapes: [
        {
          d: 'M112,70 C96,170 130,238 200,238 C270,238 304,170 288,70 L242,122 L200,48 L158,122 Z',
          part: 'çanak',
          fill: '#ff5a7a',
        },
      ],
    },
    {
      say: 'Ortadaki ucun iki yanındaki çukurlardan aşağıya, çanağın dibine doğru iki kavisli çizgi çiz.',
      shapes: [
        { d: 'M158,122 Q150,200 200,238', part: 'sol yaprak çizgisi' },
        { d: 'M242,122 Q250,200 200,238', part: 'sağ yaprak çizgisi' },
      ],
    },
    {
      say: 'Çanağın dibinden aşağıya doğru uzun, hafif kıvrık bir sap çiz.',
      shapes: [{ d: 'M200,238 Q210,300 200,366', part: 'sap' }],
    },
    {
      say: 'Sapın iki yanına uzun, sivri birer yaprak çiz. Saptan başla, yukarı uzat ve yine sapta bitir.',
      shapes: [
        { d: 'M203,356 C150,350 112,310 104,248 C150,268 186,300 205,330 Z', part: 'sol yaprak', fill: '#5cc56a' },
        { d: 'M206,340 C250,330 286,296 296,236 C254,256 222,280 207,310 Z', part: 'sağ yaprak', fill: '#5cc56a' },
      ],
    },
    {
      say: 'Ortadaki yaprağın üstüne iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(184, 168, 10), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(216, 168, 10), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(181, 164, 4), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(213, 164, 4), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına tatlı bir gülümseme, iki yanına da pembe yanaklar çiz. Lalen gülüyor!',
      shapes: [
        { d: 'M188,192 Q200,204 212,192', part: 'ağız' },
        { d: oval(142, 190, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: oval(258, 190, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default lale;
