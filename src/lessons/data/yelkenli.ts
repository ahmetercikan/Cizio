import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Taşıtlar 3: Üçgen yelkenli bir tekne. Düz bir direğe yaslanan üçgenler. */
const yelkenli: Lesson = {
  id: 'yelkenli',
  path: 'tasitlar',
  title: 'Yelkenli Tekne',
  emoji: '⛵',
  order: 3,
  level: 1,
  skill: 'Düz bir direğin iki yanına üçgenler yaslayınca rüzgârla dolan yelkenler çizdin!',
  palette: ['#ff7b6b', '#ffffff', '#ffe8a3', '#6ccf7f', '#aee3ff', '#4fa3ff'],
  steps: [
    {
      say: 'Önce teknenin gövdesini çiz. Üstü düz ve uzun, altı içe doğru kıvrılan bir kayık gibi.',
      shapes: [{ d: 'M62,250 L338,250 Q312,318 270,318 L130,318 Q88,318 62,250 Z', part: 'gövde', fill: '#ff7b6b' }],
    },
    {
      say: 'Gövdenin ortasından yukarıya doğru uzun, dümdüz bir direk çiz.',
      shapes: [{ d: 'M200,250 L200,52', part: 'direk' }],
    },
    {
      say: 'Direğin sağına büyük bir yelken çiz. Tepeden başla, kavisli inip direğe geri dön.',
      shapes: [{ d: 'M200,96 Q284,154 310,234 L200,234', part: 'büyük yelken', fill: '#ffffff' }],
    },
    {
      say: 'Direğin soluna daha küçük bir yelken çiz. Bu da aşağıda direğe dokunsun.',
      shapes: [{ d: 'M200,122 Q134,174 104,234 L200,234', part: 'küçük yelken', fill: '#ffe8a3' }],
    },
    {
      say: 'Direğin tepesine rüzgârda dalgalanan bir bayrak, gövdeye de üç yuvarlak pencere çiz.',
      shapes: [
        { d: 'M200,52 Q226,42 256,62 Q228,78 200,86', part: 'bayrak', fill: '#6ccf7f' },
        { d: circle(150, 280, 11), part: 'sol pencere', fill: '#aee3ff' },
        { d: circle(200, 280, 11), part: 'orta pencere', fill: '#aee3ff' },
        { d: circle(250, 280, 11), part: 'sağ pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Teknenin altına iki dalgalı çizgi çiz. Tekne denizde yüzüyor!',
      shapes: [
        { d: 'M40,334 Q60,318 80,334 Q100,350 120,334 Q140,318 160,334 Q180,350 200,334 Q220,318 240,334 Q260,350 280,334 Q300,318 320,334 Q340,350 360,334', part: 'büyük dalga' },
        { d: 'M110,358 Q130,344 150,358 Q170,372 190,358 Q210,344 230,358 Q250,372 270,358 Q290,344 310,358', part: 'küçük dalga' },
      ],
    },
  ],
};

export default yelkenli;
