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

/** İş Makineleri 7: Kafes kuleli, uzun kollu, kancasında kutu taşıyan bir kule vinç. */
const vinc: Lesson = {
  id: 'vinc',
  path: 'ismakineleri',
  title: 'Kule Vinç',
  emoji: '🏗️',
  order: 7,
  level: 3,
  skill: 'Uzun dik bir kule ile yatay bir kolu birleştirdin. Zikzak çizgilerle kafes yapmayı öğrendin!',
  palette: ['#ffc93c', '#9aa3b2', '#aee3ff', '#c8814a', '#3a3a4a', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce yere sağlam bir beton taban, üstüne de upuzun, ince bir kule çiz.',
      shapes: [
        { d: rect(104, 336, 116, 26, 6), part: 'taban', fill: '#9aa3b2' },
        { d: rect(140, 108, 44, 228, 2), part: 'kule', fill: '#ffc93c' },
      ],
    },
    {
      say: 'Kulenin içine yukarıdan aşağıya zikzak bir çizgi çek. Kule kafes gibi görünsün.',
      shapes: [{ d: 'M140,108 L184,146 L140,184 L184,222 L140,260 L184,298 L140,336', part: 'kafes' }],
    },
    {
      say: 'Kulenin tepesine soldan sağa uzanan upuzun bir kol çiz. İçine de zikzak çizgi çek.',
      shapes: [
        { d: rect(44, 86, 316, 22, 3), part: 'kol', fill: '#ffc93c' },
        {
          d: 'M44,108 L66,86 L88,108 L110,86 L132,108 M196,108 L218,86 L240,108 L262,86 L284,108 L306,86 L328,108 L350,86',
          part: 'kol kafesi',
        },
      ],
    },
    {
      say: 'Kolun ortasına sivri bir tepe çiz. Tepeden kolun iki ucuna birer ip çek.',
      shapes: [
        { d: 'M146,86 L162,44 L178,86', part: 'tepe', fill: '#ffc93c' },
        { d: 'M162,44 L56,86', part: 'sol ip' },
        { d: 'M162,44 L340,86', part: 'sağ ip' },
      ],
    },
    {
      say: 'Kulenin yanına camlı bir kabin, kolun sol ucuna da ağır bir karşı ağırlık çiz.',
      shapes: [
        { d: rect(188, 110, 70, 58, 12), part: 'kabin', fill: '#aee3ff' },
        { d: rect(50, 108, 50, 36, 4), part: 'karşı ağırlık', fill: '#9aa3b2' },
      ],
    },
    {
      say: 'Kolun sağına küçük bir araba çiz. Ondan aşağı uzun bir halat sarkıt, ucuna kanca tak.',
      shapes: [
        { d: rect(280, 108, 32, 12, 3), part: 'araba', fill: '#3a3a4a' },
        { d: 'M296,120 L296,234', part: 'halat' },
        { d: 'M296,234 L296,250 Q296,264 284,264 Q274,264 272,254', part: 'kanca' },
      ],
    },
    {
      say: 'Kancaya iki ip as, iplerin ucuna da kocaman bir tahta kutu çiz.',
      shapes: [
        { d: 'M262,282 L284,262 L330,282', part: 'askı ipleri' },
        { d: rect(252, 282, 88, 56, 6), part: 'kutu', fill: '#c8814a' },
        { d: 'M252,310 L340,310', part: 'kutu çizgisi' },
      ],
    },
    {
      say: 'Kabinin içine iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(210, 134, 9), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(213, 130, 3), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(236, 134, 9), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(239, 130, 3), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız ve iki pembe yanak çiz. Vinç kutuyu kaldırıyor!',
      shapes: [
        { d: 'M213,152 Q223,161 233,152', part: 'ağız' },
        { d: ellipse(199, 152, 6, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(247, 152, 6, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default vinc;
