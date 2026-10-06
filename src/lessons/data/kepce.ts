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

/** İş Makineleri 3: Paletli, iki parçalı kollu, dişli kepçesiyle toprak kazan bir ekskavatör. */
const kepce: Lesson = {
  id: 'kepce',
  path: 'ismakineleri',
  title: 'Kazıcı Kepçe',
  emoji: '🏗️',
  order: 3,
  level: 2,
  skill: 'Kolu iki parça halinde çizip eklem yerlerinden bağladın. Bükülen şekilleri parça parça çizmeyi öğrendin!',
  palette: ['#ffc93c', '#ff9f1c', '#3a3a4a', '#aee3ff', '#d0d4dc', '#2d2d2d'],
  steps: [
    {
      say: 'Önce en alta uzun, iki ucu yuvarlak bir palet çiz. Kepçe bunun üstünde yürüyecek.',
      shapes: [{ d: rect(44, 282, 216, 64, 32), part: 'palet', fill: '#3a3a4a' }],
    },
    {
      say: 'Paletin üstüne geniş bir gövde, onun üstüne de yüksek bir kabin çiz.',
      shapes: [
        { d: rect(52, 214, 200, 68, 12), part: 'gövde', fill: '#ffc93c' },
        { d: 'M70,214 L70,112 Q70,96 86,96 L160,96 Q176,96 180,112 L196,214', part: 'kabin', fill: '#ffc93c' },
      ],
    },
    {
      say: 'Gövdenin sağından yukarı kıvrılan kalın bir kol çiz. Tepeden aşağı inen ikinci kolu ekle, birleştikleri yere vida koy.',
      shapes: [
        { d: 'M206,224 Q222,128 290,78 Q308,66 318,82 Q262,124 246,224 Z', part: 'büyük kol', fill: '#ff9f1c' },
        { d: 'M296,86 L318,74 L354,226 L330,234 Z', part: 'küçük kol', fill: '#ff9f1c' },
        { d: circle(306, 86, 8), part: 'dirsek vidası', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kolun ucuna yarım ay gibi bir kepçe çiz. Altına sivri dişler, üstüne de bir vida ekle.',
      shapes: [
        { d: 'M318,226 L362,234 Q370,290 338,310 L282,310 Q294,266 318,226 Z', part: 'kepçe', fill: '#ffc93c' },
        { d: 'M282,310 L289,328 L296,310 L303,328 L310,310 L317,328 L324,310 L331,328 L338,310', part: 'dişler', fill: '#d0d4dc' },
        { d: circle(340, 232, 7), part: 'kepçe vidası', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Paletin içine yan yana üç yuvarlak tekerlek çiz. Aralarındaki boşluklar eşit olsun.',
      shapes: [
        { d: circle(84, 314, 18), part: 'sol palet tekerleği', fill: '#d0d4dc' },
        { d: circle(152, 314, 18), part: 'orta palet tekerleği', fill: '#d0d4dc' },
        { d: circle(220, 314, 18), part: 'sağ palet tekerleği', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kabine büyük bir cam çiz. Gövdenin arkasına da uzun bir egzoz borusu ekle.',
      shapes: [
        { d: 'M86,112 L156,112 Q164,112 166,120 L176,160 L86,160 Z', part: 'cam', fill: '#aee3ff' },
        { d: rect(56, 178, 12, 36, 4), part: 'egzoz', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Camın altına iki yuvarlak göz çiz. İçlerine beyaz birer parıltı koy.',
      shapes: [
        { d: circle(108, 180, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(111, 176, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(150, 180, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(153, 176, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız ve pembe yanaklar çiz. Kepçe kazmaya hazır!',
      shapes: [
        { d: 'M117,198 Q129,210 141,198', part: 'ağız' },
        { d: ellipse(92, 200, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(168, 200, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kepce;
