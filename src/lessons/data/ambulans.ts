import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

const ambulans: Lesson = {
  id: 'ambulans',
  path: 'tasitlar',
  title: 'Ambulans',
  emoji: '🚑',
  order: 10,
  level: 2,
  skill: 'Bir taşıtın gövdesini oranlı çizmeyi ve acil durum detaylarını eklemeyi öğrendin!',
  palette: ['#ffffff', '#ff4d4d', '#4fa3ff', '#3a3a4a', '#ffe066', '#d0d4dc'],
  steps: [
    {
      say: 'Önce ambulansın gövdesini çiz. Ön tarafını eğimli yapıp tekerlek yuvaları bırak.',
      shapes: [
        {
          d:
            'M60,265 L85,265 A35,35 0 0,0 155,265 L245,265 A35,35 0 0,0 315,265 L345,265 ' +
            'Q352,265 352,255 L352,210 Q352,198 338,196 L290,194 L255,145 Q250,140 240,140 ' +
            'L70,140 Q60,140 60,150 Z',
          part: 'gövde',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Sürücü için ön camı ve arkaya iki dikdörtgen pencere ekle.',
      shapes: [
        { d: 'M250,150 L284,192 L246,192 L246,150 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: rect(80, 155, 55, 32, 4), part: 'arka pencere', fill: '#aee3ff' },
        { d: rect(150, 155, 55, 32, 4), part: 'orta pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Yuvaların içine iki tekerlek ve ortalarına jant daireleri çiz.',
      shapes: [
        { d: circle(120, 265, 28), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(120, 265, 12), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(280, 265, 28), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(280, 265, 12), part: 'ön jant', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Gövdenin yanına kırmızı bir yardım artısı ve şerit çiz.',
      shapes: [
        {
          d: 'M142,208 L158,208 L158,220 L170,220 L170,236 L158,236 L158,248 L142,248 L142,236 L130,236 L130,220 L142,220 Z',
          part: 'kırmızı artı',
          fill: '#ff4d4d',
        },
        { d: 'M60,226 L122,226 M178,226 L242,226 M292,226 L348,226', part: 'kırmızı şerit' },
      ],
    },
    {
      say: 'Tavanın üstüne mavi tepe lambası ve etrafına ses dalgaları ekle.',
      shapes: [
        { d: 'M260,140 L280,140 L280,135 L260,135 Z', part: 'lamba tabanı', fill: '#3a3a4a' },
        { d: 'M262,135 Q262,120 270,120 Q278,120 278,135 Z', part: 'tepe lambası', fill: '#4fa3ff' },
        { d: 'M252,115 Q270,104 288,115', part: 'iç ses dalgası' },
        { d: 'M246,104 Q270,90 294,104', part: 'dış ses dalgası' },
      ],
    },
    {
      say: 'Öne parlak bir far, arkaya kırmızı stop lambası ve tampon çiz.',
      shapes: [
        { d: 'M344,222 Q352,222 352,232 L344,232 Z', part: 'far', fill: '#ffe066' },
        { d: 'M60,215 L66,215 L66,230 L60,230 Z', part: 'stop lambası', fill: '#ff4d4d' },
        { d: 'M336,254 L356,254 Q358,254 358,262 L336,262 Z', part: 'ön tampon', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Son olarak kapı kolunu, ızgarayı ve altındaki yolu çiz.',
      shapes: [
        { d: 'M216,200 L228,200', part: 'kapı kolu' },
        { d: 'M338,238 L348,238 M338,244 L348,244', part: 'ön ızgara' },
        { d: 'M40,295 L360,295', part: 'yol' },
        { d: 'M80,310 L130,310 M180,310 L230,310 M280,310 L330,310', part: 'yol çizgileri' },
      ],
    },
  ],
};

export default ambulans;
