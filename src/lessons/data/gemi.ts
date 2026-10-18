import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const gemi: Lesson = {
  id: 'gemi',
  path: 'tasitlar',
  title: 'Büyük Gemi',
  emoji: '🚢',
  order: 13,
  level: 2,
  skill: 'Kat kat güverteler, bacalar ve pencerelerle dev bir deniz taşıtı inşa etmeyi öğrendin!',
  palette: ['#2b4c7e', '#ff4d4d', '#ffffff', '#ffe066', '#4fa3ff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce geminin devasa gövdesini çiz. Burnu sağa doğru yükselsin.',
      shapes: [
        {
          d: 'M55,190 L340,190 Q365,190 370,180 L370,225 Q355,270 300,270 L85,270 Q55,270 55,190 Z',
          part: 'gövde',
          fill: '#2b4c7e',
        },
      ],
    },
    {
      say: 'Gövdenin alt kısmına kırmızı su altı şeridini ekle.',
      shapes: [
        {
          d: 'M65,240 L345,240 Q335,270 300,270 L85,270 Q68,270 65,240 Z',
          part: 'su altı gövdesi',
          fill: '#ff4d4d',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne beyaz birinci kat güverteyi yerleştir.',
      shapes: [
        {
          d: 'M80,190 L80,145 Q80,140 86,140 L310,140 Q320,140 326,165 L332,190 Z',
          part: 'ana güverte',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Üst kata kaptan köşkünü ve sıra sıra dikdörtgen camları çiz.',
      shapes: [
        {
          d: 'M120,140 L120,110 Q120,105 126,105 L265,105 Q275,105 280,125 L285,140 Z',
          part: 'kaptan köşkü',
          fill: '#f0f4f8',
        },
        {
          d:
            'M138,115 L158,115 L158,128 L138,128 Z M172,115 L192,115 L192,128 L172,128 Z ' +
            'M206,115 L226,115 L226,128 L206,128 Z M240,115 L260,115 L260,128 L240,128 Z',
          part: 'köşk camları',
          fill: '#aee3ff',
        },
      ],
    },
    {
      say: 'Tepesine iki kırmızı baca ve bacalardan çıkan dumanları ekle.',
      shapes: [
        { d: 'M145,105 L150,65 L175,65 L170,105 Z', part: 'arka baca', fill: '#ff4d4d' },
        { d: 'M149,75 L150,65 L175,65 L174,75 Z', part: 'arka baca şeridi', fill: '#2d2d2d' },
        { d: 'M205,105 L210,65 L235,65 L230,105 Z', part: 'ön baca', fill: '#ff4d4d' },
        { d: 'M209,75 L210,65 L235,65 L234,75 Z', part: 'ön baca şeridi', fill: '#2d2d2d' },
        { d: circle(162, 48, 10), part: 'arka duman', fill: '#ffffff' },
        { d: circle(222, 48, 10), part: 'ön duman', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gövdenin yanına eşit aralıklarla yuvarlak pencereler aç.',
      shapes: [
        {
          d:
            `${circle(110, 215, 8)} ${circle(150, 215, 8)} ${circle(190, 215, 8)} ` +
            `${circle(230, 215, 8)} ${circle(270, 215, 8)}`,
          part: 'lumbar çerçeveleri',
          fill: '#ffe066',
        },
        {
          d:
            `${circle(110, 215, 5)} ${circle(150, 215, 5)} ${circle(190, 215, 5)} ` +
            `${circle(230, 215, 5)} ${circle(270, 215, 5)}`,
          part: 'lumbar camları',
          fill: '#aee3ff',
        },
      ],
    },
    {
      say: 'Ön tarafa bir çapa, arkadaki direğe de dalgalanan bir bayrak çiz.',
      shapes: [
        { d: circle(325, 205, 5), part: 'çapa halkası', fill: '#ffe066' },
        { d: 'M325,210 L325,230 M318,217 L332,217 M315,225 Q325,235 335,225', part: 'çapa demiri' },
        { d: 'M80,140 L80,95', part: 'bayrak direği' },
        { d: 'M80,95 L55,105 L80,115 Z', part: 'bayrak', fill: '#ff4d4d' },
      ],
    },
    {
      say: 'Geminin altına köpüklü mavi deniz dalgalarını çiz.',
      shapes: [
        {
          d: 'M30,270 Q60,255 90,270 Q120,285 150,270 Q180,255 210,270 Q240,285 270,270 Q300,255 330,270 Q350,280 375,270',
          part: 'üst dalga',
        },
        {
          d: 'M40,295 Q80,280 120,295 Q160,310 200,295 Q240,280 280,295 Q320,310 360,295',
          part: 'alt dalga',
        },
      ],
    },
  ],
};

export default gemi;
