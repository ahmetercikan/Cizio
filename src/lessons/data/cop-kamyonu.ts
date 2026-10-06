import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Köşeleri yuvarlatılmış dikdörtgen. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

/** İş Makineleri 2: Kocaman arka kutulu, yanında çöp kovası olan güler yüzlü bir çöp kamyonu. */
const copKamyonu: Lesson = {
  id: 'cop-kamyonu',
  path: 'ismakineleri',
  title: 'Çöp Kamyonu',
  emoji: '🚛',
  order: 2,
  level: 2,
  skill: 'Büyük bir kutunun yanına küçük bir kabin ekleyerek farklı boyda parçaları birleştirmeyi öğrendin!',
  palette: ['#5cc36b', '#ffc93c', '#3a3a4a', '#aee3ff', '#4fa3ff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir kutu çiz. Sol üst köşesi yuvarlak olsun, çöpler buraya dolacak.',
      shapes: [
        { d: 'M136,92 L258,92 L258,262 L112,262 L112,116 Q112,92 136,92 Z', part: 'kutu', fill: '#5cc36b' },
      ],
    },
    {
      say: 'Kutunun sağına kabini çiz. Önü eğik insin. Altına da upuzun bir şasi çek.',
      shapes: [
        {
          d: 'M258,262 L258,132 Q258,120 270,120 L310,120 Q322,120 328,132 L348,186 Q354,196 354,208 L354,252 Q354,262 344,262 Z',
          part: 'kabin',
          fill: '#ffc93c',
        },
        { d: rect(56, 258, 302, 20, 6), part: 'şasi', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Kutunun arkasına eğik bir çöp ağzı çiz. İçine de kocaman, karanlık bir delik yap.',
      shapes: [
        { d: 'M112,126 L84,132 Q62,136 62,158 L62,262 L112,262', part: 'arka hazne', fill: '#3fa457' },
        { d: 'M72,160 L102,152 L102,198 L72,198 Z', part: 'hazne ağzı', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Şasinin altına iki büyük tekerlek çiz. Ortalarına da küçük birer daire koy.',
      shapes: [
        { d: circle(166, 290, 32), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(166, 290, 12), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(306, 290, 32), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(306, 290, 12), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kabine eğik bir ön cam çiz. Kutunun üstüne iki dik çizgi, ortasına da beyaz bir şerit çiz.',
      shapes: [
        { d: 'M274,134 L308,134 Q316,134 319,142 L334,182 L268,182 L268,140 Q268,134 274,134 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: 'M162,96 L162,196', part: 'kutu çizgisi' },
        { d: 'M210,96 L210,196', part: 'kutu çizgisi' },
        { d: rect(112, 196, 146, 22, 0), part: 'şerit', fill: '#ffffff' },
      ],
    },
    {
      say: 'Camın altına iki yuvarlak göz çiz. İçlerine beyaz birer parıltı koy.',
      shapes: [
        { d: circle(286, 206, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(289, 202, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(326, 206, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(329, 202, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız ve pembe yanaklar çiz. Kabinin tepesine turuncu bir lamba koy.',
      shapes: [
        { d: 'M294,226 Q306,238 318,226', part: 'ağız' },
        { d: ellipse(271, 228, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(341, 228, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M280,120 L280,110 Q280,100 290,100 L300,100 Q310,100 310,110 L310,120', part: 'tepe lambası', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Kamyonun arkasına asılı bir çöp kovası çiz. Üstüne kapağını, altına minik bir tekerlek ekle.',
      shapes: [
        { d: 'M42,224 L80,224 L76,292 L46,292 Z', part: 'çöp kovası', fill: '#4fa3ff' },
        { d: rect(36, 210, 50, 14, 5), part: 'kova kapağı', fill: '#4fa3ff' },
        { d: circle(61, 298, 8), part: 'kova tekerleği', fill: '#3a3a4a' },
        { d: 'M54,240 L54,276 M68,240 L68,276', part: 'kova çizgileri' },
      ],
    },
  ],
};

export default copKamyonu;
