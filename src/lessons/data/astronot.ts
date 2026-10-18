import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 12: Büyük vizörlü kaskı ve oksijen tüpüyle sevimli uzay yolcusu. */
const astronot: Lesson = {
  id: 'astronot',
  path: 'uzay',
  title: 'Uzay Yolcusu',
  emoji: '👨‍🚀',
  order: 4,
  level: 2,
  skill: 'Büyük kaskı, parlak vizörü ve oksijen tüpüyle uzayda süzülen bir astronot çizmeyi öğrendin!',
  palette: ['#f1f5f9', '#0284c7', '#64748b', '#fde047', '#ef4444', '#22c55e', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kâğıdın üst kısmına astronotun kocaman yuvarlak kaskını ve boyun halkasını çiz.',
      shapes: [
        {
          d: 'M140,175 C125,120 150,70 200,70 C250,70 275,120 260,175 C245,195 155,195 140,175 Z',
          part: 'kask',
          fill: '#f1f5f9',
        },
        { d: ellipse(200, 188, 56, 12), part: 'boyun halkası', fill: '#64748b' },
      ],
    },
    {
      say: 'Kaskın ortasına geniş, oval bir vizör camı çiz. Üstüne beyaz ışık yansımaları ekle.',
      shapes: [
        { d: ellipse(200, 134, 46, 36), part: 'vizör camı', fill: '#0284c7' },
        {
          d: 'M172,114 Q194,108 218,114 Q194,120 172,114 Z',
          part: 'cam parıltısı',
          fill: '#ffffff',
        },
        { d: circle(224, 138, 5), part: 'küçük parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Vizörün arkasından gülen sevimli gözleri ve mutlu gülümsemesini çiz.',
      shapes: [
        { d: ellipse(184, 138, 6, 8), part: 'sol göz', fill: '#ffffff' },
        { d: circle(184, 138, 3), part: 'sol göz bebeği', fill: '#0f172a' },
        { d: ellipse(216, 138, 6, 8), part: 'sağ göz', fill: '#ffffff' },
        { d: circle(216, 138, 3), part: 'sağ göz bebeği', fill: '#0f172a' },
        { d: 'M192,152 Q200,158 208,152', part: 'gülümseme' },
      ],
    },
    {
      say: 'Astronotun arkasına nefes almasını sağlayan oksijen tüpünü ve kaska bağlanan boruyu çiz.',
      shapes: [
        {
          d: 'M130,195 L130,296 Q130,308 144,308 L154,308 L154,195 Z',
          part: 'sol oksijen tüpü',
          fill: '#94a3b8',
        },
        {
          d: 'M246,195 L246,308 L256,308 Q270,308 270,296 L270,195 Z',
          part: 'sağ oksijen tüpü',
          fill: '#94a3b8',
        },
        { d: 'M126,225 Q110,205 144,188', part: 'oksijen hortumu' },
      ],
    },
    {
      say: 'Kaskın altına tombul uzay tulumunu çiz. Göğsüne renkli düğmeleri olan bir kontrol paneli tak.',
      shapes: [
        { d: 'M150,198 L142,305 L258,305 L250,198 Z', part: 'tulum gövdesi', fill: '#f1f5f9' },
        { d: 'M178,224 L222,224 L222,254 L178,254 Z', part: 'göğüs paneli', fill: '#334155' },
        { d: circle(188, 239, 4), part: 'kırmızı düğme', fill: '#ef4444' },
        { d: circle(200, 239, 4), part: 'yeşil düğme', fill: '#22c55e' },
        { d: circle(212, 239, 4), part: 'mavi düğme', fill: '#0284c7' },
      ],
    },
    {
      say: 'Yer çekimsiz ortamda süzülen tombul kollar ve kalın uzay eldivenleri ekle.',
      shapes: [
        { d: 'M148,212 L116,242 A14,14 0 0,0 126,262 L146,240', part: 'sol kol', fill: '#f1f5f9' },
        { d: 'M252,212 L284,188 A14,14 0 0,1 298,206 L254,242', part: 'sağ kol', fill: '#f1f5f9' },
        { d: 'M126,248 L136,258 M276,204 L286,214', part: 'eldiven çizgileri' },
      ],
    },
    {
      say: 'Tulumun altına tombul bacaklar ve kalın tabanlı uzay botları çiz.',
      shapes: [
        { d: 'M152,305 L150,356 Q150,372 172,372 L188,372 L190,305 Z', part: 'sol bacak', fill: '#f1f5f9' },
        { d: 'M210,305 L212,372 L228,372 Q250,372 250,356 L248,305 Z', part: 'sağ bacak', fill: '#f1f5f9' },
        { d: 'M146,364 L190,364 L190,374 L146,374 Z', part: 'sol taban', fill: '#64748b' },
        { d: 'M210,364 L254,364 L254,374 L210,374 Z', part: 'sağ taban', fill: '#64748b' },
      ],
    },
    {
      say: 'Arka plana halkalı minik bir gezegen ve parıldayan yıldızlar çizerek uzayı canlandır!',
      shapes: [
        { d: circle(335, 75, 14), part: 'uzak gezegen', fill: '#f59e0b' },
        { d: ellipse(335, 75, 24, 6), part: 'gezegen halkası' },
        {
          d: 'M75,90 L79,98 L87,102 L79,106 L75,114 L71,106 L63,102 L71,98 Z',
          part: 'üst yıldız',
          fill: '#fde047',
        },
        {
          d: 'M70,305 L73,311 L79,314 L73,317 L70,323 L67,317 L61,314 L67,311 Z',
          part: 'alt yıldız',
          fill: '#fde047',
        },
      ],
    },
  ],
};

export default astronot;
