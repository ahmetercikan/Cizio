import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Taşıtlar 7: Yuvarlak pencereli, periskoplu, pervaneli sarı bir denizaltı. */
const denizalti: Lesson = {
  id: 'denizalti',
  path: 'tasitlar',
  title: 'Sarı Denizaltı',
  emoji: '🛥️',
  order: 7,
  level: 2,
  skill: 'Uzun yuvarlak bir gövdeye kule, periskop ve pervane ekleyerek suyun altında yüzen bir denizaltı çizdin!',
  palette: ['#ffd23f', '#ff9f43', '#aee3ff', '#5b6078', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce uzun, yan yatmış bir hap gibi bir gövde çiz. Sağ ucu daha tombul olsun.',
      shapes: [
        {
          d: 'M112,184 L276,184 Q350,184 350,246 Q350,308 276,308 L112,308 Q64,308 58,246 Q64,184 112,184 Z',
          part: 'gövde',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne, ortaya yakın bir kule çiz. Kule yukarı doğru biraz daralsın.',
      shapes: [
        { d: 'M170,184 L180,140 Q182,130 192,130 L238,130 Q248,130 250,140 L260,184', part: 'kule', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Kulenin tepesinden yukarı ince bir periskop çiz. Ucunu sağa doğru kıvır.',
      shapes: [
        { d: 'M216,130 L216,80 Q216,70 226,70 L262,70 L262,90 L230,90 L230,130', part: 'periskop', fill: '#ff9f43' },
      ],
    },
    {
      say: 'Gövdenin arkasına kısa bir çubuk çiz. Ucuna iki kanatlı bir pervane ekle.',
      shapes: [
        { d: 'M58,246 L44,246', part: 'pervane çubuğu' },
        { d: ellipse(38, 220, 9, 22), part: 'üst pervane', fill: '#ff9f43' },
        { d: ellipse(38, 272, 9, 22), part: 'alt pervane', fill: '#ff9f43' },
        { d: 'M96,186 L80,156 L118,156 L136,184', part: 'kuyruk kanadı', fill: '#ff9f43' },
      ],
    },
    {
      say: 'Gövdeye yan yana üç yuvarlak pencere çiz. İlk pencerenin içine kavisli bir parıltı koy.',
      shapes: [
        { d: circle(116, 240, 20), part: 'birinci pencere', fill: '#aee3ff' },
        { d: circle(172, 240, 20), part: 'ikinci pencere', fill: '#aee3ff' },
        { d: circle(228, 240, 20), part: 'üçüncü pencere', fill: '#aee3ff' },
        { d: 'M106,236 Q108,228 116,226', part: 'pencere parıltısı' },
      ],
    },
    {
      say: 'Gövdenin önüne iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(286, 232, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(290, 227, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(322, 232, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(326, 227, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız, yanlarına pembe yanaklar çiz.',
      shapes: [
        { d: 'M292,256 Q304,270 316,256', part: 'ağız' },
        { d: ellipse(272, 258, 9, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(336, 258, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Denizaltının önüne yukarı çıkan üç baloncuk, altına da dalgalı bir deniz dibi çiz. Haydi dalalım!',
      shapes: [
        { d: circle(352, 160, 9), part: 'küçük baloncuk', fill: '#e6f7ff' },
        { d: circle(330, 124, 13), part: 'orta baloncuk', fill: '#e6f7ff' },
        { d: circle(352, 80, 17), part: 'büyük baloncuk', fill: '#e6f7ff' },
        { d: 'M40,352 Q120,334 200,352 Q280,370 360,352', part: 'deniz dibi' },
      ],
    },
  ],
};

export default denizalti;
