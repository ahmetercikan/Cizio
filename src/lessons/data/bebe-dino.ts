import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 14: Kırık yumurtanın içinden çıkan sevimli, kocaman gözlü Bebek Dino. */
const bebeDino: Lesson = {
  id: 'bebe-dino',
  path: 'dinozor',
  title: 'Bebek Dino',
  emoji: '🥚',
  order: 14,
  level: 1,
  skill: 'Kırık bir yumurta kabuğu içine kocaman gözlü şirin bir bebek dinozor yerleştirdin!',
  palette: ['#a3e635', '#65a30d', '#fef08a', '#ffffff', '#2d2d2d', '#f472b6'],
  steps: [
    {
      say: 'Önce alta zikzak kenarlı, yarım bir yumurta kabuğu çiz.',
      shapes: [
        {
          d: 'M80,240 Q75,340 200,345 Q325,340 320,240 L285,260 L250,235 L215,260 L185,235 L150,260 L115,235 Z',
          part: 'yumurta kabuğu',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kabuğun üstüne kocaman, tombul ve yuvarlak bir kafa çiz.',
      shapes: [
        {
          d: 'M125,235 C100,165 140,105 200,105 C260,105 300,165 275,235 Z',
          part: 'kafa',
          fill: '#a3e635',
        },
      ],
    },
    {
      say: 'Kafasının tepesine şapka gibi minik kırık bir kabuk ekle.',
      shapes: [
        {
          d: 'M150,125 Q200,80 250,125 L230,118 L210,130 L190,118 L170,128 Z',
          part: 'kabuk şapka',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kabuğun kenarına tutunan iki minik el ve yandan çıkan kuyruk çiz.',
      shapes: [
        { d: ellipse(140, 248, 14, 10), part: 'sol el', fill: '#a3e635' },
        { d: ellipse(260, 248, 14, 10), part: 'sağ el', fill: '#a3e635' },
        {
          d: 'M295,280 C325,275 350,260 365,240 C355,270 330,300 290,305 Z',
          part: 'kuyruk',
          fill: '#a3e635',
        },
      ],
    },
    {
      say: 'Yüzüne kocaman iki parlak göz ve minicik gülen bir ağız çiz.',
      shapes: [
        { d: circle(162, 175, 18), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(157, 168, 6), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(168, 182, 2.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(238, 175, 18), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(233, 168, 6), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: circle(244, 182, 2.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M188,205 Q200,216 212,205', part: 'ağız' },
      ],
    },
    {
      say: 'Son olarak pembe yanaklar, alnına benekler ve kabuğa noktalar ekle.',
      shapes: [
        { d: ellipse(142, 195, 12, 7), part: 'sol yanak', fill: '#f472b6' },
        { d: ellipse(258, 195, 12, 7), part: 'sağ yanak', fill: '#f472b6' },
        { d: circle(200, 138, 6), part: 'alın beneği', fill: '#65a30d' },
        { d: circle(186, 148, 4), part: 'alın beneği', fill: '#65a30d' },
        { d: circle(214, 148, 4), part: 'alın beneği', fill: '#65a30d' },
        { d: circle(150, 295, 8), part: 'kabuk beneği', fill: '#fef08a' },
        { d: circle(200, 310, 10), part: 'kabuk beneği', fill: '#fef08a' },
        { d: circle(250, 290, 8), part: 'kabuk beneği', fill: '#fef08a' },
      ],
    },
  ],
};

export default bebeDino;
