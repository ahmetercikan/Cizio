import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
/** Kabarık duman bulutu: altı yayvan, üstü üç tümsekli. */
const puff = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy + r * 0.3} A${r * 0.5},${r * 0.5} 0 0,1 ${cx - r * 0.45},${cy - r * 0.45} ` +
  `A${r * 0.55},${r * 0.55} 0 0,1 ${cx + r * 0.45},${cy - r * 0.45} A${r * 0.5},${r * 0.5} 0 0,1 ${cx + r},${cy + r * 0.3} ` +
  `A${r},${r * 0.45} 0 0,1 ${cx - r},${cy + r * 0.3} Z`;
/** Badem biçimli yaprak: `from` noktasından `to` ucuna, iki yanı kavisli. */
const leaf = (fx: number, fy: number, tx: number, ty: number, c1x: number, c1y: number, c2x: number, c2y: number) =>
  `M${fx},${fy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${fx},${fy} Z`;

/** Dinozorlar 8: Dumanı tüten bir volkan ve yanında bir palmiye. */
const volkan: Lesson = {
  id: 'volkan',
  path: 'dinozor',
  title: 'Dino Adası Volkanı',
  emoji: '🌋',
  order: 8,
  level: 1,
  skill: 'Büyük bir dağ, akan lav ve kabarık dumanlarla dinozorların yaşadığı bir ada manzarası kurdun!',
  palette: ['#a0715a', '#ff7b3a', '#d9dde6', '#c98a4b', '#5fc46d', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir dağ çiz. Altı geniş olsun, tepesi düz ve hafif çukur bitsin.',
      shapes: [
        {
          d: 'M30,352 Q110,300 128,164 Q165,180 202,164 Q220,300 300,352 Z',
          part: 'dağ',
          fill: '#a0715a',
        },
      ],
    },
    {
      say: 'Dağın tepesinden taşan bir lav çiz. Lav, dalga dalga aşağı doğru aksın.',
      shapes: [
        {
          d:
            'M128,164 Q165,144 202,164 L208,190 Q214,232 202,226 Q196,272 184,240 Q178,224 170,262 ' +
            'Q162,282 156,236 Q150,218 142,244 Q130,262 128,214 L122,186 Z',
          part: 'lav',
          fill: '#ff7b3a',
        },
      ],
    },
    {
      say: 'Volkanın üstüne kabarık duman bulutları çiz. Yukarı çıktıkça küçülsünler.',
      shapes: [
        { d: puff(166, 108, 44), part: 'büyük duman', fill: '#d9dde6' },
        { d: puff(236, 64, 34), part: 'orta duman', fill: '#d9dde6' },
        { d: puff(128, 48, 24), part: 'küçük duman', fill: '#d9dde6' },
      ],
    },
    {
      say: 'Dağın sağına uzun, hafif eğik bir palmiye gövdesi çiz.',
      shapes: [{ d: 'M316,352 Q304,292 324,236 L342,238 Q326,292 338,352 Z', part: 'palmiye gövdesi', fill: '#c98a4b' }],
    },
    {
      say: 'Gövdenin tepesine dört uzun yaprak çiz. İkisi sola, ikisi sağa doğru sarksın.',
      shapes: [
        { d: leaf(333, 234, 264, 280, 282, 212, 320, 258), part: 'sol alt yaprak', fill: '#5fc46d' },
        { d: leaf(333, 234, 282, 186, 284, 226, 324, 188), part: 'sol üst yaprak', fill: '#5fc46d' },
        { d: leaf(333, 234, 378, 188, 340, 182, 374, 226), part: 'sağ üst yaprak', fill: '#5fc46d' },
        { d: leaf(333, 234, 384, 280, 384, 214, 346, 260), part: 'sağ alt yaprak', fill: '#5fc46d' },
      ],
    },
    {
      say: 'Yaprakların altına iki hindistancevizi, en alta da düz bir yer çizgisi çiz. Adamız hazır!',
      shapes: [
        { d: circle(322, 248, 9), part: 'sol hindistancevizi', fill: '#7a5230' },
        { d: circle(342, 250, 9), part: 'sağ hindistancevizi', fill: '#7a5230' },
        { d: 'M30,352 L370,352', part: 'yer' },
      ],
    },
  ],
};

export default volkan;
