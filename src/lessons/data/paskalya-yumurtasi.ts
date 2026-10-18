import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const n = (v: number) => Math.round(v * 100) / 100;

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

const paskalyaYumurtasi: Lesson = {
  id: 'paskalya-yumurtasi',
  path: 'ozel',
  title: 'Süslü Yumurta',
  emoji: '🥚',
  order: 10,
  level: 1,
  skill: 'Yumurta formunu çizip üstünü renkli şeritler, zikzaklar ve minik çiçeklerle süslemeyi öğrendin!',
  palette: ['#ffe680', '#ff9ecf', '#6ee7b7', '#93c5fd', '#ffbe0b', '#ffffff'],
  steps: [
    {
      say: 'Önce kocaman, dik bir yumurta çizelim. Tepesi biraz dar, altı ise tombul ve yuvarlak olsun.',
      shapes: [
        {
          d: 'M200,45 C265,45 320,145 320,240 C320,315 265,360 200,360 C135,360 80,315 80,240 C80,145 135,45 200,45 Z',
          part: 'yumurta',
          fill: '#ffe680',
        },
      ],
    },
    {
      say: 'Yumurtamızın gövdesine renkli, dalgalı ve zikzaklı iki süs şeridi ekleyelim.',
      shapes: [
        {
          d: 'M104,152 Q130,132 155,152 Q180,172 205,152 Q230,132 255,152 Q275,172 296,152 L298,168 Q275,188 255,168 Q230,148 205,168 Q180,188 155,168 Q130,148 102,168 Z',
          part: 'üst dalgalı şerit',
          fill: '#ff9ecf',
        },
        {
          d: 'M88,270 L116,252 L144,270 L172,252 L200,270 L228,252 L256,270 L284,252 L312,270 L309,286 L284,268 L256,286 L228,268 L200,286 L172,268 L144,286 L116,268 L86,286 Z',
          part: 'alt zikzak şerit',
          fill: '#6ee7b7',
        },
      ],
    },
    {
      say: 'İki şeridin arasına yan yana üç tane sevimli bahar çiçeği konduralım.',
      shapes: [
        { d: flower(200, 210, 18, 5), part: 'orta çiçek', fill: '#ffffff' },
        { d: flower(135, 210, 14, 5), part: 'sol çiçek', fill: '#ffffff' },
        { d: flower(265, 210, 14, 5), part: 'sağ çiçek', fill: '#ffffff' },
      ],
    },
    {
      say: 'Çiçeklerin ortasına sarı göbekler ve aralarına minik mavi boncuklar çizelim.',
      shapes: [
        { d: circle(200, 210, 7), part: 'orta göbek', fill: '#ffbe0b' },
        { d: circle(135, 210, 5), part: 'sol göbek', fill: '#ffbe0b' },
        { d: circle(265, 210, 5), part: 'sağ göbek', fill: '#ffbe0b' },
        { d: circle(167, 210, 4), part: 'sol boncuk', fill: '#93c5fd' },
        { d: circle(233, 210, 4), part: 'sağ boncuk', fill: '#93c5fd' },
      ],
    },
    {
      say: 'Yumurtanın tepe kısmına renkli benekler ve tatlı bir parıltı serpelim.',
      shapes: [
        { d: circle(200, 85, 9), part: 'büyük benek', fill: '#ff9ecf' },
        { d: circle(160, 105, 7), part: 'sol benek', fill: '#93c5fd' },
        { d: circle(240, 105, 7), part: 'sağ benek', fill: '#93c5fd' },
        { d: circle(185, 125, 5), part: 'sol alt benek', fill: '#6ee7b7' },
        { d: circle(215, 125, 5), part: 'sağ alt benek', fill: '#6ee7b7' },
        { d: 'M145,85 Q160,65 180,60', part: 'ışık parıltısı' },
      ],
    },
    {
      say: 'Yumurtanın en altına minik kalpler ve süs damlaları ekleyerek çizimimizi tamamlayalım!',
      shapes: [
        { d: heart(200, 305, 28, 26), part: 'orta minik kalp', fill: '#ff9ecf' },
        { d: heart(150, 305, 20, 19), part: 'sol minik kalp', fill: '#93c5fd' },
        { d: heart(250, 305, 20, 19), part: 'sağ minik kalp', fill: '#93c5fd' },
        { d: circle(175, 338, 4), part: 'sol alt süs', fill: '#ffbe0b' },
        { d: circle(225, 338, 4), part: 'sağ alt süs', fill: '#ffbe0b' },
      ],
    },
  ],
};

export default paskalyaYumurtasi;
