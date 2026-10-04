import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 8: Kocaman gülümsemeli, tombul yeşil bir kurbağa. */
const kurbaga: Lesson = {
  id: 'kurbaga',
  path: 'hayvanlar',
  title: 'Zıpzıp Kurbağa',
  emoji: '🐸',
  order: 8,
  level: 1,
  skill: 'Yayvan bir ovalin üstüne iki tümsek ekleyip gözleri oraya yerleştirdin. Şekilleri birleştirmeyi öğrendin!',
  palette: ['#7ccf5b', '#5aae45', '#d9f5b5', '#ffffff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kocaman, yayvan bir oval çiz. Bu kurbağanın geniş kafası olacak.',
      shapes: [{ d: ellipse(200, 195, 130, 80), part: 'kafa', fill: '#7ccf5b' }],
    },
    {
      say: 'Kafanın üstüne iki yuvarlak tümsek çiz. Kafadan başla, kafada bitir. Gözler buraya gelecek!',
      shapes: [
        { d: 'M109,137.9 A46,46 0 1,1 178,116.2', part: 'sol tümsek', fill: '#7ccf5b' },
        { d: 'M222,116.2 A46,46 0 1,1 291,137.9', part: 'sağ tümsek', fill: '#7ccf5b' },
      ],
    },
    {
      say: 'Kafanın altına küçük, tombul bir gövde çiz. İçine de açık renkli bir karın ovali ekle.',
      shapes: [
        { d: 'M120,258 C90,300 105,350 200,350 C295,350 310,300 280,258', part: 'gövde', fill: '#7ccf5b' },
        { d: ellipse(200, 310, 52, 28), part: 'karın', fill: '#d9f5b5' },
      ],
    },
    {
      say: 'Gövdenin iki yanına kıvrık arka bacaklar çiz. Altlarına da üç parmaklı ayaklar ekle.',
      shapes: [
        { d: 'M107.4,285 C40,280 35,352 100,352 C118,352 132,346 140,340.2', part: 'sol bacak', fill: '#7ccf5b' },
        { d: 'M292.6,285 C360,280 365,352 300,352 C282,352 268,346 260,340.2', part: 'sağ bacak', fill: '#7ccf5b' },
        { d: 'M66,348 Q38,354 46,368 Q56,378 70,370 Q80,384 94,372 Q108,382 116,366 Q122,358 118,352', part: 'sol ayak', fill: '#5aae45' },
        { d: 'M334,348 Q362,354 354,368 Q344,378 330,370 Q320,384 306,372 Q292,382 284,366 Q278,358 282,352', part: 'sağ ayak', fill: '#5aae45' },
      ],
    },
    {
      say: 'Tümseklerin içine büyük, beyaz birer daire çiz. Kurbağanın kocaman gözleri!',
      shapes: [
        { d: circle(135, 94, 25), part: 'sol göz', fill: '#ffffff' },
        { d: circle(265, 94, 25), part: 'sağ göz', fill: '#ffffff' },
      ],
    },
    {
      say: 'Beyaz dairelerin içine siyah göz bebekleri çiz. Üstlerine de minik parıltılar koy.',
      shapes: [
        { d: circle(140, 98, 15), part: 'sol göz bebeği', fill: '#2d2d2d' },
        { d: circle(260, 98, 15), part: 'sağ göz bebeği', fill: '#2d2d2d' },
        { d: circle(145, 92, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(265, 92, 5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kafanın ortasına iki minik burun deliği, altına kocaman bir gülümseme ve pembe yanaklar çiz.',
      shapes: [
        { d: 'M186,178 L190,178 M210,178 L214,178', part: 'burun delikleri' },
        { d: 'M140,212 Q200,262 260,212', part: 'ağız' },
        { d: ellipse(112, 210, 16, 10), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(288, 210, 16, 10), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kurbaga;
