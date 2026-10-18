import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 18: Bulut Koyun — Yumuşacık bulut gibi dalgalı gövde, küçük sevimli yüz ve minik bacaklar. */
const koyun: Lesson = {
  id: 'koyun',
  path: 'hayvanlar',
  title: 'Bulut Koyun',
  emoji: '🐑',
  order: 18,
  level: 1,
  skill: 'Bulut gibi dalgalı çizgilerle kabarık yünlü bir gövde ve sevimli bir koyun çizmeyi öğrendin!',
  palette: ['#ffffff', '#f8f9fa', '#ffe5d9', '#ffd7ba', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Koyunumuzun yünlü gövdesi için bulut gibi dalgalı, yumuşacık bir daire çizelim.',
      shapes: [
        {
          d: 'M110,200 A30,30 0 0,1 140,140 A35,35 0 0,1 210,130 A35,35 0 0,1 270,150 A30,30 0 0,1 300,200 A30,30 0 0,1 285,255 A35,35 0 0,1 225,280 A35,35 0 0,1 155,275 A30,30 0 0,1 110,200 Z',
          part: 'yünlü gövde',
          fill: '#f8f9fa',
        },
      ],
    },
    {
      say: 'Gövdenin ortasına küçük, tatlı bir yüz ve tepesine kıvırcık bir yün şapkası ekleyelim.',
      shapes: [
        { d: ellipse(200, 205, 36, 42), part: 'yüz', fill: '#ffe5d9' },
        { d: 'M175,175 A14,14 0 0,1 195,160 A14,14 0 0,1 215,160 A14,14 0 0,1 225,175 Z', part: 'alın yünü', fill: '#ffffff' },
      ],
    },
    {
      say: 'Yüzün iki yanından aşağı doğru sarkan yumuşacık kulaklar çizelim.',
      shapes: [
        { d: 'M170,185 C140,185 130,210 150,220 C165,225 170,205 170,185 Z', part: 'sol kulak', fill: '#ffe5d9' },
        { d: 'M165,190 C145,190 140,208 152,214', part: 'sol kulak içi' },
        { d: 'M230,185 C260,185 270,210 250,220 C235,225 230,205 230,185 Z', part: 'sağ kulak', fill: '#ffe5d9' },
        { d: 'M235,190 C255,190 260,208 248,214', part: 'sağ kulak içi' },
      ],
    },
    {
      say: 'Gövdenin altından çıkan dört küçük bacak ve toynaklarını çizelim.',
      shapes: [
        { d: 'M160,270 L160,340 L176,340 L176,270', part: 'ön sol bacak', fill: '#ffe5d9' },
        { d: 'M160,330 L176,330 L176,340 L160,340 Z', part: 'ön sol toynak', fill: '#2d2d2d' },
        { d: 'M224,270 L224,340 L240,340 L240,270', part: 'ön sağ bacak', fill: '#ffe5d9' },
        { d: 'M224,330 L240,330 L240,340 L224,340 Z', part: 'ön sağ toynak', fill: '#2d2d2d' },
        { d: 'M130,255 L130,330 L144,330 L144,255', part: 'arka sol bacak', fill: '#ffd7ba' },
        { d: 'M130,322 L144,322 L144,330 L130,330 Z', part: 'arka sol toynak', fill: '#2d2d2d' },
        { d: 'M256,255 L256,330 L270,330 L270,255', part: 'arka sağ bacak', fill: '#ffd7ba' },
        { d: 'M256,322 L270,322 L270,330 L256,330 Z', part: 'arka sağ toynak', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Yüze iki parıldayan göz, minik bir burun ve gülen bir ağız ekleyelim.',
      shapes: [
        { d: circle(188, 202, 5), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(189.5, 200.5, 1.8), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(212, 202, 5), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(213.5, 200.5, 1.8), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M196,218 L200,224 L204,218 M200,224 L200,229 M194,232 Q200,237 206,232', part: 'burun ve ağız' },
        { d: ellipse(178, 218, 5, 3.5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(222, 218, 5, 3.5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Koyunun arkasına minik bir yün kuyruk ve gövdesine kıvırcık yün çizgileri ekleyelim.',
      shapes: [
        { d: 'M295,215 A12,12 0 1,1 295,235 A12,12 0 1,1 295,215 Z', part: 'kuyruk', fill: '#ffffff' },
        { d: 'M135,185 Q145,175 155,185', part: 'yün kıvrımı' },
        { d: 'M250,175 Q260,165 270,175', part: 'yün kıvrımı' },
        { d: 'M145,245 Q155,235 165,245', part: 'yün kıvrımı' },
        { d: 'M235,255 Q245,245 255,255', part: 'yün kıvrımı' },
      ],
    },
  ],
};

export default koyun;
