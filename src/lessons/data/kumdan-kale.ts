import type { Lesson } from '../types';

/** Kemerli pencere ya da kapı: altı düz, üstü yarım yuvarlak. */
const arch = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + w / 2} A${w / 2},${w / 2} 0 0,1 ${x + w},${y + w / 2} L${x + w},${y + h} Z`;

/** Deniz 10: Burçlu kuleleri, bayrağı, kovası ve küreğiyle bir kumdan kale. */
const kumdanKale: Lesson = {
  id: 'kumdan-kale',
  path: 'deniz',
  title: 'Kumdan Kale',
  emoji: '🏰',
  order: 10,
  level: 2,
  skill: 'Dikdörtgenlerin tepesine dişli burçlar koyarak kale yapmayı, yanına da kova ve kürek eklemeyi öğrendin!',
  palette: ['#f4d58d', '#e0b965', '#a0715a', '#ff6b6b', '#4fa3ff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kalenin ortadaki duvarını çiz. Tepesine iki tane kare diş koy.',
      shapes: [
        {
          d: 'M120,340 L120,214 L142,214 L142,196 L166,196 L166,214 L194,214 L194,196 L218,196 L218,214 L240,214 L240,340 Z',
          part: 'duvar',
          fill: '#f4d58d',
        },
      ],
    },
    {
      say: 'Duvarın soluna daha yüksek bir kule çiz. Tepesinde üç kare diş olsun.',
      shapes: [
        {
          d: 'M120,340 L60,340 L60,130 L72,130 L72,150 L84,150 L84,130 L96,130 L96,150 L108,150 L108,130 L120,130 Z',
          part: 'sol kule',
          fill: '#ecc777',
        },
      ],
    },
    {
      say: 'Duvarın sağına da aynı yükseklikte ikinci kuleyi çiz.',
      shapes: [
        {
          d: 'M240,340 L240,130 L252,130 L252,150 L264,150 L264,130 L276,130 L276,150 L288,150 L288,130 L300,130 L300,340 Z',
          part: 'sağ kule',
          fill: '#ecc777',
        },
      ],
    },
    {
      say: 'Duvarın ortasına üstü yuvarlak bir kapı, kulelere de birer küçük pencere çiz.',
      shapes: [
        { d: arch(160, 272, 40, 68), part: 'kapı', fill: '#a0715a' },
        { d: arch(78, 184, 24, 34), part: 'sol pencere', fill: '#a0715a' },
        { d: arch(258, 184, 24, 34), part: 'sağ pencere', fill: '#a0715a' },
      ],
    },
    {
      say: 'Sağ kulenin ortadaki dişinden yukarı bir direk çiz. Ucuna da üçgen bir bayrak as.',
      shapes: [
        { d: 'M270,130 L270,50', part: 'direk' },
        { d: 'M270,50 L316,66 L270,82 Z', part: 'bayrak', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Kalenin sağına bir kova çiz. Üstü geniş, altı dar olsun. Tepesine kavisli bir sap ekle.',
      shapes: [
        { d: 'M312,276 L368,276 L360,338 Q359,342 354,342 L326,342 Q321,342 320,338 Z', part: 'kova', fill: '#4fa3ff' },
        { d: 'M312,280 Q340,232 368,280', part: 'kova sapı' },
      ],
    },
    {
      say: 'Kovanın içinden yukarı bir sap çık. Sapın ucuna yuvarlak, sivri uçlu bir kürek çiz.',
      shapes: [
        { d: 'M350,276 L354,214', part: 'kürek sapı' },
        { d: 'M342,214 L366,214 L368,190 Q368,166 355,158 Q342,166 342,190 Z', part: 'kürek ucu', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Kalenin altına kavisli bir kum çizgisi, önüne de küçük bir deniz kabuğu çiz. Kale hazır!',
      shapes: [
        { d: 'M30,350 Q200,338 370,350', part: 'kum' },
        { d: 'M90,384 Q82,358 108,352 Q134,358 126,384 Z', part: 'deniz kabuğu', fill: '#ffb3c1' },
        { d: 'M108,384 L108,360', part: 'kabuk orta çizgisi' },
        { d: 'M98,384 L95,364', part: 'kabuk yan çizgisi' },
      ],
    },
  ],
};

export default kumdanKale;
