import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 16: Minik Tavuk — Tombul yuvarlak gövde, kırmızı ibik, sarı gaga ve sevimli kanatlar. */
const tavuk: Lesson = {
  id: 'tavuk',
  path: 'hayvanlar',
  title: 'Minik Tavuk',
  emoji: '🐔',
  order: 16,
  level: 1,
  skill: 'Yuvarlak gövdeye ibik, gaga ve kanat ekleyerek sevimli bir kümes hayvanı çizmeyi öğrendin!',
  palette: ['#ffffff', '#e63946', '#ffb703', '#f4a261', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Tavuğumuz için kâğıdın ortasına kocaman, tombul bir yuvarlak çizelim.',
      shapes: [
        {
          d: circle(195, 210, 85),
          part: 'gövde',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kafasının üstüne üç tepeli kırmızı bir ibik ve çenesine minik bir sakal konduralım.',
      shapes: [
        {
          d: 'M175,130 C165,95 185,85 192,108 C200,80 220,80 224,108 C232,90 248,100 238,130 Z',
          part: 'ibik',
          fill: '#e63946',
        },
        {
          d: 'M255,205 C268,205 272,225 260,230 C250,230 248,215 255,205 Z',
          part: 'sakal',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Yüzün sağına sivri sarı bir gaga, yanına meraklı bir göz ve pembe yanak çizelim.',
      shapes: [
        { d: 'M255,180 L295,192 L255,205 Z', part: 'gaga', fill: '#ffb703' },
        { d: circle(230, 175, 10), part: 'göz', fill: '#2d2d2d' },
        { d: circle(233, 172, 3.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: ellipse(220, 195, 8, 5), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Gövdenin ortasına yarım kalp gibi sevimli, tombul bir kanat ekleyelim.',
      shapes: [
        {
          d: 'M140,200 C155,170 205,175 215,210 C220,240 180,265 145,250 C135,235 135,215 140,200 Z',
          part: 'kanat',
          fill: '#f4a261',
        },
        { d: 'M160,235 C175,245 195,230 200,215', part: 'kanat tüyü' },
      ],
    },
    {
      say: 'Gövdenin sol arkasına yukarı doğru kıvrılan neşeli kuyruk tüyleri çizelim.',
      shapes: [
        {
          d: 'M120,185 C90,165 75,190 100,215 C70,205 70,235 110,240 C85,245 95,270 125,255 Z',
          part: 'kuyruk tüyleri',
          fill: '#f4a261',
        },
      ],
    },
    {
      say: 'Gövdenin altına iki bacak ve üçer parmaklı sarı ayaklar ekleyelim.',
      shapes: [
        { d: 'M175,290 L175,345 M160,355 L175,345 L190,355 M175,345 L175,358', part: 'sol bacak ve ayak' },
        { d: 'M215,290 L215,345 M200,355 L215,345 L230,355 M215,345 L215,358', part: 'sağ bacak ve ayak' },
      ],
    },
  ],
};

export default tavuk;
