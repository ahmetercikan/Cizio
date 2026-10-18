import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const denizKaplumbagasi: Lesson = {
  id: 'deniz-kaplumbagasi',
  path: 'deniz',
  title: 'Deniz Kaplumbağası',
  emoji: '🐢',
  order: 16,
  level: 2,
  skill: 'Yüzgeç gibi açılan ayaklar ve kabuk üzerine altıgen desenler çizmeyi öğrendin!',
  palette: ['#52b788', '#74c69d', '#2d6a4f', '#d8f3dc', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce ortada kocaman, yumurta şeklinde büyük bir kabuk çiz.',
      shapes: [
        {
          d: 'M200,115 C250,115 275,160 275,215 C275,275 245,310 200,310 C155,310 125,275 125,215 C125,160 150,115 200,115 Z',
          part: 'kabuk',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Kabuğun tepesinden öne doğru uzanan sevimli bir baş ve boyun çiz.',
      shapes: [
        { d: 'M188,125 C184,95 178,68 200,58 C222,68 216,95 212,125', part: 'baş ve boyun', fill: '#74c69d' },
      ],
    },
    {
      say: 'Kabuğun ön iki yanından kanat gibi açılan büyük yüzme ayakları ekle.',
      shapes: [
        { d: 'M145,145 C110,135 60,140 45,170 C50,195 95,195 135,175', part: 'sol ön yüzgeç', fill: '#74c69d' },
        { d: 'M255,145 C290,135 340,140 355,170 C350,195 305,195 265,175', part: 'sağ ön yüzgeç', fill: '#74c69d' },
      ],
    },
    {
      say: 'Kabuğun altından iki küçük arka yüzgeç ve minik sivri bir kuyruk çıkar.',
      shapes: [
        { d: 'M145,285 C120,305 115,335 130,345 C145,350 160,325 165,295', part: 'sol arka yüzgeç', fill: '#74c69d' },
        { d: 'M255,285 C280,305 285,335 270,345 C255,350 240,325 235,295', part: 'sağ arka yüzgeç', fill: '#74c69d' },
        { d: 'M195,308 L200,332 L205,308', part: 'kuyruk', fill: '#74c69d' },
      ],
    },
    {
      say: 'Kabuğun ortasına yukarıdan aşağı dizilen üç tane altıgen desen çiz.',
      shapes: [
        { d: 'M200,135 L220,150 L220,175 L200,190 L180,175 L180,150 Z', part: 'üst altıgen', fill: '#2d6a4f' },
        { d: 'M200,190 L222,205 L222,235 L200,250 L178,235 L178,205 Z', part: 'orta altıgen', fill: '#2d6a4f' },
        { d: 'M200,250 L218,265 L218,285 L200,298 L182,285 L182,265 Z', part: 'alt altıgen', fill: '#2d6a4f' },
      ],
    },
    {
      say: 'Altıgenlerin köşelerinden kabuğun dış kenarına uzanan çizgiler ekle.',
      shapes: [
        { d: 'M180,162 L132,175', part: 'sol üst çizgi' },
        { d: 'M178,220 L126,225', part: 'sol orta çizgi' },
        { d: 'M182,275 L145,285', part: 'sol alt çizgi' },
        { d: 'M220,162 L268,175', part: 'sağ üst çizgi' },
        { d: 'M222,220 L274,225', part: 'sağ orta çizgi' },
        { d: 'M218,275 L255,285', part: 'sağ alt çizgi' },
      ],
    },
    {
      say: 'Başın üzerine iki sevimli göz, parıltılar ve gülen bir ağız koy.',
      shapes: [
        { d: circle(188, 78, 6), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(186, 76, 2), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(212, 78, 6), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(210, 76, 2), part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M194,92 Q200,97 206,92', part: 'ağız' },
        { d: circle(182, 86, 3), part: 'sol yanak', fill: '#d8f3dc' },
        { d: circle(218, 86, 3), part: 'sağ yanak', fill: '#d8f3dc' },
      ],
    },
    {
      say: 'Son olarak yüzgeçlerin üzerine benekler ve etrafa su baloncukları çiz.',
      shapes: [
        { d: circle(95, 168, 5), part: 'sol yüzgeç iç benek', fill: '#2d6a4f' },
        { d: circle(75, 172, 4), part: 'sol yüzgeç dış benek', fill: '#2d6a4f' },
        { d: circle(305, 168, 5), part: 'sağ yüzgeç iç benek', fill: '#2d6a4f' },
        { d: circle(325, 172, 4), part: 'sağ yüzgeç dış benek', fill: '#2d6a4f' },
        { d: circle(165, 42, 8), part: 'sol baloncuk', fill: '#d8f3dc' },
        { d: circle(235, 40, 6), part: 'sağ baloncuk', fill: '#d8f3dc' },
      ],
    },
  ],
};

export default denizKaplumbagasi;
