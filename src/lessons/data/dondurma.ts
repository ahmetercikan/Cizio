import type { Lesson } from '../types';

/** Daire: sol noktadan başlayıp tek hamlede dönen kapalı yol. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 1: Üçgen + kubbe = dondurma. Basit şekilleri birleştirme. */
const dondurma: Lesson = {
  id: 'dondurma',
  path: 'nesneler',
  title: 'Mutlu Dondurma',
  emoji: '🍦',
  order: 1,
  level: 1,
  skill: 'Bir üçgen ile bir kubbeyi birleştirince dondurma oldu! Basit şekilleri birleştirmeyi öğrendin.',
  palette: ['#ff9ec7', '#f6b96b', '#e8434f', '#2d2d2d', '#ffffff', '#ff7fa8'],
  steps: [
    {
      say: 'Önce ters bir üçgen gibi külahı çiz. Soldan aşağıya in, sonra sağa doğru yukarı çık.',
      shapes: [{ d: 'M120,210 L200,360 L280,210', part: 'külah', fill: '#f6b96b' }],
    },
    {
      say: 'Külahın sol ucundan başla, yukarı doğru kocaman yuvarlak bir kubbe çizip sağ uca in.',
      shapes: [{ d: 'M120,210 C98,60 302,60 280,210', part: 'dondurma topu', fill: '#ff9ec7' }],
    },
    {
      say: 'Şimdi dondurmanın altına dalgalı bir çizgi çek. Sanki dondurma eriyip damlıyor!',
      shapes: [
        {
          d: 'M120,210 Q140,252 160,214 Q180,270 200,214 Q220,250 240,214 Q260,264 280,210',
          part: 'eriyen kenar',
          fill: '#ff9ec7',
        },
      ],
    },
    {
      say: 'Külahın üstüne çapraz çizgiler çiz. Küçük baklavalar oluşacak, tıpkı gofret gibi.',
      shapes: [
        { d: 'M147,262 L230,304', part: 'külah deseni' },
        { d: 'M168,300 L214,334', part: 'külah deseni' },
        { d: 'M253,262 L170,304', part: 'külah deseni' },
        { d: 'M232,300 L186,334', part: 'külah deseni' },
      ],
    },
    {
      say: 'Dondurmanın ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(170, 160, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(174, 156, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(230, 160, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(234, 156, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme, iki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M184,180 Q200,198 216,180', part: 'ağız' },
        { d: ellipse(150, 182, 12, 7), part: 'sol yanak', fill: '#ff7fa8' },
        { d: ellipse(250, 182, 12, 7), part: 'sağ yanak', fill: '#ff7fa8' },
      ],
    },
    {
      say: 'En tepeye bir kiraz ve sapını çiz. Sonra üstüne birkaç minik şeker serpiştir.',
      shapes: [
        { d: circle(200, 80, 16), part: 'kiraz', fill: '#e8434f' },
        { d: 'M200,64 Q204,46 222,38', part: 'kiraz sapı' },
        { d: 'M146,131 L153,122', part: 'şekerler' },
        { d: 'M176,108 L183,116', part: 'şekerler' },
        { d: 'M236,114 L247,117', part: 'şekerler' },
      ],
    },
  ],
};

export default dondurma;
