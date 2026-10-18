import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const vatoz: Lesson = {
  id: 'vatoz',
  path: 'deniz',
  title: 'Dost Vatoz',
  emoji: '🐠',
  order: 13,
  level: 2,
  skill: 'Elmas şeklinde kanatları ve incecik kırbaç kuyruğu olan bir vatoz çizmeyi öğrendin!',
  palette: ['#48cae4', '#90e0ef', '#0077b6', '#ffffff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce geniş, elmas şeklinde büyük bir gövde çiz. Kanatları iki yana açılsın.',
      shapes: [
        {
          d: 'M200,65 C240,68 310,115 350,175 C305,215 240,248 200,255 C160,248 95,215 50,175 C90,115 160,68 200,65 Z',
          part: 'gövde',
          fill: '#48cae4',
        },
      ],
    },
    {
      say: 'Gövdenin alt ucundan aşağı doğru uzanan ince ve uzun bir kırbaç kuyruk çiz.',
      shapes: [
        {
          d: 'M198,255 C194,295 210,335 180,375 C184,376 188,376 190,373 C218,335 204,295 202,255 Z',
          part: 'kırbaç kuyruk',
          fill: '#0077b6',
        },
      ],
    },
    {
      say: 'Kanatların alt kısımlarına dalgalı yüzme çizgileri ekle.',
      shapes: [
        { d: 'M50,175 C85,205 130,225 165,238', part: 'sol kanat kıvrımı' },
        { d: 'M350,175 C315,205 270,225 235,238', part: 'sağ kanat kıvrımı' },
      ],
    },
    {
      say: 'Başın önüne doğru iki büyük yuvarlak göz ve içine sevimli parıltılar koy.',
      shapes: [
        { d: circle(170, 130, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(166, 126, 4), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(230, 130, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(226, 126, 4), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin hemen altına kocaman gülümseyen bir ağız ve pembe yanaklar çiz.',
      shapes: [
        { d: 'M185,165 Q200,180 215,165', part: 'ağız' },
        { d: ellipse(150, 160, 11, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(250, 160, 11, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Vatozun sırtına ve kanatlarına sevimli benekler yerleştir.',
      shapes: [
        { d: circle(200, 110, 6), part: 'sırt beneği', fill: '#90e0ef' },
        { d: circle(200, 195, 6), part: 'orta benek', fill: '#90e0ef' },
        { d: circle(200, 225, 5), part: 'alt benek', fill: '#90e0ef' },
        { d: circle(175, 185, 6), part: 'sol orta benek', fill: '#90e0ef' },
        { d: circle(145, 180, 5), part: 'sol kanat beneği', fill: '#90e0ef' },
        { d: circle(225, 185, 6), part: 'sağ orta benek', fill: '#90e0ef' },
        { d: circle(255, 180, 5), part: 'sağ kanat beneği', fill: '#90e0ef' },
      ],
    },
    {
      say: 'Son olarak başının önüne iki minik yüzgeç ve etrafa su baloncukları ekle.',
      shapes: [
        { d: 'M182,72 C178,56 188,50 192,66', part: 'sol baş yüzgeci' },
        { d: 'M218,72 C222,56 212,50 208,66', part: 'sağ baş yüzgeci' },
        { d: circle(70, 95, 10), part: 'büyük baloncuk', fill: '#90e0ef' },
        { d: circle(90, 65, 6), part: 'küçük baloncuk', fill: '#90e0ef' },
      ],
    },
  ],
};

export default vatoz;
