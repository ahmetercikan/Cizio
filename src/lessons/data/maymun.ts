import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 19: Cıvıl Maymun — Yuvarlak yüz, kocaman kulaklar, göbek ve kıvrık neşeli bir kuyruk. */
const maymun: Lesson = {
  id: 'maymun',
  path: 'hayvanlar',
  title: 'Cıvıl Maymun',
  emoji: '🐒',
  order: 19,
  level: 2,
  skill: 'Yuvarlak yüz, büyük kulaklar ve kıvrık kuyrukla neşeli bir maymun çizmeyi öğrendin!',
  palette: ['#8d5b4c', '#e0a96d', '#ffb3c1', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Maymunumuz için üstte yuvarlak bir kafa, altında tombul bir gövde çizelim.',
      shapes: [
        { d: ellipse(200, 260, 52, 62), part: 'gövde', fill: '#8d5b4c' },
        { d: circle(200, 140, 56), part: 'kafa', fill: '#8d5b4c' },
      ],
    },
    {
      say: 'Kafanın iki yanına kocaman yuvarlak kulaklar ve içlerine açık renkli halkalar ekleyelim.',
      shapes: [
        { d: circle(144, 140, 24), part: 'sol kulak', fill: '#8d5b4c' },
        { d: circle(144, 140, 14), part: 'sol kulak içi', fill: '#e0a96d' },
        { d: circle(256, 140, 24), part: 'sağ kulak', fill: '#8d5b4c' },
        { d: circle(256, 140, 14), part: 'sağ kulak içi', fill: '#e0a96d' },
      ],
    },
    {
      say: 'Yüzün içine kalp gibi iki tepecikli açık renkli bir yüz ve göbeğine bir oval çizelim.',
      shapes: [
        {
          d: 'M200,145 C185,110 155,115 155,142 C155,170 185,185 200,185 C215,185 245,170 245,142 C245,115 215,110 200,145 Z',
          part: 'yüz maskesi',
          fill: '#e0a96d',
        },
        { d: ellipse(200, 265, 34, 44), part: 'göbek', fill: '#e0a96d' },
      ],
    },
    {
      say: 'Gövdenin iki yanından uzanan sevimli kollar ve yuvarlak minik eller çizelim.',
      shapes: [
        { d: 'M160,230 C135,235 125,265 130,290 C138,295 145,285 145,275 C145,255 160,245 165,240 Z', part: 'sol kol', fill: '#8d5b4c' },
        { d: circle(133, 290, 9), part: 'sol el', fill: '#e0a96d' },
        { d: 'M240,230 C265,235 275,265 270,290 C262,295 255,285 255,275 C255,255 240,245 235,240 Z', part: 'sağ kol', fill: '#8d5b4c' },
        { d: circle(267, 290, 9), part: 'sağ el', fill: '#e0a96d' },
      ],
    },
    {
      say: 'Gövdenin altına iki tombul bacak ve yana açılan sevimli ayaklar ekleyelim.',
      shapes: [
        { d: ellipse(165, 315, 22, 16), part: 'sol bacak', fill: '#8d5b4c' },
        { d: ellipse(155, 325, 18, 12), part: 'sol ayak', fill: '#e0a96d' },
        { d: ellipse(235, 315, 22, 16), part: 'sağ bacak', fill: '#8d5b4c' },
        { d: ellipse(245, 325, 18, 12), part: 'sağ ayak', fill: '#e0a96d' },
      ],
    },
    {
      say: 'Gövdenin arkasından yukarı kıvrılan, helezon gibi neşeli uzun bir kuyruk çizelim.',
      shapes: [
        {
          d: 'M160,305 C110,315 75,270 85,220 C95,170 145,170 140,205 C135,225 115,225 110,210 C105,190 120,185 125,190 C125,195 115,200 115,205 C115,215 130,215 132,202 C135,180 100,180 92,220 C85,260 115,305 160,295 Z',
          part: 'kıvrık kuyruk',
          fill: '#8d5b4c',
        },
      ],
    },
    {
      say: 'Maymunumuza iki ışıl ışıl göz, iki burun deliği, gülen bir ağız ve pembe yanaklar konduralım.',
      shapes: [
        { d: circle(184, 142, 6), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(186, 140, 2), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(216, 142, 6), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(218, 140, 2), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: circle(196, 156, 2), part: 'sol burun deliği', fill: '#2d2d2d' },
        { d: circle(204, 156, 2), part: 'sağ burun deliği', fill: '#2d2d2d' },
        { d: 'M188,165 Q200,178 212,165', part: 'gülen ağız' },
        { d: ellipse(172, 160, 6, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(228, 160, 6, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default maymun;
