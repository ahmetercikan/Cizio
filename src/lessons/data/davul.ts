import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const davul: Lesson = {
  id: 'davul',
  path: 'nesneler',
  title: 'Davul',
  emoji: '🥁',
  order: 24,
  level: 2,
  skill: 'Silindirik gövdeye kasnaklar, zikzak gergi ipleri ve bagetler ekleyerek neşeli bir enstrüman çizmeyi öğrendin!',
  palette: ['#e63946', '#fefae0', '#3a86ff', '#ffbe0b', '#fb5607', '#2d2d2d'],
  steps: [
    {
      say: 'Önce davulumuzun üst yüzeyi için kâğıdın yukarısına yatık, geniş bir oval çizelim.',
      shapes: [
        {
          d: 'M96,140 C96,121 142,106 200,106 C258,106 304,121 304,140 C304,159 258,174 200,174 C142,174 96,159 96,140 Z',
          part: 'davul derisi',
          fill: '#fefae0',
        },
      ],
    },
    {
      say: 'Ovalin iki yanından aşağıya düz çizgiler inip altını kavisli bir yayla birleştirerek gövdeyi yapalım.',
      shapes: [
        {
          d: 'M96,140 C142,159 258,159 304,140 L304,265 C258,299 142,299 96,265 Z',
          part: 'davul gövdesi',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Gövdenin hem üstüne hem de altına renkli kasnak şeritleri ekleyelim.',
      shapes: [
        {
          d: 'M96,140 C142,159 258,159 304,140 L304,155 C258,174 142,174 96,155 Z',
          part: 'üst kasnak',
          fill: '#3a86ff',
        },
        {
          d: 'M96,250 C142,284 258,284 304,250 L304,265 C258,299 142,299 96,265 Z',
          part: 'alt kasnak',
          fill: '#3a86ff',
        },
      ],
    },
    {
      say: 'Kasnakların arasına aşağı yukarı inip çıkan zikzak gergi ipleri ve ayar boncukları çizelim.',
      shapes: [
        {
          d: 'M96,155 L130,274 L165,170 L200,282 L235,170 L270,274 L304,155',
          part: 'gergi ipleri',
        },
        { d: circle(147, 222, 5), part: 'ayar boncuğu 1', fill: '#ffbe0b' },
        { d: circle(182, 226, 5), part: 'ayar boncuğu 2', fill: '#ffbe0b' },
        { d: circle(218, 226, 5), part: 'ayar boncuğu 3', fill: '#ffbe0b' },
        { d: circle(253, 222, 5), part: 'ayar boncuğu 4', fill: '#ffbe0b' },
      ],
    },
    {
      say: 'Sol taraftan davula doğru uzanan yuvarlak uçlu ahşap bir baget çizelim.',
      shapes: [
        {
          d: 'M170,142 L82,64 L88,58 L176,136 Z',
          part: 'sol baget sapı',
          fill: '#fb5607',
        },
        {
          d: circle(174, 138, 7.5),
          part: 'sol baget ucu',
          fill: '#ffbe0b',
        },
      ],
    },
    {
      say: 'Sağ taraftan gelen ikinci bagetimizi de ekleyip davulun üstüne yerleştirelim.',
      shapes: [
        {
          d: 'M230,142 L318,64 L312,58 L224,136 Z',
          part: 'sağ baget sapı',
          fill: '#fb5607',
        },
        {
          d: circle(226, 138, 7.5),
          part: 'sağ baget ucu',
          fill: '#ffbe0b',
        },
      ],
    },
    {
      say: 'Davulun ses çıkardığını göstermek için havaya uçuşan notalar ve titreşim çizgileri ekleyelim.',
      shapes: [
        { d: 'M156,130 L165,134 M162,146 L168,141 M170,152 L173,146', part: 'sol vuruş çizgileri' },
        { d: 'M244,130 L235,134 M238,146 L232,141 M230,152 L227,146', part: 'sağ vuruş çizgileri' },
        { d: ellipse(58, 110, 6, 5), part: 'sol nota başı', fill: '#2d2d2d' },
        { d: 'M63,110 L72,78 L88,72 L88,82 L73,88 M72,78 L88,72', part: 'sol nota kuyruğu' },
        { d: ellipse(332, 116, 6, 5), part: 'sağ nota başı', fill: '#2d2d2d' },
        { d: 'M337,116 L342,84 M342,84 C348,88 355,89 355,96', part: 'sağ nota kuyruğu' },
        { d: 'M65,195 C55,210 55,230 65,245', part: 'sol ses dalgası' },
        { d: 'M335,195 C345,210 345,230 335,245', part: 'sağ ses dalgası' },
      ],
    },
  ],
};

export default davul;
