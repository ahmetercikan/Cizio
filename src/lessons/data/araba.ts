import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 4: Gövde, kabin ve tekerlekleri üst üste oturtarak bir araba. */
const araba: Lesson = {
  id: 'araba',
  path: 'nesneler',
  title: 'Minik Araba',
  emoji: '🚗',
  order: 4,
  level: 2,
  skill: 'Uzun bir gövdeye kubbe ve tekerlek ekleyerek parçaları birbirine oturtmayı öğrendin!',
  palette: ['#ff6b8b', '#aee3ff', '#3a3a4a', '#ffe066', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce uzun, köşeleri yuvarlak bir gövde çiz. Alttaki iki yarım yuvarlak tekerlek yuvası olacak.',
      shapes: [
        {
          d:
            'M75,182 L325,182 Q350,182 350,207 L350,247 Q350,267 330,267 L318,267 ' +
            'A38,38 0 0,0 242,267 L158,267 A38,38 0 0,0 82,267 L70,267 Q50,267 50,247 L50,207 Q50,182 75,182 Z',
          part: 'gövde',
          fill: '#ff6b8b',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne yuvarlak bir kabin çiz. Soldan başla, kubbe gibi kıvrılıp sağa in.',
      shapes: [{ d: 'M95,182 Q108,104 170,102 L232,102 Q280,106 305,182', part: 'kabin', fill: '#ff6b8b' }],
    },
    {
      say: 'Yuvaların içine iki büyük tekerlek çiz. Ortalarına da küçük birer daire koy.',
      shapes: [
        { d: circle(120, 270, 30), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(120, 270, 11), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(280, 270, 30), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(280, 270, 11), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kabinin içine iki cam çiz. Soldaki arka cam, sağdaki ön cam olsun.',
      shapes: [
        { d: 'M122,170 Q130,124 170,122 L190,122 L190,170 Z', part: 'arka cam', fill: '#aee3ff' },
        { d: 'M210,122 L230,122 Q262,125 280,170 L210,170 Z', part: 'ön cam', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Gövdenin ortasına iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(176, 208, 13), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(180, 203, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(224, 208, 13), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(228, 203, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız, yanlarına pembe yanaklar, öne de sarı bir far çiz.',
      shapes: [
        { d: 'M186,226 Q200,242 214,226', part: 'ağız' },
        { d: ellipse(152, 226, 11, 6), part: 'sol yanak', fill: '#ffb3c6' },
        { d: ellipse(248, 226, 11, 6), part: 'sağ yanak', fill: '#ffb3c6' },
        { d: 'M350,200 L336,200 Q326,200 326,211 Q326,222 336,222 L350,222', part: 'far', fill: '#ffe066' },
      ],
    },
  ],
};

export default araba;
