import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const murekkepBaligi: Lesson = {
  id: 'murekkep-baligi',
  path: 'deniz',
  title: 'Mürekkep Balığı',
  emoji: '🦑',
  order: 11,
  level: 2,
  skill: 'Sivri bir kafa, yan yüzgeçler ve kıvrımlı vantuzlu kollar çizmeyi öğrendin!',
  palette: ['#ff6b8b', '#ff8da9', '#ffffff', '#2d2d2d', '#70d6ff', '#ffd166'],
  steps: [
    {
      say: 'Önce yukarı doğru sivrilen uzun bir kukuleta çiz. Bu balığımızın kafası olacak.',
      shapes: [
        {
          d: 'M200,45 C225,75 248,115 248,165 C216,172 184,172 152,165 C152,115 175,75 200,45 Z',
          part: 'kafa',
          fill: '#ff6b8b',
        },
      ],
    },
    {
      say: 'Kafanın iki yanına üçgen şeklinde sivri yüzgeçler ekle.',
      shapes: [
        { d: 'M165,115 C130,105 105,80 100,65 C120,60 150,70 178,85 Z', part: 'sol yüzgeç', fill: '#ff8da9' },
        { d: 'M235,115 C270,105 295,80 300,65 C280,60 250,70 222,85 Z', part: 'sağ yüzgeç', fill: '#ff8da9' },
      ],
    },
    {
      say: 'Kafanın altına iki büyük yuvarlak göz ve aralarına gülen bir ağız çiz.',
      shapes: [
        { d: circle(172, 175, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(168, 171, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(228, 175, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(224, 171, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M192,185 Q200,195 208,185', part: 'ağız' },
      ],
    },
    {
      say: 'Gözlerin altından aşağı doğru sarkan dört tane kıvrık kısa kol çiz.',
      shapes: [
        { d: 'M160,195 C145,225 140,255 155,270 C165,265 165,245 172,205', part: 'sol dış kol', fill: '#ff6b8b' },
        { d: 'M178,205 C175,235 180,265 190,275 C198,270 195,240 192,205', part: 'sol iç kol', fill: '#ff6b8b' },
        { d: 'M208,205 C205,240 202,270 210,275 C220,265 225,235 222,205', part: 'sağ iç kol', fill: '#ff6b8b' },
        { d: 'M228,205 C235,245 235,265 245,270 C260,255 255,225 240,195', part: 'sağ dış kol', fill: '#ff6b8b' },
      ],
    },
    {
      say: 'Şimdi kısa kolların yanından aşağı uzanan iki uzun yakalama kolu ekle.',
      shapes: [
        {
          d: 'M174,205 C162,260 135,310 145,355 C150,370 165,370 165,355 C165,335 150,305 184,205',
          part: 'sol uzun kol',
          fill: '#ff8da9',
        },
        {
          d: 'M226,205 C238,260 265,310 255,355 C250,370 235,370 235,355 C235,335 250,305 216,205',
          part: 'sağ uzun kol',
          fill: '#ff8da9',
        },
      ],
    },
    {
      say: 'Uzun kolların uçlarındaki geniş kısımlara minik yuvarlak vantuzlar koy.',
      shapes: [
        { d: circle(153, 345, 5), part: 'sol üst vantuz', fill: '#ffd166' },
        { d: circle(156, 360, 4), part: 'sol alt vantuz', fill: '#ffd166' },
        { d: circle(247, 345, 5), part: 'sağ üst vantuz', fill: '#ffd166' },
        { d: circle(244, 360, 4), part: 'sağ alt vantuz', fill: '#ffd166' },
      ],
    },
    {
      say: 'Son olarak kafanın üstüne sevimli benekler ve etrafa su baloncukları çiz.',
      shapes: [
        { d: circle(200, 95, 8), part: 'orta benek', fill: '#ffd166' },
        { d: circle(182, 125, 5), part: 'sol benek', fill: '#ffd166' },
        { d: circle(218, 125, 5), part: 'sağ benek', fill: '#ffd166' },
        { d: circle(325, 140, 11), part: 'büyük baloncuk', fill: '#70d6ff' },
        { d: circle(345, 110, 7), part: 'küçük baloncuk', fill: '#70d6ff' },
      ],
    },
  ],
};

export default murekkepBaligi;
