import type { Lesson } from '../types';

const agac: Lesson = {
  id: 'agac',
  path: 'doga',
  title: 'Elma Ağacı',
  emoji: '🌳',
  order: 3,
  level: 2,
  skill: 'Öndeki yaprakları önce çizdin, gövdeyi onların kenarından başlattın. Böylece gövde arkada kaldı!',
  palette: ['#5cc56a', '#a0673a', '#ff5a5f', '#6b3f22', '#7ed957', '#ff9eb5'],
  steps: [
    {
      say: 'Sol alttan başla, yukarı doğru tombul tümsekler çizerek büyük bir bulut gibi yapraklar yap.',
      shapes: [
        {
          d: 'M151.3,242.7 A41.5,41.5 0 0,1 90.8,204.3 A35.8,35.8 0 0,1 70.1,146.1 A36.3,36.3 0 0,1 96.6,89.4 A42.3,42.3 0 0,1 160.8,54.7 A45.5,45.5 0 0,1 239.2,54.7 A42.3,42.3 0 0,1 303.4,89.4 A36.3,36.3 0 0,1 329.9,146.1 A35.8,35.8 0 0,1 309.2,204.3 A41.5,41.5 0 0,1 248.7,242.7 Q200,236 151.3,242.7 Z',
          part: 'yapraklar',
          fill: '#5cc56a',
        },
      ],
    },
    {
      say: 'Yaprakların altından başlayıp aşağı inen kalın bir gövde çiz. Altını kökler gibi genişlet.',
      shapes: [{ d: 'M170,241 C172,290 168,328 145,350 L255,350 C232,328 228,290 230,241', part: 'gövde', fill: '#a0673a' }],
    },
    {
      say: 'Yaprakların ortasına iki parlak göz çiz. Ağacımız canlanıyor!',
      shapes: [
        { d: 'M161,150 A13,13 0 1,0 187,150 A13,13 0 1,0 161,150 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M213,150 A13,13 0 1,0 239,150 A13,13 0 1,0 213,150 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M164,144 A6,6 0 1,0 176,144 A6,6 0 1,0 164,144 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M216,144 A6,6 0 1,0 228,144 A6,6 0 1,0 216,144 Z', part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme, iki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M182,178 Q200,194 218,178', part: 'ağız' },
        { d: 'M138,180 A13,8 0 1,0 164,180 A13,8 0 1,0 138,180 Z', part: 'sol yanak', fill: '#ff9eb5' },
        { d: 'M236,180 A13,8 0 1,0 262,180 A13,8 0 1,0 236,180 Z', part: 'sağ yanak', fill: '#ff9eb5' },
      ],
    },
    {
      say: 'Şimdi yaprakların arasına beş tane yuvarlak elma çiz. Kenarlara dağıt!',
      shapes: [
        { d: 'M104,120 A15,15 0 1,0 134,120 A15,15 0 1,0 104,120 Z', part: 'elma', fill: '#ff5a5f' },
        { d: 'M185,82 A15,15 0 1,0 215,82 A15,15 0 1,0 185,82 Z', part: 'elma', fill: '#ff5a5f' },
        { d: 'M266,120 A15,15 0 1,0 296,120 A15,15 0 1,0 266,120 Z', part: 'elma', fill: '#ff5a5f' },
        { d: 'M106,212 A15,15 0 1,0 136,212 A15,15 0 1,0 106,212 Z', part: 'elma', fill: '#ff5a5f' },
        { d: 'M264,212 A15,15 0 1,0 294,212 A15,15 0 1,0 264,212 Z', part: 'elma', fill: '#ff5a5f' },
      ],
    },
    {
      say: 'Gövdeye küçük bir oyuk ve iki kavisli çizgi çiz. Bunlar ağacın kabuğu.',
      shapes: [
        { d: 'M202,282 A10,14 0 1,0 222,282 A10,14 0 1,0 202,282 Z', part: 'oyuk', fill: '#6b3f22' },
        { d: 'M186,256 Q181,275 187,296', part: 'kabuk çizgisi' },
        { d: 'M211,310 Q207,326 214,340', part: 'kabuk çizgisi' },
      ],
    },
    {
      say: 'Son olarak gövdenin iki yanına zikzak çizerek çimenler ekle.',
      shapes: [
        { d: 'M78,350 L86,326 L96,344 L105,318 L114,344 L124,328 L130,350', part: 'sol çimen', fill: '#7ed957' },
        { d: 'M270,350 L276,328 L286,344 L295,318 L304,344 L314,326 L322,350', part: 'sağ çimen', fill: '#7ed957' },
      ],
    },
  ],
};

export default agac;
