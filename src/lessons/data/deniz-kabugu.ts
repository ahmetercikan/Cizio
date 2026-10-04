import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Deniz 6: Tepesi dalgalı, çizgili ve gülümseyen bir deniz kabuğu. */
const denizKabugu: Lesson = {
  id: 'deniz-kabugu',
  path: 'deniz',
  title: 'Deniz Kabuğu',
  emoji: '🐚',
  order: 6,
  level: 1,
  skill: 'Dalgalı bir kenar ve tek noktaya doğru uzanan çizgiler çizdin. Yelpaze gibi açılan şekiller böyle yapılır!',
  palette: ['#ffc2a1', '#ff9b76', '#a8e6ff', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Alttan başla, yelpaze gibi açılan bir kabuk çiz. Tepesini yedi küçük tümsekle dalgalı yap.',
      shapes: [
        {
          d: 'M175,315 C120,292 66,225 58.4,148.8 Q63.3,115.9 95.1,125.3 Q106,94 135.5,109.2 Q152.2,80.5 178.2,101 Q200,76 221.8,101 Q247.8,80.5 264.5,109.2 Q294,94 304.9,125.3 Q336.7,115.9 341.6,148.8 C334,225 280,292 225,315 Q200,322 175,315 Z',
          part: 'kabuk',
          fill: '#ffc2a1',
        },
      ],
    },
    {
      say: 'Kabuğun altına iki yana açılan küçük bir ayak çiz. Kabuktan başla, kabukta bitir.',
      shapes: [
        {
          d: 'M175,315 L142,336 Q134,352 152,352 L248,352 Q266,352 258,336 L225,315',
          part: 'taban',
          fill: '#ff9b76',
        },
      ],
    },
    {
      say: 'Sol taraftaki üç çukurdan aşağı doğru düz çizgiler çiz. Çizgiler ortaya doğru yaklaşsın.',
      shapes: [
        { d: 'M95.1,125.3 L131.6,196.5', part: 'sol dış çizgi' },
        { d: 'M135.5,109.2 L157.9,186', part: 'sol orta çizgi' },
        { d: 'M178.2,101 L185.8,180.7', part: 'sol iç çizgi' },
      ],
    },
    {
      say: 'Şimdi sağ taraftaki üç çukurdan da aynı çizgileri çiz. Kabuğun dalgaları hazır!',
      shapes: [
        { d: 'M221.8,101 L214.2,180.7', part: 'sağ iç çizgi' },
        { d: 'M264.5,109.2 L242.1,186', part: 'sağ orta çizgi' },
        { d: 'M304.9,125.3 L268.4,196.5', part: 'sağ dış çizgi' },
      ],
    },
    {
      say: 'Çizgilerin altına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(163, 234, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(158, 228, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(237, 234, 16), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(232, 228, 5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin arasına gülen bir ağız, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M180,262 Q200,282 220,262', part: 'ağız' },
        { d: ellipse(132, 262, 14, 9), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(268, 262, 14, 9), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak kabuğun yanlarına üç baloncuk çiz. Biri büyük, ikisi küçük olsun.',
      shapes: [
        { d: circle(352, 72, 14), part: 'büyük baloncuk', fill: '#a8e6ff' },
        { d: circle(374, 40, 8), part: 'küçük baloncuk', fill: '#a8e6ff' },
        { d: circle(44, 72, 10), part: 'sol baloncuk', fill: '#a8e6ff' },
      ],
    },
  ],
};

export default denizKabugu;
