import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Özel Günler 6: Yılbaşı ağacı. Küçükten büyüğe üç kat; her kat bir üsttekinin altından başlar. */
const yilbasiAgaci: Lesson = {
  id: 'yilbasi-agaci',
  path: 'ozel',
  title: 'Yılbaşı Ağacı',
  emoji: '🎄',
  order: 6,
  level: 2,
  skill: 'Katları yukarıdan aşağı, her biri bir öncekinden geniş olacak şekilde dizdin. Ağaç böyle dengeli durur!',
  palette: ['#3fa34d', '#ffd23f', '#ff5a5f', '#5ab8ff', '#a0673a', '#b18cff', '#2d2d2d'],
  steps: [
    {
      say: 'En tepeden başla. İki yana eğik çizgilerle küçük bir üçgen çiz, altını hafif kavisli kapat.',
      shapes: [{ d: 'M200,80 L134,146 Q200,162 266,146 Z', part: 'üst kat', fill: '#3fa34d' }],
    },
    {
      say: 'Üst katın altından başla, daha geniş ikinci bir kat çiz. Yine üst katın altında bitir.',
      shapes: [{ d: 'M160,151.1 L94,222 Q200,242 306,222 L240,151.1', part: 'orta kat', fill: '#3fa34d' }],
    },
    {
      say: 'Orta katın altından en geniş katı çiz. Bu kat ağacın en büyük parçası olsun.',
      shapes: [{ d: 'M146,229.4 L56,298 Q200,322 344,298 L254,229.4', part: 'alt kat', fill: '#3fa34d' }],
    },
    {
      say: 'Ağacın altına kısa, kalın bir gövde çiz. Tepesine de beş köşeli parlak bir yıldız koy.',
      shapes: [
        { d: 'M182,309.8 L182,350 L218,350 L218,309.8', part: 'gövde', fill: '#a0673a' },
        {
          d: 'M200,30 L207.1,48.3 L226.6,49.3 L211.4,61.7 L216.5,80.7 L200,70 L183.5,80.7 L188.6,61.7 L173.4,49.3 L192.9,48.3 Z',
          part: 'yıldız',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Orta kata ve alt kata, bir kenardan öbürüne sarkan iki süs zinciri çiz.',
      shapes: [
        { d: 'M126,188 Q200,222 274,188', part: 'üst zincir' },
        { d: 'M95,268 Q200,306 305,268', part: 'alt zincir' },
      ],
    },
    {
      say: 'Ağaca dört yuvarlak top süs as: biri tepeye, ikisi ortaya, biri de alta.',
      shapes: [
        { d: circle(200, 118, 12), part: 'tepedeki top', fill: '#ff5a5f' },
        { d: circle(150, 212, 11), part: 'soldaki top', fill: '#5ab8ff' },
        { d: circle(250, 212, 11), part: 'sağdaki top', fill: '#ffd23f' },
        { d: circle(200, 252, 12), part: 'alttaki top', fill: '#b18cff' },
      ],
    },
    {
      say: 'Ağacın sağına büyük bir hediye kutusu çiz. Ortasından aşağı ve yana bir kurdele geçir.',
      shapes: [
        { d: 'M236,330 L316,330 L316,368 L236,368 Z', part: 'büyük hediye', fill: '#ff5a5f' },
        { d: 'M276,330 L276,368 M236,348 L316,348', part: 'büyük kurdele' },
        { d: 'M276,330 Q250,308 255,325 Q260,336 276,330 Z M276,330 Q302,308 297,325 Q292,336 276,330 Z', part: 'fiyonk', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Ağacın soluna da küçük bir hediye çiz ve üstüne artı gibi bir kurdele ekle. Mutlu yıllar!',
      shapes: [
        { d: 'M84,334 L146,334 L146,368 L84,368 Z', part: 'küçük hediye', fill: '#5ab8ff' },
        { d: 'M115,334 L115,368 M84,350 L146,350', part: 'küçük kurdele' },
      ],
    },
  ],
};

export default yilbasiAgaci;
