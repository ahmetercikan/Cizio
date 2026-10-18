import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Temeller 10: Eğri çizgiler — S ve C eğrileriyle kıvrılan sevimli bir yılan. */
const egriCizgiler: Lesson = {
  id: 'egri-cizgiler',
  path: 'temeller',
  title: 'Yılanın Yolu',
  emoji: '🐍',
  order: 10,
  level: 1,
  skill: 'S ve C eğrilerini akıcı biçimde çizmeyi öğrendin!',
  palette: ['#52b788', '#74c69d', '#ffd166', '#e63946', '#2d2d2d', '#b0c4de'],
  steps: [
    {
      say: 'Yılanımızın dalgalı gövdesi için bir S eğrisi çizelim. Soldan başla, kıvrılarak sağa ve yukarı uzansın.',
      shapes: [
        {
          d: 'M50,330 C80,230 160,230 200,290 C240,350 310,310 295,160 L265,165 C275,270 225,305 190,260 C155,210 90,215 50,330 Z',
          part: 'dalgalı gövde',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Gövdenin ucuna sevimli, yuvarlak bir kafa çizelim.',
      shapes: [
        {
          d: ellipse(280, 135, 38, 30),
          part: 'kafa',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Yılanın gövdesine renkli C eğrileri ve dalgalı çizgiler çizerek desenler yapalım.',
      shapes: [
        { d: 'M95,248 Q110,260 100,282', part: 'desen çizgisi' },
        { d: 'M140,240 Q155,255 145,275', part: 'desen çizgisi' },
        { d: 'M230,290 Q245,275 255,290', part: 'desen çizgisi' },
        { d: 'M270,230 Q285,225 285,200', part: 'desen çizgisi' },
        { d: ellipse(115, 260, 7, 5), part: 'sol benek', fill: '#ffd166' },
        { d: ellipse(235, 290, 7, 5), part: 'orta benek', fill: '#ffd166' },
      ],
    },
    {
      say: 'Kafaya iki iri, sevimli göz ve pembe yanaklar ekleyelim.',
      shapes: [
        { d: circle(268, 128, 9), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(296, 128, 9), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(266, 125, 3), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(294, 125, 3), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: ellipse(256, 142, 6, 4), part: 'sol yanak', fill: '#ff9ebb' },
        { d: ellipse(308, 142, 6, 4), part: 'sağ yanak', fill: '#ff9ebb' },
      ],
    },
    {
      say: 'Yılanımıza mutlu bir gülümseme ve ucundan çıkan minik çatallı bir dil çizelim.',
      shapes: [
        { d: 'M274,144 Q282,152 290,144', part: 'ağız' },
        { d: 'M282,150 L282,166 L276,173 M282,166 L288,173', part: 'çatallı dil', fill: '#e63946' },
      ],
    },
    {
      say: 'Yılanın gezindiği yola kıvrımlı çimen yaprakları ve küçük taşlar ekleyelim.',
      shapes: [
        { d: 'M40,360 Q65,335 90,360 M150,365 Q170,345 190,365 M260,360 Q285,335 310,360', part: 'çimenler', fill: '#74c69d' },
        { d: ellipse(70, 360, 16, 9), part: 'sol taş', fill: '#b0c4de' },
        { d: ellipse(345, 350, 18, 11), part: 'sağ taş', fill: '#b0c4de' },
        { d: 'M20,365 L380,365', part: 'zemin çizgisi' },
      ],
    },
  ],
};

export default egriCizgiler;
