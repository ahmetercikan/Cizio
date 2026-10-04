import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Deniz 5: Başından su fışkırtan kocaman, gülümseyen bir mavi balina. */
const balina: Lesson = {
  id: 'balina',
  path: 'deniz',
  title: 'Mavi Balina',
  emoji: '🐳',
  order: 5,
  level: 1,
  skill: 'Önden yuvarlak, arkaya doğru incelen bir gövde çizdin. Kuyruğu yukarı kaldırınca balina yüzüyormuş gibi oldu!',
  palette: ['#5aa9f0', '#c7e7ff', '#3a7fd0', '#9bdcff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kocaman bir gövde çiz. Sol tarafı yuvarlak bir baş olsun, sağa doğru incelsin.',
      shapes: [
        {
          d: 'M62,235 C55,170 110,128 180,128 C240,128 275,160 312,166 C326,168 330,188 318,196 C290,225 255,282 170,285 C110,287 66,272 62,235 Z',
          part: 'gövde',
          fill: '#5aa9f0',
        },
      ],
    },
    {
      say: 'Gövdenin ince ucundan yukarı doğru bir kuyruk çiz. Tepesi iki yana açılsın.',
      shapes: [
        {
          d: 'M312,166 C324,156 330,144 330,128 C312,124 292,108 284,84 C308,86 326,98 338,112 C348,92 362,80 380,74 C378,100 364,122 346,130 C348,152 340,178 322,193',
          part: 'kuyruk',
          fill: '#5aa9f0',
        },
      ],
    },
    {
      say: 'Gövdenin altına açık renkli bir karın çiz. Karnın üstüne de küçük bir yüzgeç ekle.',
      shapes: [
        {
          d: 'M64,246 C120,258 210,258 284,234 C255,268 220,284 170,285 C110,287 70,272 64,246 Z',
          part: 'karın',
          fill: '#c7e7ff',
        },
        { d: 'M178,226 C184,252 206,270 232,266 C226,246 206,230 178,226 Z', part: 'yüzgeç', fill: '#3a7fd0' },
      ],
    },
    {
      say: 'Başına yuvarlak bir göz ve beyaz parıltısını çiz. Altına uzun, gülen bir ağız ve pembe yanak ekle.',
      shapes: [
        { d: circle(112, 190, 16), part: 'göz', fill: '#2d2d2d' },
        { d: circle(106.5, 184, 5.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M70,228 Q112,250 160,228', part: 'ağız' },
        { d: ellipse(150, 212, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Başının tepesinden yukarı kısa bir çizgi çiz. Ucundan iki yana kıvrılan su fıskiyesi ekle.',
      shapes: [
        { d: 'M150,131 C148,114 150,100 152,84', part: 'fıskiye' },
        { d: 'M152,84 C140,62 116,56 98,70', part: 'sol fıskiye' },
        { d: 'M152,84 C164,62 188,56 206,70', part: 'sağ fıskiye' },
      ],
    },
    {
      say: 'Fıskiyenin iki ucuna ve tepesine birer su damlası çiz. Yukarısı sivri, altı yuvarlak olsun.',
      shapes: [
        { d: 'M96,80 Q106,96 96,102 Q86,96 96,80 Z', part: 'sol damla', fill: '#9bdcff' },
        { d: 'M208,80 Q218,96 208,102 Q198,96 208,80 Z', part: 'sağ damla', fill: '#9bdcff' },
        { d: 'M152,38 Q162,54 152,60 Q142,54 152,38 Z', part: 'tepe damlası', fill: '#9bdcff' },
      ],
    },
    {
      say: 'Son olarak balinanın altına inişli çıkışlı bir dalga çizgisi çiz. Balina denizde yüzüyor!',
      shapes: [
        {
          d: 'M44,330 Q74,310 104,330 Q134,350 164,330 Q194,310 224,330 Q254,350 284,330 Q314,310 344,330',
          part: 'dalga',
        },
      ],
    },
  ],
};

export default balina;
