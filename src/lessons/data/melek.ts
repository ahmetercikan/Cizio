import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 15: Haresi, bembeyaz kanatları ve pofuduk bulutuyla minik melek. */
const melek: Lesson = {
  id: 'melek',
  path: 'masal',
  title: 'Minik Melek',
  emoji: '👼',
  order: 2,
  level: 1,
  skill: 'Altındaki pofuduk buluttan başlayıp kanatları ve parlayan haresiyle sevimli bir melek çizmeyi öğrendin!',
  palette: ['#ffffff', '#ffe1cc', '#fde047', '#bae6fd', '#ffb3c1', '#facc15', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kâğıdın altına meleğin oturduğu kocaman, pofuduk bir bulut çiz.',
      shapes: [
        {
          d: 'M90,324 C68,324 50,338 50,358 C50,378 74,386 100,386 L300,386 C326,386 350,374 350,354 C350,334 330,324 310,324 C300,306 274,296 250,306 C232,290 192,290 172,308 C152,298 116,304 90,324 Z',
          part: 'bulut',
          fill: '#bae6fd',
        },
        { d: 'M120,340 Q145,326 175,336', part: 'sol bulut çizgisi' },
        { d: 'M230,336 Q260,322 285,340', part: 'sağ bulut çizgisi' },
      ],
    },
    {
      say: 'Bulutun üstüne meleğin bembeyaz elbisesini çiz. Beline sarı bir kuşak ekle.',
      shapes: [
        {
          d: 'M172,185 L142,320 Q200,334 258,320 L228,185 Z',
          part: 'melek elbisesi',
          fill: '#ffffff',
        },
        { d: 'M176,186 Q200,200 224,186', part: 'yaka' },
        { d: 'M160,250 Q200,260 240,250', part: 'kemer kuşağı' },
      ],
    },
    {
      say: 'Elbisenin üstüne yuvarlak başını ve kıvırcık sarı saçlarını çiz.',
      shapes: [
        { d: circle(200, 142, 38), part: 'baş', fill: '#ffe1cc' },
        {
          d: 'M156,144 C146,122 160,96 180,96 C190,86 210,86 220,96 C240,96 254,122 244,144 C238,124 216,116 200,124 C184,116 162,124 156,144 Z',
          part: 'kıvırcık saç',
          fill: '#fde047',
        },
      ],
    },
    {
      say: 'Başının üstünde havada süzülen altın renkli parıldayan hareyi çiz.',
      shapes: [
        { d: ellipse(200, 72, 40, 12), part: 'hale dışı', fill: '#facc15' },
        { d: ellipse(200, 72, 30, 8), part: 'hale içi', fill: '#fef08a' },
      ],
    },
    {
      say: 'Sırtının iki yanına açılan yumuşacık beyaz kanatlar ekle.',
      shapes: [
        {
          d: 'M168,192 C112,142 82,182 92,232 C98,246 112,250 122,240 C128,255 142,254 156,242 L168,225 Z',
          part: 'sol kanat',
          fill: '#ffffff',
        },
        {
          d: 'M232,192 C288,142 318,182 308,232 C302,246 288,250 278,240 C272,255 258,254 244,242 L232,225 Z',
          part: 'sağ kanat',
          fill: '#ffffff',
        },
        { d: 'M118,202 Q132,226 152,220', part: 'sol tüy kıvrımı' },
        { d: 'M282,202 Q268,226 248,220', part: 'sağ tüy kıvrımı' },
      ],
    },
    {
      say: 'Ellerini kalbinin üstünde birleştir ve ellerinde parlayan minik bir kalp çiz.',
      shapes: [
        { d: 'M172,196 L192,232 L182,238', part: 'sol kol' },
        { d: 'M228,196 L208,232 L218,238', part: 'sağ kol' },
        {
          d: 'M200,242 L192,232 A5,5 0 0,1 200,226 A5,5 0 0,1 208,232 Z',
          part: 'sevgi kalbi',
          fill: '#facc15',
        },
        { d: ellipse(176, 324, 7, 5), part: 'sol ayak', fill: '#ffe1cc' },
        { d: ellipse(224, 324, 7, 5), part: 'sağ ayak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Güler yüzlü kocaman gözler, tatlı bir tebessüm ve pembe yanaklar ekle.',
      shapes: [
        { d: ellipse(184, 144, 6, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(186, 141, 2.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(216, 144, 6, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(218, 141, 2.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M193,156 Q200,162 207,156', part: 'gülümseme' },
        { d: ellipse(172, 154, 7, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(228, 154, 7, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default melek;
