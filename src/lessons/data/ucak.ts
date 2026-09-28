import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Taşıtlar 2: Yandan görünen pervaneli uçak. Parçaları gövdenin doğru yerine oturtmak. */
const ucak: Lesson = {
  id: 'ucak',
  path: 'tasitlar',
  title: 'Minik Uçak',
  emoji: '✈️',
  order: 2,
  level: 2,
  skill: 'Bir taşıtı yandan çizmeyi öğrendin! Önce uzun gövde, sonra kanat, kuyruk ve pervane yerine oturur.',
  palette: ['#4fa3ff', '#ffd166', '#aee3ff', '#ff6b6b', '#ffffff'],
  steps: [
    {
      say: 'Önce uzun bir gövde çiz. Sağ ucu yuvarlak burun, sol ucu yukarı kalkan kuyruk olsun.',
      shapes: [
        {
          d: 'M72,165 Q120,178 150,178 L262,178 Q318,180 318,212 Q318,244 262,246 L140,246 Q95,244 72,165 Z',
          part: 'gövde',
          fill: '#4fa3ff',
        },
      ],
    },
    {
      say: 'Gövdenin sol ucuna dik bir kuyruk çiz. Gövdeden başla, yukarı çık ve geri in.',
      shapes: [{ d: 'M88,171 L66,104 L102,104 L137,178', part: 'kuyruk', fill: '#ff6b6b' }],
    },
    {
      say: 'Gövdenin altına büyük bir kanat, üstüne de arkadaki küçük kanadı çiz.',
      shapes: [
        { d: 'M150,246 L110,306 Q104,316 118,316 L172,316 Q186,316 194,306 L232,246', part: 'ön kanat', fill: '#ffd166' },
        { d: 'M180,178 L166,146 Q163,138 172,138 L196,138 Q204,138 208,146 L226,178', part: 'arka kanat', fill: '#ffd166' },
      ],
    },
    {
      say: 'Gövdenin ortasına üç yuvarlak pencere çiz. Aralarında eşit boşluk bırak.',
      shapes: [
        { d: circle(172, 208, 13), part: 'birinci pencere', fill: '#aee3ff' },
        { d: circle(210, 208, 13), part: 'ikinci pencere', fill: '#aee3ff' },
        { d: circle(248, 208, 13), part: 'üçüncü pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Burnun ucuna küçük bir daire, onun üstüne ve altına da birer uzun pervane kanadı çiz.',
      shapes: [
        { d: circle(328, 212, 10), part: 'pervane göbeği', fill: '#ff6b6b' },
        { d: ellipse(332, 168, 9, 34), part: 'üst pervane', fill: '#ffffff' },
        { d: ellipse(332, 256, 9, 34), part: 'alt pervane', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gökyüzüne iki yumuşak bulut ekle. Uçağımız bulutların arasında süzülüyor!',
      shapes: [
        { d: 'M226,92 A16,16 0 0,1 240,64 A22,22 0 0,1 280,58 A18,18 0 0,1 310,76 A14,14 0 0,1 310,92 Z', part: 'üst bulut', fill: '#ffffff' },
        { d: 'M40,352 A14,14 0 0,1 52,326 A20,20 0 0,1 88,322 A16,16 0 0,1 114,338 A12,12 0 0,1 114,352 Z', part: 'alt bulut', fill: '#ffffff' },
      ],
    },
  ],
};

export default ucak;
