import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 21: Fındık Sincabı — Kocaman kabarık kuyruk, sivri kulaklar ve ellerinde meşe palamudu. */
const sincap: Lesson = {
  id: 'sincap',
  path: 'hayvanlar',
  title: 'Fındık Sincabı',
  emoji: '🐿️',
  order: 21,
  level: 2,
  skill: 'Kocaman kıvrık kabarık kuyruk ve ellerinde meşe palamudu tutan sevimli bir sincap çizmeyi öğrendin!',
  palette: ['#d97736', '#ffedd8', '#6b4423', '#b07d4f', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Sincabımız için sevimli yuvarlak bir kafa ve altında oturan tombul bir gövde çizelim.',
      shapes: [
        { d: ellipse(220, 250, 48, 58), part: 'gövde', fill: '#d97736' },
        { d: circle(220, 145, 42), part: 'kafa', fill: '#d97736' },
      ],
    },
    {
      say: 'Kafanın üstüne uçları sivri iki kulak ve göğsüne açık renkli bir oval çizelim.',
      shapes: [
        { d: 'M190,125 L185,85 L208,115 Z', part: 'sol kulak', fill: '#d97736' },
        { d: 'M192,120 L188,95 L202,115 Z', part: 'sol kulak içi', fill: '#ffedd8' },
        { d: 'M232,115 L255,85 L250,125 Z', part: 'sağ kulak', fill: '#d97736' },
        { d: 'M238,115 L252,95 L248,120 Z', part: 'sağ kulak içi', fill: '#ffedd8' },
        { d: ellipse(220, 255, 28, 42), part: 'göğüs', fill: '#ffedd8' },
      ],
    },
    {
      say: 'Sincabın arkasından yukarı kıvrılan kocaman, kabarık ve dalgalı bir kuyruk çizelim.',
      shapes: [
        {
          d: 'M180,285 C140,295 90,260 85,190 C80,120 120,70 160,80 C185,87 185,115 160,115 C130,115 110,150 120,195 C128,230 155,245 185,250 Z',
          part: 'kabarık kuyruk',
          fill: '#d97736',
        },
        { d: 'M160,105 C135,110 118,145 125,185 C132,220 155,235 180,242', part: 'kuyruk tüy çizgisi' },
      ],
    },
    {
      say: 'Gövdenin iki yanına oturan tombul arka bacaklar ve minik patiler ekleyelim.',
      shapes: [
        { d: ellipse(182, 290, 20, 16), part: 'sol arka bacak', fill: '#d97736' },
        { d: ellipse(180, 305, 16, 9), part: 'sol arka pati', fill: '#c25e20' },
        { d: ellipse(258, 290, 20, 16), part: 'sağ arka bacak', fill: '#d97736' },
        { d: ellipse(260, 305, 16, 9), part: 'sağ arka pati', fill: '#c25e20' },
      ],
    },
    {
      say: 'Sincabın karnının önüne iki eliyle tuttuğu lezzetli bir meşe palamudu çizelim.',
      shapes: [
        { d: 'M205,230 C205,220 235,220 235,230 L235,235 L205,235 Z', part: 'palamut şapkası', fill: '#6b4423' },
        { d: 'M220,222 L220,214', part: 'palamut sapı' },
        { d: 'M206,235 C206,255 220,265 220,265 C220,265 234,255 234,235 Z', part: 'palamut gövdesi', fill: '#b07d4f' },
      ],
    },
    {
      say: 'Gövdeden palamuda doğru uzanan iki minik ön kol ve palamudu kavrayan patiler ekleyelim.',
      shapes: [
        { d: 'M188,225 C195,235 205,242 210,242 C214,242 214,236 205,232 L192,218 Z', part: 'sol ön kol', fill: '#d97736' },
        { d: 'M252,225 C245,235 235,242 230,242 C226,242 226,236 235,232 L248,218 Z', part: 'sağ ön kol', fill: '#d97736' },
      ],
    },
    {
      say: 'Sincabımıza parlayan iri gözler, fındık burun, tebessüm ve tombul yanaklar konduralım.',
      shapes: [
        { d: circle(204, 142, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(206, 139, 3), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(236, 142, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(238, 139, 3), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M217,152 L223,152 L220,156 Z', part: 'burun', fill: '#6b4423' },
        { d: 'M214,158 Q220,164 226,158', part: 'ağız' },
        { d: ellipse(192, 155, 7, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(248, 155, 7, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default sincap;
