import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 28: S şeklinde kıvrılan gövdeli, çatallı dilli ve sevimli minik yılan. */
const yilan: Lesson = {
  id: 'yilan',
  path: 'hayvanlar',
  title: 'Minik Yılan',
  emoji: '🐍',
  order: 28,
  level: 1,
  skill: 'Kıvrıla kıvrıla dönen S çizgisini kullanarak harika ve dost canlısı bir yılan çizmeyi başardın!',
  palette: ['#2ec4b6', '#ffe066', '#ff4d6d', '#ff758f', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce minik yılanımızın kıvrıla kıvrıla giden S şeklindeki tombul gövdesini çiz.',
      shapes: [
        {
          d: 'M240,135 C190,140 110,165 110,210 C110,260 210,240 280,265 C320,280 320,335 250,345 C180,355 120,345 105,310 C95,290 105,270 120,270 C130,270 130,290 125,305 C150,325 210,325 255,315 C285,310 285,285 245,280 C185,270 145,245 145,210 C145,185 190,165 220,150 Z',
          part: 'kıvrık gövde',
          fill: '#2ec4b6',
        },
      ],
    },
    {
      say: 'Gövdenin üst ucuna tatlı, kocaman ve yuvarlak bir kafa ekle.',
      shapes: [
        {
          d: ellipse(240, 115, 46, 38),
          part: 'kafa',
          fill: '#2ec4b6',
        },
      ],
    },
    {
      say: 'Gövdenin alt tarafı boyunca uzanan güneş sarısı karın şeridini ve çizgilerini çiz.',
      shapes: [
        {
          d: 'M220,150 C190,165 145,185 145,210 C145,225 160,238 185,246 C165,235 155,222 155,210 C155,192 195,172 225,158 Z',
          part: 'üst karın şeridi',
          fill: '#ffe066',
        },
        {
          d: 'M245,280 C285,285 285,310 255,315 C210,325 150,325 125,305 C145,318 200,318 245,308 C270,302 270,290 240,285 Z',
          part: 'alt karın şeridi',
          fill: '#ffe066',
        },
        { d: 'M150,195 L160,198 M147,210 L158,212 M152,225 L163,224', part: 'üst karın çizgileri' },
        { d: 'M145,316 L148,307 M175,321 L178,312 M205,321 L208,312 M235,316 L237,307', part: 'alt karın çizgileri' },
      ],
    },
    {
      say: 'Yüzüne iki kocaman parlak göz, gülen bir ağız ve dışarı uzanan çatallı dilini çiz.',
      shapes: [
        { d: circle(218, 105, 10), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(220, 102, 3.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(258, 105, 10), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(260, 102, 3.5), part: 'sağ parıltı', fill: '#ffffff' },
        { d: circle(234, 120, 1.8), part: 'sol burun deliği', fill: '#2d2d2d' },
        { d: circle(244, 120, 1.8), part: 'sağ burun deliği', fill: '#2d2d2d' },
        { d: 'M222,126 Q238,136 254,126', part: 'ağız' },
        {
          d: 'M235,134 L235,148 L227,158 L231,160 L237,151 L243,160 L247,158 L239,148 L239,134 Z',
          part: 'çatallı dil',
          fill: '#ff4d6d',
        },
      ],
    },
    {
      say: 'Son olarak yılanımızın sırtına neşeli sarı benekler ve yanaklarına allıklar ekle!',
      shapes: [
        { d: ellipse(206, 118, 8, 5), part: 'sol yanak', fill: '#ff758f' },
        { d: ellipse(270, 118, 8, 5), part: 'sağ yanak', fill: '#ff758f' },
        { d: circle(238, 88, 5.5), part: 'kafa beneği', fill: '#ffe066' },
        { d: circle(128, 185, 6), part: 'sırt beneği', fill: '#ffe066' },
        { d: circle(122, 230, 6.5), part: 'sırt beneği', fill: '#ffe066' },
        { d: circle(215, 252, 6), part: 'sırt beneği', fill: '#ffe066' },
        { d: circle(275, 268, 5.5), part: 'sırt beneği', fill: '#ffe066' },
        { d: circle(302, 305, 5), part: 'kuyruk beneği', fill: '#ffe066' },
      ],
    },
  ],
};

export default yilan;
