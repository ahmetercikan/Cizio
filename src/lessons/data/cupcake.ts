import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 2: Tekrar eden yuvarlak tümseklerle kabarık krema. */
const cupcake: Lesson = {
  id: 'cupcake',
  path: 'nesneler',
  title: 'Kek',
  emoji: '🧁',
  order: 2,
  level: 1,
  skill: 'Yan yana tekrar eden yuvarlak tümseklerle kabarık, yumuşak bir krema çizmeyi öğrendin!',
  palette: ['#ffb3d9', '#7ec8f0', '#e8434f', '#2d2d2d', '#ffffff', '#ff7fa8'],
  steps: [
    {
      say: 'Önce kekin kağıt kabını çiz. Soldan aşağı in, altta düz git, sonra sağdan yukarı çık.',
      shapes: [{ d: 'M112,243 L140,350 L260,350 L288,243', part: 'kağıt kap', fill: '#7ec8f0' }],
    },
    {
      say: 'Kabın üstüne kabarık bir krema çiz. Yukarıda büyük tümsekler, altta küçük dalgalar yap.',
      shapes: [
        {
          d:
            'M102,230 A32,32 0 0,1 110,172 A32,32 0 0,1 150,128 A55,55 0 0,1 250,128 ' +
            'A32,32 0 0,1 290,172 A32,32 0 0,1 298,230 A26,26 0 0,1 249,230 ' +
            'A26,26 0 0,1 200,230 A26,26 0 0,1 151,230 A26,26 0 0,1 102,230 Z',
          part: 'krema',
          fill: '#ffb3d9',
        },
      ],
    },
    {
      say: 'Kağıt kabın üstüne yukarıdan aşağı üç çizgi çek. Kabın kıvrımları böyle görünür.',
      shapes: [
        { d: 'M151,230 L168,350', part: 'kap çizgileri' },
        { d: 'M200,230 L200,350', part: 'kap çizgileri' },
        { d: 'M249,230 L232,350', part: 'kap çizgileri' },
      ],
    },
    {
      say: 'Kremanın üstüne iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar ekle.',
      shapes: [
        { d: circle(170, 176, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(174, 172, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(230, 176, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(234, 172, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin arasına tatlı bir gülümseme, iki yana da pembe yanaklar çiz.',
      shapes: [
        { d: 'M185,195 Q200,212 215,195', part: 'ağız' },
        { d: ellipse(144, 198, 12, 7), part: 'sol yanak', fill: '#ff7fa8' },
        { d: ellipse(256, 198, 12, 7), part: 'sağ yanak', fill: '#ff7fa8' },
      ],
    },
    {
      say: 'En tepeye kırmızı bir kiraz ve sapını koy. Kremaya da birkaç minik şeker serp.',
      shapes: [
        { d: circle(200, 80, 17), part: 'kiraz', fill: '#e8434f' },
        { d: 'M200,63 Q205,44 224,38', part: 'kiraz sapı' },
        { d: 'M127,165 L134,156', part: 'şekerler' },
        { d: 'M170,120 L177,128', part: 'şekerler' },
        { d: 'M226,114 L236,118', part: 'şekerler' },
      ],
    },
  ],
};

export default cupcake;
