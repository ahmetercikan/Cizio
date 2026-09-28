import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Beş köşeli yıldız: tepeden başlayıp saat yönünde tek hamlede. */
const star = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? R : R * 0.45;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
};

/** Karakterler 3: Uzay gemisindeki uzaylı. Simetri: iki tarafı aynı çizmek. */
const uzayli: Lesson = {
  id: 'uzayli',
  path: 'karakterler',
  title: 'Uzaylı ve Uzay Gemisi',
  emoji: '👽',
  order: 3,
  level: 2,
  skill: 'Simetriyi öğrendin! Bir tarafa ne çizersen, öbür tarafa da aynısını çizince her şey dengeli olur.',
  palette: ['#8ee06b', '#9aa7ff', '#d6f3ff', '#ffe066', '#ff7eb6', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman, yuvarlak bir cam kubbe çiz. Soldan başla, yukarıdan dolaşıp sağa in.',
      shapes: [{ d: 'M100,230 A110,110 0 1,1 300,230', part: 'cam kubbe', fill: '#d6f3ff' }],
    },
    {
      say: 'Kubbenin altına yayvan, uzun bir oval çiz. Bu uzay gemisinin gövdesi.',
      shapes: [{ d: ellipse(200, 262, 155, 42), part: 'uzay gemisi', fill: '#9aa7ff' }],
    },
    {
      say: 'Geminin altına yarım bir kavis çiz. Ortasına ve iki yanına da yuvarlak ışıklar koy.',
      shapes: [
        { d: 'M130,300 Q200,345 270,300', part: 'geminin altı', fill: '#7482e6' },
        { d: circle(110, 262, 11), part: 'sol ışık', fill: '#ffe066' },
        { d: circle(200, 280, 11), part: 'orta ışık', fill: '#ffe066' },
        { d: circle(290, 262, 11), part: 'sağ ışık', fill: '#ffe066' },
      ],
    },
    {
      say: 'Kubbenin içine uzaylının yuvarlak kafasını çiz. Geminin kenarından başlayıp yine oraya dön.',
      shapes: [{ d: 'M160,221 A56,56 0 1,1 240,221', part: 'kafa', fill: '#8ee06b' }],
    },
    {
      say: 'Kafanın tepesine iki anten çiz, uçlarına top koy. Sağdaki soldakinin aynısı olsun.',
      shapes: [
        { d: 'M181,129 L170,104', part: 'sol anten' },
        { d: circle(168, 97, 8), part: 'sol anten topu', fill: '#ff7eb6' },
        { d: 'M219,129 L230,104', part: 'sağ anten' },
        { d: circle(232, 97, 8), part: 'sağ anten topu', fill: '#ff7eb6' },
      ],
    },
    {
      say: 'Kafanın ortasına iki büyük göz çiz. İkisi aynı boyda olsun, parıltıları da unutma.',
      shapes: [
        { d: circle(178, 180, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(183, 175, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(222, 180, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(227, 175, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına minik bir gülümseme, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M186,203 Q200,215 214,203', part: 'ağız' },
        { d: ellipse(160, 203, 9, 5), part: 'sol yanak', fill: '#ff9ec0' },
        { d: ellipse(240, 203, 9, 5), part: 'sağ yanak', fill: '#ff9ec0' },
      ],
    },
    {
      say: 'Gökyüzüne iki parlak yıldız ekle. Uzaylımız uzayda uçuyor!',
      shapes: [
        { d: star(62, 92, 22), part: 'sol yıldız', fill: '#ffd23f' },
        { d: star(338, 118, 20), part: 'sağ yıldız', fill: '#ffd23f' },
      ],
    },
  ],
};

export default uzayli;
