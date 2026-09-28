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

/** Karakterler 4: Chibi peri kız. Kocaman kafa, minicik vücut. */
const peri: Lesson = {
  id: 'peri',
  path: 'karakterler',
  title: 'Peri Kız',
  emoji: '🧚',
  order: 4,
  level: 3,
  skill: 'Chibi çizmeyi öğrendin! Kafa kocaman, vücut minicik olunca karakter çok tatlı görünür.',
  palette: ['#b07cf2', '#ffe1cc', '#ff8fc8', '#aee8ff', '#ffd23f', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman, yuvarlak bir saç çiz. Soldaki çeneden başla, tepeden dolaş, sağdaki çeneye in.',
      shapes: [
        {
          d: 'M152,208 Q112,222 106,190 C98,130 115,52 200,52 C285,52 302,130 294,190 Q288,222 248,208',
          part: 'saç',
          fill: '#b07cf2',
        },
      ],
    },
    {
      say: 'Saçın içine yüzü çiz. Üstte yuvarlak perçemler yap, sonra aşağıdan yuvarlak bir çene ile kapat.',
      shapes: [
        {
          d: 'M130,124 Q145,170 165,121 Q182,172 200,119 Q218,172 235,121 Q255,170 270,124 A75,75 0 1,1 130,124 Z',
          part: 'yüz',
          fill: '#ffe1cc',
        },
      ],
    },
    {
      say: 'Kafanın altına minicik bir elbise çiz. Kafa büyük, vücut küçük olunca tam bir chibi olur!',
      shapes: [{ d: 'M185,223 L142,316 Q200,330 258,316 L215,223', part: 'elbise', fill: '#ff8fc8' }],
    },
    {
      say: 'Elbisenin iki yanına yuvarlak kanatlar çiz. İki kanat da aynı büyüklükte olsun.',
      shapes: [
        { d: 'M164,268 C120,240 62,244 70,280 C76,312 124,314 150,298', part: 'sol kanat', fill: '#aee8ff' },
        { d: 'M250,298 C276,314 324,312 330,280 C338,244 280,240 236,268', part: 'sağ kanat', fill: '#aee8ff' },
      ],
    },
    {
      say: 'Omuzlardan iki minik kol, elbisenin altından da iki kısa bacak çiz.',
      shapes: [
        { d: 'M183,228 L150,236 A8,8 0 0,0 152,252 L175,244', part: 'sol kol', fill: '#ffe1cc' },
        { d: 'M217,228 L250,236 A8,8 0 0,1 248,252 L225,244', part: 'sağ kol', fill: '#ffe1cc' },
        { d: 'M178,322 L178,346 A9,9 0 0,0 196,346 L196,325', part: 'sol bacak', fill: '#ffe1cc' },
        { d: 'M204,325 L204,346 A9,9 0 0,0 222,346 L222,322', part: 'sağ bacak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Yüzün ortasına iki kocaman göz çiz. Chibi gözleri büyük olur, parıltıları da unutma.',
      shapes: [
        { d: ellipse(172, 180, 13, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(176, 173, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(228, 180, 13, 16), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(232, 173, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Minik bir gülümseme, pembe yanaklar ve saçına küçük bir kalp toka çiz.',
      shapes: [
        { d: 'M187,204 Q200,216 213,204', part: 'ağız' },
        { d: ellipse(157, 201, 10, 6), part: 'sol yanak', fill: '#ffa3c4' },
        { d: ellipse(243, 201, 10, 6), part: 'sağ yanak', fill: '#ffa3c4' },
        { d: 'M255,106 L244,95 A8,8 0 0,1 255,85 A8,8 0 0,1 266,95 Z', part: 'kalp toka', fill: '#ff5c8a' },
      ],
    },
    {
      say: 'Sağ eline bir sihirli değnek ver. Ucuna da parlak bir yıldız çiz. İşte perin hazır!',
      shapes: [
        { d: 'M257,243 L300,234', part: 'değnek' },
        { d: star(322, 228, 22), part: 'yıldız', fill: '#ffd23f' },
      ],
    },
  ],
};

export default peri;
