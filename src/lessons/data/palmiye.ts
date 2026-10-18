import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const palmiye: Lesson = {
  id: 'palmiye',
  path: 'doga',
  title: 'Palmiye Ağacı',
  emoji: '🌴',
  order: 13,
  level: 1,
  skill: 'Eğik bir gövde ve etrafa yayılan büyük yapraklarla tropik bir palmiye çizdin!',
  palette: ['#2d6a4f', '#40916c', '#52b788', '#99582a', '#6c4a27', '#f4a261'],
  steps: [
    {
      say: 'Önce palmiyemizin üzerinde duracağı minik, tatlı bir kumsal tepesi çiz.',
      shapes: [
        {
          d: 'M40,360 Q200,315 360,360 L360,380 Q200,345 40,380 Z',
          part: 'kumsal',
          fill: '#f4a261',
        },
      ],
    },
    {
      say: 'Kumsaldan yukarı doğru hafif eğik, uzun bir ağaç gövdesi uzat.',
      shapes: [
        {
          d: 'M188,340 C182,270 196,195 208,140 L226,140 C214,195 200,270 216,340 Z',
          part: 'gövde',
          fill: '#99582a',
        },
      ],
    },
    {
      say: 'Gövdeye palmiye halkalarını ekle. Kavisli çizgiler çiz.',
      shapes: [
        { d: 'M191,300 Q202,295 214,302', part: 'gövde çizgisi' },
        { d: 'M195,260 Q205,255 217,261', part: 'gövde çizgisi' },
        { d: 'M199,220 Q208,215 220,221', part: 'gövde çizgisi' },
        { d: 'M203,180 Q211,175 223,180', part: 'gövde çizgisi' },
        { d: 'M205,155 Q212,152 224,156', part: 'gövde çizgisi' },
      ],
    },
    {
      say: 'Gövdenin tepesine üç tane lezzetli, yuvarlak hindistan cevizi kondur.',
      shapes: [
        { d: circle(204, 146, 11), part: 'hindistan cevizi', fill: '#6c4a27' },
        { d: circle(226, 146, 11), part: 'hindistan cevizi', fill: '#6c4a27' },
        { d: circle(215, 158, 10), part: 'hindistan cevizi', fill: '#583618' },
      ],
    },
    {
      say: 'Tepeden sola ve aşağıya doğru sarkan iki büyük palmiye yaprağı çiz.',
      shapes: [
        {
          d: 'M212,138 C160,85 105,80 65,105 C85,120 120,132 155,138 C180,140 198,138 212,138 Z',
          part: 'sol üst yaprak',
          fill: '#2d6a4f',
        },
        {
          d: 'M208,142 C148,132 95,160 62,202 C98,198 138,182 172,166 C188,158 198,150 208,142 Z',
          part: 'sol alt yaprak',
          fill: '#40916c',
        },
      ],
    },
    {
      say: 'Şimdi de sağa ve yukarı doğru açılan coşkulu yaprakları ekle.',
      shapes: [
        {
          d: 'M222,138 C270,85 325,80 355,110 C330,125 295,135 260,138 C240,140 230,138 222,138 Z',
          part: 'sağ üst yaprak',
          fill: '#2d6a4f',
        },
        {
          d: 'M222,142 C275,135 325,165 352,208 C318,198 280,182 248,166 C235,158 228,150 222,142 Z',
          part: 'sağ alt yaprak',
          fill: '#40916c',
        },
        {
          d: 'M214,136 C206,80 212,48 217,38 C222,48 228,80 220,136 Z',
          part: 'tepe yaprak',
          fill: '#52b788',
        },
      ],
    },
  ],
};

export default palmiye;
