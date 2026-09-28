import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 4: Minik kanatlı, çizgili karınlı, sırtı dikenli dost bir ejderha. */
const ejderha: Lesson = {
  id: 'ejderha',
  path: 'dinozor',
  title: 'Dost Ejderha',
  emoji: '🐉',
  order: 4,
  level: 3,
  skill: 'Kanadı, karnı ve dikenleri gövdenin üstüne ve yanına ekledin. Üst üste binen şekillerle katman katman çizmeyi öğrendin!',
  palette: ['#b98cff', '#ffe9a8', '#ff9ecf', '#ffd166', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kocaman, yuvarlak bir kafa çiz. Sağ tarafı hafifçe dışarı çıksın, burnu orası olacak.',
      shapes: [
        {
          d: 'M170,150 C160,85 215,55 265,58 C320,60 345,95 340,130 C336,165 305,185 262,188 C220,190 178,180 170,150 Z',
          part: 'kafa',
          fill: '#b98cff',
        },
      ],
    },
    {
      say: 'Kafanın solundan başla, aşağıya tombul bir armut gibi gövde çiz ve kafanın altında bitir.',
      shapes: [
        {
          d: 'M170,150 C130,170 110,230 115,275 C120,320 160,345 210,345 C255,345 280,320 282,280 C284,240 275,210 262,188',
          part: 'gövde',
          fill: '#b98cff',
        },
      ],
    },
    {
      say: 'Gövdenin altından sola kıvrılan bir kuyruk çiz. Ucuna da yaprak gibi sivri bir uç ekle.',
      shapes: [
        { d: 'M115,275 C88,286 64,284 56,258 C58,302 98,320 136.2,319.1', part: 'kuyruk', fill: '#b98cff' },
        { d: 'M56,258 Q22,248 34,206 Q78,216 56,258 Z', part: 'kuyruk ucu', fill: '#ff9ecf' },
      ],
    },
    {
      say: 'Sırtına minik bir kanat çiz. Gövdeden yukarı sivri bir uca çık, altını dalga dalga yaparak geri dön.',
      shapes: [
        {
          d: 'M153,161.5 C140,130 110,100 75,88 Q92,110 80,135 Q102,145 104,168 Q122,172 128.6,196.3',
          part: 'kanat',
          fill: '#ff9ecf',
        },
      ],
    },
    {
      say: 'Altına iki tombul ayak, göğsüne de minik bir kol çiz. Hepsi gövdeden başlasın, gövdede bitsin.',
      shapes: [
        { d: 'M156.4,333.3 C150,352 155,368 178,368 C198,368 202,358 195.3,344.3', part: 'arka ayak', fill: '#b98cff' },
        { d: 'M234.6,342.1 C232,360 240,368 258,368 C276,368 280,350 268.8,320.2', part: 'ön ayak', fill: '#b98cff' },
        { d: 'M277.6,227.3 C298,226 306,240 300,250 C296,256 290,257 281.9,257.2', part: 'kol', fill: '#b98cff' },
      ],
    },
    {
      say: 'Karnına büyük, açık renkli bir oval çiz. İçine de yan yana üç çizgi çek. Çizgili karın oldu!',
      shapes: [
        { d: ellipse(230, 272, 40, 55), part: 'karın', fill: '#ffe9a8' },
        { d: 'M195.2,245 Q230,254 264.8,245', part: 'karın çizgileri' },
        { d: 'M190,272 Q230,281 270,272', part: 'karın çizgileri' },
        { d: 'M195.2,299 Q230,308 264.8,299', part: 'karın çizgileri' },
      ],
    },
    {
      say: 'Kafasının üstüne iki kıvrık boynuz, sırtına da iki sivri diken ekle.',
      shapes: [
        { d: 'M195,78.5 Q188,52 174,38 Q202,44 220.5,64.3', part: 'boynuzlar', fill: '#ffd166' },
        { d: 'M235,60.2 Q232,42 224,31 Q252,36 265,58', part: 'boynuzlar', fill: '#ffd166' },
        { d: 'M125.6,203.1 L91.9,208.9 L117.1,231.9', part: 'sırt dikenleri', fill: '#ff9ecf' },
        { d: 'M115.3,240 L86,253 L114.4,268', part: 'sırt dikenleri', fill: '#ff9ecf' },
      ],
    },
    {
      say: 'Son olarak parlak bir göz, burun deliği, gülümseyen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(285, 112, 17), part: 'göz', fill: '#2d2d2d' },
        { d: circle(291, 106, 5.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(328, 110, 3.5), part: 'burun deliği', fill: '#2d2d2d' },
        { d: 'M284,154 Q310,168 334,146', part: 'ağız' },
        { d: ellipse(258, 144, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default ejderha;
