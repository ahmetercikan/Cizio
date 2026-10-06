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

/** İş Makineleri 10: Dik direği ve çatallarıyla paletli koli taşıyan bir forklift. */
const forklift: Lesson = {
  id: 'forklift',
  path: 'ismakineleri',
  title: 'Forklift',
  emoji: '📦',
  order: 10,
  level: 2,
  skill: 'Dik bir direğe yatay çatallar ekleyip üstüne yük koydun. Parçaları dengede tutmayı öğrendin!',
  palette: ['#ff9f1c', '#3a3a4a', '#9aa3b2', '#c8814a', '#e8b878', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce tombul bir gövde çiz. Arkası yuvarlak, önü düz olsun.',
      shapes: [
        {
          d: 'M72,300 Q44,300 44,272 L44,240 Q44,208 76,208 L232,208 Q248,208 248,224 L248,300 Z',
          part: 'gövde',
          fill: '#ff9f1c',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne sürücüyü koruyan bir kafes çiz. Tepesine de düz bir tavan koy.',
      shapes: [
        { d: 'M96,208 L112,96 M230,208 L230,96', part: 'kafes' },
        { d: rect(100, 84, 142, 14, 6), part: 'tavan', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Kafesin içine bir koltuk ve küçük bir direksiyon çiz.',
      shapes: [
        { d: 'M128,208 L124,166 Q124,156 134,156 L144,156 Q152,156 152,166 L156,208', part: 'koltuk', fill: '#3a3a4a' },
        { d: 'M210,208 L194,162', part: 'direksiyon mili' },
        { d: ellipse(192, 158, 16, 6), part: 'direksiyon', fill: '#9aa3b2' },
      ],
    },
    {
      say: 'Gövdenin önüne yukarı uzanan uzun bir direk çiz. Yük bu direkte yukarı çıkar.',
      shapes: [
        { d: rect(250, 56, 22, 256, 4), part: 'direk', fill: '#9aa3b2' },
        { d: 'M261,60 L261,308', part: 'direk çizgisi' },
      ],
    },
    {
      say: 'Direğin önüne iki uzun çatal çiz. Biri arkada, biri önde dursun.',
      shapes: [
        { d: 'M272,226 L284,226 L284,250 L360,250 L360,258 L272,258 Z', part: 'arka çatal', fill: '#3a3a4a' },
        { d: 'M272,246 L280,246 L280,266 L350,266 L350,274 L272,274 Z', part: 'ön çatal', fill: '#5a5a6a' },
      ],
    },
    {
      say: 'Çatalların üstüne tahta bir palet, onun üstüne de kocaman bir koli çiz.',
      shapes: [
        { d: rect(286, 232, 72, 18, 3), part: 'palet', fill: '#e8b878' },
        { d: rect(290, 152, 64, 80, 6), part: 'koli', fill: '#c8814a' },
        { d: 'M322,152 L322,232', part: 'koli bandı' },
      ],
    },
    {
      say: 'Gövdenin altına iki tekerlek çiz. Öndeki biraz daha büyük olsun.',
      shapes: [
        { d: circle(96, 304, 30), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(96, 304, 11), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(210, 302, 34), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(210, 302, 12), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Gövdenin ortasına iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(132, 234, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(136, 229, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(168, 234, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(172, 229, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız ve iki pembe yanak çiz. Forklift koliyi taşıyor!',
      shapes: [
        { d: 'M139,254 Q150,265 161,254', part: 'ağız' },
        { d: ellipse(118, 255, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(182, 255, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default forklift;
