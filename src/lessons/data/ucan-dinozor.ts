import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 7: Kocaman kanatlarını açmış, gagalı ve ibikli sevimli bir uçan dinozor. */
const ucanDinozor: Lesson = {
  id: 'ucan-dinozor',
  path: 'dinozor',
  title: 'Uçan Dinozor',
  emoji: '🦅',
  order: 7,
  level: 2,
  skill: 'İki kanadı aynalar gibi karşılıklı çizdin. Sağ ve sol tarafı eşit yapmak çizimi dengeli gösterir!',
  palette: ['#ff9f6b', '#ffd3b8', '#e8774a', '#ffc94d', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce yukarıya yuvarlak bir kafa çiz. Bir daire yeter!',
      shapes: [{ d: circle(200, 130, 52), part: 'kafa', fill: '#ff9f6b' }],
    },
    {
      say: 'Kafanın altından armut gibi tombul bir gövde çiz. Kafadan başla, kafada bitir.',
      shapes: [
        {
          d: 'M170,173 C136,200 136,296 200,304 C264,296 264,200 230,173',
          part: 'gövde',
          fill: '#ff9f6b',
        },
      ],
    },
    {
      say: 'Gövdenin solundan kocaman bir kanat aç. Üstü kavisli olsun, altı üç dalga ile gövdeye dönsün.',
      shapes: [
        {
          d: 'M149,212 C120,172 76,148 26,148 Q58,184 64,236 Q100,240 116,268 Q134,252 152,262',
          part: 'sol kanat',
          fill: '#e8774a',
        },
      ],
    },
    {
      say: 'Şimdi sağ tarafa da aynı kanadı çiz. İki kanat birbirine benzesin.',
      shapes: [
        {
          d: 'M251,212 C280,172 324,148 374,148 Q342,184 336,236 Q300,240 284,268 Q266,252 248,262',
          part: 'sağ kanat',
          fill: '#e8774a',
        },
      ],
    },
    {
      say: 'Kafanın sağına uzun, sivri bir gaga çiz. Kafanın arkasına da geriye uzanan bir ibik ekle.',
      shapes: [
        { d: 'M249,108 C280,104 312,108 340,116 C312,130 280,140 251,142', part: 'gaga', fill: '#ffc94d' },
        { d: 'M160,97 C136,76 104,66 70,62 C98,84 124,104 150,117', part: 'ibik', fill: '#e8774a' },
      ],
    },
    {
      say: 'Gövdenin ortasına açık renkli bir karın, altına da iki minik ayak çiz.',
      shapes: [
        { d: ellipse(200, 252, 30, 38), part: 'karın', fill: '#ffd3b8' },
        { d: 'M176,295 L170,326 Q168,334 178,334 L192,334 Q200,334 198,326 L194,302', part: 'sol ayak', fill: '#ffc94d' },
        { d: 'M206,302 L202,326 Q200,334 208,334 L222,334 Q232,334 230,326 L224,295', part: 'sağ ayak', fill: '#ffc94d' },
      ],
    },
    {
      say: 'Kafaya parlak bir göz çiz. Gaganın dibine gülen bir ağız, gözün altına da pembe bir yanak ekle.',
      shapes: [
        { d: circle(214, 120, 17), part: 'göz', fill: '#2d2d2d' },
        { d: circle(208, 113.5, 6), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M254,126 Q284,134 314,122', part: 'ağız' },
        { d: ellipse(222, 156, 12, 7), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak iki kanadın içine omuzdan kanadın ucuna doğru birer kavisli çizgi çiz. Kanatlar hazır!',
      shapes: [
        { d: 'M148,226 Q104,204 64,236', part: 'sol kanat çizgisi' },
        { d: 'M252,226 Q296,204 336,236', part: 'sağ kanat çizgisi' },
      ],
    },
  ],
};

export default ucanDinozor;
