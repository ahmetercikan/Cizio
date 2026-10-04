import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
const n = (v: number) => Math.round(v * 10) / 10;

const CX = 200;
const CY = 152;
const BASE = 56;
const TIP = 112;
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${n(CX + r * Math.cos(a))},${n(CY + r * Math.sin(a))}`;
};
/** Ortadaki dairenin kenarından başlayıp sivri uçlu taç yaprakları sırayla çizen tek bir çizgi. */
const petals = (from: number, count: number) => {
  let d = `M${pt(BASE, from)}`;
  for (let k = 0; k < count; k++) {
    const a = from + 30 * k + 15;
    d += ` Q${pt(TIP - 26, a - 19)} ${pt(TIP, a)} Q${pt(TIP - 26, a + 19)} ${pt(BASE, a + 15)}`;
  }
  return d;
};

/** Doğa 9: Ayçiçeği. Taç yaprakları ortadaki dairenin çevresine sırayla dizilir. */
const aycicegi: Lesson = {
  id: 'aycicegi',
  path: 'doga',
  title: 'Ayçiçeği',
  emoji: '🌻',
  order: 9,
  level: 2,
  skill: 'Yaprakları ortanın çevresine yan yana, eşit boyda dizdin. Sırayla gidince hepsi yerine oturur!',
  palette: ['#ffcf3f', '#a8693a', '#5cc56a', '#3f9e4d', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Kesikli dairenin tepesinden başla. Sağa doğru, yan yana altı sivri yaprak çiz ve en altta bitir.',
      shapes: [
        { d: circle(CX, CY, BASE), guide: true },
        { d: petals(-90, 6), part: 'sağ yapraklar', fill: '#ffcf3f' },
      ],
    },
    {
      say: 'Şimdi alttan başla, sol tarafa da altı yaprak çiz. Tepede, ilk yaprağın yanında bitir.',
      shapes: [{ d: petals(90, 6), part: 'sol yapraklar', fill: '#ffcf3f' }],
    },
    {
      say: 'Kesikli dairenin üstünden geçerek ortaya kocaman, yuvarlak bir göbek çiz.',
      shapes: [{ d: circle(CX, CY, BASE), part: 'göbek', fill: '#a8693a' }],
    },
    {
      say: 'Göbeğe iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(181, 142, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(219, 142, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(178, 138, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(216, 138, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M184,166 Q200,182 216,166', part: 'ağız' },
        { d: oval(164, 166, 10, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: oval(236, 166, 10, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Göbeğin altından, iki yaprağın arasından aşağıya uzun bir sap çiz.',
      shapes: [{ d: 'M200,208 Q210,290 200,368', part: 'sap' }],
    },
    {
      say: 'Sapın iki yanına kocaman birer yaprak çiz. Ortalarına da birer damar çizgisi ekle.',
      shapes: [
        { d: 'M202,332 C178,272 110,258 78,288 C104,340 162,356 202,332 Z', part: 'sol yaprak', fill: '#5cc56a' },
        { d: 'M205,296 C226,236 294,222 324,252 C300,304 242,320 205,296 Z', part: 'sağ yaprak', fill: '#5cc56a' },
        { d: 'M196,326 Q140,294 96,290', part: 'sol damar' },
        { d: 'M211,290 Q266,258 308,256', part: 'sağ damar' },
      ],
    },
  ],
};

export default aycicegi;
