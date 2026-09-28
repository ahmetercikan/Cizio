import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 2: Tek kocaman göz ve açık ağızla neşeli bir canavar. */
const canavar: Lesson = {
  id: 'canavar',
  path: 'karakterler',
  title: 'Sevimli Canavar',
  emoji: '👾',
  order: 2,
  level: 1,
  skill: 'Kocaman bir göz ve açık bir ağızla karakterine duygu katmayı öğrendin! Yüz, karakteri canlandırır.',
  palette: ['#a88bff', '#ffe08a', '#ffffff', '#8a2a4a', '#ff8fb1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir kubbe gibi gövde çiz. Soldan yukarı çık, sağdan in, altını hafif kavisli kapat.',
      shapes: [
        {
          d: 'M110,300 C100,180 130,95 200,95 C270,95 300,180 290,300 Q200,320 110,300 Z',
          part: 'gövde',
          fill: '#a88bff',
        },
      ],
    },
    {
      say: 'Başının üstüne iki kıvrık boynuz çiz. Birini sola, birini sağa doğru uzat.',
      shapes: [
        { d: 'M148,117 Q132,82 142,52 Q166,78 180,98', part: 'sol boynuz', fill: '#ffe08a' },
        { d: 'M220,98 Q234,78 258,52 Q268,82 252,117', part: 'sağ boynuz', fill: '#ffe08a' },
      ],
    },
    {
      say: 'İki yana el sallayan minik kollar, altına da iki yuvarlak ayak çiz.',
      shapes: [
        { d: 'M108,239 L74,214 A15,15 0 0,1 90,190 L112,203', part: 'sol kol', fill: '#a88bff' },
        { d: 'M288,203 L310,190 A15,15 0 0,1 326,214 L292,239', part: 'sağ kol', fill: '#a88bff' },
        { d: 'M134,305 A26,22 0 0,0 186,310', part: 'sol ayak', fill: '#8a6ee8' },
        { d: 'M214,310 A26,22 0 0,0 266,305', part: 'sağ ayak', fill: '#8a6ee8' },
      ],
    },
    {
      say: 'Ortaya tek, kocaman beyaz bir göz çiz. İçine siyah bir göz bebeği ve minik bir parıltı koy.',
      shapes: [
        { d: circle(200, 170, 42), part: 'göz', fill: '#ffffff' },
        { d: circle(204, 176, 21), part: 'göz bebeği', fill: '#2d2d2d' },
        { d: circle(212, 167, 7), part: 'göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözün altına kocaman açık bir ağız çiz. Önce düz bir çizgi, sonra altına bir U harfi.',
      shapes: [{ d: 'M150,232 L250,232 Q200,295 150,232 Z', part: 'ağız', fill: '#8a2a4a' }],
    },
    {
      say: 'Ağzın üstüne iki minik diş, içine pembe bir dil çiz. Yanaklara da pembe daireler ekle.',
      shapes: [
        { d: 'M168,232 L177,246 L186,232', part: 'sol diş', fill: '#ffffff' },
        { d: 'M214,232 L223,246 L232,232', part: 'sağ diş', fill: '#ffffff' },
        { d: 'M172,254 Q200,230 228,254', part: 'dil', fill: '#ff8fb1' },
        { d: ellipse(132, 222, 13, 8), part: 'sol yanak', fill: '#ff8fb1' },
        { d: ellipse(268, 222, 13, 8), part: 'sağ yanak', fill: '#ff8fb1' },
      ],
    },
  ],
};

export default canavar;
