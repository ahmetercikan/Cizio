import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const n = (v: number) => Math.round(v * 100) / 100;
/** Yatay bir çizgi (y) üstünde duran dairenin açık yayı: sol kesişimden başlayıp tepeden dolanır. */
const arcOn = (cx: number, cy: number, r: number, y: number) => {
  const dx = Math.sqrt(r * r - (y - cy) ** 2);
  return `M${n(cx - dx)},${n(y)} A${r},${r} 0 1,1 ${n(cx + dx)},${n(y)}`;
};
/** İki dairenin kesişim yüksekliği (merkezler aynı dikey çizgide, üstteki daire c2). */
const meetY = (cy1: number, r1: number, cy2: number, r2: number) => {
  const d = cy1 - cy2;
  return cy2 + (r2 * r2 - r1 * r1 + d * d) / (2 * d);
};

const SNOW = '#eef6ff';

/** Özel Günler 2: Kardan adam. Büyükten küçüğe üst üste yuvarlaklar. */
const kardanAdam: Lesson = {
  id: 'kardan-adam',
  path: 'ozel',
  title: 'Kardan Adam',
  emoji: '⛄',
  order: 2,
  level: 1,
  skill: 'Büyükten küçüğe üç yuvarlağı üst üste dizmeyi öğrendin! En büyüğü altta olunca kardan adam dik durur.',
  palette: [SNOW, '#ff5d73', '#3a3a4a', '#ff9f1c', '#8d6e63'],
  steps: [
    {
      say: 'Önce en alta kocaman bir kartopu çiz. Kardan adamımız bunun üstünde duracak.',
      shapes: [{ d: circle(200, 302, 64), part: 'alt kartopu', fill: SNOW }],
    },
    {
      say: 'Üstüne biraz daha küçük ikinci bir kartopu çiz. Alttakinin kenarından başla ve oraya dön.',
      shapes: [{ d: arcOn(200, 200, 48, meetY(302, 64, 200, 48)), part: 'orta kartopu', fill: SNOW }],
    },
    {
      say: 'Orta kartopunun tepesine kalın bir atkı sar. Sağ tarafa da aşağı sarkan ucunu çiz.',
      shapes: [
        { d: 'M176,158.4 L166,156 Q160,148 168,140 L232,140 Q240,148 234,156 L224,158.4', part: 'atkı', fill: '#ff5d73' },
        { d: 'M211,159.6 L213,206 L233,200 L226,159.7', part: 'atkının ucu', fill: '#ff5d73' },
      ],
    },
    {
      say: 'Atkının üstüne en küçük kartopunu çiz. Bu kardan adamın kafası olacak.',
      shapes: [{ d: arcOn(200, 108, 38, 140), part: 'kafa', fill: SNOW }],
    },
    {
      say: 'Kafanın tepesine bir şapka çiz. Önce yassı bir kenar, sonra üstüne uzun bir kutu, sonra bir şerit.',
      shapes: [
        { d: 'M152,72 L248,72 Q256,72 256,65 Q256,58 248,58 L152,58 Q144,58 144,65 Q144,72 152,72 Z', part: 'şapka kenarı', fill: '#3a3a4a' },
        { d: 'M168,58 L168,30 L232,30 L232,58', part: 'şapka', fill: '#3a3a4a' },
        { d: 'M168,47 L232,47', part: 'şapka şeridi' },
      ],
    },
    {
      say: 'Kafaya kömürden iki göz, havuçtan sivri bir burun ve gülen bir ağız çiz.',
      shapes: [
        { d: circle(185, 97, 6), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(215, 97, 6), part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M200,108 L238,116 L200,123 Z', part: 'havuç burun', fill: '#ff9f1c' },
        { d: 'M184,128 Q200,138 216,128', part: 'ağız' },
      ],
    },
    {
      say: 'Orta kartopunun iki yanına dal kollar çiz. Her kolun ucuna minik bir parmak dalı ekle.',
      shapes: [
        { d: 'M153,192 L104,162 L92,134', part: 'sol kol' },
        { d: 'M104,162 L72,158', part: 'sol kol' },
        { d: 'M247,192 L296,162 L308,134', part: 'sağ kol' },
        { d: 'M296,162 L328,158', part: 'sağ kol' },
      ],
    },
    {
      say: 'Son olarak ortadaki kartopuna alt alta üç kömür düğme çiz. Kardan adam hazır!',
      shapes: [
        { d: circle(196, 180, 6), part: 'üst düğme', fill: '#2d2d2d' },
        { d: circle(196, 204, 6), part: 'orta düğme', fill: '#2d2d2d' },
        { d: circle(196, 228, 6), part: 'alt düğme', fill: '#2d2d2d' },
      ],
    },
  ],
};

export default kardanAdam;
