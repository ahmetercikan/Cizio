import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 14: Dik yakalı pelerini, minik dişleri ve sevimli gülüşüyle şirin vampir. */
const vampir: Lesson = {
  id: 'vampir',
  path: 'karakterler',
  title: 'Şirin Vampir',
  emoji: '🧛',
  order: 14,
  level: 2,
  skill: 'Görkemli pelerini, sivri kulakları ve sevimli vampir dişleriyle eğlenceli bir karakter çizmeyi öğrendin!',
  palette: ['#1e1e2d', '#e63946', '#f8fafc', '#ffd23f', '#ffb3c1', '#2d2d3a', '#ffffff'],
  steps: [
    {
      say: 'Önce arkada yükselen sivri uçlu pelerin yakasını ve yere uzanan pelerini çiz.',
      shapes: [
        {
          d: 'M170,205 L110,360 Q200,380 290,360 L230,205 Z',
          part: 'pelerin gövdesi',
          fill: '#1e1e2d',
        },
        {
          d: 'M128,95 Q170,165 200,205 Q230,165 272,95 Q200,148 128,95 Z',
          part: 'kırmızı astar',
          fill: '#e63946',
        },
        {
          d: 'M128,95 Q145,155 170,205 M272,95 Q255,155 230,205',
          part: 'yaka kenarları',
        },
      ],
    },
    {
      say: 'Pelerinin önüne yuvarlak yüzü, sivri perçemli saçını ve sivri kulaklarını çiz.',
      shapes: [
        { d: circle(200, 150, 46), part: 'yüz', fill: '#f8fafc' },
        {
          d: 'M154,148 C150,110 172,102 200,102 C228,102 250,110 246,148 C240,126 218,126 200,140 C182,126 160,126 154,148 Z',
          part: 'saç',
          fill: '#1e1e2d',
        },
        { d: 'M154,144 L138,136 L152,156 Z', part: 'sol kulak', fill: '#f8fafc' },
        { d: 'M246,144 L262,136 L248,156 Z', part: 'sağ kulak', fill: '#f8fafc' },
      ],
    },
    {
      say: 'Vampirin gövdesine şık bir yelek, beyaz gömlek ve kırmızı bir papyon çiz.',
      shapes: [
        { d: 'M178,198 L200,238 L222,198 Z', part: 'gömlek', fill: '#ffffff' },
        { d: 'M168,204 L150,308 L250,308 L232,204 L200,238 Z', part: 'yelek', fill: '#2d2d3a' },
        { d: 'M200,202 L190,195 L190,209 Z', part: 'sol papyon kanadı', fill: '#e63946' },
        { d: 'M200,202 L210,195 L210,209 Z', part: 'sağ papyon kanadı', fill: '#e63946' },
        { d: circle(200, 202, 3), part: 'papyon düğümü', fill: '#e63946' },
        { d: circle(200, 256, 3), part: 'üst düğme', fill: '#ffd23f' },
        { d: circle(200, 276, 3), part: 'alt düğme', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Yeleğin yanlarına pelerinini tutan iki kol ve el ekle.',
      shapes: [
        { d: 'M168,212 L140,248 A8,8 0 0,0 152,258 L174,236', part: 'sol kol', fill: '#2d2d3a' },
        { d: circle(144, 255, 5), part: 'sol el', fill: '#f8fafc' },
        { d: 'M232,212 L260,248 A8,8 0 0,1 248,258 L226,236', part: 'sağ kol', fill: '#2d2d3a' },
        { d: circle(256, 255, 5), part: 'sağ el', fill: '#f8fafc' },
      ],
    },
    {
      say: 'Gövdenin altına siyah pantolon ve parlak ayakkabılar çiz.',
      shapes: [
        {
          d: 'M158,308 L154,364 L192,364 L200,334 L208,364 L246,364 L242,308 Z',
          part: 'pantolon',
          fill: '#1e1e2d',
        },
        { d: ellipse(172, 368, 14, 7), part: 'sol ayakkabı', fill: '#0f172a' },
        { d: ellipse(228, 368, 14, 7), part: 'sağ ayakkabı', fill: '#0f172a' },
      ],
    },
    {
      say: 'Güler yüzlü kocaman gözler, pembe yanaklar ve iki minik sivri diş ekle.',
      shapes: [
        { d: ellipse(180, 150, 8, 11), part: 'sol göz', fill: '#1e1e2d' },
        { d: circle(182, 146, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(220, 150, 8, 11), part: 'sağ göz', fill: '#1e1e2d' },
        { d: circle(222, 146, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M186,168 Q200,182 214,168', part: 'gülümseme' },
        { d: 'M190,170 L193,178 L196,171 Z', part: 'sol diş', fill: '#ffffff' },
        { d: 'M204,171 L207,178 L210,170 Z', part: 'sağ diş', fill: '#ffffff' },
        { d: ellipse(168, 166, 7, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(232, 166, 7, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Tepesine uçan minik, sevimli bir yarasa dostu çizerek resmi tamamla!',
      shapes: [
        { d: ellipse(95, 75, 10, 12), part: 'yarasa gövdesi', fill: '#1e1e2d' },
        { d: 'M88,66 L86,55 L93,64 Z', part: 'yarasa sol kulağı', fill: '#1e1e2d' },
        { d: 'M102,64 L109,55 L107,66 Z', part: 'yarasa sağ kulağı', fill: '#1e1e2d' },
        {
          d: 'M85,73 Q60,55 50,75 Q68,82 72,92 Q80,82 85,83 Z',
          part: 'yarasa sol kanadı',
          fill: '#2d2d3a',
        },
        {
          d: 'M105,73 Q130,55 140,75 Q122,82 118,92 Q110,82 105,83 Z',
          part: 'yarasa sağ kanadı',
          fill: '#2d2d3a',
        },
        { d: circle(92, 73, 2), part: 'yarasa sol gözü', fill: '#ffffff' },
        { d: circle(98, 73, 2), part: 'yarasa sağ gözü', fill: '#ffffff' },
      ],
    },
  ],
};

export default vampir;
