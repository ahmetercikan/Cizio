import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Özel Günler 8: Öğretmenler Günü için kitapların üstünde gülümseyen bir elma. */
const ogretmenElma: Lesson = {
  id: 'ogretmen-elma',
  path: 'ozel',
  title: 'Öğretmenime Elma',
  emoji: '🍎',
  order: 8,
  level: 1,
  skill: 'Şekilleri üst üste koyarak bir yığın kurmayı öğrendin! Öğretmenine sevgiyle verebilirsin.',
  palette: ['#5aa9e6', '#ffd166', '#ff4d4d', '#6ccf7f', '#8d6e63', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce alta uzun, yatay bir kitap çiz. Üstüne biraz daha kısa ikinci bir kitap koy.',
      shapes: [
        { d: 'M62,306 L338,306 L338,358 L62,358 Z', part: 'alttaki kitap', fill: '#5aa9e6' },
        { d: 'M88,256 L318,256 L318,306 L88,306 Z', part: 'üstteki kitap', fill: '#ffd166' },
      ],
    },
    {
      say: 'Kitapların üstüne kocaman bir elma çiz. Tepesi ortadan hafif çukur, altı yuvarlak olsun.',
      shapes: [
        {
          d: 'M200,118 C170,92 112,102 112,166 C112,222 158,256 200,242 C242,256 288,222 288,166 C288,102 230,92 200,118 Z',
          part: 'elma',
          fill: '#ff4d4d',
        },
      ],
    },
    {
      say: 'Elmanın tepesindeki çukura kısa bir sap çiz. Sapın yanına da bir yaprak ekle.',
      shapes: [
        { d: 'M200,120 Q198,94 210,76', part: 'sap' },
        { d: 'M206,94 Q234,62 270,76 Q244,108 206,94 Z', part: 'yaprak', fill: '#6ccf7f' },
      ],
    },
    {
      say: 'Elmanın ortasına iki kocaman oval göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: ellipse(172, 168, 14, 18), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(177, 161, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(228, 168, 14, 18), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(233, 161, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına tatlı bir gülümseme, iki yanına pembe yanaklar çiz. Sol üste de parlak bir çizgi çek.',
      shapes: [
        { d: 'M184,202 Q200,218 216,202', part: 'ağız' },
        { d: ellipse(148, 198, 12, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(252, 198, 12, 7), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M134,150 Q138,126 160,118', part: 'parıltı' },
      ],
    },
    {
      say: 'Kitapların ortasına birer beyaz etiket çiz. Öğretmenine elma hediyen hazır!',
      shapes: [
        { d: 'M160,270 L246,270 L246,292 L160,292 Z', part: 'üst kitap etiketi', fill: '#ffffff' },
        { d: 'M150,320 L250,320 L250,344 L150,344 Z', part: 'alt kitap etiketi', fill: '#ffffff' },
      ],
    },
  ],
};

export default ogretmenElma;
