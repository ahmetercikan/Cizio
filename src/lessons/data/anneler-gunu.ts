import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const n = (v: number) => Math.round(v * 100) / 100;
/** Kalp: üstteki çukurdan başlayıp sol tümsekten sivri uca, oradan sağ tümsekle geri dönen tek çizgi. */
const heart = (cx: number, top: number, w: number, h: number) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const dip = top + h * 0.22, mid = top + h * 0.34, tip = top + h;
  return (
    `M${n(cx)},${n(dip)} C${n(cx - w * 0.12)},${n(top - h * 0.05)} ${n(x0)},${n(top)} ${n(x0)},${n(mid)} ` +
    `C${n(x0)},${n(top + h * 0.62)} ${n(cx - w * 0.3)},${n(top + h * 0.78)} ${n(cx)},${n(tip)} ` +
    `C${n(cx + w * 0.3)},${n(top + h * 0.78)} ${n(x1)},${n(top + h * 0.62)} ${n(x1)},${n(mid)} ` +
    `C${n(x1)},${n(top)} ${n(cx + w * 0.12)},${n(top - h * 0.05)} ${n(cx)},${n(dip)} Z`
  );
};
/** Tek hamlede çizilen yuvarlak taç yapraklı çiçek. */
const flower = (cx: number, cy: number, R: number, petals: number) => {
  const pts: [number, number][] = [];
  for (let k = 0; k < petals; k++) {
    const a = ((-90 + (k + 0.5) * (360 / petals)) * Math.PI) / 180;
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  const r = R * Math.sin(Math.PI / petals) * 1.25;
  return `M${n(pts[0][0])},${n(pts[0][1])} ` + pts.map((_, k) => {
    const [x, y] = pts[(k + 1) % petals];
    return `A${n(r)},${n(r)} 0 1,1 ${n(x)},${n(y)}`;
  }).join(' ') + ' Z';
};

/** Özel Günler 3: Anneler Günü kartı. Kalbi tek hamlede çizmek. */
const annelerGunu: Lesson = {
  id: 'anneler-gunu',
  path: 'ozel',
  title: 'Anneler Günü Kartı',
  emoji: '💌',
  order: 3,
  level: 2,
  skill: 'Kalbi iki yuvarlak tümsek ve sivri bir uçla tek hamlede çizmeyi öğrendin! Annene sevgiyle verebilirsin.',
  palette: ['#ffe3ec', '#fff4d6', '#ff4d7e', '#ffd166', '#ff9f1c', '#6ccf7f'],
  steps: [
    {
      say: 'Önce kartın ön kapağı için uzun bir dikdörtgen çiz. Sol üst köşeden başla.',
      shapes: [{ d: 'M60,46 L262,46 L262,354 L60,354 Z', part: 'ön kapak', fill: '#ffe3ec' }],
    },
    {
      say: 'Sağ kenardan açılan arka kapağı çiz. Üst köşeden eğik çık, aşağı in ve alt köşeye dön.',
      shapes: [{ d: 'M262,46 L344,74 L344,326 L262,354', part: 'arka kapak', fill: '#fff4d6' }],
    },
    {
      say: 'Ön kapağın üst yarısına kocaman bir kalp çiz. Ortadaki çukurdan başla, sola dolan ve uca in.',
      shapes: [{ d: heart(161, 82, 164, 152), part: 'büyük kalp', fill: '#ff4d7e' }],
    },
    {
      say: 'Kalbin sol tümseğine küçük bir parıltı koy. Kalbin altına da yuvarlak yapraklı bir çiçek çiz.',
      shapes: [
        { d: 'M106,138 Q108,112 132,106', part: 'kalp parıltısı' },
        { d: flower(161, 282, 20, 5), part: 'çiçek', fill: '#ffd166' },
      ],
    },
    {
      say: 'Çiçeğin ortasına küçük bir daire, altına bir sap ve sapın yanına bir yaprak çiz.',
      shapes: [
        { d: circle(161, 282, 10), part: 'çiçek ortası', fill: '#ff9f1c' },
        { d: 'M161,312 L161,344', part: 'sap' },
        { d: 'M161,336 Q172,312 198,316 Q188,340 161,336 Z', part: 'yaprak', fill: '#6ccf7f' },
      ],
    },
    {
      say: 'Arka kapağa da iki minik kalp çiz. Kartın annene sevgi dolu bir sürpriz olacak!',
      shapes: [
        { d: heart(303, 120, 42, 40), part: 'üst minik kalp', fill: '#ff8fab' },
        { d: heart(303, 240, 36, 34), part: 'alt minik kalp', fill: '#ff8fab' },
      ],
    },
  ],
};

export default annelerGunu;
