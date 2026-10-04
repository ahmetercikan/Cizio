import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Temeller 8: Göz, kaş ve ağzın biçimini değiştirerek farklı duygular çizmek. */
const yuzler: Lesson = {
  id: 'yuzler',
  path: 'temeller',
  title: 'Gülen Yüzler',
  emoji: '😊',
  order: 8,
  level: 1,
  skill: 'Göz, kaş ve ağzın biçimini değiştirerek mutlu, şaşkın ve göz kırpan yüzler çizmeyi öğrendin!',
  palette: ['#ffd166', '#8ecae6', '#a0e7a0', '#e8434f', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Üç büyük daire çiz: ikisi üstte yan yana, biri altta ortada. Her biri bir yüz olacak.',
      shapes: [
        { d: circle(112, 128, 78), part: 'mutlu yüz', fill: '#ffd166' },
        { d: circle(288, 128, 78), part: 'şaşkın yüz', fill: '#8ecae6' },
        { d: circle(200, 284, 80), part: 'göz kırpan yüz', fill: '#a0e7a0' },
      ],
    },
    {
      say: 'Soldaki yüze iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(86, 110, 12), part: 'mutlu sol göz', fill: '#2d2d2d' },
        { d: circle(90, 106, 4), part: 'mutlu sol göz parıltısı', fill: '#ffffff' },
        { d: circle(138, 110, 12), part: 'mutlu sağ göz', fill: '#2d2d2d' },
        { d: circle(142, 106, 4), part: 'mutlu sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman açık bir gülümseme çiz: üstü düz, altı yuvarlak. Yanlara pembe yanaklar ekle.',
      shapes: [
        { d: 'M80,140 L144,140 Q140,184 112,184 Q84,184 80,140 Z', part: 'mutlu ağız', fill: '#e8434f' },
        { d: ellipse(60, 140, 12, 8), part: 'mutlu sol yanak', fill: '#ffb3c1' },
        { d: ellipse(164, 140, 12, 8), part: 'mutlu sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Sağdaki yüze daha büyük, kocaman açılmış iki göz çiz. İçlerine beyaz parıltılar koy.',
      shapes: [
        { d: circle(262, 116, 15), part: 'şaşkın sol göz', fill: '#2d2d2d' },
        { d: circle(267, 110, 5), part: 'şaşkın sol göz parıltısı', fill: '#ffffff' },
        { d: circle(314, 116, 15), part: 'şaşkın sağ göz', fill: '#2d2d2d' },
        { d: circle(319, 110, 5), part: 'şaşkın sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin üstüne yukarı kalkmış iki kaş çiz. Altına da yuvarlak bir O ağzı yap. Şaşırdı!',
      shapes: [
        { d: 'M246,86 Q262,72 278,86', part: 'şaşkın sol kaş' },
        { d: 'M298,86 Q314,72 330,86', part: 'şaşkın sağ kaş' },
        { d: ellipse(288, 162, 13, 17), part: 'şaşkın ağız', fill: '#e8434f' },
      ],
    },
    {
      say: 'Alttaki yüze solda yuvarlak bir göz çiz. Sağdaki göz kapalı olsun: tepesi yukarıda bir kavis yap.',
      shapes: [
        { d: circle(172, 266, 13), part: 'açık göz', fill: '#2d2d2d' },
        { d: circle(176, 262, 4), part: 'açık göz parıltısı', fill: '#ffffff' },
        { d: 'M212,270 Q228,250 244,270', part: 'kırpan göz' },
      ],
    },
    {
      say: 'Altına yana kayan bir gülümseme çiz, ucundan minik bir dil çıksın. Yanlara pembe yanaklar ekle.',
      shapes: [
        { d: 'M168,300 Q200,332 236,298', part: 'kırpan ağız' },
        { d: 'M206,314 Q208,334 220,332 Q230,328 224,308', part: 'dil', fill: '#ff8fab' },
        { d: ellipse(146, 298, 13, 8), part: 'kırpan sol yanak', fill: '#ffb3c1' },
        { d: ellipse(256, 296, 13, 8), part: 'kırpan sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default yuzler;
