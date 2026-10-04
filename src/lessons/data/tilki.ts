import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 12: Beyaz yüzlü, kabarık kuyruklu turuncu bir tilki. */
const tilki: Lesson = {
  id: 'tilki',
  path: 'hayvanlar',
  title: 'Kurnaz Tilki',
  emoji: '🦊',
  order: 12,
  level: 2,
  skill: 'Kafayı iki parçadan, turuncu bir kubbe ve beyaz bir yüzden kurdun. Parçaları birleştirip yeni şekiller yaptın!',
  palette: ['#f48b3a', '#fff6ea', '#7a4a2a', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce gövde için bir U çiz. Soldan aşağı in, altı düz olsun, sağdan yukarı çık.',
      shapes: [{ d: 'M150,251.7 C105,270 95,350 160,350 L240,350 C305,350 295,270 250,251.7', part: 'gövde', fill: '#f48b3a' }],
    },
    {
      say: 'Gövdenin üstüne geniş bir kubbe çiz. Soldan başla, yukarı çık ve sağda aşağı in.',
      shapes: [{ d: 'M90,205 C90,120 140,85 200,85 C260,85 310,120 310,205', part: 'kafa', fill: '#f48b3a' }],
    },
    {
      say: 'Kubbenin altına beyaz bir yüz çiz. Üstü dalgalı olsun, altı sivri bir çeneyle bitsin.',
      shapes: [
        {
          d: 'M90,205 Q140,160 200,190 Q260,160 310,205 Q250,262 200,272 Q150,262 90,205 Z',
          part: 'yüz',
          fill: '#fff6ea',
        },
      ],
    },
    {
      say: 'Kafanın üstüne iki büyük, sivri kulak çiz. İçlerine de küçük üçgenler ekle.',
      shapes: [
        { d: 'M112,125.5 L100,42 L168,88.6', part: 'sol kulak', fill: '#f48b3a' },
        { d: 'M232,88.6 L300,42 L288,125.5', part: 'sağ kulak', fill: '#f48b3a' },
        { d: 'M120,108 L110,64 L148,89 Z', part: 'sol kulak içi', fill: '#7a4a2a' },
        { d: 'M280,108 L290,64 L252,89 Z', part: 'sağ kulak içi', fill: '#7a4a2a' },
      ],
    },
    {
      say: 'Gövdenin sağından yukarı kıvrılan kabarık bir kuyruk çiz. Altına da iki küçük pati ekle.',
      shapes: [
        {
          d: 'M280.7,330 C340,345 380,280 366,215 C360,190 345,170 335,160 C327,185 333,205 331,215 C330,245 320,280 283.5,290',
          part: 'kuyruk',
          fill: '#f48b3a',
        },
        { d: 'M155,350 C142,378 196,380 190,350', part: 'sol pati', fill: '#7a4a2a' },
        { d: 'M210,350 C204,380 258,378 245,350', part: 'sağ pati', fill: '#7a4a2a' },
      ],
    },
    {
      say: 'Kuyruğun ucuna zikzak bir çizgi çek, ucu beyaz olsun. Göğsüne de beyaz bir önlük çiz.',
      shapes: [
        { d: 'M366,215 C360,190 345,170 335,160 C327,185 333,205 331,215 L340,227 L349,214 L358,227 Z', part: 'kuyruk ucu', fill: '#fff6ea' },
        { d: 'M170,262.3 Q168,318 200,322 Q232,318 230,262.3', part: 'göğüs', fill: '#fff6ea' },
      ],
    },
    {
      say: 'Yüzün üst kısmına iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(158, 152, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(242, 152, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(162.5, 147.5, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(246.5, 147.5, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Çenenin ucuna küçük bir burun, altına gülümseyen bir ağız ve iki yana pembe yanaklar çiz.',
      shapes: [
        { d: 'M188,230 Q200,222 212,230 Q207,242 200,243 Q193,242 188,230 Z', part: 'burun', fill: '#2d2d2d' },
        { d: 'M200,243 L200,250 M188,251 Q194,258 200,250 Q206,258 212,251', part: 'ağız' },
        { d: ellipse(136, 205, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(264, 205, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default tilki;
