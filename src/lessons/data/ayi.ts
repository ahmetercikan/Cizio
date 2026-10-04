import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 9: Oturan, tombul patili bir oyuncak ayı. */
const ayi: Lesson = {
  id: 'ayi',
  path: 'hayvanlar',
  title: 'Oyuncak Ayı',
  emoji: '🧸',
  order: 9,
  level: 2,
  skill: 'Yuvarlak bir kafa ve armut gibi bir gövdeyle oturan bir ayı çizdin. Daireler ve ovaller her şeye dönüşür!',
  palette: ['#c98b52', '#f3d9b1', '#2d2d2d', '#ffb3c1', '#ffffff'],
  steps: [
    {
      say: 'Önce gövde için armut gibi büyük bir U çiz. Soldan başla, aşağı in, sağdan yukarı çık.',
      shapes: [{ d: 'M150,185.9 C95,215 85,330 200,330 C315,330 305,215 250,185.9', part: 'gövde', fill: '#c98b52' }],
    },
    {
      say: 'U harfinin iki ucuna değen büyük, yuvarlak bir kafa çiz.',
      shapes: [{ d: circle(200, 130, 75), part: 'kafa', fill: '#c98b52' }],
    },
    {
      say: 'Kafanın üstüne iki yuvarlak kulak ekle. İçlerine de küçük daireler çiz.',
      shapes: [
        { d: 'M131.4,99.7 A28,28 0 1,1 162.1,65.3', part: 'sol kulak', fill: '#c98b52' },
        { d: 'M237.9,65.3 A28,28 0 1,1 268.6,99.7', part: 'sağ kulak', fill: '#c98b52' },
        { d: circle(133, 70, 13), part: 'sol kulak içi', fill: '#f3d9b1' },
        { d: circle(267, 70, 13), part: 'sağ kulak içi', fill: '#f3d9b1' },
      ],
    },
    {
      say: 'Gövdenin iki yanına aşağı sarkan tombul kollar, altına da öne uzanan iki yuvarlak ayak çiz.',
      shapes: [
        { d: 'M116.6,225 C80,235 62,285 85,296 C100,303 110,295 115.9,285', part: 'sol kol', fill: '#c98b52' },
        { d: 'M283.4,225 C320,235 338,285 315,296 C300,303 290,295 284.1,285', part: 'sağ kol', fill: '#c98b52' },
        { d: 'M124.5,300 C80,300 70,360 110,368 C150,376 185,360 180,328.7', part: 'sol ayak', fill: '#c98b52' },
        { d: 'M275.5,300 C320,300 330,360 290,368 C250,376 215,360 220,328.7', part: 'sağ ayak', fill: '#c98b52' },
      ],
    },
    {
      say: 'Karnına büyük, açık renkli bir oval çiz. Kafanın alt kısmına da daha küçük bir burun ovali ekle.',
      shapes: [
        { d: ellipse(200, 268, 52, 44), part: 'karın', fill: '#f3d9b1' },
        { d: ellipse(200, 160, 36, 27), part: 'burun ovali', fill: '#f3d9b1' },
      ],
    },
    {
      say: 'Ayakların içine birer büyük yastık, yastıkların üstüne de üçer minik parmak izi çiz.',
      shapes: [
        { d: ellipse(121, 349, 19, 14), part: 'sol taban', fill: '#f3d9b1' },
        { d: ellipse(279, 349, 19, 14), part: 'sağ taban', fill: '#f3d9b1' },
        { d: `${circle(99, 330, 7)} ${circle(115, 322, 7)} ${circle(131, 326, 7)}`, part: 'sol parmaklar', fill: '#f3d9b1' },
        { d: `${circle(269, 326, 7)} ${circle(285, 322, 7)} ${circle(301, 330, 7)}`, part: 'sağ parmaklar', fill: '#f3d9b1' },
      ],
    },
    {
      say: 'Burun ovalinin üstüne iki parlak göz çiz. İçlerine minik beyaz parıltılar koymayı unutma!',
      shapes: [
        { d: circle(165, 118, 13), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(235, 118, 13), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(169.5, 113.5, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(239.5, 113.5, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ovalin içine yuvarlak bir burun ve gülen bir ağız çiz. İki yana da pembe yanaklar ekle.',
      shapes: [
        { d: 'M186,146 Q200,137 214,146 Q208,159 200,160 Q192,159 186,146 Z', part: 'burun', fill: '#2d2d2d' },
        { d: 'M200,160 L200,168 M184,170 Q192,180 200,168 Q208,180 216,170', part: 'ağız' },
        { d: ellipse(148, 160, 12, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(252, 160, 12, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default ayi;
