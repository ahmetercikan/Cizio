import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 8: Miğferli, kalkanlı ve oyuncak kılıçlı chibi şövalye. */
const sovalye: Lesson = {
  id: 'sovalye',
  path: 'karakterler',
  title: 'Cesur Şövalye',
  emoji: '🛡️',
  order: 8,
  level: 3,
  skill: 'Karakterin eline eşyalar vermeyi öğrendin! Kalkan ve kılıç, şövalyenin kim olduğunu hemen anlatır.',
  palette: ['#c9d3e0', '#ffe1cc', '#e63946', '#4f8df5', '#ffd23f', '#8d6e63', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir miğfer çiz. Yanları dik insin, tepesi yuvarlak olsun, altı hafif kavisli kapansın.',
      shapes: [
        {
          d: 'M115,215 L115,150 C115,95 152,62 200,62 C248,62 285,95 285,150 L285,215 Q200,232 115,215 Z',
          part: 'miğfer',
          fill: '#c9d3e0',
        },
      ],
    },
    {
      say: 'Miğferin ortasına yüzün göründüğü köşeleri yuvarlak bir pencere çiz.',
      shapes: [
        {
          d: 'M150,122 L250,122 Q266,122 266,138 L266,190 Q266,210 246,210 L154,210 Q134,210 134,190 L134,138 Q134,122 150,122 Z',
          part: 'yüz',
          fill: '#ffe1cc',
        },
      ],
    },
    {
      say: 'Miğferin tepesine kıvrık, kırmızı bir tüy çiz. Pencereye kadar da düz bir çizgi in.',
      shapes: [
        { d: 'M196,64 Q182,32 216,30 Q250,28 262,56 Q238,46 222,64', part: 'tüy', fill: '#e63946' },
        { d: 'M200,64 L200,122', part: 'miğfer çizgisi' },
      ],
    },
    {
      say: 'Miğferin altına minik bir zırh, onun altına da iki kısa bacak çiz.',
      shapes: [
        { d: 'M162,222 L148,312 Q200,324 252,312 L238,222', part: 'zırh', fill: '#aab7c8' },
        { d: 'M170,315 L170,352 Q170,362 180,362 L196,362 L196,318', part: 'sol bacak', fill: '#7a8699' },
        { d: 'M204,318 L204,362 L220,362 Q230,362 230,352 L230,315', part: 'sağ bacak', fill: '#7a8699' },
      ],
    },
    {
      say: 'Zırhın soluna büyük bir kalkan çiz. Üstü düz olsun, altı sivri bir uçla bitsin.',
      shapes: [
        { d: 'M62,236 L142,236 L142,282 Q142,326 102,348 Q62,326 62,282 Z', part: 'kalkan', fill: '#4f8df5' },
        { d: 'M102,304 L85,287 A12,12 0 0,1 102,272 A12,12 0 0,1 119,287 Z', part: 'kalkan kalbi', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Sağ tarafa oyuncak bir kılıç çiz. Önce sivri uçlu uzun bıçak, sonra enine tutamak ve sap.',
      shapes: [
        { d: 'M302,250 L302,150 L310,132 L318,150 L318,250 Z', part: 'kılıç', fill: '#eef3f8' },
        { d: 'M286,250 L334,250 L334,262 L286,262 Z', part: 'kılıç tutamağı', fill: '#ffd23f' },
        { d: 'M304,262 L316,262 L316,288 L304,288 Z', part: 'kılıç sapı', fill: '#8d6e63' },
        { d: circle(310, 295, 7), part: 'sap topu', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Zırhın iki yanından kollar çiz. Sol el kalkanı, sağ el kılıcın sapını tutsun.',
      shapes: [
        { d: 'M162,236 L134,256 A9,9 0 0,0 142,272 L164,258', part: 'sol kol', fill: '#aab7c8' },
        { d: 'M238,234 L300,266 A10,10 0 0,1 292,284 L242,258', part: 'sağ kol', fill: '#aab7c8' },
      ],
    },
    {
      say: 'Pencerenin içine iki kocaman göz çiz. Beyaz parıltılarını da unutma.',
      shapes: [
        { d: ellipse(174, 160, 13, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(178, 153, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(226, 160, 13, 16), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(230, 153, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Cesur bir gülümseme ve iki pembe yanak çiz. Şövalyen göreve hazır!',
      shapes: [
        { d: 'M186,186 Q200,198 214,186', part: 'ağız' },
        { d: ellipse(153, 184, 10, 6), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(247, 184, 10, 6), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default sovalye;
