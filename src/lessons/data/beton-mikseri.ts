import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Köşeleri yuvarlatılmış dikdörtgen. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

/** Eğik duran tambur: merkez, yarıçaplar ve eğim (derece). */
const DRUM = { cx: 158, cy: 184, rx: 108, ry: 62, rot: 15 };
const rad = (DRUM.rot * Math.PI) / 180;
const toXY = (u: number, v: number): string => {
  const x = DRUM.cx + u * Math.cos(rad) - v * Math.sin(rad);
  const y = DRUM.cy + u * Math.sin(rad) + v * Math.cos(rad);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
};
const drum = () => {
  const a = toXY(-DRUM.rx, 0);
  const b = toXY(DRUM.rx, 0);
  return `M${a} A${DRUM.rx},${DRUM.ry} ${DRUM.rot} 1,0 ${b} A${DRUM.rx},${DRUM.ry} ${DRUM.rot} 1,0 ${a} Z`;
};
/** Tamburu saran bir şerit: u1–u2 arası, üst ve alt kenarı tamburun çizgisine oturur. */
const band = (u1: number, u2: number) => {
  const half = (u: number) => DRUM.ry * Math.sqrt(Math.max(0, 1 - (u / DRUM.rx) ** 2));
  const us = [0, 1, 2, 3].map((i) => u1 + ((u2 - u1) * i) / 3);
  const top = us.map((u) => toXY(u, -half(u)));
  const bottom = [...us].reverse().map((u) => toXY(u, half(u)));
  return `M${top.join(' L')} L${bottom.join(' L')} Z`;
};

/** İş Makineleri 6: Çizgili tamburu dönen, güler yüzlü bir beton mikseri. */
const betonMikseri: Lesson = {
  id: 'beton-mikseri',
  path: 'ismakineleri',
  title: 'Beton Mikseri',
  emoji: '🚚',
  order: 6,
  level: 2,
  skill: 'Eğik bir oval çizip üstüne şeritler ekledin. Yuvarlak şekilleri süslemeyi öğrendin!',
  palette: ['#ff9f1c', '#e8ecf2', '#4fa3ff', '#3a3a4a', '#aee3ff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce sağ tarafa kabini çiz. Üstü yuvarlak, önü hafifçe eğik olsun.',
      shapes: [
        {
          d: 'M266,282 L266,146 Q266,130 282,130 L314,130 Q332,130 340,148 L356,206 Q360,216 360,228 L360,270 Q360,282 348,282 Z',
          part: 'kabin',
          fill: '#ff9f1c',
        },
      ],
    },
    {
      say: 'Kabinin soluna upuzun, ince bir kasa çiz. Kamyonun tabanı bu olacak.',
      shapes: [{ d: rect(40, 252, 228, 30, 8), part: 'kasa', fill: '#3a3a4a' }],
    },
    {
      say: 'Kasanın üstüne kocaman, eğik bir oval çiz. Bu, betonu karıştıran tambur!',
      shapes: [{ d: drum(), part: 'tambur', fill: '#e8ecf2' }],
    },
    {
      say: 'Tamburun üstüne yan yana üç şerit çiz. Tambur dönünce şeritler de döner!',
      shapes: [
        { d: band(-66, -42), part: 'şeritler', fill: '#4fa3ff' },
        { d: band(-12, 12), part: 'şeritler', fill: '#4fa3ff' },
        { d: band(42, 66), part: 'şeritler', fill: '#4fa3ff' },
      ],
    },
    {
      say: 'Tamburun arkasına beton dökülen bir huni, altına da onu taşıyan bir ayak çiz.',
      shapes: [
        { d: 'M67,136 L44,98 L102,94 L80,128', part: 'huni', fill: '#ff9f1c' },
        { d: 'M80,212 L72,252 L106,252 L100,227', part: 'ayak', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Kasanın altına arka arkaya iki tekerlek çiz. Ortalarına küçük daireler koy.',
      shapes: [
        { d: circle(88, 290, 28), part: 'arka tekerlekler', fill: '#3a3a4a' },
        { d: circle(88, 290, 10), part: 'arka jantlar', fill: '#d0d4dc' },
        { d: circle(156, 290, 28), part: 'arka tekerlekler', fill: '#3a3a4a' },
        { d: circle(156, 290, 10), part: 'arka jantlar', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Kabinin altına ön tekerleği, üstüne de büyük bir pencere çiz.',
      shapes: [
        { d: circle(312, 290, 30), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(312, 290, 11), part: 'ön jant', fill: '#d0d4dc' },
        { d: 'M280,146 L312,146 Q324,146 328,158 L338,196 L280,196 Z', part: 'pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Pencerenin altına iki yuvarlak göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: circle(294, 222, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(298, 217, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(330, 222, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(334, 217, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Son olarak gülen bir ağız, pembe yanaklar ve öne sarı bir far çiz. Mikser işe hazır!',
      shapes: [
        { d: 'M300,242 Q312,254 324,242', part: 'ağız' },
        { d: ellipse(281, 244, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(344, 244, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M360,256 L352,256 Q346,256 346,263 Q346,270 352,270 L360,270', part: 'far', fill: '#fff4b0' },
      ],
    },
  ],
};

export default betonMikseri;
