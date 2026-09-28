import type { Lesson } from '../types';

const gunesBulut: Lesson = {
  id: 'gunes-bulut',
  path: 'doga',
  title: 'Güneş ve Bulut',
  emoji: '🌤️',
  order: 1,
  level: 1,
  skill: 'Işınları önce dört ana yöne, sonra aralarına çizerek eşit aralıklı yerleştirdin!',
  palette: ['#ffd23f', '#ffa62b', '#d9eeff', '#ff9eb5', '#2d2d2d'],
  steps: [
    {
      say: 'Sol üst köşeye büyük, yuvarlak bir daire çiz. Bu bizim güneşimiz!',
      shapes: [{ d: 'M78,138 A64,64 0 1,0 206,138 A64,64 0 1,0 78,138 Z', part: 'güneş', fill: '#ffd23f' }],
    },
    {
      say: 'Güneşten dışarı doğru dört ışın çiz: yukarı, sağa, aşağı ve sola.',
      shapes: [
        { d: 'M142,60 L142,30', part: 'üst ışın' },
        { d: 'M220,138 L250,138', part: 'sağ ışın' },
        { d: 'M142,216 L142,246', part: 'alt ışın' },
        { d: 'M64,138 L34,138', part: 'sol ışın' },
      ],
    },
    {
      say: 'Şimdi ışınların tam arasına dört çapraz ışın daha ekle.',
      shapes: [
        { d: 'M86.8,82.8 L65.6,61.6', part: 'çapraz ışın' },
        { d: 'M197.2,82.8 L218.4,61.6', part: 'çapraz ışın' },
        { d: 'M86.8,193.2 L65.6,214.4', part: 'çapraz ışın' },
        { d: 'M197.2,193.2 L218.4,214.4', part: 'çapraz ışın' },
      ],
    },
    {
      say: 'Sağ alta kabarık bir bulut çiz. Tümsekleri yukarı doğru yuvarlat, altını düz bırak.',
      shapes: [
        {
          d: 'M200,335 A32,32 0 0,1 196,272 A44,44 0 0,1 276,244 A40,40 0 0,1 342,280 A28,28 0 0,1 338,335 Z',
          part: 'bulut',
          fill: '#d9eeff',
        },
      ],
    },
    {
      say: 'Güneşe iki parlak göz ve kocaman bir gülümseme çiz.',
      shapes: [
        { d: 'M109,128 A12,12 0 1,0 133,128 A12,12 0 1,0 109,128 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M151,128 A12,12 0 1,0 175,128 A12,12 0 1,0 151,128 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M112,123 A5,5 0 1,0 122,123 A5,5 0 1,0 112,123 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M154,123 A5,5 0 1,0 164,123 A5,5 0 1,0 154,123 Z', part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M122,154 Q142,172 162,154', part: 'güneşin ağzı' },
      ],
    },
    {
      say: 'Güneşe pembe yanaklar ekle. Buluta da gülen kapalı gözler ve bir gülümseme çiz.',
      shapes: [
        { d: 'M94,152 A10,7 0 1,0 114,152 A10,7 0 1,0 94,152 Z', part: 'güneşin yanağı', fill: '#ff9eb5' },
        { d: 'M170,152 A10,7 0 1,0 190,152 A10,7 0 1,0 170,152 Z', part: 'güneşin yanağı', fill: '#ff9eb5' },
        { d: 'M240,292 Q252,278 264,292', part: 'bulutun gözü' },
        { d: 'M288,292 Q300,278 312,292', part: 'bulutun gözü' },
        { d: 'M262,306 Q276,320 290,306', part: 'bulutun ağzı' },
      ],
    },
  ],
};

export default gunesBulut;
