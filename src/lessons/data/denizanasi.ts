import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Deniz 7: Kubbe gibi başı ve dalgalı dokunaçlarıyla sevimli bir denizanası. */
const denizanasi: Lesson = {
  id: 'denizanasi',
  path: 'deniz',
  title: 'Denizanası',
  emoji: '🪼',
  order: 7,
  level: 1,
  skill: 'Kubbe gibi bir baş ve dalgalı çizgiler çizdin. Kalemi sağa sola kıvırarak yumuşacık dokunaçlar yaptın!',
  palette: ['#c39bff', '#ead9ff', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kubbe gibi yuvarlak bir baş çiz. Altını küçük tümseklerle dalgalı yap.',
      shapes: [
        {
          d: 'M80,200 C80,115 135,62 200,62 C265,62 320,115 320,200 Q300,226 280,200 Q260,226 240,200 Q220,226 200,200 Q180,226 160,200 Q140,226 120,200 Q100,226 80,200 Z',
          part: 'kubbe',
          fill: '#c39bff',
        },
      ],
    },
    {
      say: 'Kubbenin altından iki uzun, dalgalı dokunaç sarkıt. Biri solda, biri sağda olsun.',
      shapes: [
        { d: 'M120,200 C98,230 140,255 118,285 C96,315 138,335 114,364', part: 'sol dokunaç' },
        { d: 'M280,200 C302,230 260,255 282,285 C304,315 262,335 286,364', part: 'sağ dokunaç' },
      ],
    },
    {
      say: 'Ortaya üç dalgalı dokunaç daha çiz. Ortadaki en uzun olsun.',
      shapes: [
        { d: 'M160,200 C142,226 176,246 158,272 C142,296 172,312 156,334', part: 'sol iç dokunaç' },
        { d: 'M200,200 C182,230 218,252 200,280 C182,308 218,330 200,358', part: 'orta dokunaç' },
        { d: 'M240,200 C258,226 224,246 242,272 C258,296 228,312 244,334', part: 'sağ iç dokunaç' },
      ],
    },
    {
      say: 'Kubbenin ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(160, 140, 17), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(154, 133, 5.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(240, 140, 17), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(234, 133, 5.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin arasına gülen bir ağız, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M182,166 Q200,184 218,166', part: 'ağız' },
        { d: ellipse(128, 170, 15, 9), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(272, 170, 15, 9), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak kubbenin sol üstüne kavisli bir parlaklık, sağ üstüne de iki benek çiz.',
      shapes: [
        { d: 'M106,152 Q110,106 152,84', part: 'parlaklık' },
        { d: circle(252, 94, 10), part: 'büyük benek', fill: '#ead9ff' },
        { d: circle(286, 128, 7), part: 'küçük benek', fill: '#ead9ff' },
      ],
    },
  ],
};

export default denizanasi;
