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

/** İş Makineleri 1: Kasası yukarı kalkmış, içi kum dolu, güler yüzlü bir damperli kamyon. */
const kamyon: Lesson = {
  id: 'kamyon',
  path: 'ismakineleri',
  title: 'Damperli Kamyon',
  emoji: '🚚',
  order: 1,
  level: 1,
  skill: 'Kasayı eğik çizerek kamyonun kumu döktüğünü gösterdin. Eğik şekillerle hareket anlatmayı öğrendin!',
  palette: ['#ffc93c', '#ff9f1c', '#3a3a4a', '#aee3ff', '#c98a4b', '#2d2d2d'],
  steps: [
    {
      say: 'Önce sağ tarafa uzun bir kabin çiz. Önü eğik inen, köşeleri yuvarlak bir kutu olsun.',
      shapes: [
        {
          d: 'M252,270 L252,124 Q252,110 266,110 L306,110 Q320,110 326,122 L346,180 Q352,190 352,204 L352,258 Q352,270 340,270 Z',
          part: 'kabin',
          fill: '#ffc93c',
        },
      ],
    },
    {
      say: 'Kabinin soluna uzun bir şasi çiz. Üstüne de yukarı kalkmış eğik bir kasa ve onu iten bir piston ekle.',
      shapes: [
        { d: rect(48, 244, 204, 24, 6), part: 'şasi', fill: '#3a3a4a' },
        { d: 'M184,244 L196,209', part: 'piston' },
        { d: 'M66,244 L240,197 L229,118 L45,167 Z', part: 'kasa', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Altına iki büyük tekerlek çiz. Ortalarına da küçük birer daire koy.',
      shapes: [
        { d: circle(112, 282, 34), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(112, 282, 12), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(304, 282, 34), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(304, 282, 12), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kabine eğik bir ön cam çiz. Öne de yuvarlak bir far ve küçük bir tampon ekle.',
      shapes: [
        { d: 'M268,124 L304,124 Q312,124 315,132 L332,176 L262,176 L262,130 Q262,124 268,124 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: 'M352,226 Q364,226 364,238 Q364,250 352,250 Z', part: 'far', fill: '#fff4b0' },
        { d: rect(334, 256, 28, 14, 5), part: 'tampon', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kasanın üstüne tepecik tepecik kum çiz. Kasanın yanına da iki eğik çizgi çek.',
      shapes: [
        { d: 'M50,166 Q58,132 90,136 Q108,104 142,112 Q168,82 198,100 Q222,98 226,119 Z', part: 'kum', fill: '#c98a4b' },
        { d: 'M123,229 L106,151', part: 'kasa çizgisi' },
        { d: 'M181,213 L166,135', part: 'kasa çizgisi' },
      ],
    },
    {
      say: 'Camın altına iki yuvarlak göz çiz. İçlerine beyaz birer parıltı koy.',
      shapes: [
        { d: circle(282, 200, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(285, 196, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(322, 200, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(325, 196, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız, yanlarına da pembe yanaklar çiz. Kamyon işe hazır!',
      shapes: [
        { d: 'M290,220 Q302,232 314,220', part: 'ağız' },
        { d: ellipse(267, 222, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(338, 222, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kamyon;
