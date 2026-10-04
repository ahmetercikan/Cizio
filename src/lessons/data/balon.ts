import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Balon: alttaki uçtan başlayıp sola, tepeye ve sağdan geri dönen yuvarlak biçim. */
const balloon = (cx: number, top: number, rx: number, h: number) => {
  const b = top + h;
  const cy = top + h * 0.45;
  const k = 0.552;
  const r = (n: number) => Math.round(n);
  return (
    `M${cx},${b} C${r(cx - rx * 0.55)},${r(b - h * 0.1)} ${cx - rx},${r(cy + h * 0.28)} ${cx - rx},${r(cy)} ` +
    `C${cx - rx},${r(cy - k * (cy - top))} ${r(cx - k * rx)},${top} ${cx},${top} ` +
    `C${r(cx + k * rx)},${top} ${cx + rx},${r(cy - k * (cy - top))} ${cx + rx},${r(cy)} ` +
    `C${cx + rx},${r(cy + h * 0.28)} ${r(cx + rx * 0.55)},${r(b - h * 0.1)} ${cx},${b} Z`
  );
};
/** Balonun altındaki minik üçgen düğüm. */
const knot = (cx: number, y: number) => `M${cx},${y} L${cx - 11},${y + 15} L${cx + 11},${y + 15} Z`;
/** Balonun sol üstündeki parlak yay. */
const shine = (cx: number, top: number, rx: number, h: number) => {
  const cy = Math.round(top + h * 0.45);
  return `M${cx - rx + 16},${cy - 4} Q${cx - rx + 18},${top + 24} ${cx - Math.round(rx * 0.3)},${top + 16}`;
};

/** Sevimli Nesneler 7: Yumurta biçimli balonlar ve aşağıda birleşen ipler. */
const balon: Lesson = {
  id: 'balon',
  path: 'nesneler',
  title: 'Uçan Balonlar',
  emoji: '🎈',
  order: 7,
  level: 1,
  skill: 'Yumurta biçimli balonlar çizip iplerini aşağıda tek bir noktada birleştirmeyi öğrendin!',
  palette: ['#ff6b6b', '#7ec8f0', '#ffd166', '#ff9ec7', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Ortaya kocaman bir balon çiz. Alttaki uçtan başla, sola kıvrılıp tepeye çık, sağdan geri in.',
      shapes: [{ d: balloon(200, 42, 60, 170), part: 'kırmızı balon', fill: '#ff6b6b' }],
    },
    {
      say: 'Sol tarafa biraz daha küçük ikinci bir balon çiz. Ortadaki balona değmesin.',
      shapes: [{ d: balloon(90, 92, 50, 145), part: 'mavi balon', fill: '#7ec8f0' }],
    },
    {
      say: 'Sağ tarafa da aynı boyda üçüncü balonu çiz. Soldaki balonla ikiz gibi olsun.',
      shapes: [{ d: balloon(310, 92, 50, 145), part: 'sarı balon', fill: '#ffd166' }],
    },
    {
      say: 'Her balonun alt ucuna minik bir üçgen düğüm çiz. Ucu yukarıda, tabanı aşağıda olsun.',
      shapes: [
        { d: knot(200, 212), part: 'orta düğüm', fill: '#ff6b6b' },
        { d: knot(90, 237), part: 'sol düğüm', fill: '#7ec8f0' },
        { d: knot(310, 237), part: 'sağ düğüm', fill: '#ffd166' },
      ],
    },
    {
      say: 'Düğümlerden aşağı kıvrık ipler çiz. Üç ip de en altta aynı noktada buluşsun.',
      shapes: [
        { d: 'M200,227 Q186,262 200,295 Q214,326 200,345', part: 'orta ip' },
        { d: 'M90,252 Q108,300 148,316 Q186,330 200,345', part: 'sol ip' },
        { d: 'M310,252 Q292,300 252,316 Q214,330 200,345', part: 'sağ ip' },
      ],
    },
    {
      say: 'İplerin buluştuğu yere küçük pembe bir fiyonk çiz. Ortası dar, iki yanı yuvarlak olsun.',
      shapes: [
        { d: 'M200,345 C178,324 160,334 162,349 C164,366 182,364 200,345 Z', part: 'sol fiyonk', fill: '#ff9ec7' },
        { d: 'M200,345 C222,324 240,334 238,349 C236,366 218,364 200,345 Z', part: 'sağ fiyonk', fill: '#ff9ec7' },
      ],
    },
    {
      say: 'Ortadaki balona iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(176, 116, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(181, 111, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(224, 116, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(229, 111, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M184,146 Q200,164 216,146', part: 'ağız' },
        { d: ellipse(160, 146, 11, 7), part: 'sol yanak', fill: '#ff9ec7' },
        { d: ellipse(240, 146, 11, 7), part: 'sağ yanak', fill: '#ff9ec7' },
      ],
    },
    {
      say: 'Her balonun sol üst köşesine küçük, kıvrık bir çizgi çiz. Balonlar parlasın!',
      shapes: [
        { d: shine(90, 92, 50, 145), part: 'mavi parıltı' },
        { d: shine(200, 42, 60, 170), part: 'kırmızı parıltı' },
        { d: shine(310, 92, 50, 145), part: 'sarı parıltı' },
      ],
    },
  ],
};

export default balon;
