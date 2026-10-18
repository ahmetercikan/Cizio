import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const bardak: Lesson = {
  id: 'bardak',
  path: 'nesneler',
  title: 'Renkli Bardak',
  emoji: '🥤',
  order: 23,
  level: 1,
  skill: 'Bardak formu oluşturup içine sıvı, baloncuklar ve sevimli detaylar eklemeyi öğrendin!',
  palette: ['#e0f2fe', '#bae6fd', '#ff477e', '#ff70a6', '#ffd166', '#ffffff', '#2d2d2d', '#ff0054'],
  steps: [
    {
      say: 'Kâğıdın ortasına ağzı oval, aşağıya doğru hafifçe daralan bir bardak gövdesi çizelim.',
      shapes: [
        {
          d: 'M125,130 C125,119 158,110 200,110 C242,110 275,119 275,130 L255,325 C255,334 230,342 200,342 C170,342 145,334 145,325 Z',
          part: 'bardak gövdesi',
          fill: '#e0f2fe',
        },
        {
          d: ellipse(200, 130, 75, 20),
          part: 'bardak ağzı',
          fill: '#bae6fd',
        },
      ],
    },
    {
      say: 'Bardağın içine lezzetli, pespembe meyve suyu dolduralım.',
      shapes: [
        {
          d: ellipse(200, 175, 68, 16),
          part: 'meyve suyu yüzeyi',
          fill: '#ff70a6',
        },
        {
          d: 'M132,175 L147,322 C147,331 171,338 200,338 C229,338 253,331 253,322 L268,175 C242,190 158,190 132,175 Z',
          part: 'meyve suyu',
          fill: '#ff477e',
        },
      ],
    },
    {
      say: 'Bardağın içinden dışarı uzanan, üstü bükülmüş çizgili bir pipet ekleyelim.',
      shapes: [
        {
          d: 'M178,310 L178,105 L138,58 L152,46 L192,98 L192,310 Z',
          part: 'pipet',
          fill: '#ffd166',
        },
        {
          d: 'M140,62 L154,50 M149,73 L163,61 M160,86 L174,74 M178,115 L192,115 M178,142 L192,142 M178,170 L192,170 M178,200 L192,200',
          part: 'pipet çizgileri',
        },
      ],
    },
    {
      say: 'Meyve suyunun içine serinletici bir buz küpü ve yukarı doğru çıkan baloncuklar çizelim.',
      shapes: [
        {
          d: 'M162,190 L196,182 L206,196 L172,204 Z',
          part: 'buz küpü',
          fill: '#ffffff',
        },
        { d: 'M196,182 L172,204', part: 'buz çizgisi' },
        { d: circle(165, 225, 7), part: 'baloncuk 1', fill: '#ffffff' },
        { d: circle(225, 230, 6), part: 'baloncuk 2', fill: '#ffffff' },
        { d: circle(185, 255, 9), part: 'baloncuk 3', fill: '#ffffff' },
        { d: circle(215, 275, 7), part: 'baloncuk 4', fill: '#ffffff' },
        { d: circle(165, 290, 5), part: 'baloncuk 5', fill: '#ffffff' },
      ],
    },
    {
      say: 'Bardağımıza neşeli minik bir gülen yüz ve yanına parlak cam parıltısı konduralım.',
      shapes: [
        { d: 'M142,148 C145,195 152,260 155,310', part: 'cam parıltısı' },
        { d: 'M148,155 C150,185 154,215 156,235', part: 'küçük parıltı' },
        { d: circle(185, 240, 4), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(215, 240, 4), part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M195,248 Q200,254 205,248', part: 'gülen ağız' },
        { d: ellipse(176, 246, 4, 3), part: 'sol yanak', fill: '#ff0054' },
        { d: ellipse(224, 246, 4, 3), part: 'sağ yanak', fill: '#ff0054' },
      ],
    },
  ],
};

export default bardak;
