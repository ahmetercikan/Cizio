import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
const r = (n: number) => Math.round(n);
/** Kalbin bir yarısı: üstteki çukurdan başlar, yuvarlak bir tümsek yapıp alttaki sivri uca iner. side: -1 sol, 1 sağ. */
const half = (cx: number, cy: number, s: number, side: -1 | 1) =>
  `M${cx},${r(cy - 0.3 * s)} C${r(cx + side * 0.15 * s)},${r(cy - 0.85 * s)} ${r(cx + side * s)},${r(cy - 0.8 * s)} ${r(cx + side * s)},${r(cy - 0.2 * s)} ` +
  `C${r(cx + side * s)},${r(cy + 0.3 * s)} ${r(cx + side * 0.4 * s)},${r(cy + 0.6 * s)} ${cx},${r(cy + 0.95 * s)}`;
/** Tek hamlede bütün kalp: çukurdan sola, uca, sağa ve yine çukura. */
const heart = (cx: number, cy: number, s: number) =>
  `${half(cx, cy, s, -1)} ` +
  `C${r(cx + 0.4 * s)},${r(cy + 0.6 * s)} ${r(cx + s)},${r(cy + 0.3 * s)} ${r(cx + s)},${r(cy - 0.2 * s)} ` +
  `C${r(cx + s)},${r(cy - 0.8 * s)} ${r(cx + 0.15 * s)},${r(cy - 0.85 * s)} ${cx},${r(cy - 0.3 * s)} Z`;

/** Temeller 7: İki kavisin sivri bir uçta buluşması — kalpler. */
const kalpler: Lesson = {
  id: 'kalpler',
  path: 'temeller',
  title: 'Kalpler',
  emoji: '💗',
  order: 7,
  level: 1,
  skill: 'İki yuvarlak kavisi aşağıda sivri bir uçta buluşturarak kalp çizmeyi öğrendin!',
  palette: ['#ff6b8b', '#ff9ec7', '#c77dff', '#ffd166', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Ortada, üstteki küçük çukurdan başla. Sola doğru yuvarlak bir tümsek yap ve aşağıdaki uca in.',
      shapes: [{ d: half(200, 175, 112, -1), part: 'büyük kalbin sol yarısı', fill: '#ff6b8b' }],
    },
    {
      say: 'Şimdi aynı çukurdan sağa doğru ikinci tümseği çiz. Aşağıda sol yarıyla aynı uçta buluşsun.',
      shapes: [{ d: half(200, 175, 112, 1), part: 'büyük kalbin sağ yarısı', fill: '#ff6b8b' }],
    },
    {
      say: 'Kalbin ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(168, 168, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(173, 163, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(232, 168, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(237, 163, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M180,198 Q200,218 220,198', part: 'ağız' },
        { d: ellipse(140, 198, 14, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(260, 198, 14, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Büyük kalbin iki alt yanına birer orta boy kalp çiz. Yine çukurdan başla, uçta buluştur.',
      shapes: [
        { d: heart(84, 312, 42), part: 'sol orta kalp', fill: '#ff9ec7' },
        { d: heart(316, 312, 42), part: 'sağ orta kalp', fill: '#ff9ec7' },
      ],
    },
    {
      say: 'Büyük kalbin ucunun altına küçük mor bir kalp çiz. Kavisler küçük ama uç yine sivri olsun.',
      shapes: [{ d: heart(200, 330, 30), part: 'küçük kalp', fill: '#c77dff' }],
    },
    {
      say: 'Üst köşelere iki minik sarı kalp çiz. Ne kadar küçük olursa o kadar dikkatli çiz.',
      shapes: [
        { d: heart(66, 78, 24), part: 'sol minik kalp', fill: '#ffd166' },
        { d: heart(334, 78, 24), part: 'sağ minik kalp', fill: '#ffd166' },
      ],
    },
    {
      say: 'Büyük kalbin sol üstüne kıvrık küçük bir çizgi çiz. Kalbimiz parlasın!',
      shapes: [{ d: 'M112,160 Q110,120 140,106', part: 'parlak çizgi' }],
    },
  ],
};

export default kalpler;
