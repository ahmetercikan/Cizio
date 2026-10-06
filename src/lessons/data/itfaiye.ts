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

/** İş Makineleri 9: Merdivenli, tepe lambalı, hortumlu kırmızı bir itfaiye aracı. */
const itfaiye: Lesson = {
  id: 'itfaiye',
  path: 'ismakineleri',
  title: 'İtfaiye Aracı',
  emoji: '🚒',
  order: 9,
  level: 2,
  skill: 'Uzun bir gövdeye merdiven, lamba ve hortum ekledin. Parçaları yerli yerine koymayı öğrendin!',
  palette: ['#ff4d4d', '#e8ecf2', '#4fa3ff', '#3a3a4a', '#ffe066', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce uzun bir gövde çiz. Sağ tarafı yüksek bir kabin olsun, altına iki yuva bırak.',
      shapes: [
        {
          d:
            'M54,170 L262,170 L262,138 Q262,124 276,124 L314,124 Q332,124 340,142 L356,200 Q360,210 360,222 ' +
            'L360,278 Q360,290 348,290 L346,290 A38,38 0 0,0 270,290 L146,290 A38,38 0 0,0 70,290 L54,290 ' +
            'Q40,290 40,276 L40,184 Q40,170 54,170 Z',
          part: 'gövde',
          fill: '#ff4d4d',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne uzun bir merdiven çiz. İçine eşit aralıklarla basamaklar çek.',
      shapes: [
        { d: rect(48, 146, 210, 22, 4), part: 'merdiven', fill: '#e8ecf2' },
        {
          d: 'M78,146 L78,168 M108,146 L108,168 M138,146 L138,168 M168,146 L168,168 M198,146 L198,168 M228,146 L228,168',
          part: 'basamaklar',
        },
      ],
    },
    {
      say: 'Kabinin tepesine mavi bir lamba, önüne de büyük bir pencere çiz.',
      shapes: [
        { d: 'M284,124 L284,112 Q284,100 298,100 L306,100 Q320,100 320,112 L320,124', part: 'lamba', fill: '#4fa3ff' },
        { d: 'M278,140 L312,140 Q324,140 328,152 L338,190 L278,190 Z', part: 'pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Yuvaların içine iki büyük tekerlek çiz. Ortalarına küçük daireler koy.',
      shapes: [
        { d: circle(108, 292, 30), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(108, 292, 11), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(308, 292, 30), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(308, 292, 11), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Gövdenin soluna yuvarlak bir hortum makarası çiz. Hortumu dışarı sarkıt, ucuna başlık tak.',
      shapes: [
        { d: circle(92, 218, 30), part: 'makara', fill: '#ffe066' },
        { d: circle(92, 218, 10), part: 'makara göbeği', fill: '#3a3a4a' },
        { d: 'M122,218 Q146,218 148,240 Q150,258 168,258', part: 'hortum' },
        { d: 'M168,250 L186,252 L186,264 L168,266 Z', part: 'hortum başlığı', fill: '#e8ecf2' },
      ],
    },
    {
      say: 'Gövdenin ortasına yan yana iki dolap kapağı çiz. İçinde itfaiyecilerin aletleri var!',
      shapes: [
        { d: rect(150, 184, 46, 52, 6), part: 'sol kapak', fill: '#ff8080' },
        { d: rect(206, 184, 46, 52, 6), part: 'sağ kapak', fill: '#ff8080' },
      ],
    },
    {
      say: 'Pencerenin altına iki yuvarlak göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: circle(290, 216, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(294, 211, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(326, 216, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(330, 211, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gülen bir ağız, pembe yanaklar ve öne sarı bir far çiz. İtfaiye yardıma koşuyor!',
      shapes: [
        { d: 'M296,236 Q308,248 320,236', part: 'ağız' },
        { d: ellipse(277, 238, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(340, 238, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M360,252 L352,252 Q346,252 346,259 Q346,266 352,266 L360,266', part: 'far', fill: '#ffe066' },
      ],
    },
  ],
};

export default itfaiye;
