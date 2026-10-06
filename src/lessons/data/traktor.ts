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

/** İş Makineleri 5: Kocaman arka tekerlekli, minik ön tekerlekli, bacası tüten bir traktör. */
const traktor: Lesson = {
  id: 'traktor',
  path: 'ismakineleri',
  title: 'Traktör',
  emoji: '🚜',
  order: 5,
  level: 1,
  skill: 'Bir büyük bir küçük tekerlek çizdin. Aynı şeklin farklı boylarını kullanmayı öğrendin!',
  palette: ['#ff6b4a', '#ffc93c', '#3a3a4a', '#aee3ff', '#eef1f8', '#2d2d2d'],
  steps: [
    {
      say: 'Önce yüksek bir kabin çiz. Yukarı çık, düz bir tavan yap ve sağ tarafından aşağı in.',
      shapes: [{ d: 'M92,202 L98,86 Q100,74 112,74 L192,74 Q204,74 206,86 L210,239', part: 'kabin', fill: '#ff6b4a' }],
    },
    {
      say: 'Kabinin sağına uzun bir motor kaputu çiz. Kabinin üstüne de dışarı taşan bir çatı koy.',
      shapes: [
        { d: 'M210,188 L340,188 Q354,188 354,202 L354,258 Q354,272 340,272 L220,272', part: 'kaput', fill: '#ff6b4a' },
        { d: rect(80, 60, 144, 18, 8), part: 'çatı', fill: '#ffc93c' },
      ],
    },
    {
      say: 'Kabinin altına kocaman bir arka tekerlek çiz. İçine sarı bir jant, ortasına da bir nokta koy.',
      shapes: [
        { d: circle(132, 280, 72), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(132, 280, 36), part: 'arka jant', fill: '#ffc93c' },
        { d: circle(132, 280, 10), part: 'arka göbek', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Büyük tekerleğin üstüne kavisli bir çamurluk çiz. Kaputun altına da küçük bir ön tekerlek ekle.',
      shapes: [
        { d: 'M44,280 A88,88 0 0,1 220,280 L204,280 A72,72 0 0,0 60,280 Z', part: 'çamurluk', fill: '#ffc93c' },
        { d: circle(300, 312, 40), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(300, 312, 18), part: 'ön jant', fill: '#ffc93c' },
      ],
    },
    {
      say: 'Kabine büyük bir cam çiz. Kaputun üstüne de dik bir egzoz borusu koy.',
      shapes: [
        { d: rect(112, 90, 82, 76, 8), part: 'cam', fill: '#aee3ff' },
        { d: rect(300, 120, 14, 68, 4), part: 'egzoz', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Kaputun üstüne iki yuvarlak göz çiz. İçlerine beyaz birer parıltı koy.',
      shapes: [
        { d: circle(250, 218, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(253, 214, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(296, 218, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(299, 214, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gülen bir ağız ve pembe yanaklar çiz. Kaputun önüne de sarı bir far ekle.',
      shapes: [
        { d: 'M260,240 Q273,252 286,240', part: 'ağız' },
        { d: ellipse(232, 242, 9, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(316, 242, 9, 6), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M354,204 Q366,204 366,216 Q366,228 354,228 Z', part: 'far', fill: '#fff4b0' },
      ],
    },
    {
      say: 'Egzozdan yukarı çıkan iki duman bulutu çiz. Traktör tarlaya gidiyor!',
      shapes: [
        { d: puff(314, 98, 20), part: 'küçük duman', fill: '#eef1f8' },
        { d: puff(280, 58, 28), part: 'büyük duman', fill: '#eef1f8' },
      ],
    },
  ],
};

export default traktor;
