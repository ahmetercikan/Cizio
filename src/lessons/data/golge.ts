import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Temeller 14: Gölge Eşleştirme - Işığın yönüne göre nesnelerin yere vuran gölgelerini kavrama. */
const golge: Lesson = {
  id: 'golge',
  path: 'temeller',
  title: 'Gölge Eşleştirme',
  emoji: '🌞',
  order: 14,
  level: 1,
  skill: 'Güneş ışığının geldiği yönün tersine nesnelerin koyu gölgelerini çizmeyi öğrendin!',
  palette: ['#ffd166', '#2b9348', '#8b5a2b', '#48cae4', '#e63946', '#4a5568', '#ffffff'],
  steps: [
    {
      say: 'Sol üst köşeye sıcacık parıldayan bir güneş ve ışık saçan çizgilerini çizelim.',
      shapes: [
        { d: circle(70, 60, 24), part: 'güneş', fill: '#ffd166' },
        {
          d:
            'M70,22 L70,30 M70,90 L70,98 M32,60 L40,60 M100,60 L108,60 ' +
            'M43,33 L49,39 M91,81 L97,87 M43,87 L49,81 M91,39 L97,33',
          part: 'güneş ışınları',
        },
        { d: circle(63, 56, 3), part: 'güneş sol göz', fill: '#2d2d2d' },
        { d: circle(77, 56, 3), part: 'güneş sağ göz', fill: '#2d2d2d' },
        { d: 'M64,65 Q70,72 76,65', part: 'güneş gülümsemesi' },
      ],
    },
    {
      say: 'Şimdi düz bir zemin çizgisi ve sol tarafa dik duran bir ağaç gövdesi çiz.',
      shapes: [
        { d: 'M20,280 L380,280', part: 'zemin çizgisi' },
        { d: 'M112,280 L112,185 L128,185 L128,280 Z', part: 'ağaç gövdesi', fill: '#8b5a2b' },
      ],
    },
    {
      say: 'Gövdenin üstüne pofuduk yuvarlak yapraklar ve dallarına kırmızı elmalar ekle.',
      shapes: [
        {
          d: 'M80,165 C68,145 76,120 98,115 C104,92 136,92 142,115 C164,120 172,145 160,165 C170,185 145,195 120,195 C95,195 70,185 80,165 Z',
          part: 'ağaç yaprakları',
          fill: '#2b9348',
        },
        { d: circle(105, 140, 5), part: 'sol elma', fill: '#e63946' },
        { d: circle(135, 135, 5), part: 'sağ elma', fill: '#e63946' },
        { d: circle(120, 168, 5), part: 'alt elma', fill: '#e63946' },
      ],
    },
    {
      say: 'Güneş sol üstten parladığı için ağacın sağ alta uzanan koyu gölgesini çiz.',
      shapes: [
        {
          d: 'M112,280 L132,280 L160,305 C195,305 224,318 224,332 C224,346 178,348 142,346 C116,344 112,330 130,314 L112,280 Z',
          part: 'ağacın gölgesi',
          fill: '#4a5568',
        },
      ],
    },
    {
      say: 'Sağ tarafa yerde duran yuvarlak bir oyun topu ve renkli kıvrık şeritlerini çiz.',
      shapes: [
        { d: circle(290, 240, 38), part: 'top gövdesi', fill: '#ffd166' },
        {
          d: 'M290,202 C265,220 265,260 290,278 C275,260 275,220 290,202 Z',
          part: 'top sol şeridi',
          fill: '#e63946',
        },
        {
          d: 'M290,202 C315,220 315,260 290,278 C305,260 305,220 290,202 Z',
          part: 'top sağ şeridi',
          fill: '#48cae4',
        },
      ],
    },
    {
      say: 'Topun altına sağa doğru uzanan oval gölgesini ve topun parıltısını çiz.',
      shapes: [
        { d: ellipse(315, 305, 42, 12), part: 'topun gölgesi', fill: '#4a5568' },
        { d: circle(280, 222, 6), part: 'top ışıltısı', fill: '#ffffff' },
        { d: circle(285, 230, 3), part: 'küçük ışıltı', fill: '#ffffff' },
      ],
    },
  ],
};

export default golge;
