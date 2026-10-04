import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
const star = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? R : R * 0.45;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
};

/** Karakterler 9: Pelerinli, maskeli, göğsünde yıldız olan chibi süper kahraman. */
const kahraman: Lesson = {
  id: 'kahraman',
  path: 'karakterler',
  title: 'Süper Kahraman',
  emoji: '🦸',
  order: 9,
  level: 3,
  skill: 'Arkada kalan pelerini önce, önündeki gövdeyi sonra çizerek katman kurmayı öğrendin!',
  palette: ['#ffe1cc', '#5a3a22', '#e63946', '#4f8df5', '#ffd23f', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman, yuvarlak bir kafa çiz. Kâğıdın üst yarısında olsun.',
      shapes: [{ d: circle(200, 150, 70), part: 'kafa', fill: '#ffe1cc' }],
    },
    {
      say: 'Kafanın üstüne diken diken bir saç çiz. Üstte sivri uçlar, altta minik perçemler yap.',
      shapes: [
        {
          d: 'M132,146 L126,104 L148,110 L156,76 L178,94 L200,60 L222,94 L244,76 L252,110 L274,104 L268,146 L256,126 L244,138 L228,118 L214,134 L200,114 L186,134 L172,118 L156,138 L144,126 Z',
          part: 'saç',
          fill: '#5a3a22',
        },
      ],
    },
    {
      say: 'Kafanın altına iki yana açılan uzun bir pelerin çiz. Alt ucu dalgalı olsun.',
      shapes: [
        {
          d: 'M172,226 Q124,290 100,356 Q148,368 176,350 L224,350 Q252,368 300,356 Q276,290 228,226 Z',
          part: 'pelerin',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Pelerinin önüne kahramanın gövdesini çiz. Yukarıda dar, aşağıda biraz geniş olsun.',
      shapes: [{ d: 'M170,220 L158,312 L242,312 L230,220', part: 'gövde', fill: '#4f8df5' }],
    },
    {
      say: 'Sağ kolu yumruk yapıp yukarı kaldır, sol kolu aşağı indir. Altına iki çizme çiz.',
      shapes: [
        { d: 'M230,236 L266,204 A12,12 0 0,1 282,222 L236,258', part: 'sağ kol', fill: '#4f8df5' },
        { d: 'M170,236 L138,268 A10,10 0 0,0 152,280 L166,264', part: 'sol kol', fill: '#4f8df5' },
        { d: 'M170,312 L170,350 Q170,362 182,362 L196,362 L196,312', part: 'sol çizme', fill: '#e63946' },
        { d: 'M204,312 L204,362 L218,362 Q230,362 230,350 L230,312', part: 'sağ çizme', fill: '#e63946' },
      ],
    },
    {
      say: 'Gövdenin altına bir kemer, göğsünün ortasına da beş köşeli bir yıldız çiz.',
      shapes: [
        { d: 'M161,286 L239,286 L240,298 L160,298 Z', part: 'kemer', fill: '#ffd23f' },
        { d: star(200, 256, 20), part: 'yıldız', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Gözlerin olacağı yere bir maske çiz. İki yana kanat gibi açılsın, ortası burnun üstünde insin.',
      shapes: [
        {
          d: 'M138,162 Q146,140 200,150 Q254,140 262,162 Q258,186 230,184 Q212,182 200,172 Q188,182 170,184 Q142,186 138,162 Z',
          part: 'maske',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Maskenin içine iki kocaman göz çiz. Beyaz parıltılarını da unutma.',
      shapes: [
        { d: ellipse(174, 166, 12, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(178, 160, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(226, 166, 12, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(230, 160, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kendinden emin bir gülümseme ve iki pembe yanak çiz. Kahramanın uçmaya hazır!',
      shapes: [
        { d: 'M186,198 Q200,210 214,198', part: 'ağız' },
        { d: ellipse(152, 196, 10, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(248, 196, 10, 6), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kahraman;
