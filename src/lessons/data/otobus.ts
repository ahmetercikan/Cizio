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

/** Taşıtlar 5: Uzun gövdeli, pencereli, güler yüzlü bir okul otobüsü. */
const otobus: Lesson = {
  id: 'otobus',
  path: 'tasitlar',
  title: 'Okul Otobüsü',
  emoji: '🚌',
  order: 5,
  level: 2,
  skill: 'Uzun bir gövdeye sıra sıra pencereler dizerek düzenli aralıklarla çizmeyi öğrendin!',
  palette: ['#ffc93c', '#aee3ff', '#3a3a4a', '#ff7b6b', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce upuzun, köşeleri yuvarlak bir gövde çiz. Alttaki iki yarım yuvarlak tekerlek yuvası olacak.',
      shapes: [
        {
          d:
            'M64,96 L318,96 Q350,96 354,128 L360,266 Q360,290 336,290 L326,290 ' +
            'A38,38 0 0,0 250,290 L150,290 A38,38 0 0,0 74,290 L64,290 Q40,290 40,266 L40,120 Q40,96 64,96 Z',
          part: 'gövde',
          fill: '#ffc93c',
        },
      ],
    },
    {
      say: 'Yuvaların içine iki büyük tekerlek çiz. Ortalarına da küçük birer daire koy.',
      shapes: [
        { d: circle(112, 292, 30), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(112, 292, 11), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(288, 292, 30), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(288, 292, 11), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Gövdenin üst kısmına yan yana üç kare pencere çiz. Aralarında eşit boşluk bırak.',
      shapes: [
        { d: rect(60, 116, 50, 50, 8), part: 'birinci pencere', fill: '#aee3ff' },
        { d: rect(124, 116, 50, 50, 8), part: 'ikinci pencere', fill: '#aee3ff' },
        { d: rect(188, 116, 50, 50, 8), part: 'üçüncü pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Sağ tarafa uzun bir kapı, en öne de eğik bir ön cam çiz. Kapının ortasına bir çizgi çek.',
      shapes: [
        { d: rect(252, 116, 38, 124, 6), part: 'kapı', fill: '#aee3ff' },
        { d: 'M271,116 L271,240', part: 'kapı çizgisi' },
        { d: 'M304,116 L332,116 Q346,118 348,138 L350,186 L304,186 Z', part: 'ön cam', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Pencerelerin altına, soldan kapıya kadar düz bir şerit çiz.',
      shapes: [{ d: 'M40,184 L252,184', part: 'şerit' }],
    },
    {
      say: 'Şeridin altına iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(160, 216, 13), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(164, 211, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(208, 216, 13), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(212, 211, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız, yanlarına pembe yanaklar, öne de sarı bir far çiz.',
      shapes: [
        { d: 'M170,236 Q184,252 198,236', part: 'ağız' },
        { d: ellipse(134, 236, 11, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(234, 236, 11, 6), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M359,216 L346,216 Q336,216 336,227 Q336,238 346,238 L360,238', part: 'far', fill: '#fff4b0' },
      ],
    },
    {
      say: 'Çatının üstüne iki küçük kırmızı lamba çiz. Okul otobüsü yola çıkmaya hazır!',
      shapes: [
        { d: 'M66,96 L66,84 Q66,76 74,76 L90,76 Q98,76 98,84 L98,96', part: 'arka lamba', fill: '#ff7b6b' },
        { d: 'M300,96 L300,84 Q300,76 308,76 L324,76 Q332,76 332,84 L332,96', part: 'ön lamba', fill: '#ff7b6b' },
      ],
    },
  ],
};

export default otobus;
