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

/** İş Makineleri 8: Önünde kocaman merdanesi olan, yolu dümdüz eden bir yol silindiri. */
const silindir: Lesson = {
  id: 'silindir',
  path: 'ismakineleri',
  title: 'Yol Silindiri',
  emoji: '🚧',
  order: 8,
  level: 1,
  skill: 'Kutuları ve büyük daireleri bir araya getirerek koca bir iş makinesi çizdin!',
  palette: ['#ffc93c', '#9aa3b2', '#3a3a4a', '#aee3ff', '#ff9f1c', '#2d2d2d'],
  steps: [
    {
      say: 'Önce uzun, alçak bir gövde çiz. Köşeleri yuvarlak olsun.',
      shapes: [{ d: rect(46, 190, 214, 88, 14), part: 'gövde', fill: '#ffc93c' }],
    },
    {
      say: 'Gövdenin üstüne, sol tarafa büyük bir kabin çiz.',
      shapes: [{ d: rect(64, 92, 140, 98, 16), part: 'kabin', fill: '#ffc93c' }],
    },
    {
      say: 'Kabine büyük bir pencere, tepesine turuncu bir lamba, gövdeye de bir egzoz borusu çiz.',
      shapes: [
        { d: rect(82, 108, 104, 58, 10), part: 'pencere', fill: '#aee3ff' },
        { d: 'M118,92 L118,82 Q118,70 134,70 Q150,70 150,82 L150,92', part: 'lamba', fill: '#ff9f1c' },
        { d: 'M222,190 L222,140 Q222,132 230,132 Q238,132 238,140 L238,190', part: 'egzoz', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Sağ tarafa kocaman bir silindir çiz. Ortasına da küçük bir daire koy.',
      shapes: [
        { d: circle(286, 280, 60), part: 'silindir', fill: '#9aa3b2' },
        { d: circle(286, 280, 16), part: 'silindir göbeği', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Silindirin üstüne kavisli bir çamurluk, sol alta da bir tekerlek çiz.',
      shapes: [
        { d: 'M214,280 A72,72 0 0,1 358,280 L348,280 A62,62 0 0,0 224,280 Z', part: 'çamurluk', fill: '#ffc93c' },
        { d: circle(98, 292, 46), part: 'tekerlek', fill: '#3a3a4a' },
        { d: circle(98, 292, 16), part: 'jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Gövdenin ortasına iki yuvarlak göz çiz. Beyaz parıltıları unutma.',
      shapes: [
        { d: circle(164, 222, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(168, 217, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(200, 222, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(204, 217, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gülen bir ağız, pembe yanaklar ve altına dümdüz bir yol çiz. Silindir yolu düzlüyor!',
      shapes: [
        { d: 'M170,246 Q182,258 194,246', part: 'ağız' },
        { d: ellipse(152, 246, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(212, 246, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M40,340 L360,340', part: 'yol' },
      ],
    },
  ],
};

export default silindir;
