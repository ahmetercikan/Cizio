import type { Lesson } from '../types';

/** Temeller 6: Yıldız ve simetri — iki eş yarımdan oluşan gülen bir yıldız. */
const yildiz: Lesson = {
  id: 'yildiz',
  path: 'temeller',
  title: 'Mutlu Yıldız',
  emoji: '⭐',
  order: 6,
  level: 2,
  skill: 'Beş köşeli yıldız çizmeyi ve iki yarımı aynı yapmayı, yani simetriyi öğrendin!',
  palette: ['#ffd23f', '#ff8fab', '#ffb703', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Kesikli çizgi yıldızın tam ortası. Tepeden başla, sola doğru iki sivri köşe yaparak aşağı in.',
      shapes: [
        { d: 'M200,40 L200,362', guide: true, part: 'orta çizgi' },
        {
          d: 'M200,55 L159,158 L48,166 L133,237 L106,344 L200,285',
          part: 'yıldızın sol yarısı',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Şimdi sağ tarafı aynısından çiz. Tepeden başla, sağa doğru iki köşe yap ve aşağıda buluş.',
      shapes: [
        {
          d: 'M200,55 L241,158 L352,166 L267,237 L294,344 L200,285',
          part: 'yıldızın sağ yarısı',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Ortanın iki yanına iki yuvarlak göz çiz. İkisi de aynı boyda olsun. Minik parıltıları unutma!',
      shapes: [
        { d: 'M172,190 A15,15 0 1,1 172,220 A15,15 0 1,1 172,190 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M177,194 A5,5 0 1,1 177,204 A5,5 0 1,1 177,194 Z', part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: 'M228,190 A15,15 0 1,1 228,220 A15,15 0 1,1 228,190 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M233,194 A5,5 0 1,1 233,204 A5,5 0 1,1 233,194 Z', part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M180,240 Q200,262 220,240', part: 'ağız' },
        { d: 'M141,238 A13,8 0 1,1 167,238 A13,8 0 1,1 141,238 Z', part: 'sol yanak', fill: '#ff8fab' },
        { d: 'M233,238 A13,8 0 1,1 259,238 A13,8 0 1,1 233,238 Z', part: 'sağ yanak', fill: '#ff8fab' },
      ],
    },
    {
      say: 'Yıldızın iki yanına parıltılar çiz. Her biri bir dikey, bir yatay çizgi. Sağ ve sol aynı olsun!',
      shapes: [
        { d: 'M80,58 L80,108', part: 'sol parıltı' },
        { d: 'M55,83 L105,83', part: 'sol parıltı' },
        { d: 'M320,58 L320,108', part: 'sağ parıltı' },
        { d: 'M295,83 L345,83', part: 'sağ parıltı' },
      ],
    },
  ],
};

export default yildiz;
