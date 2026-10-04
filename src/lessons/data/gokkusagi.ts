import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const LEFT_CLOUD = 'M56,344 A42,42 0 0,1 91.4,279.4 A38,38 0 0,1 151.8,306.3 A24,24 0 0,1 179.9,344 Z';
const RIGHT_CLOUD = 'M220.1,344 A24,24 0 0,1 248.2,306.3 A38,38 0 0,1 308.6,279.4 A42,42 0 0,1 344,344 Z';

/** Doğa 6: Gökkuşağı. İç içe, birbirine paralel kemerler; uçları iki bulutun arkasına saklanır. */
const gokkusagi: Lesson = {
  id: 'gokkusagi',
  path: 'doga',
  title: 'Gökkuşağı',
  emoji: '🌈',
  order: 6,
  level: 1,
  skill: 'Kemerleri birbirine paralel, aynı aralıkla iç içe çizdin. Paralel eğriler gökkuşağını düzgün gösterir!',
  palette: ['#ff5a5f', '#ffa53d', '#ffd84d', '#7ed957', '#5ab8ff', '#ffffff', '#2d2d2d'],
  steps: [
    {
      say: 'Soldaki kesikli bulutun kenarından başla. Yukarı kocaman bir kemer çiz, sağdaki bulutta bitir.',
      shapes: [
        { d: LEFT_CLOUD, guide: true },
        { d: RIGHT_CLOUD, guide: true },
        { d: 'M40.4,263 A165,245 0 0,1 359.6,263', part: 'kırmızı kemer', fill: '#ff5a5f' },
      ],
    },
    {
      say: 'İlk kemerin hemen içine, ona paralel iki kemer daha çiz. Aralıkları eşit olsun.',
      shapes: [
        { d: 'M65,261 A141,221 0 0,1 335,261', part: 'turuncu kemer', fill: '#ffa53d' },
        { d: 'M87,273.7 A117,197 0 0,1 313,273.7', part: 'sarı kemer', fill: '#ffd84d' },
      ],
    },
    {
      say: 'Aynı aralıkla üç kemer daha çiz. Her biri bir öncekinden biraz küçük olsun.',
      shapes: [
        { d: 'M111.5,272.1 A93,173 0 0,1 288.5,272.1', part: 'yeşil kemer', fill: '#7ed957' },
        { d: 'M134.5,278 A69,149 0 0,1 265.5,278', part: 'mavi kemer', fill: '#5ab8ff' },
        { d: 'M155.6,304.8 A45,125 0 0,1 244.4,304.8', part: 'en içteki kemer', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kesikli çizgilerin üstünden geçerek iki kabarık bulut çiz. Tümsekler yuvarlak, altları düz olsun.',
      shapes: [
        { d: LEFT_CLOUD, part: 'sol bulut', fill: '#ffffff' },
        { d: RIGHT_CLOUD, part: 'sağ bulut', fill: '#ffffff' },
      ],
    },
    {
      say: 'Sol buluta iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(84, 314, 9), part: 'sol bulutun sol gözü', fill: '#2d2d2d' },
        { d: circle(118, 314, 9), part: 'sol bulutun sağ gözü', fill: '#2d2d2d' },
        { d: circle(81, 310, 3.5), part: 'sol bulutun sol parıltısı', fill: '#ffffff' },
        { d: circle(115, 310, 3.5), part: 'sol bulutun sağ parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Sağ buluta da aynı gözleri çiz. İki bulut ikiz gibi olsun.',
      shapes: [
        { d: circle(282, 314, 9), part: 'sağ bulutun sol gözü', fill: '#2d2d2d' },
        { d: circle(316, 314, 9), part: 'sağ bulutun sağ gözü', fill: '#2d2d2d' },
        { d: circle(279, 310, 3.5), part: 'sağ bulutun sol parıltısı', fill: '#ffffff' },
        { d: circle(313, 310, 3.5), part: 'sağ bulutun sağ parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Son olarak iki bulutun gözlerinin altına birer gülümseme çiz. Gökkuşağın hazır!',
      shapes: [
        { d: 'M90,329 Q101,339 112,329', part: 'sol bulutun ağzı' },
        { d: 'M288,329 Q299,339 310,329', part: 'sağ bulutun ağzı' },
      ],
    },
  ],
};

export default gokkusagi;
