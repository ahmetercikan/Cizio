import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Deniz 9: Kocaman gülümseyen, hiç korkutucu olmayan dost bir köpekbalığı. */
const kopekbaligi: Lesson = {
  id: 'kopekbaligi',
  path: 'deniz',
  title: 'Dost Köpekbalığı',
  emoji: '🦈',
  order: 9,
  level: 2,
  skill: 'Uzun bir gövdeye sivri yüzgeçler ekledin. Kocaman bir gülümseme, en korkutucu hayvanı bile dost yapar!',
  palette: ['#8fb4d9', '#eef6ff', '#6b93bf', '#9bdcff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce yan yatmış uzun bir gövde çiz. Burnu sağda yuvarlak olsun, sol ucu incelsin.',
      shapes: [
        {
          d: 'M84,196 C130,150 210,128 280,134 C338,140 368,178 366,212 C364,248 324,270 262,272 C188,276 128,258 84,226 Z',
          part: 'gövde',
          fill: '#8fb4d9',
        },
      ],
    },
    {
      say: 'Gövdenin sol ucuna iki sivri uçlu bir kuyruk çiz. Biri yukarı, biri aşağı baksın.',
      shapes: [
        {
          d: 'M84,196 C94,160 76,118 40,100 C40,140 46,182 62,211 C46,240 40,280 42,318 C70,300 90,262 84,226',
          part: 'kuyruk',
          fill: '#8fb4d9',
        },
      ],
    },
    {
      say: 'Sırtının ortasına büyük, sivri bir yüzgeç çiz. Gövdenin altına da küçük bir yüzgeç ekle.',
      shapes: [
        { d: 'M175,145 C184,108 206,80 244,62 C236,90 236,114 244,134', part: 'sırt yüzgeci', fill: '#6b93bf' },
        { d: 'M250,272 C250,302 230,324 194,334 C200,312 196,290 192,270', part: 'alt yüzgeç', fill: '#6b93bf' },
      ],
    },
    {
      say: 'Gövdenin altına açık renkli bir karın çiz. Ağzın altından kuyruğa doğru uzansın.',
      shapes: [
        {
          d: 'M112,243 C170,236 270,234 325,260 C310,268 290,271 262,272 C188,276 140,262 112,243 Z',
          part: 'karın',
          fill: '#eef6ff',
        },
      ],
    },
    {
      say: 'Gözün yerinin soluna yukarıdan aşağı üç kısa, kavisli çizgi çiz. Bunlar solungaçları.',
      shapes: [
        { d: 'M236,180 Q228,198 236,216', part: 'birinci solungaç' },
        { d: 'M252,178 Q244,198 252,218', part: 'ikinci solungaç' },
        { d: 'M268,180 Q260,198 268,216', part: 'üçüncü solungaç' },
      ],
    },
    {
      say: 'Burnun yanına parlak bir göz çiz. Altına kocaman gülen bir ağız ve pembe bir yanak ekle.',
      shapes: [
        { d: circle(316, 190, 17), part: 'göz', fill: '#2d2d2d' },
        { d: circle(310, 183.5, 5.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M292,230 Q326,256 356,226', part: 'ağız' },
        { d: ellipse(292, 214, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak köpekbalığının üstüne üç baloncuk çiz. Büyükten küçüğe doğru yukarı çıksınlar.',
      shapes: [
        { d: circle(330, 116, 14), part: 'büyük baloncuk', fill: '#9bdcff' },
        { d: circle(352, 80, 9), part: 'orta baloncuk', fill: '#9bdcff' },
        { d: circle(334, 52, 6), part: 'minik baloncuk', fill: '#9bdcff' },
      ],
    },
  ],
};

export default kopekbaligi;
