import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const taksi: Lesson = {
  id: 'taksi',
  path: 'tasitlar',
  title: 'Sarı Taksi',
  emoji: '🚕',
  order: 15,
  level: 1,
  skill: 'Karakteristik renkler ve dama deseniyle tanıdık bir şehir taşıtı çizmeyi öğrendin!',
  palette: ['#ffd166', '#ffffff', '#3a3a4a', '#aee3ff', '#2d2d2d', '#ff4d4d'],
  steps: [
    {
      say: 'Önce sarı taksinin sevimli gövdesini ve tekerlek yuvalarını çiz.',
      shapes: [
        {
          d:
            'M60,250 L60,225 Q60,210 75,210 L120,210 L165,155 Q175,145 190,145 ' +
            'L250,145 Q265,145 275,155 L315,210 L345,210 Q355,215 355,225 L355,255 ' +
            'L340,255 A35,35 0 0,0 270,255 L170,255 A35,35 0 0,0 100,255 L65,255 Q60,255 60,250 Z',
          part: 'gövde',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Taksiye ön ve arka iki büyük pencere ekle.',
      shapes: [
        { d: 'M175,155 L207,155 L207,205 L135,205 Z', part: 'arka pencere', fill: '#aee3ff' },
        { d: 'M215,155 L255,155 L295,205 L215,205 Z', part: 'ön pencere', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Tekerlek yuvalarına iki tekerlek ve ortalarına beyaz jantlar çiz.',
      shapes: [
        { d: circle(135, 255, 28), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(135, 255, 11), part: 'arka jant', fill: '#ffffff' },
        { d: circle(305, 255, 28), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(305, 255, 11), part: 'ön jant', fill: '#ffffff' },
      ],
    },
    {
      say: 'Tavanın üstüne taksi tabelasını yerleştir.',
      shapes: [
        { d: 'M200,145 L240,145 L240,140 L200,140 Z', part: 'tabela tabanı', fill: '#3a3a4a' },
        {
          d: 'M196,140 L244,140 Q248,140 248,135 L245,120 Q245,116 238,116 L202,116 Q195,116 195,120 L192,135 Q192,140 196,140 Z',
          part: 'taksi tabelası',
          fill: '#ffffff',
        },
        { d: 'M202,125 H238 M208,132 H232', part: 'tabela yazısı' },
      ],
    },
    {
      say: 'Gövdenin yanına boydan boya siyah-beyaz dama deseni çiz.',
      shapes: [
        {
          d:
            'M100,215 H115 V225 H100 Z M130,215 H145 V225 H130 Z M160,215 H175 V225 H160 Z ' +
            'M190,215 H205 V225 H190 Z M220,215 H235 V225 H220 Z M250,215 H265 V225 H250 Z ' +
            'M280,215 H295 V225 H280 Z',
          part: 'dama deseni',
          fill: '#2d2d2d',
        },
      ],
    },
    {
      say: 'Farları, stop lambasını ve kapı detaylarını ekle.',
      shapes: [
        { d: 'M352,225 Q358,225 358,233 L352,235 Z', part: 'ön far', fill: '#ffffff' },
        { d: 'M60,225 L65,225 L65,235 L60,235 Z', part: 'stop lambası', fill: '#ff4d4d' },
        { d: 'M192,210 L204,210 M252,210 L264,210', part: 'kapı kolları' },
        { d: 'M211,155 L211,254', part: 'kapı ayrımı' },
      ],
    },
    {
      say: 'Taksinin altına düz bir yol ve şerit çizgileri çiz.',
      shapes: [
        { d: 'M40,283 L360,283', part: 'yol' },
        { d: 'M70,300 L115,300 M165,300 L210,300 M260,300 L305,300', part: 'şerit çizgileri' },
      ],
    },
  ],
};

export default taksi;
