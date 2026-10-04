import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const BODY = oval(200, 218, 18, 86);

/** Doğa 10: Kelebek. Her kanadın aynadaki eşi; desenler de iki yanda aynı yerde. */
const kelebek: Lesson = {
  id: 'kelebek',
  path: 'doga',
  title: 'Kelebek',
  emoji: '🦋',
  order: 10,
  level: 2,
  skill: 'Bir yana ne çizdiysen öbür yana aynısını çizdin. Buna simetri denir; kelebek kanatları hep simetriktir!',
  palette: ['#ff8fb8', '#ffc46b', '#ffe066', '#9b7bea', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Kesikli gövdenin sol yanından başla, yukarı kocaman yuvarlak bir kanat çiz. Sağa da aynısını yap.',
      shapes: [
        { d: BODY, guide: true },
        { d: 'M186.4,162 C164,96 92,40 56,72 C24,104 52,178 182,214', part: 'sol üst kanat', fill: '#ff8fb8' },
        { d: 'M213.6,162 C236,96 308,40 344,72 C376,104 348,178 218,214', part: 'sağ üst kanat', fill: '#ff8fb8' },
      ],
    },
    {
      say: 'Üst kanatların altına daha küçük iki kanat çiz. Aşağı doğru yuvarlansınlar ve gövdede bitsinler.',
      shapes: [
        { d: 'M182,228 C130,226 72,258 86,312 C100,356 164,338 190.6,292', part: 'sol alt kanat', fill: '#ffc46b' },
        { d: 'M218,228 C270,226 328,258 314,312 C300,356 236,338 209.4,292', part: 'sağ alt kanat', fill: '#ffc46b' },
      ],
    },
    {
      say: 'Kesikli çizginin üstünden geçerek ortaya uzun, ince bir oval gövde çiz.',
      shapes: [{ d: BODY, part: 'gövde', fill: '#9b7bea' }],
    },
    {
      say: 'Gövdenin tepesine yuvarlak bir kafa çiz. Kafadan iki yana ucu kıvrık birer anten çıkar.',
      shapes: [
        { d: circle(200, 96, 36), part: 'kafa', fill: '#9b7bea' },
        { d: 'M188,62 Q180,38 160,34 Q146,34 148,46 Q152,56 162,48', part: 'sol anten' },
        { d: 'M212,62 Q220,38 240,34 Q254,34 252,46 Q248,56 238,48', part: 'sağ anten' },
      ],
    },
    {
      say: 'Kanatlara desen çiz: üst kanatlara büyük, alt kanatlara küçük birer daire. İki yan aynı olsun.',
      shapes: [
        { d: circle(102, 116, 24), part: 'sol büyük desen', fill: '#ffe066' },
        { d: circle(298, 116, 24), part: 'sağ büyük desen', fill: '#ffe066' },
        { d: circle(124, 298, 15), part: 'sol küçük desen', fill: '#ffe066' },
        { d: circle(276, 298, 15), part: 'sağ küçük desen', fill: '#ffe066' },
      ],
    },
    {
      say: 'Kafaya iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(186, 92, 9), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(214, 92, 9), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(183, 88, 3.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(211, 88, 3.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına küçük bir gülümseme, iki yanına da pembe yanaklar çiz. Kelebeğin uçmaya hazır!',
      shapes: [
        { d: 'M190,110 Q200,120 210,110', part: 'ağız' },
        { d: oval(175, 108, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: oval(225, 108, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kelebek;
