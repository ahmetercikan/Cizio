import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Taşıtlar 4: Yuvarlak kabinli helikopter. Büyük yuvarlağa ince uzun parçalar eklemek. */
const helikopter: Lesson = {
  id: 'helikopter',
  path: 'tasitlar',
  title: 'Helikopter',
  emoji: '🚁',
  order: 4,
  level: 2,
  skill: 'Kocaman yuvarlak bir kabine ince uzun kuyruk, pervane ve ayaklar ekleyerek dengeli bir helikopter çizdin!',
  palette: ['#ffc94d', '#5b6078', '#aee3ff', '#ff7b6b', '#ffffff'],
  steps: [
    {
      say: 'Önce kocaman, yan yatmış bir yumurta gibi yuvarlak bir kabin çiz.',
      shapes: [{ d: ellipse(170, 215, 88, 72), part: 'kabin', fill: '#ffc94d' }],
    },
    {
      say: 'Kabinin sağından ince uzun bir kuyruk çıkar. Ucunu yuvarlatıp kabine geri dön.',
      shapes: [
        { d: 'M253,192 L326,200 Q338,202 338,209 Q338,216 326,217 L256,230', part: 'kuyruk', fill: '#ffc94d' },
      ],
    },
    {
      say: 'Kabinin tepesine kısa bir çubuk, üstüne upuzun bir pervane, kuyruğun ucuna da minik bir pervane çiz.',
      shapes: [
        { d: 'M170,143 L170,113', part: 'pervane çubuğu' },
        { d: ellipse(170, 105, 132, 8), part: 'büyük pervane', fill: '#5b6078' },
        { d: ellipse(350, 208, 7, 28), part: 'kuyruk pervanesi', fill: '#5b6078' },
      ],
    },
    {
      say: 'Kabinin önüne büyük bir cam çiz. Arkasına da yuvarlak küçük bir pencere ekle.',
      shapes: [
        { d: 'M102,214 Q102,168 150,164 L170,164 L170,214 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: circle(214, 200, 17), part: 'yuvarlak pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Kabinin altına iki kısa ayak çiz. Ayakların altına da uzun bir kızak çek, ucu yukarı kıvrılsın.',
      shapes: [
        { d: 'M130,279 L120,318', part: 'sol ayak' },
        { d: 'M210,279 L220,318', part: 'sağ ayak' },
        { d: 'M66,318 L262,318 Q284,318 290,298', part: 'kızak' },
      ],
    },
    {
      say: 'Kabinin alt yarısına kavisli bir şerit çiz. Helikopterimiz havalanmaya hazır!',
      shapes: [{ d: 'M86,236 Q170,258 254,236', part: 'şerit' }],
    },
  ],
};

export default helikopter;
