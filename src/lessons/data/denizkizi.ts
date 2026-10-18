import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const denizkizi: Lesson = {
  id: 'denizkizi',
  path: 'masal',
  title: 'Küçük Denizkızı',
  emoji: '🧜‍♀️',
  order: 9,
  level: 3,
  skill: 'İnsan figürüyle balık kuyruğunu birleştirip dalgalı saçlar çizmeyi öğrendin!',
  palette: ['#ff758f', '#ffe5d9', '#48cae4', '#52b788', '#ffd166', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce yukarıya yuvarlak bir kafa ve altına minik bir boyun çiz.',
      shapes: [
        { d: ellipse(200, 95, 28, 30), part: 'kafa', fill: '#ffe5d9' },
        { d: 'M194,124 L194,136 L206,136 L206,124', part: 'boyun', fill: '#ffe5d9' },
      ],
    },
    {
      say: 'Boynun altına narin bir gövde ve iki yana uzanan kollar çiz.',
      shapes: [
        { d: 'M188,136 C184,155 186,175 190,185 L210,185 C214,175 216,155 212,136 Z', part: 'gövde', fill: '#ffe5d9' },
        { d: 'M188,140 C170,155 160,175 162,188 C166,190 174,175 180,162', part: 'sol kol', fill: '#ffe5d9' },
        { d: 'M212,140 C230,155 240,175 238,188 C234,190 226,175 220,162', part: 'sağ kol', fill: '#ffe5d9' },
      ],
    },
    {
      say: 'Gövdenin üstüne deniz kabuğundan sevimli bir büstiyer ekle.',
      shapes: [
        { d: 'M184,146 C178,138 195,134 196,146 C196,155 180,155 184,146 Z', part: 'sol deniz kabuğu', fill: '#ff758f' },
        { d: 'M204,146 C205,134 222,138 216,146 C220,155 204,155 204,146 Z', part: 'sağ deniz kabuğu', fill: '#ff758f' },
      ],
    },
    {
      say: 'Belden aşağı doğru zarifçe kıvrılan uzun balık kuyruğunu çiz.',
      shapes: [
        {
          d: 'M190,185 C186,220 198,255 218,295 L232,295 C226,255 215,220 210,185 Z',
          part: 'balık kuyruğu',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Kuyruğun ucuna iki yana açılan geniş ve dalgalı bir yüzgeç ekle.',
      shapes: [
        { d: 'M222,295 C200,312 170,325 174,352 C190,354 214,332 225,312', part: 'sol kuyruk yüzgeci', fill: '#48cae4' },
        { d: 'M228,295 C248,312 278,325 274,352 C258,354 234,332 225,312', part: 'sağ kuyruk yüzgeci', fill: '#48cae4' },
      ],
    },
    {
      say: 'Balık kuyruğunun üzerine küçük hilal şeklinde pullar çiz.',
      shapes: [
        { d: 'M197,215 Q201,222 205,215', part: 'üst pul 1' },
        { d: 'M203,232 Q207,239 211,232', part: 'üst pul 2' },
        { d: 'M196,242 Q200,249 204,242', part: 'orta pul' },
        { d: 'M206,260 Q210,267 214,260', part: 'alt pul 1' },
        { d: 'M215,278 Q219,285 223,278', part: 'alt pul 2' },
      ],
    },
    {
      say: 'Kafanın etrafına omuzlardan aşağı dalgalanarak dökülen uzun saçlar ekle.',
      shapes: [
        { d: 'M172,95 C168,58 232,58 228,95 C218,84 206,82 200,86 C194,82 182,84 172,95 Z', part: 'üst saç', fill: '#ff758f' },
        { d: 'M172,95 C150,130 144,175 160,215 C166,200 162,150 178,122', part: 'sol dalgalı saç', fill: '#ff758f' },
        { d: 'M228,95 C250,130 256,175 240,215 C234,200 238,150 222,122', part: 'sağ dalgalı saç', fill: '#ff758f' },
      ],
    },
    {
      say: 'Yüzüne tatlı kirpikli gözler, gülen bir ağız ve pembe yanaklar çiz.',
      shapes: [
        { d: circle(191, 95, 5), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(189, 93, 1.8), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(209, 95, 5), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(207, 93, 1.8), part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M187,91 L183,88', part: 'sol kirpik' },
        { d: 'M213,91 L217,88', part: 'sağ kirpik' },
        { d: 'M196,108 Q200,113 204,108', part: 'ağız' },
        { d: circle(183, 104, 3.5), part: 'sol yanak', fill: '#ff758f' },
        { d: circle(217, 104, 3.5), part: 'sağ yanak', fill: '#ff758f' },
      ],
    },
    {
      say: 'Son olarak saçına minik bir deniz yıldızı tokası ve sihirli baloncuklar ekle.',
      shapes: [
        {
          d: 'M228,76 L232,82 L239,82 L234,87 L236,94 L228,90 L221,94 L223,87 L218,82 L225,82 Z',
          part: 'saç tokası',
          fill: '#ffd166',
        },
        { d: circle(115, 95, 10), part: 'büyük baloncuk', fill: '#48cae4' },
        { d: circle(130, 70, 6), part: 'orta baloncuk', fill: '#48cae4' },
        { d: circle(285, 120, 8), part: 'sağ baloncuk', fill: '#48cae4' },
      ],
    },
  ],
};

export default denizkizi;
