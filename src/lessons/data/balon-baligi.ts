import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const balonBaligi: Lesson = {
  id: 'balon-baligi',
  path: 'deniz',
  title: 'Balon Balığı',
  emoji: '🐡',
  order: 17,
  level: 1,
  skill: 'Yuvarlak bir gövde etrafına küçük sivri dikenler ve şaşkın bir ifade çizmeyi öğrendin!',
  palette: ['#ffd166', '#f4a261', '#ffffff', '#2d2d2d', '#ffb3c1', '#a8dadc'],
  steps: [
    {
      say: 'Önce kocaman, şişmiş yuvarlak bir balon gövde çiz.',
      shapes: [
        { d: circle(190, 200, 95), part: 'şişmiş gövde', fill: '#ffd166' },
      ],
    },
    {
      say: 'Gövdenin sağına dalgalı bir kuyruk, üstüne ve altına küçük yüzgeçler ekle.',
      shapes: [
        { d: 'M280,185 L335,165 Q325,200 335,235 L280,215', part: 'kuyruk', fill: '#f4a261' },
        { d: 'M205,108 Q225,80 245,110', part: 'sırt yüzgeci', fill: '#f4a261' },
        { d: 'M205,292 Q225,320 245,290', part: 'karın yüzgeci', fill: '#f4a261' },
        { d: 'M190,212 Q212,198 220,222 Q205,232 190,212 Z', part: 'yan yüzgeç', fill: '#f4a261' },
      ],
    },
    {
      say: 'Gövdenin etrafına dışarı doğru bakan sivri minik dikenler ekle.',
      shapes: [
        { d: 'M130,125 L124,105 L145,116', part: 'üst sol diken' },
        { d: 'M165,108 L168,88 L185,105', part: 'üst orta diken' },
        { d: 'M102,158 L82,152 L105,178', part: 'orta sol üst diken' },
        { d: 'M96,202 L76,207 L98,222', part: 'orta sol alt diken' },
        { d: 'M122,275 L114,295 L136,285', part: 'alt sol diken' },
        { d: 'M160,290 L165,310 L182,295', part: 'alt orta diken' },
      ],
    },
    {
      say: 'Gövdenin içine de küçük sivri dikenler serpiştir.',
      shapes: [
        { d: 'M135,160 L140,150 L148,162', part: 'iç diken 1' },
        { d: 'M120,210 L125,200 L133,212', part: 'iç diken 2' },
        { d: 'M145,245 L150,235 L158,247', part: 'iç diken 3' },
        { d: 'M175,260 L180,250 L188,262', part: 'iç diken 4' },
        { d: 'M230,160 L235,150 L243,162', part: 'iç diken 5' },
        { d: 'M240,240 L245,230 L253,242', part: 'iç diken 6' },
      ],
    },
    {
      say: 'Yüzüne kocaman, şaşkın bakan iki yuvarlak göz ve pembe yanaklar çiz.',
      shapes: [
        { d: circle(136, 172, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(132, 167, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(176, 168, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(172, 163, 4), part: 'sağ parıltı', fill: '#ffffff' },
        { d: ellipse(122, 202, 10, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(174, 200, 10, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak öne büzülmüş küçük yuvarlak bir ağız ve su baloncukları ekle.',
      shapes: [
        { d: ellipse(104, 195, 9, 13), part: 'şaşkın ağız', fill: '#f4a261' },
        { d: 'M104,182 C99,189 99,201 104,208', part: 'dudak çizgisi' },
        { d: circle(65, 140, 11), part: 'büyük baloncuk', fill: '#a8dadc' },
        { d: circle(48, 110, 7), part: 'orta baloncuk', fill: '#a8dadc' },
        { d: circle(68, 80, 5), part: 'küçük baloncuk', fill: '#a8dadc' },
      ],
    },
  ],
};

export default balonBaligi;
