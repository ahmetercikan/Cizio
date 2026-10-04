import type { Lesson } from '../types';

type P = [number, number];
/** Sağ yarının köşeleri (tepeden aşağıya). Sol yarı bunun aynadaki eşi. */
const RIGHT: P[] = [
  [200, 40], [222, 98], [248, 84], [238, 152], [306, 122], [352, 130], [320, 174],
  [342, 200], [270, 214], [296, 250], [314, 312], [250, 296], [200, 256],
];
const line = (pts: P[]) => 'M' + pts.map(([x, y]) => `${x},${y}`).join(' L');
const mirror = (pts: P[]): P[] => pts.map(([x, y]): P => [400 - x, y]);

/** Doğa 8: Sonbahar yaprağı. Önce bir yarısı, sonra aynadaki eşi; damarlar sapın dibinden yayılır. */
const yaprak: Lesson = {
  id: 'yaprak',
  path: 'doga',
  title: 'Sonbahar Yaprağı',
  emoji: '🍁',
  order: 8,
  level: 1,
  skill: 'Yaprağın bir yarısını çizip öbür yarısını aynı yaptın. Damarlar da tek bir noktadan yayıldı!',
  palette: ['#ff8a3d', '#e8582b', '#8d5a2b', '#9ec9ff', '#2d2d2d'],
  steps: [
    {
      say: 'Tepedeki sivri uçtan başla, sağa doğru zikzak çiz. Üç sivri dilim yap ve ortada, aşağıda bitir.',
      shapes: [{ d: line(RIGHT), part: 'sağ yarı', fill: '#ff8a3d' }],
    },
    {
      say: 'Şimdi aynı tepeden sola doğru aynısını çiz. İki yarı aynadaki gibi eş olsun.',
      shapes: [{ d: line(mirror(RIGHT)), part: 'sol yarı', fill: '#ff8a3d' }],
    },
    {
      say: 'Yaprağın dibinden tepedeki uca kadar dümdüz bir orta damar çiz.',
      shapes: [{ d: 'M200,256 L200,62', part: 'orta damar' }],
    },
    {
      say: 'Aynı dipten başla, her sivri uca doğru birer damar çiz. Damarlar yelpaze gibi açılsın.',
      shapes: [
        { d: 'M200,256 L330,144', part: 'sağ üst damar' },
        { d: 'M200,256 L70,144', part: 'sol üst damar' },
        { d: 'M200,256 L298,302', part: 'sağ alt damar' },
        { d: 'M200,256 L102,302', part: 'sol alt damar' },
      ],
    },
    {
      say: 'Yaprağın dibinden aşağıya kısa, hafif kıvrık bir sap çiz.',
      shapes: [{ d: 'M200,256 Q208,318 192,366', part: 'sap' }],
    },
    {
      say: 'Son olarak yaprağın altına, iki yana kıvrılan rüzgâr çizgileri çiz. Yaprak rüzgârda uçuşuyor!',
      shapes: [
        { d: 'M40,340 Q80,322 120,338 Q140,350 130,362 Q118,370 112,356', part: 'sol rüzgâr' },
        { d: 'M360,340 Q320,322 280,338 Q260,350 270,362 Q282,370 288,356', part: 'sağ rüzgâr' },
      ],
    },
  ],
};

export default yaprak;
