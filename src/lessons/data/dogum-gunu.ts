import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
/** Krema akıntısı: sol üst köşeden başlayıp damla damla sağ üst köşeye giden dalgalı çizgi. */
const drips = (x0: number, x1: number, y: number, count: number, depth: number) => {
  const w = (x1 - x0) / count;
  let d = `M${x0},${y}`;
  for (let k = 0; k < count; k++) {
    const a = x0 + k * w;
    const deep = k % 2 === 0 ? depth : depth * 0.55;
    d += ` Q${a + w * 0.05},${y + deep} ${a + w * 0.5},${y + deep}`;
    d += ` Q${a + w * 0.95},${y + deep} ${a + w},${y}`;
  }
  return d;
};
/** Mum alevi: alttan başlayıp sivri tepeye çıkan damla. */
const flame = (cx: number, bottom: number) =>
  `M${cx},${bottom} Q${cx - 13},${bottom - 12} ${cx},${bottom - 34} Q${cx + 13},${bottom - 12} ${cx},${bottom} Z`;

/** Özel Günler 4: Doğum günü pastası. Katları üst üste oturtmak, kremayı dalgalı çizgiyle akıtmak. */
const dogumGunu: Lesson = {
  id: 'dogum-gunu',
  path: 'ozel',
  title: 'Doğum Günü Pastası',
  emoji: '🎂',
  order: 4,
  level: 1,
  skill: 'Katları üst üste oturtmayı ve kremayı dalgalı bir çizgiyle akıtmayı öğrendin! Nice mutlu yıllara!',
  palette: ['#ff9ec0', '#b18cff', '#fff6fa', '#aee3ff', '#ffd166', '#ffa53d'],
  steps: [
    {
      say: 'Önce pastanın alt katı için geniş bir dikdörtgen çiz. Sol üst köşeden başla.',
      shapes: [{ d: 'M70,236 L330,236 L330,336 L70,336 Z', part: 'alt kat', fill: '#ff9ec0' }],
    },
    {
      say: 'Alt katın üstüne daha dar ikinci bir kat çiz. Alt katın çizgisinden başla ve oraya dön.',
      shapes: [{ d: 'M112,236 L112,150 L288,150 L288,236', part: 'üst kat', fill: '#b18cff' }],
    },
    {
      say: 'Her katın üst köşesinden diğerine dalgalı bir krema çiz. Krema aşağı doğru damla damla aksın.',
      shapes: [
        { d: drips(112, 288, 152, 5, 32), part: 'üst krema', fill: '#fff6fa' },
        { d: drips(70, 330, 238, 7, 30), part: 'alt krema', fill: '#fff6fa' },
      ],
    },
    {
      say: 'Pastanın altına bir tabak çiz. Alt katın köşelerinden başla, iki yana taşsın.',
      shapes: [{ d: 'M70,336 L46,336 Q34,354 58,360 L342,360 Q366,354 354,336 L330,336', part: 'tabak', fill: '#aee3ff' }],
    },
    {
      say: 'Pastanın tepesine üç ince, uzun mum çiz. Aralarında eşit boşluk bırak.',
      shapes: [
        { d: 'M150,150 L150,100 L168,100 L168,150', part: 'sol mum', fill: '#6cc4ff' },
        { d: 'M191,150 L191,92 L209,92 L209,150', part: 'orta mum', fill: '#ffd166' },
        { d: 'M232,150 L232,100 L250,100 L250,150', part: 'sağ mum', fill: '#7ed957' },
      ],
    },
    {
      say: 'Her mumun üstüne damla gibi sivri bir alev çiz. Mumlar yanıyor, dilek tutma zamanı!',
      shapes: [
        { d: flame(159, 94), part: 'sol alev', fill: '#ffa53d' },
        { d: flame(200, 86), part: 'orta alev', fill: '#ffa53d' },
        { d: flame(241, 94), part: 'sağ alev', fill: '#ffa53d' },
      ],
    },
    {
      say: 'Alt kata renkli şeker taneleri serp. Küçük yuvarlaklar çiz, pasta hazır!',
      shapes: [
        { d: circle(104, 300, 8), part: 'şeker', fill: '#ffd166' },
        { d: circle(156, 312, 8), part: 'şeker', fill: '#6cc4ff' },
        { d: circle(206, 298, 8), part: 'şeker', fill: '#7ed957' },
        { d: circle(254, 312, 8), part: 'şeker', fill: '#ffd166' },
        { d: circle(298, 298, 8), part: 'şeker', fill: '#6cc4ff' },
      ],
    },
  ],
};

export default dogumGunu;
