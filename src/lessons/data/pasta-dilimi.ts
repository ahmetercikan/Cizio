import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 10: Üçgen üst + iki yan yüz = pasta dilimi. Katmanlı bir nesneyi üç boyutlu çizmek. */
const pastaDilimi: Lesson = {
  id: 'pasta-dilimi',
  path: 'nesneler',
  title: 'Çilekli Pasta Dilimi',
  emoji: '🍰',
  order: 10,
  level: 2,
  skill: 'Üst yüzü ve iki yan yüzü birleştirip katmanlar ekleyerek üç boyutlu bir pasta dilimi çizmeyi öğrendin!',
  palette: ['#ffe0a3', '#fff0f5', '#f6b96b', '#ff9ec7', '#e8434f', '#6fcf97', '#2d2d2d'],
  steps: [
    {
      say: 'Önce dilimin ön yüzünü çiz. Sağa doğru hafif inen geniş bir dörtgen olsun.',
      shapes: [{ d: 'M40,205 L290,235 L290,370 L40,340 Z', part: 'ön yüz', fill: '#ffe0a3' }],
    },
    {
      say: 'Sol üst köşeden sağa yukarı uzun bir çizgi çek, sonra sağ köşeye in. Üçgen bir üst yüz oluşur.',
      shapes: [{ d: 'M40,205 L360,155 L290,235 Z', part: 'üst yüz', fill: '#fff0f5' }],
    },
    {
      say: 'Sağ uca dar, eğik bir yüz daha ekle. Üstteki köşeden aşağı in ve ön yüzün altına bağla.',
      shapes: [{ d: 'M290,235 L360,155 L360,290 L290,370', part: 'arka yüz', fill: '#f6b96b' }],
    },
    {
      say: 'Ön yüzün üst kenarına dalgalı bir krema çiz. Sanki krema aşağı doğru damlıyor!',
      shapes: [
        {
          d:
            'M40,205 L290,235 L290,249 Q276,281 262,246 Q248,256 234,242 Q220,275 206,239 Q192,249 178,236 ' +
            'Q164,268 150,232 Q136,243 122,229 Q108,261 94,225 Q80,236 66,222 Q50,226 40,205 Z',
          part: 'damlayan krema',
          fill: '#fff0f5',
        },
      ],
    },
    {
      say: 'Ön yüzün alt kısmına alt alta iki çizgiyle bir krema katmanı çiz. Sağdaki eğik yüze de devam ettir.',
      shapes: [
        { d: 'M40,300 L290,330 L290,345 L40,315 Z', part: 'krema katmanı', fill: '#ff9ec7' },
        { d: 'M290,330 L360,250 L360,265 L290,345 Z', part: 'arka krema katmanı', fill: '#ff9ec7' },
      ],
    },
    {
      say: 'Üst yüzün üstüne ucu aşağıda kocaman bir çilek çiz. Tepesine de yeşil sivri yapraklar ekle.',
      shapes: [
        { d: 'M250,200 C206,184 204,124 250,120 C296,124 294,184 250,200 Z', part: 'çilek', fill: '#e8434f' },
        { d: 'M224,126 L232,100 L250,115 L268,100 L276,126 Q250,138 224,126 Z', part: 'çilek yaprakları', fill: '#6fcf97' },
      ],
    },
    {
      say: 'Çileğin üstüne minik çizgilerle çekirdekler çiz. Üç dört tane yeterli.',
      shapes: [
        { d: 'M232,146 L234,153', part: 'sol üst çekirdek' },
        { d: 'M266,144 L264,151', part: 'sağ üst çekirdek' },
        { d: 'M248,164 L250,171', part: 'orta çekirdek' },
        { d: 'M272,168 L269,175', part: 'sağ alt çekirdek' },
      ],
    },
    {
      say: 'Ön yüzün ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(130, 268, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(135, 263, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(196, 276, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(201, 271, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına tatlı bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M145,294 Q164,312 183,298', part: 'ağız' },
        { d: ellipse(98, 290, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(228, 304, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default pastaDilimi;
