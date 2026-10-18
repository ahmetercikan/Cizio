import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const istiridye: Lesson = {
  id: 'istiridye',
  path: 'deniz',
  title: 'İnci İstiridyesi',
  emoji: '🦪',
  order: 12,
  level: 1,
  skill: 'Açık bir istiridye kabuğu ve ortasında parlayan yuvarlak bir inci çizmeyi öğrendin!',
  palette: ['#b8c0ff', '#e7c6ff', '#ffd6ff', '#ffffff', '#ffd166', '#2d2d2d'],
  steps: [
    {
      say: 'Önce alta geniş, çukur bir tabak gibi alt kabuğu çiz. İncimiz burada duracak.',
      shapes: [
        {
          d: 'M90,230 C85,295 130,345 200,345 C270,345 315,295 310,230 C270,250 235,258 200,258 C165,258 130,250 90,230 Z',
          part: 'alt kabuk',
          fill: '#b8c0ff',
        },
      ],
    },
    {
      say: 'Şimdi alt kabuğun üstüne yukarı doğru açılmış üst kabuğu çiz.',
      shapes: [
        {
          d: 'M95,225 C90,165 115,85 155,75 C185,68 215,68 245,75 C285,85 310,165 305,225 C270,215 235,210 200,210 C165,210 130,215 95,225 Z',
          part: 'üst kabuk',
          fill: '#e7c6ff',
        },
      ],
    },
    {
      say: 'Kabukların üstüne merkezden dışarı doğru yayılan yelpaze çizgileri ekle.',
      shapes: [
        { d: 'M200,210 L200,70', part: 'üst orta çizgi' },
        { d: 'M170,212 L150,85', part: 'üst sol iç çizgi' },
        { d: 'M140,218 L115,120', part: 'üst sol dış çizgi' },
        { d: 'M230,212 L250,85', part: 'üst sağ iç çizgi' },
        { d: 'M260,218 L285,120', part: 'üst sağ dış çizgi' },
        { d: 'M200,258 L200,345', part: 'alt orta çizgi' },
        { d: 'M165,256 L150,335', part: 'alt sol iç çizgi' },
        { d: 'M130,250 L115,310', part: 'alt sol dış çizgi' },
        { d: 'M235,256 L250,335', part: 'alt sağ iç çizgi' },
        { d: 'M270,250 L285,310', part: 'alt sağ dış çizgi' },
      ],
    },
    {
      say: 'Kabuğun tam ortasına kocaman, parıldayan yuvarlak bir inci çiz.',
      shapes: [
        { d: circle(200, 235, 26), part: 'inci', fill: '#ffffff' },
        { d: circle(192, 227, 7), part: 'inci parıltısı', fill: '#ffd166' },
        { d: circle(186, 221, 3), part: 'küçük parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'İncimizin içine iki tatlı göz ve gülümseyen sevimli bir ağız koy.',
      shapes: [
        { d: circle(193, 238, 3), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(207, 238, 3), part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M196,244 Q200,248 204,244', part: 'ağız' },
        { d: circle(188, 242, 2.5), part: 'sol yanak', fill: '#ffd6ff' },
        { d: circle(212, 242, 2.5), part: 'sağ yanak', fill: '#ffd6ff' },
      ],
    },
    {
      say: 'Son olarak incinin etrafına parıltı yıldızları ve su baloncukları ekle.',
      shapes: [
        { d: 'M130,150 L144,150 M137,143 L137,157', part: 'sol parıltı yıldızı' },
        { d: 'M256,150 L270,150 M263,143 L263,157', part: 'sağ parıltı yıldızı' },
        { d: 'M200,40 L200,54 M193,47 L207,47', part: 'üst parıltı yıldızı' },
        { d: circle(65, 190, 10), part: 'sol baloncuk', fill: '#b8c0ff' },
        { d: circle(335, 190, 12), part: 'sağ baloncuk', fill: '#b8c0ff' },
      ],
    },
  ],
};

export default istiridye;
