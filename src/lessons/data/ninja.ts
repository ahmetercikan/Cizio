import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 10: Gizemli maskesi, kemeri ve kılıcıyla sevimli bir ninja. */
const ninja: Lesson = {
  id: 'ninja',
  path: 'karakterler',
  title: 'Gizli Ninja',
  emoji: '🥷',
  order: 10,
  level: 2,
  skill: 'Ninja maskesi, sarkan kuşakları ve arkasındaki kılıcıyla gizemli bir karakter çizmeyi öğrendin!',
  palette: ['#2d3142', '#ffe1cc', '#e63946', '#94a3b8', '#ffd23f', '#1a1a24', '#ffffff'],
  steps: [
    {
      say: 'Önce ninjanın yuvarlak kafa maskesini çiz. Arkaya doğru süzülen iki kumaş bağcık ekle.',
      shapes: [
        {
          d: 'M200,75 C242,75 258,105 258,142 C258,178 238,198 200,198 C162,198 142,178 142,142 C142,105 158,75 200,75 Z',
          part: 'maskeli kafa',
          fill: '#2d3142',
        },
        {
          d: 'M256,120 C274,112 288,116 300,122 C288,130 274,128 257,128 Z',
          part: 'üst bağcık',
          fill: '#e63946',
        },
        {
          d: 'M255,127 C272,136 288,150 298,160 C284,158 270,146 253,134 Z',
          part: 'alt bağcık',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Maskenin ortasına gözlerin göründüğü yatay bir boşluk ve üstüne alın bandı çiz.',
      shapes: [
        {
          d: 'M164,126 Q200,118 236,126 Q240,152 236,158 Q200,165 164,158 Q160,152 164,126 Z',
          part: 'yüz açıklığı',
          fill: '#ffe1cc',
        },
        {
          d: 'M172,98 L228,98 Q234,107 228,116 L172,116 Q166,107 172,98 Z',
          part: 'alın bandı plakası',
          fill: '#94a3b8',
        },
        { d: circle(200, 107, 4), part: 'amblem', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Açıklığın içine dikkatle bakan iki göz ve kararlı kaşlar çiz.',
      shapes: [
        { d: ellipse(182, 142, 7, 8), part: 'sol göz', fill: '#1a1a24' },
        { d: circle(184, 139, 2.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(218, 142, 7, 8), part: 'sağ göz', fill: '#1a1a24' },
        { d: circle(220, 139, 2.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M174,131 L190,136', part: 'sol kaş' },
        { d: 'M226,131 L210,136', part: 'sağ kaş' },
      ],
    },
    {
      say: 'Kafanın altına ninjanın gövdesini çiz. Yaka kısmına çapraz bir kesim yap.',
      shapes: [
        { d: 'M168,194 L142,274 L258,274 L232,194 Z', part: 'gövde', fill: '#2d3142' },
        { d: 'M175,195 L200,236 L225,195', part: 'yaka çizgisi' },
      ],
    },
    {
      say: 'Beline parlak kırmızı bir kuşak bağla. Kuşağın iki ucu aşağıya doğru sarksın.',
      shapes: [
        { d: 'M140,268 L260,268 L258,288 L142,288 Z', part: 'kemer kuşağı', fill: '#e63946' },
        { d: circle(200, 278, 6), part: 'kemer düğümü', fill: '#e63946' },
        { d: 'M196,284 C192,308 186,330 180,344 L192,344 C197,328 201,308 203,284 Z', part: 'sol kuşak ucu', fill: '#e63946' },
        { d: 'M202,284 C204,306 208,326 215,340 L224,338 C216,322 210,304 207,284 Z', part: 'sağ kuşak ucu', fill: '#e63946' },
      ],
    },
    {
      say: 'Ninjanın iki kolunu ve bacaklarını çiz. Çevik bir duruş sergilesin!',
      shapes: [
        { d: 'M165,202 L132,238 A8,8 0 0,0 142,252 L160,230', part: 'sol kol', fill: '#2d3142' },
        { d: 'M235,202 L268,238 A8,8 0 0,1 258,252 L240,230', part: 'sağ kol', fill: '#2d3142' },
        { d: 'M156,288 L150,352 Q150,364 164,364 L178,364 L180,288 Z', part: 'sol bacak', fill: '#1a1a24' },
        { d: 'M220,288 L222,364 L236,364 Q250,364 250,352 L244,288 Z', part: 'sağ bacak', fill: '#1a1a24' },
        { d: 'M149,338 L179,338 M221,338 L249,338', part: 'bacak bağları' },
      ],
    },
    {
      say: 'Sırtına çapraz duran bir katana kılıcı yerleştir. Omzun üstünden sapı görünsün.',
      shapes: [
        { d: 'M256,108 L286,72 L296,80 L266,116 Z', part: 'kılıç kabzası', fill: '#e63946' },
        { d: 'M250,103 L272,121', part: 'kılıç siperliği', fill: '#ffd23f' },
        { d: 'M146,268 L124,302 L116,296 L138,262 Z', part: 'kılıç kını ucu', fill: '#1a1a24' },
        { d: 'M176,198 L244,268', part: 'kılıç askısı' },
      ],
    },
    {
      say: 'Ninjanın yanına havada süzülen bir ninja yıldızı ve hız çizgileri ekle.',
      shapes: [
        {
          d: 'M110,224 L114,236 L126,240 L114,244 L110,256 L106,244 L94,240 L106,236 Z',
          part: 'ninja yıldızı',
          fill: '#94a3b8',
        },
        { d: circle(110, 240, 3), part: 'yıldız deliği', fill: '#2d3142' },
        { d: 'M82,232 Q94,240 84,248', part: 'hız çizgisi' },
      ],
    },
  ],
};

export default ninja;
