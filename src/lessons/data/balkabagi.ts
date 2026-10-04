import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Özel Günler 5: Gülen balkabağı. Tombul bir gövde, içinde kavisli dilim çizgileri ve dost bir yüz. */
const balkabagi: Lesson = {
  id: 'balkabagi',
  path: 'ozel',
  title: 'Gülen Balkabağı',
  emoji: '🎃',
  order: 5,
  level: 2,
  skill: 'Dilim çizgilerini kenara paralel, kavisli çizdin. Kavisli çizgiler balkabağını tombul ve yuvarlak gösterir!',
  palette: ['#ff9a3c', '#e07a2a', '#7a9a3a', '#5cc56a', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Tepedeki küçük çukurdan başla. İki yana doğru kocaman, tombul ve yuvarlak bir balkabağı çiz.',
      shapes: [
        {
          d: 'M200,112 C250,84 356,100 356,226 C356,330 290,352 200,350 C110,352 44,330 44,226 C44,100 150,84 200,112 Z',
          part: 'balkabağı',
          fill: '#ff9a3c',
        },
      ],
    },
    {
      say: 'Çukurdan aşağıya iki kavisli dilim çizgisi çiz. Biri sola, biri sağa doğru şişkin olsun.',
      shapes: [
        { d: 'M186,105.7 Q100,226 186,350.1', part: 'sol dilim çizgisi' },
        { d: 'M214,105.7 Q300,226 214,350.1', part: 'sağ dilim çizgisi' },
      ],
    },
    {
      say: 'Kenarlara yakın iki dilim çizgisi daha çiz. Bunlar daha da kavisli olsun.',
      shapes: [
        { d: 'M140,100.8 Q38,226 124,343.1', part: 'sol kenar çizgisi' },
        { d: 'M260,100.8 Q362,226 276,343.1', part: 'sağ kenar çizgisi' },
      ],
    },
    {
      say: 'Tepedeki çukurdan yukarı kısa, kalın ve hafif eğik bir sap çiz.',
      shapes: [{ d: 'M184,105 Q178,72 192,44 L218,50 Q206,78 216,105', part: 'sap', fill: '#7a9a3a' }],
    },
    {
      say: 'Sapın sağına sivri bir yaprak, soluna da yay gibi kıvrılan bir dal çiz.',
      shapes: [
        { d: 'M211.5,77.8 Q250,40 296,62 Q256,100 211.5,77.8 Z', part: 'yaprak', fill: '#5cc56a' },
        { d: 'M183,73.3 Q152,52 132,70 Q118,88 136,94 Q152,96 150,80', part: 'kıvrık dal' },
      ],
    },
    {
      say: 'Ortadaki dilime iki büyük, yuvarlak göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: circle(176, 206, 15), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(224, 206, 15), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(171, 200, 6), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(219, 200, 6), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman, sevimli bir gülümseme çiz. Yanlarına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M172,246 Q200,276 228,246', part: 'ağız' },
        { d: oval(160, 242, 11, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: oval(240, 242, 11, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default balkabagi;
