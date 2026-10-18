import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 20: Renkli lolipop. Daire taban, sarmal spiral şeritler, çubuk ve kurdele. */
const lolipop: Lesson = {
  id: 'lolipop',
  path: 'nesneler',
  title: 'Renkli Lolipop',
  emoji: '🍭',
  order: 20,
  level: 1,
  skill: 'Dairenin içine kıvrılan spiral çizgiler çizip çubuk ve fiyonk eklemeyi öğrendin!',
  palette: ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#ffffff', '#ced6e0', '#ff6b81'],
  steps: [
    {
      say: 'Önce lolipopun yuvarlak şekeri için büyük ve düzgün bir daire çiz.',
      shapes: [{ d: circle(200, 150, 85), part: 'şeker dairesi', fill: '#ffffff' }],
    },
    {
      say: 'Şekerin merkezinden dışarıya doğru kıvrılan ilk iki renkli sarmal şeridi çiz.',
      shapes: [
        {
          d: 'M200,150 Q235,110 273,107 A85,85 0 0,1 285,150 Q235,155 200,150 Z',
          part: 'kırmızı sarmal',
          fill: '#ff4757',
        },
        {
          d: 'M200,150 Q165,190 127,193 A85,85 0 0,1 115,150 Q165,145 200,150 Z',
          part: 'turuncu sarmal',
          fill: '#ffa502',
        },
      ],
    },
    {
      say: 'Aralara yeşil ve mavi sarmal dilimleri de ekleyerek şekeri renklendir.',
      shapes: [
        {
          d: 'M200,150 Q230,175 242,210 A85,85 0 0,1 200,235 Q195,190 200,150 Z',
          part: 'yeşil sarmal',
          fill: '#2ed573',
        },
        {
          d: 'M200,150 Q170,125 158,90 A85,85 0 0,1 200,65 Q205,110 200,150 Z',
          part: 'mavi sarmal',
          fill: '#1e90ff',
        },
      ],
    },
    {
      say: 'Şekerin üzerine dönen kıvrımlı bir spiral çizgi ve beyaz bir parıltı kondur.',
      shapes: [
        {
          d: 'M200,150 Q215,140 210,125 Q195,115 175,130 Q160,155 180,175 Q210,190 235,165 Q250,130 225,95 Q185,75 145,115 Q125,160 155,205 Q200,240 250,210',
          part: 'spiral çizgi',
        },
        { d: 'M145,100 A65,65 0 0,1 190,87', part: 'parıltı' },
      ],
    },
    {
      say: 'Şekerin altından aşağıya doğru tutacağımız uzun ve düz bir çubuk uzat.',
      shapes: [{ d: 'M193,235 L193,375 Q200,380 207,375 L207,235 Z', part: 'çubuk', fill: '#ced6e0' }],
    },
    {
      say: 'Çubuğun başladığı yere rengarenk, süslü bir fiyonk kurdele bağla!',
      shapes: [
        {
          d: 'M200,238 C165,220 140,235 155,258 C170,270 195,248 200,238 Z',
          part: 'sol fiyonk',
          fill: '#ff6b81',
        },
        {
          d: 'M200,238 C235,220 260,235 245,258 C230,270 205,248 200,238 Z',
          part: 'sağ fiyonk',
          fill: '#ff6b81',
        },
        { d: circle(200, 243, 8), part: 'düğüm', fill: '#ffa502' },
        { d: 'M196,250 L180,285 L192,278 L198,250 Z', part: 'sol kurdele ucu', fill: '#ff6b81' },
        { d: 'M204,250 L220,285 L208,278 L202,250 Z', part: 'sağ kurdele ucu', fill: '#ff6b81' },
      ],
    },
  ],
};

export default lolipop;
