import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 3: Büyük gövdeli, uzun boyunlu ve uzun kuyruklu sevimli bir dinozor. */
const uzunBoyun: Lesson = {
  id: 'uzun-boyun',
  path: 'dinozor',
  title: 'Uzun Boyunlu Dinozor',
  emoji: '🦕',
  order: 3,
  level: 2,
  skill: 'Büyük bir gövdeye uzun bir boyun ve kuyruk ekledin. Tek bir ovalden koca bir dinozor çıkardın!',
  palette: ['#7cc6f5', '#5eb1ea', '#3f86d1', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce ortaya büyük, yayvan bir oval çiz. Bu dinozorun kocaman gövdesi.',
      shapes: [{ d: ellipse(185, 245, 100, 62), part: 'gövde', fill: '#7cc6f5' }],
    },
    {
      say: 'Gövdenin sağ üstünden uzun bir boyun çıkar. Tepede yuvarlak bir kafa yap ve gövdeye geri in.',
      shapes: [
        {
          d: 'M235,191.3 C240,140 250,100 272,72 C288,40 340,30 360,55 C372,75 358,98 330,98 C312,98 302,115 300,145 C300,180 298,205 281.6,229',
          part: 'boyun ve kafa',
          fill: '#7cc6f5',
        },
      ],
    },
    {
      say: 'Gövdenin solundan aşağı doğru kıvrılan, ucu sivri uzun bir kuyruk çiz.',
      shapes: [{ d: 'M88.4,229 C55,238 38,280 38,335 C52,305 70,280 91,266.2', part: 'kuyruk', fill: '#7cc6f5' }],
    },
    {
      say: 'Gövdenin altına dört tombul bacak çiz. Her biri gövdeden başlasın, gövdede bitsin.',
      shapes: [
        { d: 'M112,287.4 L112,343 Q112,356 125,356 Q138,356 138,343 L138,299.7', part: 'arka bacaklar', fill: '#5eb1ea' },
        { d: 'M142,301 L142,352 Q142,365 156,365 Q170,365 170,352 L170,306.3', part: 'arka bacaklar', fill: '#7cc6f5' },
        { d: 'M204,305.9 L204,343 Q204,356 217,356 Q230,356 230,343 L230,300.4', part: 'ön bacaklar', fill: '#5eb1ea' },
        { d: 'M234,299.1 L234,352 Q234,365 248,365 Q262,365 262,352 L262,284.6', part: 'ön bacaklar', fill: '#7cc6f5' },
      ],
    },
    {
      say: 'Kafaya parlak bir göz, minik bir burun deliği, gülümseyen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(318, 62, 11), part: 'göz', fill: '#2d2d2d' },
        { d: circle(321.5, 58, 3.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(355, 60, 2.5), part: 'burun deliği', fill: '#2d2d2d' },
        { d: 'M322,84 Q340,94 358,79', part: 'ağız' },
        { d: ellipse(304, 81, 9, 5.5), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak sırtına büyüklü küçüklü yuvarlak benekler çiz. Dinozorun desenli oldu!',
      shapes: [
        { d: ellipse(128, 226, 15, 10), part: 'benekler', fill: '#3f86d1' },
        { d: ellipse(176, 208, 18, 11), part: 'benekler', fill: '#3f86d1' },
        { d: ellipse(222, 222, 14, 9), part: 'benekler', fill: '#3f86d1' },
        { d: ellipse(160, 252, 11, 7), part: 'benekler', fill: '#3f86d1' },
      ],
    },
  ],
};

export default uzunBoyun;
