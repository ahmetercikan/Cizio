import type { Lesson } from '../types';

const mantar: Lesson = {
  id: 'mantar',
  path: 'doga',
  title: 'Benekli Mantar',
  emoji: '🍄',
  order: 4,
  level: 2,
  skill: 'Büyük ve küçük benekleri karışık dağıttın. Farklı boylar çizimi daha canlı gösterir!',
  palette: ['#ff5a5f', '#ffffff', '#fff1d6', '#ff9eb5', '#7ed957', '#2d2d2d'],
  steps: [
    {
      say: 'Soldan başla, kocaman yuvarlak bir şapka çiz. Altını hafif kavisli bir çizgiyle kapat.',
      shapes: [{ d: 'M55,225 C55,25 345,25 345,225 Q200,203 55,225 Z', part: 'şapka', fill: '#ff5a5f' }],
    },
    {
      say: 'Şapkanın altından başla, aşağıya tombul bir sap çiz ve yine şapkada bitir.',
      shapes: [
        { d: 'M145,216 C138,270 130,330 165,345 Q200,352 235,345 C270,330 262,270 255,216', part: 'sap', fill: '#fff1d6' },
      ],
    },
    {
      say: 'Şapkaya benekler çiz: ortaya büyük bir tane, kenarlara daha küçükleri.',
      shapes: [
        { d: 'M176,126 A24,24 0 1,0 224,126 A24,24 0 1,0 176,126 Z', part: 'büyük benek', fill: '#ffffff' },
        { d: 'M130,112 A13,13 0 1,0 156,112 A13,13 0 1,0 130,112 Z', part: 'küçük benek', fill: '#ffffff' },
        { d: 'M244,112 A13,13 0 1,0 270,112 A13,13 0 1,0 244,112 Z', part: 'küçük benek', fill: '#ffffff' },
        { d: 'M98,180 A17,17 0 1,0 132,180 A17,17 0 1,0 98,180 Z', part: 'orta benek', fill: '#ffffff' },
        { d: 'M268,180 A17,17 0 1,0 302,180 A17,17 0 1,0 268,180 Z', part: 'orta benek', fill: '#ffffff' },
      ],
    },
    {
      say: 'Sapın üstüne iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: 'M165,268 A13,13 0 1,0 191,268 A13,13 0 1,0 165,268 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M209,268 A13,13 0 1,0 235,268 A13,13 0 1,0 209,268 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M168,262 A6,6 0 1,0 180,262 A6,6 0 1,0 168,262 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M212,262 A6,6 0 1,0 224,262 A6,6 0 1,0 212,262 Z', part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına küçük bir gülümseme ve iki pembe yanak çiz.',
      shapes: [
        { d: 'M186,294 Q200,308 214,294', part: 'ağız' },
        { d: 'M146,292 A12,8 0 1,0 170,292 A12,8 0 1,0 146,292 Z', part: 'sol yanak', fill: '#ff9eb5' },
        { d: 'M230,292 A12,8 0 1,0 254,292 A12,8 0 1,0 230,292 Z', part: 'sağ yanak', fill: '#ff9eb5' },
      ],
    },
    {
      say: 'Son olarak mantarın iki yanına zikzak çizerek çimenler ekle.',
      shapes: [
        { d: 'M66,348 L74,324 L84,342 L93,316 L102,342 L112,326 L118,348', part: 'sol çimen', fill: '#7ed957' },
        { d: 'M282,348 L288,326 L298,342 L307,316 L316,342 L326,324 L334,348', part: 'sağ çimen', fill: '#7ed957' },
      ],
    },
  ],
};

export default mantar;
