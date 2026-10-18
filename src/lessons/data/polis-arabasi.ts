import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const polisArabasi: Lesson = {
  id: 'polis-arabasi',
  path: 'tasitlar',
  title: 'Polis Arabası',
  emoji: '🚔',
  order: 11,
  level: 2,
  skill: 'Araba silueti çizmeyi ve iki renkli gövde detaylarını birleştirmeyi öğrendin!',
  palette: ['#2b4c7e', '#ffffff', '#ff4d4d', '#4fa3ff', '#3a3a4a', '#ffd166'],
  steps: [
    {
      say: 'Önce polis arabasının gövdesini çiz. Tavanını yüksek, altını tekerlekler için boş bırak.',
      shapes: [
        {
          d:
            'M50,245 L50,215 Q50,205 60,205 L110,205 L150,145 Q155,140 165,140 ' +
            'L260,140 Q270,140 275,145 L315,205 L350,205 Q360,208 360,220 L360,250 ' +
            'L345,250 A35,35 0 0,0 275,250 L175,250 A35,35 0 0,0 105,250 L55,250 Q50,250 50,245 Z',
          part: 'gövde',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kapılara koyu mavi polis bloklarını çiz.',
      shapes: [
        { d: 'M112,205 L112,248 L170,248 L170,205 Z', part: 'arka kapı kaplaması', fill: '#2b4c7e' },
        { d: 'M176,205 L176,248 L270,248 L270,205 Z', part: 'ön kapı kaplaması', fill: '#2b4c7e' },
      ],
    },
    {
      say: 'Ön ve arka yan camları ekle.',
      shapes: [
        { d: 'M165,148 L208,148 L208,200 L130,200 Z', part: 'arka cam', fill: '#aee3ff' },
        { d: 'M215,148 L260,148 L298,200 L215,200 Z', part: 'ön cam', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Tekerlek yuvalarına iki tekerlek ve ortalarına jantları çiz.',
      shapes: [
        { d: circle(140, 250, 28), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(140, 250, 12), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(310, 250, 28), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(310, 250, 12), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Tavanın üstüne kırmızı-mavi çakar lambayı ve ışık çizgilerini ekle.',
      shapes: [
        { d: 'M195,140 L235,140 L235,134 L195,134 Z', part: 'çakar tabanı', fill: '#3a3a4a' },
        { d: 'M195,134 L213,134 L213,120 Q195,120 195,134 Z', part: 'kırmızı lamba', fill: '#ff4d4d' },
        { d: 'M217,134 L235,134 Q235,120 217,120 L217,134 Z', part: 'mavi lamba', fill: '#4fa3ff' },
        { d: 'M185,116 L175,106 M245,116 L255,106 M215,112 L215,100', part: 'çakar ışıkları' },
      ],
    },
    {
      say: 'Ön kapının üstüne parlayan sarı bir polis yıldızı ve kapı kolları çiz.',
      shapes: [
        {
          d: 'M224,215 L227,221 L235,223 L229,229 L231,237 L224,232 L217,237 L219,229 L213,223 L221,221 Z',
          part: 'polis rozeti',
          fill: '#ffd166',
        },
        { d: 'M198,212 L206,212 M255,212 L263,212', part: 'kapı kolları' },
      ],
    },
    {
      say: 'Farları, arka stop lambasını ve altındaki yolu çiz.',
      shapes: [
        { d: 'M356,220 Q362,220 362,228 L356,230 Z', part: 'ön far', fill: '#ffe066' },
        { d: 'M50,220 L56,220 L56,230 L50,230 Z', part: 'arka stop lambası', fill: '#ff4d4d' },
        { d: 'M352,238 L360,238 M352,243 L360,243', part: 'ön ızgara' },
        { d: 'M30,278 L370,278', part: 'yol' },
        { d: 'M70,292 L120,292 M170,292 L220,292 M270,292 L320,292', part: 'şerit çizgileri' },
      ],
    },
  ],
};

export default polisArabasi;
