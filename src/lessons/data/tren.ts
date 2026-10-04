import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Kabarık duman bulutu: altı yayvan, üstü üç tümsekli. */
const puff = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy + r * 0.3} A${r * 0.5},${r * 0.5} 0 0,1 ${cx - r * 0.45},${cy - r * 0.45} ` +
  `A${r * 0.55},${r * 0.55} 0 0,1 ${cx + r * 0.45},${cy - r * 0.45} A${r * 0.5},${r * 0.5} 0 0,1 ${cx + r},${cy + r * 0.3} ` +
  `A${r},${r * 0.45} 0 0,1 ${cx - r},${cy + r * 0.3} Z`;
/** Köşeleri yuvarlatılmış dikdörtgen. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

/** Taşıtlar 6: Bacasından duman çıkan lokomotif ve bir vagon. */
const tren: Lesson = {
  id: 'tren',
  path: 'tasitlar',
  title: 'Neşeli Tren',
  emoji: '🚂',
  order: 6,
  level: 2,
  skill: 'Uzun ve kısa kutuları yan yana dizip tekerleklerle birleştirerek bir tren kurdun!',
  palette: ['#ff6b6b', '#4fa3ff', '#3a3a4a', '#ffe066', '#aee3ff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce lokomotifi çiz. Solda uzun bir kabin, sağında daha alçak, uzun bir burun olsun.',
      shapes: [
        {
          d: 'M196,282 L196,124 Q196,110 210,110 L260,110 Q274,110 274,124 L274,174 L342,174 Q358,174 358,190 L358,282 Z',
          part: 'lokomotif',
          fill: '#ff6b6b',
        },
      ],
    },
    {
      say: 'Kabinin üstüne taşan bir çatı çiz. Burnun üstüne de huni gibi açılan bir baca ekle.',
      shapes: [
        { d: rect(186, 94, 98, 18, 6), part: 'çatı', fill: '#3a3a4a' },
        { d: 'M302,174 L306,138 L292,120 L340,120 L326,138 L330,174', part: 'baca', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Kabinin altına büyük bir tekerlek, burnun altına küçük bir tekerlek çiz. Ortalarına nokta koy.',
      shapes: [
        { d: circle(236, 288, 32), part: 'büyük tekerlek', fill: '#3a3a4a' },
        { d: circle(236, 288, 10), part: 'büyük jant', fill: '#ffe066' },
        { d: circle(324, 296, 24), part: 'küçük tekerlek', fill: '#3a3a4a' },
        { d: circle(324, 296, 8), part: 'küçük jant', fill: '#ffe066' },
      ],
    },
    {
      say: 'Lokomotifin soluna bir vagon çiz. Kısa bir çizgiyle lokomotife bağla, altına da bir şerit çek.',
      shapes: [
        { d: rect(44, 170, 140, 112, 12), part: 'vagon', fill: '#4fa3ff' },
        { d: 'M184,262 L196,262', part: 'bağlantı' },
        { d: rect(44, 242, 140, 14, 0), part: 'vagon şeridi', fill: '#ffe066' },
      ],
    },
    {
      say: 'Vagonun altına iki tekerlek çiz. Kabine bir pencere, vagona da iki pencere ekle.',
      shapes: [
        { d: circle(82, 298, 22), part: 'vagon sol tekerlek', fill: '#3a3a4a' },
        { d: circle(146, 298, 22), part: 'vagon sağ tekerlek', fill: '#3a3a4a' },
        { d: rect(212, 128, 46, 40, 8), part: 'kabin penceresi', fill: '#aee3ff' },
        { d: rect(62, 188, 104, 40, 8), part: 'vagon penceresi', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Burnun üstüne iki yuvarlak göz, altına gülen bir ağız çiz. Öne de üçgen bir tampon ekle.',
      shapes: [
        { d: circle(300, 210, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(334, 210, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M304,236 Q317,250 330,236', part: 'ağız' },
        { d: 'M358,246 L372,282 L358,282', part: 'tampon', fill: '#ffe066' },
      ],
    },
    {
      say: 'Gözlere beyaz parıltı koy. Ağzın iki yanına da pembe birer yanak çiz.',
      shapes: [
        { d: circle(303, 206, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(337, 206, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: ellipse(288, 232, 7, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(346, 232, 7, 5), part: 'sağ yanak', fill: '#ffb3c1' },
              ],
    },
    {
      say: 'Bacadan yukarı doğru büyüyen üç duman bulutu çiz. Altına da uzun bir ray çek. Çuf çuf!',
      shapes: [
        { d: puff(322, 94, 18), part: 'küçük duman', fill: '#eef1f8' },
        { d: puff(280, 66, 24), part: 'orta duman', fill: '#eef1f8' },
        { d: puff(222, 44, 30), part: 'büyük duman', fill: '#eef1f8' },
        { d: 'M30,326 L370,326', part: 'ray' },
      ],
    },
  ],
};

export default tren;
