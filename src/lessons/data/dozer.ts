import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Köşeleri yuvarlatılmış dikdörtgen. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

/** İş Makineleri 4: Paletli, önünde kocaman bıçağı olan, toprağı iten güler yüzlü bir buldozer. */
const dozer: Lesson = {
  id: 'dozer',
  path: 'ismakineleri',
  title: 'Buldozer',
  emoji: '🚧',
  order: 4,
  level: 2,
  skill: 'Kutuları üst üste dizip öne kocaman bir bıçak ekledin. Büyük parçaları sırayla birleştirmeyi öğrendin!',
  palette: ['#ffc93c', '#ff9f1c', '#3a3a4a', '#aee3ff', '#d0d4dc', '#2d2d2d'],
  steps: [
    {
      say: 'Önce en alta uzun, iki ucu yuvarlak bir palet çiz. Buldozer bununla her yere gider.',
      shapes: [{ d: rect(44, 262, 236, 76, 38), part: 'palet', fill: '#3a3a4a' }],
    },
    {
      say: 'Paletin üstüne uzun bir gövde çiz. Gövdenin sol tarafına da yüksek bir kabin ekle.',
      shapes: [
        { d: rect(54, 192, 226, 72, 12), part: 'gövde', fill: '#ffc93c' },
        { d: 'M66,192 L66,100 Q66,86 80,86 L166,86 Q180,86 180,100 L180,192', part: 'kabin', fill: '#ffc93c' },
      ],
    },
    {
      say: 'Kabinin üstüne taşan bir çatı ve içine büyük bir cam çiz. Gövdenin üstüne de egzoz borusu koy.',
      shapes: [
        { d: rect(54, 74, 138, 18, 6), part: 'çatı', fill: '#ff9f1c' },
        { d: rect(82, 106, 82, 66, 8), part: 'cam', fill: '#aee3ff' },
        { d: rect(230, 138, 16, 54, 4), part: 'egzoz', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Paletin içine, sol tarafa doğru yan yana üç yuvarlak tekerlek çiz.',
      shapes: [
        { d: circle(84, 300, 20), part: 'sol palet tekerleği', fill: '#d0d4dc' },
        { d: circle(146, 300, 20), part: 'orta palet tekerleği', fill: '#d0d4dc' },
        { d: circle(208, 300, 20), part: 'sağ palet tekerleği', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Öne vidalı kalın bir kol uzat. Ucuna kocaman, kıvrık bir bıçak çiz. Gövdeden bıçağa bir piston çek.',
      shapes: [
        { d: 'M228,288 L306,280 L306,304 L228,312 Z', part: 'itme kolu', fill: '#ff9f1c' },
        { d: 'M272,202 L304,216', part: 'piston' },
        { d: circle(238, 300, 7), part: 'kol vidası', fill: '#d0d4dc' },
        { d: 'M298,176 L336,172 Q318,256 360,340 L298,340 Q284,258 298,176 Z', part: 'bıçak', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Gövdenin ön tarafına iki yuvarlak göz çiz. İçlerine beyaz birer parıltı koy.',
      shapes: [
        { d: circle(208, 218, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(211, 214, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(250, 218, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(253, 214, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gülen bir ağız, pembe yanaklar ve çatıya turuncu bir lamba çiz. Buldozer toprağı itmeye hazır!',
      shapes: [
        { d: 'M217,238 Q229,250 241,238', part: 'ağız' },
        { d: ellipse(194, 240, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(264, 240, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M110,74 L110,64 Q110,54 120,54 L130,54 Q140,54 140,64 L140,74', part: 'tepe lambası', fill: '#ff9f1c' },
      ],
    },
  ],
};

export default dozer;
