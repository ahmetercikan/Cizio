import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
/** Beş köşeli yıldız: tepeden başlayıp saat yönünde tek hamlede. */
const star = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? R : R * 0.45;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
};

/** Taşıtlar 1: Dikdörtgen, üçgen ve daireyi üst üste koyarak bir roket. */
const roket: Lesson = {
  id: 'roket',
  path: 'tasitlar',
  title: 'Uzay Roketi',
  emoji: '🚀',
  order: 1,
  level: 1,
  skill: 'Dikdörtgen, üçgen ve daire gibi basit şekilleri üst üste koyunca koca bir roket çıktığını gördün!',
  palette: ['#eef1f8', '#ff5d73', '#7fd3ff', '#ffa53d', '#ffe066', '#ffd23f'],
  steps: [
    {
      say: 'Önce uzun, dik bir dikdörtgen çiz. Bu roketin gövdesi olacak.',
      shapes: [{ d: 'M140,135 L260,135 L260,290 L140,290 Z', part: 'gövde', fill: '#eef1f8' }],
    },
    {
      say: 'Gövdenin tepesine sivri bir burun çiz. Sol köşeden başla, yukarıda buluş ve sağ köşeye in.',
      shapes: [{ d: 'M140,135 Q144,80 200,38 Q256,80 260,135', part: 'burun', fill: '#ff5d73' }],
    },
    {
      say: 'Gövdenin iki yanına birer kanatçık ekle. İkisi de aşağıya doğru uzansın.',
      shapes: [
        { d: 'M140,215 L92,268 L92,318 L140,290', part: 'sol kanatçık', fill: '#ff5d73' },
        { d: 'M260,215 L308,268 L308,318 L260,290', part: 'sağ kanatçık', fill: '#ff5d73' },
      ],
    },
    {
      say: 'Gövdenin üst yarısına yuvarlak bir pencere çiz. İçine minik bir parıltı koy.',
      shapes: [
        { d: circle(200, 188, 32), part: 'pencere', fill: '#7fd3ff' },
        { d: circle(189, 177, 8), part: 'pencere parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gövdenin altından dalgalı bir alev çıksın. İçine de daha küçük sarı bir alev çiz.',
      shapes: [
        { d: 'M156,290 Q154,324 174,320 Q180,348 200,364 Q220,348 226,320 Q246,324 244,290', part: 'alev', fill: '#ffa53d' },
        { d: 'M182,290 Q184,316 200,334 Q216,316 218,290', part: 'iç alev', fill: '#ffe066' },
      ],
    },
    {
      say: 'Gövdeye bir şerit çiz, roketin iki yanına da parlayan yıldızlar ekle. Roket uçuşa hazır!',
      shapes: [
        { d: 'M140,248 L260,248', part: 'şerit' },
        { d: star(70, 105, 30), part: 'sol yıldız', fill: '#ffd23f' },
        { d: star(334, 200, 24), part: 'sağ yıldız', fill: '#ffd23f' },
      ],
    },
  ],
};

export default roket;
