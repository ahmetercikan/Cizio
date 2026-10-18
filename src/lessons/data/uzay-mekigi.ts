import type { Lesson } from '../types';

const uzayMekigi: Lesson = {
  id: 'uzay-mekigi',
  path: 'uzay',
  title: 'Uzay Mekiği',
  emoji: '🚀',
  order: 5,
  level: 2,
  skill: 'Simetrik gövde, delta kanatlar ve fırlatma alevleriyle bir uzay mekiği çizmeyi öğrendin!',
  palette: ['#ffffff', '#2d2d2d', '#ff5a36', '#ffe066', '#4fa3ff', '#3a3a4a'],
  steps: [
    {
      say: 'Önce uzay mekiğinin uzun beyaz gövdesini ve siyah burun ucunu çiz.',
      shapes: [
        {
          d: 'M200,50 Q225,120 225,270 L175,270 Q175,120 200,50 Z',
          part: 'gövde',
          fill: '#ffffff',
        },
        {
          d: 'M200,50 Q210,80 216,95 L184,95 Q190,80 200,50 Z',
          part: 'burun ucu',
          fill: '#2d2d2d',
        },
      ],
    },
    {
      say: 'Astronotların dışarıyı görmesi için kokpit camlarını ekle.',
      shapes: [
        { d: 'M187,112 L198,112 L197,122 L185,120 Z', part: 'sol kokpit camı', fill: '#4fa3ff' },
        { d: 'M202,112 L213,112 L215,120 L203,122 Z', part: 'sağ kokpit camı', fill: '#4fa3ff' },
      ],
    },
    {
      say: 'Gövdenin iki yanına büyük üçgen delta kanatları çiz.',
      shapes: [
        { d: 'M175,170 L105,270 L175,270 Z', part: 'sol kanat', fill: '#ffffff' },
        { d: 'M175,170 L105,270 L115,270 L175,185 Z', part: 'sol kanat kenarı', fill: '#2d2d2d' },
        { d: 'M225,170 L295,270 L225,270 Z', part: 'sağ kanat', fill: '#ffffff' },
        { d: 'M225,170 L295,270 L285,270 L225,185 Z', part: 'sağ kanat kenarı', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Gövdenin ortasına dikey kuyruk dümenini yerleştir.',
      shapes: [
        { d: 'M197,150 L203,150 L205,255 L195,255 Z', part: 'kuyruk gövdesi', fill: '#d0d4dc' },
        { d: 'M197,150 L200,135 L203,150 Z', part: 'kuyruk ucu', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Mekiğin iki yanına uzun fırlatma yardımcı roketlerini çiz.',
      shapes: [
        { d: 'M150,130 Q158,105 166,130 L166,280 L150,280 Z', part: 'sol roket', fill: '#f0f4f8' },
        { d: 'M150,130 Q158,105 166,130 Z', part: 'sol roket ucu', fill: '#ffffff' },
        { d: 'M234,130 Q242,105 250,130 L250,280 L234,280 Z', part: 'sağ roket', fill: '#f0f4f8' },
        { d: 'M234,130 Q242,105 250,130 Z', part: 'sağ roket ucu', fill: '#ffffff' },
      ],
    },
    {
      say: 'Roketlerin altına güçlü motor egzoz çıkışlarını ekle.',
      shapes: [
        { d: 'M180,270 L176,286 L190,286 L186,270 Z', part: 'sol motor', fill: '#3a3a4a' },
        { d: 'M214,270 L210,286 L224,286 L220,270 Z', part: 'sağ motor', fill: '#3a3a4a' },
        { d: 'M195,260 L192,274 L208,274 L205,260 Z', part: 'üst motor', fill: '#3a3a4a' },
        { d: 'M152,280 L149,292 L167,292 L164,280 Z', part: 'sol roket nozulu', fill: '#3a3a4a' },
        { d: 'M236,280 L233,292 L251,292 L248,280 Z', part: 'sağ roket nozulu', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Motorların altından fışkıran parlak ateş ve alevleri çiz.',
      shapes: [
        { d: 'M150,292 Q158,360 158,360 Q166,292 166,292 Z', part: 'sol roket alevi', fill: '#ff5a36' },
        { d: 'M154,292 Q158,335 158,335 Q162,292 162,292 Z', part: 'sol iç alev', fill: '#ffe066' },
        { d: 'M234,292 Q242,360 242,360 Q250,292 250,292 Z', part: 'sağ roket alevi', fill: '#ff5a36' },
        { d: 'M238,292 Q242,335 242,335 Q246,292 246,292 Z', part: 'sağ iç alev', fill: '#ffe066' },
        { d: 'M180,286 Q200,375 200,375 Q220,286 220,286 Z', part: 'mekik alevi', fill: '#ff9f1c' },
        { d: 'M188,286 Q200,340 200,340 Q212,286 212,286 Z', part: 'mekik iç alev', fill: '#ffe066' },
      ],
    },
    {
      say: 'Uzaya parıldayan yıldızlar ve duman bulutları ekle.',
      shapes: [
        { d: 'M70,75 Q75,75 75,70 Q75,75 80,75 Q75,75 75,80 Q75,75 70,75 Z', part: 'sol yıldız', fill: '#ffe066' },
        { d: 'M325,95 Q330,95 330,90 Q330,95 335,95 Q330,95 330,100 Q330,95 325,95 Z', part: 'sağ yıldız', fill: '#ffe066' },
        { d: 'M65,150 Q70,150 70,145 Q70,150 75,150 Q70,150 70,155 Q70,150 65,150 Z', part: 'alt yıldız', fill: '#ffe066' },
        { d: 'M80,375 Q110,345 140,375', part: 'sol duman' },
        { d: 'M260,375 Q290,345 320,375', part: 'sağ duman' },
      ],
    },
  ],
};

export default uzayMekigi;
