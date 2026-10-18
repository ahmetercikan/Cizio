import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 18: Gülen muz. Hilal kavisli gövde, sap, gözler ve neşeli gülümseme. */
const muz: Lesson = {
  id: 'muz',
  path: 'nesneler',
  title: 'Gülen Muz',
  emoji: '🍌',
  order: 18,
  level: 1,
  skill: 'Hilal şeklinde kavisli bir gövde çizip sevimli bir yüz ifadesi eklemeyi öğrendin!',
  palette: ['#fbc531', '#44bd32', '#71583a', '#2f3542', '#ff7979', '#ffffff'],
  steps: [
    {
      say: 'Önce muzun kavisli, hilal gibi kıvrılan tombul sarı gövdesini çiz.',
      shapes: [
        {
          d: 'M290,80 C185,95 85,160 95,245 C105,310 200,345 285,320 C205,310 155,265 150,215 C145,155 215,110 290,80 Z',
          part: 'muz gövdesi',
          fill: '#fbc531',
        },
      ],
    },
    {
      say: 'Kabuğun köşeli hissini veren boylu boyunca uzanan kavisli sırt çizgisini çek.',
      shapes: [
        {
          d: 'M288,82 C195,115 120,180 125,250 C130,295 195,322 285,320',
          part: 'kabuk çizgisi',
        },
      ],
    },
    {
      say: 'Muzun tepesine yeşil bir sap, altına da minik kahverengi ucunu ekle.',
      shapes: [
        { d: 'M290,80 L318,52 L328,62 L298,88 Z', part: 'muz sapı', fill: '#44bd32' },
        { d: 'M285,320 L302,326 L298,336 L281,328 Z', part: 'alt uç', fill: '#71583a' },
      ],
    },
    {
      say: 'Muzun ortasına pırıl pırıl iki göz ve tatlı pembe yanaklar kondur.',
      shapes: [
        { d: circle(170, 202, 9), part: 'sol göz', fill: '#2f3542' },
        { d: circle(173, 199, 3), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(210, 216, 9), part: 'sağ göz', fill: '#2f3542' },
        { d: circle(213, 213, 3), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: ellipse(152, 212, 8, 5), part: 'sol yanak', fill: '#ff7979' },
        { d: ellipse(230, 226, 8, 5), part: 'sağ yanak', fill: '#ff7979' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman, neşeli bir gülümseme çizerek muzunu tamamla!',
      shapes: [
        {
          d: 'M178,218 Q194,242 208,228 Q194,248 178,218 Z',
          part: 'gülen ağız',
          fill: '#2f3542',
        },
        {
          d: 'M186,234 Q194,232 202,230 Q196,242 186,234 Z',
          part: 'dil',
          fill: '#ff7979',
        },
      ],
    },
  ],
};

export default muz;
