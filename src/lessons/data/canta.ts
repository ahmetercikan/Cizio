import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 8: Kubbeli gövde, cep ve askılar = okul çantası. Simetrik parçalar. */
const canta: Lesson = {
  id: 'canta',
  path: 'nesneler',
  title: 'Okul Çantası',
  emoji: '🎒',
  order: 8,
  level: 2,
  skill: 'Kubbeli bir gövdeye cep, kapak ve iki yana simetrik askılar ekleyerek çanta çizmeyi öğrendin!',
  palette: ['#ff7b6b', '#ffd166', '#ffb703', '#7ec8f0', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Çantanın gövdesini çiz. Üstü kubbe gibi yuvarlak, altı yuvarlak köşeli bir kutu olsun.',
      shapes: [
        {
          d: 'M110,140 Q110,92 200,92 Q290,92 290,140 L290,330 Q290,356 264,356 L136,356 Q110,356 110,330 Z',
          part: 'gövde',
          fill: '#ff7b6b',
        },
      ],
    },
    {
      say: 'Çantanın iki yanına uzun, kıvrık askılar çiz. Tepeden başlayıp aşağıya doğru yay gibi insin.',
      shapes: [
        { d: 'M118,112 C62,140 56,290 110,334 L110,306 C86,280 84,170 112,140 Z', part: 'sol askı', fill: '#7ec8f0' },
        { d: 'M282,112 C338,140 344,290 290,334 L290,306 C314,280 316,170 288,140 Z', part: 'sağ askı', fill: '#7ec8f0' },
      ],
    },
    {
      say: 'Çantanın tepesine küçük bir tutma kulpu çiz. Ters bir U harfi gibi olsun.',
      shapes: [{ d: 'M172,94 C172,50 228,50 228,94', part: 'tutma kulpu' }],
    },
    {
      say: 'Gövdenin alt kısmına büyük bir cep çiz. Köşeleri yuvarlak bir kare gibi olsun.',
      shapes: [
        {
          d: 'M136,250 L264,250 L264,322 Q264,338 248,338 L152,338 Q136,338 136,322 Z',
          part: 'cep',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Cebin üstüne kavisli bir kapak çiz. Kapağın ortasına da yuvarlak bir düğme koy.',
      shapes: [
        { d: 'M136,250 L264,250 L264,268 Q200,300 136,268 Z', part: 'cep kapağı', fill: '#ffb703' },
        { d: circle(200, 284, 9), part: 'düğme', fill: '#7ec8f0' },
      ],
    },
    {
      say: 'Gövdenin üst kısmına kavisli bir fermuar çizgisi çiz. Sağ ucuna minik bir fermuar çekeceği ekle.',
      shapes: [
        { d: 'M128,140 Q200,116 272,140', part: 'fermuar' },
        { d: 'M246,128 L246,146 A6,6 0 0,0 258,146 L258,128', part: 'fermuar çekeceği', fill: '#ffd166' },
      ],
    },
    {
      say: 'Fermuarın altına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(166, 190, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(171, 185, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(234, 190, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(239, 185, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M180,216 Q200,236 220,216', part: 'ağız' },
        { d: ellipse(140, 218, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(260, 218, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default canta;
