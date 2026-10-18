import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Temeller 12: Ayna Simetrisi — İki yanı birbiriyle tıpatıp aynı olan rengarenk bir kelebek. */
const simetriKelebek: Lesson = {
  id: 'simetri-kelebek',
  path: 'temeller',
  title: 'Simetri Kelebeği',
  emoji: '🦋',
  order: 12,
  level: 2,
  skill: 'Her iki tarafı eşit çizerek ayna simetrisi uygulamayı öğrendin!',
  palette: ['#7209b7', '#4361ee', '#4cc9f0', '#ffd166', '#f72585', '#ff8fab'],
  steps: [
    {
      say: 'Tam ortaya dikey bir simetri çizgisi çizelim. Bu çizgi kelebeğimizin ayna çizgisi olacak.',
      shapes: [
        { d: 'M200,40 L200,360', guide: true, part: 'simetri ekseni' },
        { d: ellipse(200, 210, 16, 75), part: 'kelebek gövdesi', fill: '#7209b7' },
      ],
    },
    {
      say: 'Gövdenin tepesine bir kafa ve iki yana eşit açılan kıvrık antenler çizelim.',
      shapes: [
        { d: circle(200, 120, 22), part: 'kafa', fill: '#7209b7' },
        { d: 'M192,102 Q175,70 155,70 Q145,75 152,85', part: 'sol anten' },
        { d: 'M208,102 Q225,70 245,70 Q255,75 248,85', part: 'sağ anten' },
      ],
    },
    {
      say: 'Simetri çizgisinin soluna ve sağına aynı büyüklükte geniş üst kanatlar çizelim.',
      shapes: [
        { d: 'M188,160 C150,90 80,85 55,130 C30,175 90,230 185,215 Z', part: 'sol üst kanat', fill: '#4361ee' },
        { d: 'M212,160 C250,90 320,85 345,130 C370,175 310,230 215,215 Z', part: 'sağ üst kanat', fill: '#4361ee' },
      ],
    },
    {
      say: 'Üst kanatların altına, iki yana eşit damla şeklinde alt kanatlar ekleyelim.',
      shapes: [
        { d: 'M185,225 C120,230 80,270 95,320 C110,360 170,330 188,275 Z', part: 'sol alt kanat', fill: '#4cc9f0' },
        { d: 'M215,225 C280,230 320,270 305,320 C290,360 230,330 212,275 Z', part: 'sağ alt kanat', fill: '#4cc9f0' },
      ],
    },
    {
      say: 'Her iki üst ve alt kanada aynı hizada yuvarlak desenler çizelim.',
      shapes: [
        { d: circle(115, 155, 20), part: 'sol üst benek', fill: '#ffd166' },
        { d: circle(285, 155, 20), part: 'sağ üst benek', fill: '#ffd166' },
        { d: circle(145, 290, 14), part: 'sol alt benek', fill: '#ffd166' },
        { d: circle(255, 290, 14), part: 'sağ alt benek', fill: '#ffd166' },
      ],
    },
    {
      say: 'Büyük beneklerin içine ve kenarlara minik pembe süs noktaları ekleyelim.',
      shapes: [
        { d: circle(115, 155, 8), part: 'sol iç desen', fill: '#f72585' },
        { d: circle(285, 155, 8), part: 'sağ iç desen', fill: '#f72585' },
        { d: circle(145, 290, 6), part: 'sol alt iç desen', fill: '#f72585' },
        { d: circle(255, 290, 6), part: 'sağ alt iç desen', fill: '#f72585' },
      ],
    },
    {
      say: 'Kelebeğimizin yüzüne simetrik iki göz, gülen bir ağız ve pembe yanaklar konduralım.',
      shapes: [
        { d: circle(192, 118, 5), part: 'sol göz', fill: '#ffffff' },
        { d: circle(208, 118, 5), part: 'sağ göz', fill: '#ffffff' },
        { d: circle(192, 118, 2.5), part: 'sol göz bebeği', fill: '#2d2d2d' },
        { d: circle(208, 118, 2.5), part: 'sağ göz bebeği', fill: '#2d2d2d' },
        { d: 'M195,128 Q200,134 205,128', part: 'ağız' },
        { d: circle(186, 126, 4), part: 'sol yanak', fill: '#ff8fab' },
        { d: circle(214, 126, 4), part: 'sağ yanak', fill: '#ff8fab' },
      ],
    },
  ],
};

export default simetriKelebek;
