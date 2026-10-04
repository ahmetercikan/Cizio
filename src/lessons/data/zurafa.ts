import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 13: Uzun boyunlu, benekli, boynuzcukları topuzlu bir zürafa. */
const zurafa: Lesson = {
  id: 'zurafa',
  path: 'hayvanlar',
  title: 'Sevimli Zürafa',
  emoji: '🦒',
  order: 13,
  level: 2,
  skill: 'Kafayı gövdeye uzun bir boyunla bağladın ve benekler ekledin. Desenler hayvanını tanınır yapar!',
  palette: ['#f7c35f', '#ffe7b8', '#c97b3a', '#8a5530', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce üst tarafa yayvan bir oval çiz. Bu zürafanın kafası olacak.',
      shapes: [{ d: ellipse(200, 125, 85, 62), part: 'kafa', fill: '#f7c35f' }],
    },
    {
      say: 'Kafanın altından iki çizgiyle uzun bir boyun indir. Aşağıda yuvarlak bir gövdeyle birleştir.',
      shapes: [
        {
          d: 'M175,184.3 L170,240 C110,245 105,318 145,318 L255,318 C295,318 290,245 230,240 L225,184.3',
          part: 'boyun ve gövde',
          fill: '#f7c35f',
        },
      ],
    },
    {
      say: 'Kafanın üstüne topuzlu iki minik boynuz, iki yanına da yaprak gibi kulaklar çiz.',
      shapes: [
        { d: `M182,64.6 L177,44 ${circle(175, 36, 9)}`, part: 'sol boynuz', fill: '#8a5530' },
        { d: `M218,64.6 L223,44 ${circle(225, 36, 9)}`, part: 'sağ boynuz', fill: '#8a5530' },
        { d: 'M122.2,100 Q85,78 62,96 Q86,124 115.3,120', part: 'sol kulak', fill: '#f7c35f' },
        { d: 'M277.8,100 Q315,78 338,96 Q314,124 284.7,120', part: 'sağ kulak', fill: '#f7c35f' },
      ],
    },
    {
      say: 'Gövdenin altına iki uzun bacak çiz. Gövdeden başla, aşağı in ve gövdeye geri çık.',
      shapes: [
        { d: 'M145,318 L145,356 L175,356 L175,318', part: 'sol bacak', fill: '#f7c35f' },
        { d: 'M225,318 L225,356 L255,356 L255,318', part: 'sağ bacak', fill: '#f7c35f' },
      ],
    },
    {
      say: 'Bacakların ucuna koyu toynaklar ekle. Gövdenin sağına da ucu püsküllü minik bir kuyruk çiz.',
      shapes: [
        { d: 'M145,356 L145,364 Q145,372 153,372 L167,372 Q175,372 175,364 L175,356', part: 'sol toynak', fill: '#8a5530' },
        { d: 'M225,356 L225,364 Q225,372 233,372 L247,372 Q255,372 255,364 L255,356', part: 'sağ toynak', fill: '#8a5530' },
        { d: 'M279.8,280 Q306,282 312,306', part: 'kuyruk' },
        { d: 'M312,306 Q300,322 312,336 Q324,322 312,306 Z', part: 'kuyruk püskülü', fill: '#8a5530' },
      ],
    },
    {
      say: 'Kafanın alt kısmına açık renkli bir burun ovali çiz. İçine iki minik burun deliği koy.',
      shapes: [
        { d: ellipse(200, 155, 52, 25), part: 'burun ovali', fill: '#ffe7b8' },
        { d: ellipse(184, 147, 4.5, 5.5), part: 'sol burun deliği', fill: '#8a5530' },
        { d: ellipse(216, 147, 4.5, 5.5), part: 'sağ burun deliği', fill: '#8a5530' },
      ],
    },
    {
      say: 'Burun ovalinin üstüne iki parlak göz çiz. İçlerine minik beyaz parıltılar ekle.',
      shapes: [
        { d: circle(162, 110, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(238, 110, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(167, 105, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(243, 105, 5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ovalin içine gülümseyen bir ağız, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M182,162 Q200,176 218,162', part: 'ağız' },
        { d: ellipse(140, 137, 11, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(260, 137, 11, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak boynuna ve gövdesine büyüklü küçüklü benekler çiz. Zürafan desenli oldu!',
      shapes: [
        { d: ellipse(200, 212, 11, 15), part: 'boyun beneği', fill: '#c97b3a' },
        { d: ellipse(148, 280, 17, 13), part: 'sol benek', fill: '#c97b3a' },
        { d: ellipse(252, 277, 16, 12), part: 'sağ benek', fill: '#c97b3a' },
        { d: ellipse(200, 299, 14, 9), part: 'orta benek', fill: '#c97b3a' },
      ],
    },
  ],
};

export default zurafa;
