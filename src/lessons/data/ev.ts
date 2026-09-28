import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 3: Kare + üçgen = ev. Büyük parçadan küçük ayrıntılara gitmek. */
const ev: Lesson = {
  id: 'ev',
  path: 'nesneler',
  title: 'Şirin Ev',
  emoji: '🏠',
  order: 3,
  level: 2,
  skill: 'Önce büyük kare ve üçgeni, sonra kapı ve pencere gibi küçük ayrıntıları çizmeyi öğrendin!',
  palette: ['#ffd166', '#ff7b6b', '#9b6ef3', '#aee3ff', '#6ccf7f', '#c98a5e'],
  steps: [
    {
      say: 'Önce evin duvarı için büyük bir kare çiz. Üst kenardan başla ve dört köşeyi dolaş.',
      shapes: [{ d: 'M115,200 L285,200 L285,350 L115,350 Z', part: 'duvar', fill: '#ffd166' }],
    },
    {
      say: 'Karenin üstüne kocaman bir üçgen çatı çiz. Çatı iki yandan biraz taşsın.',
      shapes: [{ d: 'M85,200 L200,88 L315,200 Z', part: 'çatı', fill: '#ff7b6b' }],
    },
    {
      say: 'Duvarın ortasına, yere değen kemerli bir kapı çiz. Yanına da minik bir kapı kolu koy.',
      shapes: [
        { d: 'M175,350 L175,292 A25,25 0 0,1 225,292 L225,350', part: 'kapı', fill: '#9b6ef3' },
        { d: circle(213, 322, 5), part: 'kapı kolu', fill: '#ffd166' },
      ],
    },
    {
      say: 'Kapının iki yanına birer kare pencere çiz. İkisi aynı boyda olsun.',
      shapes: [
        { d: 'M128,218 L172,218 L172,262 L128,262 Z', part: 'sol pencere', fill: '#aee3ff' },
        { d: 'M228,218 L272,218 L272,262 L228,262 Z', part: 'sağ pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Her pencereye bir artı işareti çiz. Böylece dört küçük cam oluşur.',
      shapes: [
        { d: 'M150,218 L150,262', part: 'pencere çizgileri' },
        { d: 'M128,240 L172,240', part: 'pencere çizgileri' },
        { d: 'M250,218 L250,262', part: 'pencere çizgileri' },
        { d: 'M228,240 L272,240', part: 'pencere çizgileri' },
      ],
    },
    {
      say: 'Çatının sağına bir baca ekle. Çatının ortasına da yuvarlak küçük bir pencere çiz.',
      shapes: [
        { d: 'M245,132 L245,96 L272,96 L272,158', part: 'baca', fill: '#c98a5e' },
        { d: circle(200, 158, 18), part: 'yuvarlak pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Bacadan kıvrılan bir duman çiz. Evin iki yanına da yuvarlak çalılar ekle.',
      shapes: [
        { d: 'M258,88 Q236,78 256,64 Q276,50 254,36', part: 'duman' },
        { d: 'M50,350 A18,18 0 0,1 62,318 A20,20 0 0,1 98,316 A18,18 0 0,1 108,350 Z', part: 'sol çalı', fill: '#6ccf7f' },
        { d: 'M292,350 A18,18 0 0,1 302,316 A20,20 0 0,1 338,318 A18,18 0 0,1 350,350 Z', part: 'sağ çalı', fill: '#6ccf7f' },
      ],
    },
  ],
};

export default ev;
