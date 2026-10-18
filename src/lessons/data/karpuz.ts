import type { Lesson } from '../types';

/** Sevimli Nesneler 12: Karpuz dilimi. Yarım ay taban, katmanlar ve damla çekirdekler. */
const karpuz: Lesson = {
  id: 'karpuz',
  path: 'nesneler',
  title: 'Karpuz Dilimi',
  emoji: '🍉',
  order: 12,
  level: 1,
  skill: 'Geniş bir yay çizip katmanlar ve damla şeklinde çekirdekler eklemeyi öğrendin!',
  palette: ['#2ed573', '#ffffff', '#ff4757', '#2f3542', '#10ac84'],
  steps: [
    {
      say: 'Önce karpuzun tabanı için üstü düz, altı kavisli kocaman bir yarım daire kabuk çiz.',
      shapes: [{ d: 'M25,150 A175,175 0 0,0 375,150 Z', part: 'dış yeşil kabuk', fill: '#2ed573' }],
    },
    {
      say: 'Yeşil kabuğun içine biraz daha dar, ince ve beyaz bir şerit katman ekle.',
      shapes: [{ d: 'M45,150 A155,155 0 0,0 355,150 Z', part: 'iç beyaz kabuk', fill: '#ffffff' }],
    },
    {
      say: 'Şimdi karpuzun en lezzetli yerine, kıpkırmızı sulu iç kısmını doldur.',
      shapes: [{ d: 'M60,150 A140,140 0 0,0 340,150 Z', part: 'karpuz içi', fill: '#ff4757' }],
    },
    {
      say: 'Kırmızı kısmın içine damla şeklinde minik siyah çekirdekler serp.',
      shapes: [
        { d: 'M100,195 C94,204 98,215 104,215 C110,215 114,204 108,195 Z', part: 'çekirdek 1', fill: '#2f3542' },
        { d: 'M144,220 C138,229 142,240 148,240 C154,240 158,229 152,220 Z', part: 'çekirdek 2', fill: '#2f3542' },
        { d: 'M184,245 C178,254 182,265 188,265 C194,265 198,254 192,245 Z', part: 'çekirdek 3', fill: '#2f3542' },
        { d: 'M216,245 C210,254 214,265 220,265 C226,265 230,254 224,245 Z', part: 'çekirdek 4', fill: '#2f3542' },
        { d: 'M256,220 C250,229 254,240 260,240 C266,240 270,229 264,220 Z', part: 'çekirdek 5', fill: '#2f3542' },
        { d: 'M300,195 C294,204 298,215 304,215 C310,215 314,204 308,195 Z', part: 'çekirdek 6', fill: '#2f3542' },
      ],
    },
    {
      say: 'Dış kabuğa koyu yeşil şeritler ekleyerek karpuz dilimini tamamla.',
      shapes: [
        { d: 'M58,220 L46,226 L42,219 L55,213 Z', part: 'kabuk deseni 1', fill: '#10ac84' },
        { d: 'M113,282 L105,293 L98,289 L106,277 Z', part: 'kabuk deseni 2', fill: '#10ac84' },
        { d: 'M204,308 L204,322 L196,322 L196,308 Z', part: 'kabuk deseni 3', fill: '#10ac84' },
        { d: 'M294,277 L302,289 L295,293 L287,282 Z', part: 'kabuk deseni 4', fill: '#10ac84' },
        { d: 'M345,213 L358,219 L354,226 L342,220 Z', part: 'kabuk deseni 5', fill: '#10ac84' },
      ],
    },
  ],
};

export default karpuz;
