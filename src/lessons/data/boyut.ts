import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Temeller 11: 3 Boyut — Düz çizgiler ve perspektifle üç boyutlu bir hediye kutusu. */
const boyut: Lesson = {
  id: 'boyut',
  path: 'temeller',
  title: '3B Kutu',
  emoji: '📦',
  order: 11,
  level: 2,
  skill: 'Düz çizgilerle üç boyutlu derinlik yanılsaması yaratmayı öğrendin!',
  palette: ['#ffbe0b', '#ffd166', '#fb5607', '#ff006e', '#ff3385', '#e2e8f0'],
  steps: [
    {
      say: 'Önce kutumuzun ön yüzü için düzgün bir kare çizelim.',
      shapes: [
        {
          d: 'M90,170 L250,170 L250,330 L90,330 Z',
          part: 'ön yüz',
          fill: '#ffbe0b',
        },
      ],
    },
    {
      say: 'Ön karenin üst iki köşesinden sağa ve yukarı doğru iki eğik derinlik çizgisi uzatalım.',
      shapes: [
        { d: 'M90,170 L150,90', part: 'sol derinlik çizgisi' },
        { d: 'M250,170 L310,90', part: 'sağ derinlik çizgisi' },
      ],
    },
    {
      say: 'Bu iki eğik çizginin ucunu düz bir yatay çizgiyle birleştirip üst kapağı kapatalım.',
      shapes: [
        {
          d: 'M90,170 L150,90 L310,90 L250,170 Z',
          part: 'üst yüz',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Sağ alt köşeden yukarı eğik bir çizgi çekip dikey çizgiyle kutunun sağ yan yüzünü kapatalım.',
      shapes: [
        {
          d: 'M250,330 L310,250 L310,90 L250,170 Z',
          part: 'sağ yan yüz',
          fill: '#fb5607',
        },
      ],
    },
    {
      say: 'Kutumuzun önünden ve üst kapağından geçen renkli paketleme şeritleri çizelim.',
      shapes: [
        { d: 'M155,170 L185,170 L185,330 L155,330 Z', part: 'ön şerit', fill: '#ff006e' },
        { d: 'M155,170 L215,90 L245,90 L185,170 Z', part: 'üst şerit', fill: '#ff3385' },
      ],
    },
    {
      say: 'Kutunun tepesine hediye paketi gibi tatlı bir fiyonk konduralım.',
      shapes: [
        { d: 'M230,90 C185,60 175,95 225,95 Z', part: 'fiyonk sol kanat', fill: '#ff006e' },
        { d: 'M230,90 C275,60 285,95 235,95 Z', part: 'fiyonk sağ kanat', fill: '#ff006e' },
        { d: circle(230, 92, 8), part: 'fiyonk düğümü', fill: '#ff5499' },
        { d: 'M226,96 Q215,120 205,125 M234,96 Q245,120 255,125', part: 'kurdela uçları' },
      ],
    },
    {
      say: 'Kutunun altına masadaki gölgesini ve köşelerine parıltı yıldızları ekleyelim.',
      shapes: [
        { d: 'M80,335 C140,365 270,365 330,310 C320,270 250,315 80,335 Z', part: 'zemin gölgesi', fill: '#e2e8f0' },
        { d: 'M60,140 L60,160 M50,150 L70,150', part: 'sol parıltı' },
        { d: 'M340,140 L340,160 M330,150 L350,150', part: 'sağ parıltı' },
      ],
    },
  ],
};

export default boyut;
