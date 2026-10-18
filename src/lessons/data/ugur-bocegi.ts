import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ugurBocegi: Lesson = {
  id: 'ugur-bocegi',
  path: 'hayvanlar',
  title: 'Uğur Böceği',
  emoji: '🐞',
  order: 30,
  level: 1,
  skill: 'Daireyi ortadan ikiye bölerek ve simetrik benekler ekleyerek sevimli bir uğur böceği çizmeyi öğrendin!',
  palette: ['#e63946', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Uğur böceğimizin kanatları için kâğıdın ortasına kocaman, parlak kırmızı bir yuvarlak çizelim.',
      shapes: [
        {
          d: circle(200, 230, 80),
          part: 'gövde',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne yarım daire şeklinde siyah bir kafa ve iki parlak göz ekleyelim.',
      shapes: [
        {
          d: 'M162,165 C162,118 238,118 238,165 Z',
          part: 'kafa',
          fill: '#2d2d2d',
        },
        { d: circle(182, 142, 5), part: 'sol göz', fill: '#ffffff' },
        { d: circle(183, 143, 2.5), part: 'sol gözbebeği', fill: '#2d2d2d' },
        { d: circle(218, 142, 5), part: 'sağ göz', fill: '#ffffff' },
        { d: circle(217, 143, 2.5), part: 'sağ gözbebeği', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Kanatların ayrıldığını göstermek için ortadan aşağıya düz bir çizgi ve boynuna minik bir üçgen çizelim.',
      shapes: [
        { d: 'M200,165 L200,310', part: 'kanat çizgisi' },
        {
          d: 'M188,165 L212,165 L200,185 Z',
          part: 'boyun üçgeni',
          fill: '#2d2d2d',
        },
      ],
    },
    {
      say: 'Kırmızı kanatların üstüne üçer tane tombul, simsiyah benek konduralım.',
      shapes: [
        { d: circle(155, 205, 13), part: 'sol üst benek', fill: '#2d2d2d' },
        { d: circle(145, 260, 11), part: 'sol alt benek', fill: '#2d2d2d' },
        { d: circle(182, 275, 10), part: 'sol iç benek', fill: '#2d2d2d' },
        { d: circle(245, 205, 13), part: 'sağ üst benek', fill: '#2d2d2d' },
        { d: circle(255, 260, 11), part: 'sağ alt benek', fill: '#2d2d2d' },
        { d: circle(218, 275, 10), part: 'sağ iç benek', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Kafasının üstüne uçları dışarı doğru kıvrılan iki sevimli anten yapalım.',
      shapes: [
        {
          d: 'M182,122 C172,92 145,82 140,92 C135,102 148,108 152,98',
          part: 'sol anten',
        },
        {
          d: 'M218,122 C228,92 255,82 260,92 C265,102 252,108 248,98',
          part: 'sağ anten',
        },
      ],
    },
    {
      say: 'Son olarak gövdenin iki yanına üçer tane minik ve kıvrık bacak ekleyelim.',
      shapes: [
        { d: 'M135,185 C108,180 98,195 90,190', part: 'sol ön bacak' },
        { d: 'M122,230 C95,230 85,245 80,245', part: 'sol orta bacak' },
        { d: 'M138,278 C112,288 102,310 98,320', part: 'sol arka bacak' },
        { d: 'M265,185 C292,180 302,195 310,190', part: 'sağ ön bacak' },
        { d: 'M278,230 C305,230 315,245 320,245', part: 'sağ orta bacak' },
        { d: 'M262,278 C288,288 298,310 302,320', part: 'sağ arka bacak' },
      ],
    },
  ],
};

export default ugurBocegi;
