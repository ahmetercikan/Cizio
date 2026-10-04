import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 6: Dalgalı yakalı ve üç boynuzlu, gülümseyen bir triceratops. */
const triceratops: Lesson = {
  id: 'triceratops',
  path: 'dinozor',
  title: 'Triceratops',
  emoji: '🦖',
  order: 6,
  level: 3,
  skill: 'Başın arkasına dalgalı bir yaka, önüne üç boynuz ekledin. Parçaları sırayla üst üste koymak zor işti, başardın!',
  palette: ['#5cc3b0', '#3fa392', '#ffb347', '#ffe08a', '#fff4d6', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kenarı tümsek tümsek kocaman bir yelpaze çiz. Bu dinozorun yakası. Sağ alt köşesi içe kavisli olsun.',
      shapes: [
        {
          d: 'M236,130 L261.9,76.7 Q250.5,50.4 226.1,65.6 Q205.7,45.4 188.7,68.5 Q162.3,57.2 155,85 Q126.3,84.2 129.7,112.8 Q102.7,122.6 116.5,147.9 Q95,167 117.1,185.4 Q104.2,211 131.5,220 Q129,248.6 157.6,246.9 C185,250 210,254 234,255 C214,220 212,160 236,130 Z',
          part: 'yaka',
          fill: '#ffb347',
        },
      ],
    },
    {
      say: 'Yakanın içe kavisli köşesine sağa bakan bir baş çiz. Burnu aşağı doğru kıvrılan bir gaga olsun.',
      shapes: [
        {
          d: 'M236,130 C262,104 318,108 340,150 C350,170 364,190 376,214 C382,228 372,240 358,238 C346,252 320,262 290,262 C262,264 244,262 234,255 C214,220 212,160 236,130 Z',
          part: 'baş',
          fill: '#5cc3b0',
        },
      ],
    },
    {
      say: 'Yakanın altından sola doğru tombul bir gövde çiz. Altından dolaşıp başın altında bitir.',
      shapes: [
        {
          d: 'M157.6,246.9 C110,240 62,258 54,292 C46,326 84,344 130,346 C180,350 236,344 258,312 C266,298 270,280 270,261',
          part: 'gövde',
          fill: '#5cc3b0',
        },
      ],
    },
    {
      say: 'Gövdenin soluna kısa ve sivri bir kuyruk çiz.',
      shapes: [{ d: 'M63,274 C44,272 30,278 18,290 C32,302 44,310 54,311', part: 'kuyruk', fill: '#5cc3b0' }],
    },
    {
      say: 'Gövdenin altına dört kısa, kalın bacak çiz. Arkadakiler biraz daha kısa olsun.',
      shapes: [
        { d: 'M76,331 L76,356 Q76,368 92,368 Q108,368 108,356 L108,342', part: 'arka uzak bacak', fill: '#3fa392' },
        { d: 'M122,345 L122,360 Q122,372 140,372 Q158,372 158,360 L158,347', part: 'arka yakın bacak', fill: '#5cc3b0' },
        { d: 'M180,349 L180,356 Q180,368 196,368 Q212,368 212,356 L212,341', part: 'ön uzak bacak', fill: '#3fa392' },
        { d: 'M222,336 L222,360 Q222,372 240,372 Q258,372 258,360 L258,312', part: 'ön yakın bacak', fill: '#5cc3b0' },
      ],
    },
    {
      say: 'Başın tepesine yukarı uzanan iki uzun boynuz, burnunun üstüne de küçük bir boynuz çiz.',
      shapes: [
        { d: 'M259,116 C262,90 270,62 286,40 C292,66 290,92 278,114', part: 'arka boynuz', fill: '#fff4d6' },
        { d: 'M295,115 C306,90 324,64 350,46 C346,74 332,102 313,122', part: 'ön boynuz', fill: '#fff4d6' },
        { d: 'M350,168 C356,152 364,140 376,130 C376,152 372,172 361,187', part: 'burun boynuzu', fill: '#fff4d6' },
      ],
    },
    {
      say: 'Yakanın içine üç yuvarlak benek çiz. Yaka rengarenk olsun!',
      shapes: [
        { d: circle(203, 96, 12), part: 'üst benek', fill: '#ffe08a' },
        { d: circle(161, 120, 12), part: 'orta benek', fill: '#ffe08a' },
        { d: circle(147, 170, 12), part: 'alt benek', fill: '#ffe08a' },
      ],
    },
    {
      say: 'Son olarak başa parlak bir göz, gagasının altına gülen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(300, 168, 15), part: 'göz', fill: '#2d2d2d' },
        { d: circle(294.5, 162, 5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M298,234 Q324,252 352,240', part: 'ağız' },
        { d: ellipse(278, 210, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default triceratops;
