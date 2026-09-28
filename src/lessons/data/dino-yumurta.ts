import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 1: Kırık yumurta kabuğundan başını çıkaran minik dino. */
const dinoYumurta: Lesson = {
  id: 'dino-yumurta',
  path: 'dinozor',
  title: 'Yumurtadan Çıkan Dino',
  emoji: '🥚',
  order: 1,
  level: 1,
  skill: 'Önce kafayı çizdin, kabuğu da onun önüne yerleştirdin. Öndeki şekil arkadakinin bir kısmını saklar!',
  palette: ['#8be07a', '#fff1c9', '#ffb347', '#8ecbff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce yukarı doğru kocaman, yuvarlak bir kemer çiz. Bu minik dinonun kafası olacak.',
      shapes: [{ d: 'M131,225 C110,190 92,88 200,82 C308,88 290,190 269,225', part: 'kafa', fill: '#8be07a' }],
    },
    {
      say: 'Şimdi kırık yumurta kabuğunu çiz. Üstü zikzak olsun, altını da yuvarlak bir çanakla kapat.',
      shapes: [
        {
          d: 'M85,225 L108,198 L131,225 L154,198 L177,225 L200,198 L223,225 L246,198 L269,225 L292,198 L315,225 C315,300 270,368 200,368 C130,368 85,300 85,225 Z',
          part: 'yumurta kabuğu',
          fill: '#fff1c9',
        },
      ],
    },
    {
      say: 'Kafanın üstüne havaya fırlayan kabuk parçasını çiz. Altı zikzak, üstü yuvarlak bir şapka gibi olsun.',
      shapes: [{ d: 'M120,95 L131.2,78.5 L150.2,84.5 L161.4,68 L180.4,74 L191.6,57.5 L210.6,63.5 C205,15 115,30 120,95 Z', part: 'kabuk şapka', fill: '#fff1c9' }],
    },
    {
      say: 'Kafanın sağ yanına iki sivri diken ekle. Her diken kafadan çıkıp kafaya geri dönsün.',
      shapes: [
        { d: 'M250.7,95.8 L281,88 L272.5,117', part: 'üst diken', fill: '#ffb347' },
        { d: 'M272.5,117 L302,121 L282.9,142.6', part: 'alt diken', fill: '#ffb347' },
      ],
    },
    {
      say: 'Kocaman iki göz çiz. Her gözün içine de minik beyaz bir parıltı ekle.',
      shapes: [
        { d: circle(165, 138, 17), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(171, 132, 5.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(235, 138, 17), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(241, 132, 5.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'İki minik burun deliği, altına gülümseyen bir ağız, yanlara da pembe yanaklar çiz.',
      shapes: [
        { d: circle(191, 163, 3), part: 'burun delikleri', fill: '#2d2d2d' },
        { d: circle(209, 163, 3), part: 'burun delikleri', fill: '#2d2d2d' },
        { d: 'M176,176 Q200,194 224,176', part: 'ağız' },
        { d: ellipse(138, 168, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(262, 168, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak kabuğa ve şapkaya renkli benekler çiz. Minik dino dünyaya merhaba diyor!',
      shapes: [
        { d: circle(135, 282, 14), part: 'kabuk benekleri', fill: '#8ecbff' },
        { d: circle(200, 322, 16), part: 'kabuk benekleri', fill: '#8ecbff' },
        { d: circle(264, 272, 12), part: 'kabuk benekleri', fill: '#8ecbff' },
        { d: circle(163, 50, 8), part: 'şapka beneği', fill: '#8ecbff' },
      ],
    },
  ],
};

export default dinoYumurta;
