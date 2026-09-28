import type { Lesson } from '../types';

const balik: Lesson = {
  id: 'balik',
  path: 'hayvanlar',
  title: 'Minik Balık',
  emoji: '🐟',
  order: 2,
  level: 1,
  skill: 'Önce büyük gövdeyi çizdin, sonra kuyruk ve yüzgeçleri gövdenin kenarına bağladın!',
  palette: ['#ff9f43', '#ff6b6b', '#ffffff', '#2d2d2d', '#ffb3c1', '#9bdcff'],
  steps: [
    {
      say: 'Önce büyük, yan yatmış bir oval çiz. Bu balığımızın gövdesi olacak.',
      shapes: [{ d: 'M70,205 A110,80 0 1,0 290,205 A110,80 0 1,0 70,205 Z', part: 'gövde', fill: '#ff9f43' }],
    },
    {
      say: 'Sağ tarafa kocaman bir kuyruk ekle. Gövdeden başla, gövdede bitir.',
      shapes: [{ d: 'M280,172 L345,125 Q325,205 345,285 L280,238', part: 'kuyruk', fill: '#ff6b6b' }],
    },
    {
      say: 'Sırtına kavisli bir yüzgeç, gövdenin ortasına da küçük bir yan yüzgeç çiz.',
      shapes: [
        { d: 'M120,138 Q150,68 200,126', part: 'sırt yüzgeci', fill: '#ff6b6b' },
        { d: 'M160,228 Q195,205 212,245 Q185,262 160,228 Z', part: 'yan yüzgeç', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Kuyruğa yakın kalın bir şerit çiz. Yukarıdan in, alttan geç, sonra yukarı çık.',
      shapes: [
        {
          d: 'M215,129 Q235,205 215,281 A110,80 0 0,0 250,267 Q270,205 250,143 A110,80 0 0,0 215,129 Z',
          part: 'şerit',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Sol tarafa yuvarlak bir göz, içine minik beyaz bir parıltı çiz.',
      shapes: [
        { d: 'M104,190 A16,16 0 1,0 136,190 A16,16 0 1,0 104,190 Z', part: 'göz', fill: '#2d2d2d' },
        { d: 'M109,184 A5,5 0 1,0 119,184 A5,5 0 1,0 109,184 Z', part: 'göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözün altına gülümseyen bir ağız ve pembe bir yanak ekle.',
      shapes: [
        { d: 'M75,218 Q88,234 101,218', part: 'ağız' },
        { d: 'M128,224 A12,8 0 1,0 152,224 A12,8 0 1,0 128,224 Z', part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak balığın önüne üç baloncuk çiz. Büyükten küçüğe doğru!',
      shapes: [
        { d: 'M47,110 A13,13 0 1,0 73,110 A13,13 0 1,0 47,110 Z', part: 'büyük baloncuk', fill: '#9bdcff' },
        { d: 'M76,72 A9,9 0 1,0 94,72 A9,9 0 1,0 76,72 Z', part: 'orta baloncuk', fill: '#9bdcff' },
        { d: 'M49,46 A6,6 0 1,0 61,46 A6,6 0 1,0 49,46 Z', part: 'minik baloncuk', fill: '#9bdcff' },
      ],
    },
  ],
};

export default balik;
