import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const palyacoBaligi: Lesson = {
  id: 'palyaco-baligi',
  path: 'deniz',
  title: 'Palyaco Balığı',
  emoji: '🐠',
  order: 18,
  level: 2,
  skill: 'Kavisli beyaz şeritler ve deniz anemonu yuvası çizmeyi öğrendin!',
  palette: ['#ff6b35', '#ffffff', '#2d2d2d', '#ff9f1c', '#ff758f', '#48cae4'],
  steps: [
    {
      say: 'Önce balığımızın tombul, sevimli gövdesini çiz.',
      shapes: [
        {
          d: 'M130,195 C145,140 215,135 285,185 C285,210 245,250 180,250 C145,250 130,225 130,195 Z',
          part: 'gövde',
          fill: '#ff6b35',
        },
      ],
    },
    {
      say: 'Gövdenin arkasına dalgalı bir kuyruk, üstüne ve altına yuvarlak yüzgeçler ekle.',
      shapes: [
        { d: 'M280,182 Q335,155 330,195 Q335,235 280,212 Z', part: 'kuyruk', fill: '#ff9f1c' },
        { d: 'M175,140 Q210,105 255,145 Q265,115 280,178', part: 'sırt yüzgeci', fill: '#ff9f1c' },
        { d: 'M190,250 Q215,280 235,248', part: 'karın yüzgeci', fill: '#ff9f1c' },
        { d: 'M165,205 Q195,190 200,220 Q180,235 165,205 Z', part: 'yan yüzgeç', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Gövdenin üstüne üç tane kalın beyaz şerit çiz. Ortadaki şerit hafifçe kıvrılsın.',
      shapes: [
        {
          d: 'M162,143 Q175,195 160,248 L175,250 Q190,195 177,141 Z',
          part: 'ön şerit',
          fill: '#ffffff',
        },
        {
          d: 'M215,140 Q235,175 220,195 Q235,215 220,250 L235,248 Q250,215 235,195 Q250,175 230,140 Z',
          part: 'orta şerit',
          fill: '#ffffff',
        },
        {
          d: 'M270,175 Q278,195 270,220 L280,215 Q288,195 280,180 Z',
          part: 'kuyruk şeridi',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Balığın yüzüne neşeli bir göz, gülen bir ağız ve pembe bir yanak ekle.',
      shapes: [
        { d: circle(146, 178, 11), part: 'göz', fill: '#2d2d2d' },
        { d: circle(143, 175, 3.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M132,202 Q138,210 146,204', part: 'ağız' },
        { d: circle(156, 202, 5), part: 'yanak', fill: '#ff758f' },
      ],
    },
    {
      say: 'Yüzgeçlerin ve kuyruğun kenarlarına ince siyah süs çizgileri çiz.',
      shapes: [
        { d: 'M325,166 Q318,195 325,224', part: 'kuyruk süsü' },
        { d: 'M185,133 Q215,112 250,140', part: 'sırt yüzgeci süsü' },
        { d: 'M200,268 Q218,278 230,254', part: 'karın yüzgeci süsü' },
      ],
    },
    {
      say: 'Balığın altına kıvrılarak yükselen deniz anemonu kollarını çiz.',
      shapes: [
        { d: 'M60,370 C70,320 85,290 100,295 C110,300 95,335 105,370', part: 'sol anemon kolu 1', fill: '#ff758f' },
        { d: 'M110,370 C120,310 135,285 148,290 C155,295 140,335 150,370', part: 'sol anemon kolu 2', fill: '#ff758f' },
        { d: 'M165,370 C175,305 190,280 205,285 C215,290 200,335 210,370', part: 'orta anemon kolu', fill: '#ff758f' },
        { d: 'M225,370 C235,310 250,285 262,290 C270,295 255,335 265,370', part: 'sağ anemon kolu 1', fill: '#ff758f' },
        { d: 'M280,370 C290,320 305,295 318,300 C325,305 310,335 320,370', part: 'sağ anemon kolu 2', fill: '#ff758f' },
      ],
    },
    {
      say: 'Son olarak anemonların uçlarına ışıltılı benekler ve neşeli su baloncukları ekle.',
      shapes: [
        { d: circle(100, 292, 4), part: 'anemon beneği 1', fill: '#ffd166' },
        { d: circle(148, 287, 4), part: 'anemon beneği 2', fill: '#ffd166' },
        { d: circle(205, 282, 4), part: 'anemon beneği 3', fill: '#ffd166' },
        { d: circle(262, 287, 4), part: 'anemon beneği 4', fill: '#ffd166' },
        { d: circle(318, 297, 4), part: 'anemon beneği 5', fill: '#ffd166' },
        { d: circle(100, 150, 10), part: 'büyük baloncuk', fill: '#48cae4' },
        { d: circle(82, 120, 6), part: 'orta baloncuk', fill: '#48cae4' },
        { d: circle(115, 95, 5), part: 'küçük baloncuk', fill: '#48cae4' },
      ],
    },
  ],
};

export default palyacoBaligi;
