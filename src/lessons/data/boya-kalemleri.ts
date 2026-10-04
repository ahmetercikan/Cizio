import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 9: Dikdörtgen + sivri uç = boya kalemi. Eğik duran şekiller. */
const boyaKalemleri: Lesson = {
  id: 'boya-kalemleri',
  path: 'nesneler',
  title: 'Boya Kalemleri',
  emoji: '🖍️',
  order: 9,
  level: 2,
  skill: 'Dik ve yana eğik duran dikdörtgenlere sivri uçlar ekleyerek boya kalemi çizmeyi öğrendin!',
  palette: ['#c9a0ff', '#ff6b6b', '#4dabf7', '#ffd166', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kalemliğin gövdesini çiz. Soldan aşağı in, altta düz git, sonra sağdan yukarı çık.',
      shapes: [{ d: 'M100,240 L116,360 L284,360 L300,240', part: 'kalemlik', fill: '#c9a0ff' }],
    },
    {
      say: 'Kalemliğin üstüne biraz daha geniş, ince bir dikdörtgen çiz. Bu, kalemliğin ağzı.',
      shapes: [{ d: 'M88,214 L312,214 L312,240 L88,240 Z', part: 'kalemlik ağzı', fill: '#b085f5' }],
    },
    {
      say: 'Ortaya, kalemliğin ağzından yukarı uzun bir dikdörtgen çiz. Tepesine sivri bir uç ekle.',
      shapes: [
        { d: 'M178,214 L178,86 L222,86 L222,214', part: 'mavi kalem', fill: '#4dabf7' },
        { d: 'M178,86 L194,52 Q200,44 206,52 L222,86 Z', part: 'mavi kalem ucu', fill: '#4dabf7' },
      ],
    },
    {
      say: 'Sol tarafa sola doğru eğik ikinci bir kalem çiz. Onun da tepesine sivri bir uç koy.',
      shapes: [
        { d: 'M123,214 L96,120 L138,108 L169,214', part: 'kırmızı kalem', fill: '#ff6b6b' },
        { d: 'M96,120 L102,83 Q106,74 114,80 L138,108 Z', part: 'kırmızı kalem ucu', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Sağ tarafa da sağa doğru eğik üçüncü kalemi çiz. Soldaki kalemle ikiz gibi olsun.',
      shapes: [
        { d: 'M231,214 L262,108 L304,120 L277,214', part: 'sarı kalem', fill: '#ffd166' },
        { d: 'M262,108 L286,80 Q294,74 298,83 L304,120 Z', part: 'sarı kalem ucu', fill: '#ffd166' },
      ],
    },
    {
      say: 'Her kalemin ortasına bir kâğıt etiket çiz. Kalemi saran küçük bir dikdörtgen yeterli.',
      shapes: [
        { d: 'M115,187 L103,145 L146,133 L158,175 Z', part: 'kırmızı etiket', fill: '#e8434f' },
        { d: 'M178,180 L178,136 L222,136 L222,180 Z', part: 'mavi etiket', fill: '#2f86d6' },
        { d: 'M242,175 L254,133 L297,145 L285,187 Z', part: 'sarı etiket', fill: '#ffb703' },
      ],
    },
    {
      say: 'Kalemliğin üstüne iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(162, 282, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(167, 277, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(238, 282, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(243, 277, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M178,310 Q200,332 222,310', part: 'ağız' },
        { d: ellipse(136, 312, 14, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(264, 312, 14, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default boyaKalemleri;
