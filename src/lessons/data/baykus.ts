import type { Lesson } from '../types';

const baykus: Lesson = {
  id: 'baykus',
  path: 'hayvanlar',
  title: 'Koca Gözlü Baykuş',
  emoji: '🦉',
  order: 4,
  level: 2,
  skill: 'Büyük gövdeyi önce çizdin, sonra gözleri, kanatları ve tüyleri iki tarafa eşit yerleştirdin!',
  palette: ['#c58a5c', '#f7dcb4', '#8a5a3a', '#fff6d6', '#ffb020', '#2d2d2d'],
  steps: [
    {
      say: 'Sol kulak ucundan başla, iki sivri kulaklı büyük bir yumurta şekli çiz. Bu baykuşun gövdesi.',
      shapes: [
        {
          d: 'M110,70 Q150,100 200,100 Q250,100 290,70 Q320,150 310,230 C300,310 260,340 200,340 C140,340 100,310 90,230 Q80,150 110,70 Z',
          part: 'gövde',
          fill: '#c58a5c',
        },
      ],
    },
    {
      say: 'Gövdenin iki yanına damla gibi birer kanat çiz.',
      shapes: [
        { d: 'M100,190 Q155,220 135,300 Q100,275 100,190 Z', part: 'sol kanat', fill: '#8a5a3a' },
        { d: 'M300,190 Q245,220 265,300 Q300,275 300,190 Z', part: 'sağ kanat', fill: '#8a5a3a' },
      ],
    },
    {
      say: 'Gövdenin alt ortasına büyük, yuvarlak bir karın çiz.',
      shapes: [{ d: 'M140,268 A60,60 0 1,0 260,268 A60,60 0 1,0 140,268 Z', part: 'karın', fill: '#f7dcb4' }],
    },
    {
      say: 'Kulakların altına iki kocaman daire çiz. Baykuşun gözleri çok büyüktür!',
      shapes: [
        { d: 'M118,162 A40,40 0 1,0 198,162 A40,40 0 1,0 118,162 Z', part: 'sol göz dairesi', fill: '#fff6d6' },
        { d: 'M202,162 A40,40 0 1,0 282,162 A40,40 0 1,0 202,162 Z', part: 'sağ göz dairesi', fill: '#fff6d6' },
      ],
    },
    {
      say: 'Dairelerin içine siyah gözbebekleri, onların içine de minik beyaz parıltılar çiz.',
      shapes: [
        { d: 'M143,166 A20,20 0 1,0 183,166 A20,20 0 1,0 143,166 Z', part: 'sol gözbebeği', fill: '#2d2d2d' },
        { d: 'M217,166 A20,20 0 1,0 257,166 A20,20 0 1,0 217,166 Z', part: 'sağ gözbebeği', fill: '#2d2d2d' },
        { d: 'M150,158 A6,6 0 1,0 162,158 A6,6 0 1,0 150,158 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M224,158 A6,6 0 1,0 236,158 A6,6 0 1,0 224,158 Z', part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'İki gözün arasına, aşağı bakan küçük bir üçgen gaga çiz.',
      shapes: [{ d: 'M187,190 Q200,184 213,190 L200,210 Z', part: 'gaga', fill: '#ffb020' }],
    },
    {
      say: 'Karnın üstüne küçük U şekilleri çiz. Bunlar baykuşun yumuşacık tüyleri!',
      shapes: [
        { d: 'M170,242 Q182,258 194,242', part: 'tüyler' },
        { d: 'M206,242 Q218,258 230,242', part: 'tüyler' },
        { d: 'M154,274 Q166,290 178,274', part: 'tüyler' },
        { d: 'M188,274 Q200,290 212,274', part: 'tüyler' },
        { d: 'M222,274 Q234,290 246,274', part: 'tüyler' },
      ],
    },
    {
      say: 'Baykuşun altına uzun bir dal, dalın üstüne de iki minik ayak çiz.',
      shapes: [
        { d: 'M45,348 Q200,340 355,348 Q370,357 355,366 Q200,358 45,366 Q30,357 45,348 Z', part: 'dal', fill: '#7a4b2a' },
        { d: 'M159,334 C156,354 166,358 172,351 C178,359 190,355 188,339', part: 'sol ayak', fill: '#ffb020' },
        { d: 'M212,339 C210,355 222,359 228,351 C234,358 244,354 241,334', part: 'sağ ayak', fill: '#ffb020' },
      ],
    },
  ],
};

export default baykus;
