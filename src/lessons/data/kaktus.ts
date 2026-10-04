import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Doğa 7: Saksıda kaktüs. Önce saksı, sonra saksıdan çıkan gövde ve yukarı kalkmış kollar. */
const kaktus: Lesson = {
  id: 'kaktus',
  path: 'doga',
  title: 'Saksıda Kaktüs',
  emoji: '🌵',
  order: 7,
  level: 1,
  skill: 'Kaktüsü saksının kenarından başlattın, kolları da gövdeye yapıştırdın. Parçalar birbirine değince bütün olur!',
  palette: ['#5cc56a', '#e07a4f', '#c9603a', '#ff7eb6', '#ffd84d', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce aşağıya saksıyı çiz. Üstte yassı bir kenar, altında aşağı doğru daralan bir kova olsun.',
      shapes: [
        { d: 'M118,268 L282,268 Q290,268 290,276 L290,292 Q290,300 282,300 L118,300 Q110,300 110,292 L110,276 Q110,268 118,268 Z', part: 'saksı kenarı', fill: '#c9603a' },
        { d: 'M126,300 L146,364 L254,364 L274,300', part: 'saksı', fill: '#e07a4f' },
      ],
    },
    {
      say: 'Saksının kenarından başla, yukarı uzun bir gövde çiz. Tepesini yuvarlat ve yine saksıda bitir.',
      shapes: [{ d: 'M140,268 L140,120 C140,60 260,60 260,120 L260,268', part: 'gövde', fill: '#5cc56a' }],
    },
    {
      say: 'Gövdenin iki yanına yukarı kalkmış birer kol çiz. Kollar U harfi gibi kıvrılsın.',
      shapes: [
        { d: 'M140,236 L110,236 Q84,236 84,210 L84,160 Q84,140 103,140 Q122,140 122,160 L122,198 L140,198', part: 'sol kol', fill: '#5cc56a' },
        { d: 'M260,190 L290,190 Q316,190 316,164 L316,114 Q316,94 297,94 Q278,94 278,114 L278,152 L260,152', part: 'sağ kol', fill: '#5cc56a' },
      ],
    },
    {
      say: 'Gövdenin üst kısmına iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(180, 152, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(220, 152, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(176, 147, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(216, 147, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M184,180 Q200,196 216,180', part: 'ağız' },
        { d: oval(160, 180, 11, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: oval(240, 180, 11, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Gövdeye ve kollara minik dikenler çiz. Her biri küçük, kısa bir çizgi olsun.',
      shapes: [
        { d: 'M168,224 L159,216 M232,224 L241,216 M200,248 L200,236', part: 'gövde dikenleri' },
        { d: 'M103,174 L103,162 M297,128 L297,116', part: 'kol dikenleri' },
      ],
    },
    {
      say: 'Kaktüsün tepesine beş yapraklı küçük bir çiçek çiz. Ortasına da sarı bir göbek koy.',
      shapes: [
        {
          d: 'M194.8,42.8 A12,12 0 1,1 205.2,42.8 A12,12 0 1,1 208.5,52.8 A12,12 0 1,1 200,58.9 A12,12 0 1,1 191.5,52.8 A12,12 0 1,1 194.8,42.8 Z',
          part: 'çiçek',
          fill: '#ff7eb6',
        },
        { d: circle(200, 50, 10), part: 'çiçek göbeği', fill: '#ffd84d' },
      ],
    },
    {
      say: 'Son olarak saksının ortasına soldan sağa dalgalı bir şerit çiz. Kaktüsün hazır!',
      shapes: [{ d: 'M136,332 Q150,320 164,332 Q178,344 192,332 Q206,320 220,332 Q234,344 248,332 Q256,326 264,330', part: 'saksı deseni' }],
    },
  ],
};

export default kaktus;
