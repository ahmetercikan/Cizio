import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const civciv: Lesson = {
  id: 'civciv',
  path: 'hayvanlar',
  title: 'Sarı Civciv',
  emoji: '🐥',
  order: 29,
  level: 1,
  skill: 'Tombul bir gövdeye kanat, gaga ve minik ayaklar ekleyerek sevimli bir civciv çizmeyi öğrendin!',
  palette: ['#ffde59', '#f5c518', '#fb8500', '#ff9ebb', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Civcivimiz için kâğıdın ortasına büyük, tombul ve yuvarlak bir gövde çizelim.',
      shapes: [
        {
          d: 'M200,110 C265,110 290,155 290,215 C290,280 255,305 200,305 C145,305 110,280 110,215 C110,155 135,110 200,110 Z',
          part: 'gövde',
          fill: '#ffde59',
        },
      ],
    },
    {
      say: 'Başının üstüne yukarı doğru bakan neşeli iki minik tüy ekleyelim.',
      shapes: [
        {
          d: 'M192,112 C188,85 202,78 200,72 C206,80 205,94 204,111 C208,96 220,88 218,82 C222,92 215,104 208,113 Z',
          part: 'baş tüyleri',
          fill: '#f5c518',
        },
      ],
    },
    {
      say: 'Yüzüne iki yuvarlak simsiyah göz ve tatlı pembe yanaklar konduralım.',
      shapes: [
        { d: circle(168, 188, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(171, 185, 2.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(232, 188, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(235, 185, 2.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: ellipse(152, 206, 10, 6), part: 'sol yanak', fill: '#ff9ebb' },
        { d: ellipse(248, 206, 10, 6), part: 'sağ yanak', fill: '#ff9ebb' },
      ],
    },
    {
      say: 'İki gözün tam ortasına minik, üçgen turuncu bir gaga çizelim.',
      shapes: [
        {
          d: 'M188,198 C194,194 206,194 212,198 C208,214 204,220 200,220 C196,220 192,214 188,198 Z',
          part: 'gaga',
          fill: '#fb8500',
        },
        { d: 'M190,204 Q200,212 210,204', part: 'gaga çizgisi' },
      ],
    },
    {
      say: 'Gövdenin iki yanına minik, pofuduk kanatlar ekleyelim.',
      shapes: [
        {
          d: 'M120,200 C92,216 95,250 128,252 C116,234 115,216 120,200 Z',
          part: 'sol kanat',
          fill: '#f5c518',
        },
        {
          d: 'M280,200 C308,216 305,250 272,252 C284,234 285,216 280,200 Z',
          part: 'sağ kanat',
          fill: '#f5c518',
        },
      ],
    },
    {
      say: 'Civcivimizin altına pıt pıt yürüyen iki küçük turuncu ayak çizelim.',
      shapes: [
        { d: 'M175,304 L175,340 M160,348 L175,340 L190,348 M175,340 L175,352', part: 'sol ayak' },
        { d: 'M225,304 L225,340 M210,348 L225,340 L240,348 M225,340 L225,352', part: 'sağ ayak' },
      ],
    },
  ],
};

export default civciv;
