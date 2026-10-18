import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 21: Topuz saçlı, kabarık tütülü ve parmak ucunda dans eden balerin. */
const balerin: Lesson = {
  id: 'balerin',
  path: 'meslekler',
  title: 'Balerin',
  emoji: '🩰',
  order: 6,
  level: 3,
  skill: 'Topuz saçları, kabarık tütüsü ve parmak ucundaki zarif duruşuyla güzel bir balerin çizmeyi öğrendin!',
  palette: ['#f472b6', '#fbcfe8', '#ffe1cc', '#854d0e', '#ffffff', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce balerinin başının tepesindeki yuvarlak topuzunu ve pembe saç kurdelesini çiz.',
      shapes: [
        { d: circle(200, 68, 22), part: 'saç topuzu', fill: '#854d0e' },
        { d: ellipse(200, 78, 24, 6), part: 'saç bandı', fill: '#f472b6' },
        {
          d: 'M194,76 C190,72 190,64 195,64 C200,64 200,72 200,76 C200,72 200,64 205,64 C210,64 210,72 206,76 Z',
          part: 'topuz fiyonku',
          fill: '#fbcfe8',
        },
      ],
    },
    {
      say: 'Topuzun altına narin yüzünü, arkaya taranmış saçlarını ve incili küpelerini çiz.',
      shapes: [
        { d: circle(200, 130, 42), part: 'yüz', fill: '#ffe1cc' },
        {
          d: 'M160,125 C160,94 180,90 200,90 C220,90 240,94 240,125 C230,108 215,102 200,105 C185,102 170,108 160,125 Z',
          part: 'taranmış saç',
          fill: '#854d0e',
        },
        { d: 'M160,130 Q148,135 150,144 Q152,152 162,148', part: 'sol kulak', fill: '#ffe1cc' },
        { d: 'M240,130 Q252,135 250,144 Q248,152 238,148', part: 'sağ kulak', fill: '#ffe1cc' },
        { d: circle(149, 147, 2.5), part: 'sol inci küpe', fill: '#ffffff' },
        { d: circle(251, 147, 2.5), part: 'sağ inci küpe', fill: '#ffffff' },
      ],
    },
    {
      say: 'Zarif boynunu ve üzerine tam oturan pembe bale mayosunu çiz.',
      shapes: [
        { d: 'M192,168 L192,185 L208,185 L208,168', part: 'boyun' },
        { d: 'M180,185 L174,250 L226,250 L220,185 Z', part: 'bale mayosu', fill: '#f472b6' },
        { d: 'M180,185 Q190,196 200,190 Q210,196 220,185', part: 'mayo yakası' },
        { d: 'M200,190 L200,250', part: 'mayo dikişi' },
      ],
    },
    {
      say: 'Belinin iki yanına açılan kocaman, kabarık tütü eteğini ve fırfırlı kenarlarını çiz.',
      shapes: [
        {
          d: 'M174,250 C110,245 80,270 95,285 C140,295 260,295 305,285 C320,270 290,245 226,250 Z',
          part: 'tütü etek',
          fill: '#fbcfe8',
        },
        {
          d: 'M95,285 Q125,296 155,290 Q180,298 200,292 Q220,298 245,290 Q275,296 305,285',
          part: 'tütü fırfırı',
        },
        { d: 'M120,265 Q200,278 280,265', part: 'katman çizgisi' },
      ],
    },
    {
      say: 'Başının üstünde kuğu gibi kıvrılan zarif kolları ve parmakları çiz.',
      shapes: [
        {
          d: 'M180,188 C145,160 135,110 162,88 C168,85 174,90 170,96 C148,118 156,155 186,180 Z',
          part: 'sol zarif kol',
          fill: '#ffe1cc',
        },
        {
          d: 'M220,188 C255,160 265,110 238,88 C232,85 226,90 230,96 C252,118 244,155 214,180 Z',
          part: 'sağ zarif kol',
          fill: '#ffe1cc',
        },
        { d: ellipse(168, 88, 5, 4), part: 'sol el', fill: '#ffe1cc' },
        { d: ellipse(232, 88, 5, 4), part: 'sağ el', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Tütünün altından parmak ucuna kalkan dik bacakları çiz.',
      shapes: [
        { d: 'M188,275 L190,366 L200,366 L198,275 Z', part: 'sol bacak', fill: '#ffe1cc' },
        { d: 'M202,275 L210,358 L220,358 L212,275 Z', part: 'sağ bacak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Parmak uçlarında duran pembe bale patiklerini ve bileklere dolanan çapraz kurdeleleri çiz.',
      shapes: [
        { d: 'M189,364 L189,380 L201,380 L201,364 Z', part: 'sol bale patiği', fill: '#f472b6' },
        { d: 'M209,356 L209,372 L221,372 L221,356 Z', part: 'sağ bale patiği', fill: '#f472b6' },
        { d: 'M190,346 L200,356 M200,346 L190,356', part: 'sol patik kurdelesi' },
        { d: 'M210,338 L220,348 M220,338 L210,348', part: 'sağ patik kurdelesi' },
      ],
    },
    {
      say: 'Zarif gözler, uzun kirpikler, tatlı bir gülümseme ve pembe yanaklar ekle.',
      shapes: [
        { d: ellipse(182, 132, 7, 9), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(184, 129, 3), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(218, 132, 7, 9), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(220, 129, 3), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M174,127 L168,122 M226,127 L232,122', part: 'kirpikler' },
        { d: 'M192,145 Q200,152 208,145', part: 'gülümseme' },
        { d: ellipse(170, 142, 6, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(230, 142, 6, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Balerinin tütüsüne parıltılar ve etrafına süzülen müzik notaları ekleyerek resmi tamamla!',
      shapes: [
        { d: circle(86, 175, 4), part: 'sol nota gövdesi 1', fill: '#f472b6' },
        { d: circle(98, 170, 4), part: 'sol nota gövdesi 2', fill: '#f472b6' },
        { d: 'M90,175 L90,154 L102,149 L102,170', part: 'sol nota sapı' },
        { d: circle(320, 160, 4), part: 'sağ nota gövdesi', fill: '#f472b6' },
        { d: 'M324,160 L324,142 Q332,140 334,148', part: 'sağ nota sapı' },
        {
          d: 'M140,265 L142,270 L147,272 L142,274 L140,279 L138,274 L133,272 L138,270 Z',
          part: 'sol ışıltı',
          fill: '#ffffff',
        },
        {
          d: 'M260,268 L262,273 L267,275 L262,277 L260,282 L258,277 L253,275 L258,273 Z',
          part: 'sağ ışıltı',
          fill: '#ffffff',
        },
      ],
    },
  ],
};

export default balerin;
