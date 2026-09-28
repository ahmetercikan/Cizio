import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 2: Kocaman kafalı, minik kollu, sevimli bir T-Rex. */
const trex: Lesson = {
  id: 'trex',
  path: 'dinozor',
  title: 'Minik T-Rex',
  emoji: '🦖',
  order: 2,
  level: 2,
  skill: 'Kocaman bir kafa ile minicik kollar yan yana gelince sevimli bir karakter çıktı. Boyutları oynatmak çizime kişilik katar!',
  palette: ['#5fc46d', '#fff1b8', '#ffc94d', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce sağ üste kocaman, yuvarlak bir kafa çiz. Burnu sağa doğru uzansın.',
      shapes: [
        {
          d: 'M172,165 C160,95 215,62 270,62 C325,62 348,100 344,135 C340,172 305,190 258,192 C215,193 180,188 172,165 Z',
          part: 'kafa',
          fill: '#5fc46d',
        },
      ],
    },
    {
      say: 'Kafanın solundan başla, aşağı doğru tombul bir gövde çiz ve kafanın altında bitir.',
      shapes: [
        {
          d: 'M172,165 C140,178 122,205 118,240 C115,265 118,282 128,298 C145,325 185,338 220,330 C255,322 272,300 270,265 C268,235 265,210 258,192',
          part: 'gövde',
          fill: '#5fc46d',
        },
      ],
    },
    {
      say: 'Gövdenin arkasından sola doğru sivri uçlu uzun bir kuyruk çiz.',
      shapes: [{ d: 'M118,240 C85,250 55,275 36,308 C70,302 100,300 128,298', part: 'kuyruk', fill: '#5fc46d' }],
    },
    {
      say: 'Gövdenin altına iki kalın, güçlü bacak çiz. Ayakları yere sağlam bassın.',
      shapes: [
        { d: 'M148.8,318.3 C146,342 138,366 160,366 L190,366 Q199,366 197,354 L187.9,331.7', part: 'arka bacak', fill: '#5fc46d' },
        { d: 'M220,330 C219,348 212,366 234,366 L262,366 Q271,366 269,354 C267,338 263,322 258.9,307.6', part: 'ön bacak', fill: '#5fc46d' },
      ],
    },
    {
      say: 'Göğsüne minicik iki kol ekle. Karnına da açık renkli büyük bir oval çiz.',
      shapes: [
        { d: 'M264.7,216.8 C280,214 293,220 292,229 C291,237 280,238 267.4,235.4', part: 'üst kol', fill: '#5fc46d' },
        { d: 'M268.3,243.5 C283,242 295,248 294,257 C293,265 282,265 269.7,260.6', part: 'alt kol', fill: '#5fc46d' },
        { d: ellipse(220, 274, 34, 46), part: 'karın', fill: '#fff1b8' },
      ],
    },
    {
      say: 'Kafaya parlak bir göz, minik bir burun deliği, gülümseyen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(292, 108, 16), part: 'göz', fill: '#2d2d2d' },
        { d: circle(297, 102, 5.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(333, 100, 3.5), part: 'burun deliği', fill: '#2d2d2d' },
        { d: 'M282,158 Q310,174 336,150', part: 'ağız' },
        { d: ellipse(262, 145, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak sırtına üç sivri diken ekle. Her diken sırttan çıkıp sırta geri dönsün.',
      shapes: [
        { d: 'M170.1,165.8 L140.7,145.1 L147,180.3', part: 'dikenler', fill: '#ffc94d' },
        { d: 'M142.9,184.2 L108.3,175.7 L127.8,205.6', part: 'dikenler', fill: '#ffc94d' },
        { d: 'M125.4,210.8 L91.9,216.3 L118.3,237.9', part: 'dikenler', fill: '#ffc94d' },
      ],
    },
  ],
};

export default trex;
