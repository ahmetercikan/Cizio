import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Beş yuvarlak taç yapraklı çiçek: dışı tümsek tümsek tek bir çizgi. */
const flower = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let k = 0; k <= 5; k++) {
    const a = ((-90 + k * 72) * Math.PI) / 180;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  const b = Math.round(r * 0.62);
  return `M${pts[0]}` + pts.slice(1).map((p) => ` A${b},${b} 0 0,1 ${p}`).join('') + ' Z';
};

/** Doğa 11: Tombul, çizgili, sevimli bir bal arısı ve küçük bir çiçek. */
const ari: Lesson = {
  id: 'ari',
  path: 'doga',
  title: 'Bal Arısı',
  emoji: '🐝',
  order: 11,
  level: 2,
  skill: 'Yuvarlak bir gövdeyi kavisli şeritlerle süsleyip kanat ve duyargayla canlı bir böcek çizdin!',
  palette: ['#ffd23f', '#3a3a4a', '#d6f0ff', '#ff8fab', '#5fc46d', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman, yan yatmış tombul bir yumurta çiz. Bu arının gövdesi olacak.',
      shapes: [{ d: ellipse(196, 214, 108, 86), part: 'gövde', fill: '#ffd23f' }],
    },
    {
      say: 'Gövdenin sağ yarısına iki kalın şerit çiz. Şeritler gövdenin kıvrımına uyup kavisli olsun.',
      shapes: [
        { d: 'M196,128 Q186,214 196,300 L228,297 Q238,214 228,131 Z', part: 'birinci şerit', fill: '#3a3a4a' },
        { d: 'M256,142 Q266,214 256,286 L280,270 Q290,214 280,158 Z', part: 'ikinci şerit', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Gövdenin en sağ ucuna küçük, sivri bir iğne çiz.',
      shapes: [{ d: 'M302,198 L332,214 L302,230', part: 'iğne', fill: '#3a3a4a' }],
    },
    {
      say: 'Gövdenin üstüne iki yuvarlak kanat çiz. Kanatlar gövdeden yukarı doğru açılsın.',
      shapes: [
        { d: 'M182,130 Q146,62 196,54 Q250,52 220,132', part: 'ön kanat', fill: '#d6f0ff' },
        { d: 'M240,136 Q258,70 302,80 Q342,104 270,154', part: 'arka kanat', fill: '#d6f0ff' },
      ],
    },
    {
      say: 'Başın tepesinden iki kıvrık duyarga çiz. Uçlarına küçük yuvarlaklar koy.',
      shapes: [
        { d: 'M128,152 Q108,116 84,108', part: 'sol duyarga' },
        { d: circle(78, 106, 9), part: 'sol duyarga ucu', fill: '#3a3a4a' },
        { d: 'M156,136 Q150,98 132,80', part: 'sağ duyarga' },
        { d: circle(128, 74, 9), part: 'sağ duyarga ucu', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Gövdenin solunda iki yuvarlak göz çiz. Beyaz parıltıları da unutma.',
      shapes: [
        { d: circle(124, 202, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(128, 197, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(164, 202, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(168, 197, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız, yanlarına pembe yanaklar çiz.',
      shapes: [
        { d: 'M132,226 Q144,240 156,226', part: 'ağız' },
        { d: ellipse(108, 226, 9, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(180, 226, 9, 6), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Sağ alta küçük bir çiçek çiz. Ortasına sarı bir göbek, altına da yeşil bir sap ekle. Vız vız!',
      shapes: [
        { d: flower(332, 300, 30), part: 'çiçek', fill: '#ff8fab' },
        { d: circle(332, 300, 10), part: 'çiçek göbeği', fill: '#ffd23f' },
        { d: 'M332,330 Q328,350 336,372', part: 'sap' },
      ],
    },
  ],
};

export default ari;
