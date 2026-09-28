import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 1: Kare ve dikdörtgenlerden bir robot. */
const robot: Lesson = {
  id: 'robot',
  path: 'karakterler',
  title: 'Robot',
  emoji: '🤖',
  order: 1,
  level: 1,
  skill: 'Kare ve dikdörtgenleri üst üste ve yan yana koyarak bir karakter kurmayı öğrendin!',
  palette: ['#8fd0ff', '#6db8f2', '#b7c3d4', '#ffb454', '#ff5c8a', '#2d2d2d'],
  steps: [
    {
      say: 'Önce robotun gövdesi için bir kare çiz. Alt köşelerini biraz yuvarlat.',
      shapes: [
        {
          d: 'M140,195 L260,195 L260,305 Q260,320 245,320 L155,320 Q140,320 140,305 Z',
          part: 'gövde',
          fill: '#6db8f2',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne ondan daha büyük bir kafa çiz. Köşeleri yuvarlak bir kutu gibi.',
      shapes: [
        {
          d: 'M135,85 L265,85 Q285,85 285,105 L285,175 Q285,195 265,195 L135,195 Q115,195 115,175 L115,105 Q115,85 135,85 Z',
          part: 'kafa',
          fill: '#8fd0ff',
        },
      ],
    },
    {
      say: 'Gövdenin iki yanına kollar, altına da iki kısa bacak çiz. Hepsi küçük dikdörtgenler.',
      shapes: [
        { d: 'M140,215 L118,215 Q108,215 108,225 L108,288 Q108,298 118,298 L140,298', part: 'sol kol', fill: '#b7c3d4' },
        { d: 'M260,215 L282,215 Q292,215 292,225 L292,288 Q292,298 282,298 L260,298', part: 'sağ kol', fill: '#b7c3d4' },
        { d: 'M163,320 L163,352 L193,352 L193,320', part: 'sol bacak', fill: '#b7c3d4' },
        { d: 'M207,320 L207,352 L237,352 L237,320', part: 'sağ bacak', fill: '#b7c3d4' },
      ],
    },
    {
      say: 'Kafanın tepesine bir anten ve ucuna yuvarlak bir top çiz. İki yana da kulak ekle.',
      shapes: [
        { d: 'M200,85 L200,53', part: 'anten' },
        { d: circle(200, 44, 10), part: 'anten topu', fill: '#ff5c8a' },
        { d: 'M115,118 L101,118 Q95,118 95,124 L95,156 Q95,162 101,162 L115,162', part: 'sol kulak', fill: '#ffb454' },
        { d: 'M285,118 L299,118 Q305,118 305,124 L305,156 Q305,162 299,162 L285,162', part: 'sağ kulak', fill: '#ffb454' },
      ],
    },
    {
      say: 'Kafanın içine iki kocaman yuvarlak göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: circle(163, 135, 16), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(169, 129, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(237, 135, 16), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(243, 129, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülümseyen bir ağız çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M182,164 Q200,180 218,164', part: 'ağız' },
        { d: ellipse(140, 166, 11, 7), part: 'sol yanak', fill: '#ff9ec0' },
        { d: ellipse(260, 166, 11, 7), part: 'sağ yanak', fill: '#ff9ec0' },
      ],
    },
    {
      say: 'Son olarak gövdenin ortasına bir kalp çiz. Aşağıdaki sivri uçtan başla.',
      shapes: [{ d: 'M200,292 L172,264 A20,20 0 0,1 200,238 A20,20 0 0,1 228,264 Z', part: 'kalp', fill: '#ff5c8a' }],
    },
  ],
};

export default robot;
