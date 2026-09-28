import type { Lesson } from '../types';

const tavsan: Lesson = {
  id: 'tavsan',
  path: 'hayvanlar',
  title: 'Uzun Kulaklı Tavşan',
  emoji: '🐰',
  order: 3,
  level: 1,
  skill: 'Sağ ve sol tarafı ayna gibi aynı çizdin. Buna simetri denir!',
  palette: ['#ece4ff', '#ffb3c1', '#ff7f9c', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce büyük, yuvarlak bir oval çiz. Bu tavşanımızın kafası olacak.',
      shapes: [{ d: 'M100,225 A100,85 0 1,0 300,225 A100,85 0 1,0 100,225 Z', part: 'kafa', fill: '#ece4ff' }],
    },
    {
      say: 'Kafanın üstüne iki uzun kulak çiz. İkisi de aynı boyda olsun!',
      shapes: [
        { d: 'M140,157 C110,100 115,35 150,35 C185,35 192,100 185,141', part: 'sol kulak', fill: '#ece4ff' },
        { d: 'M215,141 C208,100 215,35 250,35 C285,35 290,100 260,157', part: 'sağ kulak', fill: '#ece4ff' },
      ],
    },
    {
      say: 'Kulakların içine daha ince, uzun birer şekil çiz.',
      shapes: [
        { d: 'M163,140 C142,110 140,62 154,58 C168,55 178,100 175,138 Q169,146 163,140 Z', part: 'sol kulak içi', fill: '#ffb3c1' },
        { d: 'M225,138 C222,100 232,55 246,58 C260,62 258,110 237,140 Q231,146 225,138 Z', part: 'sağ kulak içi', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'İki yuvarlak göz çiz, içlerine de minik beyaz parıltılar koy.',
      shapes: [
        { d: 'M146,222 A14,14 0 1,0 174,222 A14,14 0 1,0 146,222 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M226,222 A14,14 0 1,0 254,222 A14,14 0 1,0 226,222 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M150,216 A5.5,5.5 0 1,0 161,216 A5.5,5.5 0 1,0 150,216 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M230,216 A5.5,5.5 0 1,0 241,216 A5.5,5.5 0 1,0 230,216 Z', part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ortaya minik bir burun, altına da gülümseyen bir ağız çiz.',
      shapes: [
        { d: 'M189,244 Q200,236 211,244 Q206,256 200,257 Q194,256 189,244 Z', part: 'burun', fill: '#ff7f9c' },
        { d: 'M180,268 Q190,280 200,258 Q210,280 220,268', part: 'ağız' },
      ],
    },
    {
      say: 'Ağzın altına iki minik diş, iki yana da pembe yanaklar ekle.',
      shapes: [
        { d: 'M189,274 L189,292 Q200,296 211,292 L211,274', part: 'dişler', fill: '#ffffff' },
        { d: 'M116,256 A17,11 0 1,0 150,256 A17,11 0 1,0 116,256 Z', part: 'sol yanak', fill: '#ffb3c1' },
        { d: 'M250,256 A17,11 0 1,0 284,256 A17,11 0 1,0 250,256 Z', part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default tavsan;
