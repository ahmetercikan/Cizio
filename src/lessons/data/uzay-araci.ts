import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Taşıtlar 22: Uzay Aracı - Kubbeli, renkli ışıklı ve ışık huzmeli sevimli uçan daire. */
const uzayAraci: Lesson = {
  id: 'uzay-araci',
  path: 'tasitlar',
  title: 'Uzay Aracı',
  emoji: '🛸',
  order: 22,
  level: 2,
  skill: 'Geniş bir daire gövde, şeffaf kubbe ve yere süzülen ışık huzmesiyle uzay gemisi çizmeyi öğrendin!',
  palette: ['#118ab2', '#06d6a0', '#ffd166', '#ef476f', '#a2d2ff', '#ffffff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce uçan dairenin geniş, yayvan oval gövdesini çizelim.',
      shapes: [
        {
          d: 'M50,175 C50,140 350,140 350,175 C350,210 50,210 50,175 Z',
          part: 'gövde diski',
          fill: '#118ab2',
        },
        {
          d: 'M50,175 C50,192 350,192 350,175 C350,165 50,165 50,175 Z',
          part: 'gövde şeridi',
          fill: '#0077b6',
        },
      ],
    },
    {
      say: 'Gövdenin altına eğik bir alt taban ve ışık fırlatan yuvarlak bölmeyi çiz.',
      shapes: [
        {
          d: 'M115,202 C145,232 255,232 285,202 C255,218 145,218 115,202 Z',
          part: 'alt gövde',
          fill: '#073b4c',
        },
        {
          d: 'M160,224 C160,234 240,234 240,224 C240,218 160,218 160,224 Z',
          part: 'ışık feneri',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne kubbe şeklinde şeffaf bir kabin camı oturt.',
      shapes: [
        {
          d: 'M125,160 C125,72 275,72 275,160 C240,170 160,170 125,160 Z',
          part: 'kabin kubbesi',
          fill: '#a2d2ff',
        },
        { d: 'M150,135 C145,95 180,82 198,82', part: 'cam parıltısı' },
      ],
    },
    {
      say: 'Kubbenin içine el sallayan tatlı bir yeşil uzaylı ve kafasına minik bir anten çiz.',
      shapes: [
        { d: circle(200, 125, 23), part: 'uzaylı başı', fill: '#06d6a0' },
        { d: 'M200,102 L200,88', part: 'anten sapı' },
        { d: circle(200, 84, 5), part: 'anten topu', fill: '#ffd166' },
        { d: ellipse(191, 122, 5, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(193, 119, 2), part: 'sol göz ışıltısı', fill: '#ffffff' },
        { d: ellipse(209, 122, 5, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(211, 119, 2), part: 'sağ göz ışıltısı', fill: '#ffffff' },
        { d: 'M195,134 Q200,140 205,134', part: 'uzaylı gülümsemesi' },
        { d: 'M222,128 Q234,120 230,112', part: 'el sallayan kol' },
      ],
    },
    {
      say: 'Uçan dairenin kenarına sırayla parıldayan renkli sinyal ışıkları yerleştir.',
      shapes: [
        { d: circle(95, 180, 7), part: '1. ışık', fill: '#ffd166' },
        { d: circle(145, 192, 8), part: '2. ışık', fill: '#ef476f' },
        { d: circle(200, 196, 9), part: 'orta ışık', fill: '#ffd166' },
        { d: circle(255, 192, 8), part: '4. ışık', fill: '#ef476f' },
        { d: circle(305, 180, 7), part: '5. ışık', fill: '#ffd166' },
      ],
    },
    {
      say: 'Geminin altından yere doğru genişleyerek inen parıltılı ışık huzmesini çiz.',
      shapes: [
        {
          d: 'M165,228 L60,375 C100,390 300,390 340,375 L235,228 Z',
          part: 'ışık huzmesi',
          fill: '#fff3b0',
        },
        { d: ellipse(200, 375, 140, 14), part: 'zemin ışık halkası', fill: '#ffe66d' },
        { d: 'M140,285 Q200,300 260,285', part: 'üst ışık dalgası' },
        { d: 'M100,335 Q200,355 300,335', part: 'alt ışık dalgası' },
      ],
    },
    {
      say: 'Uzay boşluğuna halkalı küçük bir gezegen ve ışıl ışıl parlayan yıldızlar saç!',
      shapes: [
        { d: circle(55, 60, 15), part: 'küçük gezegen', fill: '#ff9f1c' },
        { d: 'M32,62 Q55,76 78,62 M78,58 Q55,44 32,58', part: 'gezegen halkası' },
        {
          d: 'M335,55 L338,67 L350,70 L338,73 L335,85 L332,73 L320,70 L332,67 Z',
          part: 'büyük yıldız',
          fill: '#ffffff',
        },
        {
          d: 'M365,115 L367,122 L374,124 L367,126 L365,133 L363,126 L356,124 L363,122 Z',
          part: 'orta yıldız',
          fill: '#ffd166',
        },
        {
          d: 'M55,125 L56,130 L61,131 L56,132 L55,137 L54,132 L49,131 L54,130 Z',
          part: 'küçük yıldız',
          fill: '#ffffff',
        },
      ],
    },
  ],
};

export default uzayAraci;
