import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 5: Kare kutu + kapak + kurdele = hediye. Dikdörtgenleri üst üste koymak. */
const hediye: Lesson = {
  id: 'hediye',
  path: 'nesneler',
  title: 'Hediye Kutusu',
  emoji: '🎁',
  order: 5,
  level: 1,
  skill: 'İki dikdörtgeni üst üste koyup kurdele ve fiyonk ekleyerek hediye kutusu çizmeyi öğrendin!',
  palette: ['#ff6b8b', '#ff9eb5', '#ffd166', '#ffb703', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kutunun gövdesi için büyük bir kare çiz. Sol üstten başla ve dört köşeyi dolaş.',
      shapes: [{ d: 'M88,190 L312,190 L312,360 L88,360 Z', part: 'kutu', fill: '#ff6b8b' }],
    },
    {
      say: 'Kutunun üstüne biraz daha geniş, ince bir dikdörtgen çiz. Bu, kutunun kapağı.',
      shapes: [{ d: 'M70,140 L330,140 L330,190 L70,190 Z', part: 'kapak', fill: '#ff9eb5' }],
    },
    {
      say: 'Kapağın tepesinden kutunun altına kadar uzun bir şerit çiz. Bu, sarı kurdele.',
      shapes: [{ d: 'M180,140 L220,140 L220,360 L180,360 Z', part: 'kurdele', fill: '#ffd166' }],
    },
    {
      say: 'Kurdelenin tepesine iki yaprak gibi kocaman fiyonk halkası çiz. Ortaya da yuvarlak bir düğüm koy.',
      shapes: [
        { d: 'M200,135 C160,62 84,62 96,110 C104,140 168,145 200,135 Z', part: 'sol fiyonk', fill: '#ffd166' },
        { d: 'M200,135 C240,62 316,62 304,110 C296,140 232,145 200,135 Z', part: 'sağ fiyonk', fill: '#ffd166' },
        { d: circle(200, 131, 17), part: 'düğüm', fill: '#ffb703' },
      ],
    },
    {
      say: 'Kurdelenin iki yanına birer yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(143, 245, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(148, 240, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(257, 245, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(262, 240, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına, kurdelenin üstünden geçen kocaman bir gülümseme çiz. Yanlara pembe yanaklar ekle.',
      shapes: [
        { d: 'M162,280 Q200,320 238,280', part: 'ağız' },
        { d: ellipse(116, 278, 15, 9), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(284, 278, 15, 9), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak kutunun köşelerine minik puantiyeler çiz. Küçük yuvarlaklar yeterli.',
      shapes: [
        { d: circle(116, 334, 9), part: 'sol alt benek', fill: '#ffffff' },
        { d: circle(284, 334, 9), part: 'sağ alt benek', fill: '#ffffff' },
        { d: circle(110, 212, 6), part: 'sol üst benek', fill: '#ffffff' },
        { d: circle(290, 212, 6), part: 'sağ üst benek', fill: '#ffffff' },
      ],
    },
  ],
};

export default hediye;
