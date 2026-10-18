import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 19: Çizgili tişörtlü, denizci şapkalı ve dümen tutan minik denizci. */
const denizci: Lesson = {
  id: 'denizci',
  path: 'karakterler',
  title: 'Minik Denizci',
  emoji: '⚓',
  order: 19,
  level: 2,
  skill: 'Mavi-beyaz çizgili tişörtü, denizci şapkası ve gemi dümeniyle denizlere açılan sevimli bir denizci çizmeyi öğrendin!',
  palette: ['#1e3a8a', '#ffffff', '#b45309', '#ef4444', '#ffd23f', '#ffe1cc', '#2d2d2d'],
  steps: [
    {
      say: 'Önce denizcinin beyaz şapkasını, koyu mavi bandını ve arkaya uçuşan kurdelesini çiz.',
      shapes: [
        {
          d: 'M145,130 C140,82 260,82 255,130 Z',
          part: 'şapka tepesi',
          fill: '#ffffff',
        },
        {
          d: 'M136,126 Q200,138 264,126 L265,142 Q200,154 135,142 Z',
          part: 'şapka bandı',
          fill: '#1e3a8a',
        },
        {
          d: 'M264,134 Q286,130 298,122 Q288,142 265,142 Z',
          part: 'şapka kurdelesi',
          fill: '#1e3a8a',
        },
        {
          d: 'M200,130 L200,138 M197,133 L203,133 M197,137 Q200,141 203,137',
          part: 'çapa işlemesi',
        },
      ],
    },
    {
      say: 'Şapkanın altına güler yüzlü bir çene ve yanlarına iki sevimli kulak ekle.',
      shapes: [
        { d: 'M144,148 Q144,222 200,222 Q256,222 256,148', part: 'yüz', fill: '#ffe1cc' },
        { d: 'M142,172 Q126,176 128,190 Q130,200 144,195', part: 'sol kulak', fill: '#ffe1cc' },
        { d: 'M258,172 Q274,176 272,190 Q270,200 256,195', part: 'sağ kulak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Kafanın altına beyaz tişörtü, kırmızı fuları ve lacivert çizgilerini çiz.',
      shapes: [
        { d: 'M162,218 L142,305 L258,305 L238,218 Z', part: 'tişört', fill: '#ffffff' },
        { d: 'M180,218 L200,246 L220,218', part: 'kırmızı fular', fill: '#ef4444' },
        { d: 'M156,250 L244,250 L243,258 L157,258 Z', part: 'üst çizgi', fill: '#1e3a8a' },
        { d: 'M150,270 L250,270 L248,278 L152,278 Z', part: 'orta çizgi', fill: '#1e3a8a' },
        { d: 'M144,290 L256,290 L255,298 L145,298 Z', part: 'alt çizgi', fill: '#1e3a8a' },
      ],
    },
    {
      say: 'Denizcinin yanına ahşap bir gemi dümeni çiz. Parmaklıkları çemberin dışına taşsın.',
      shapes: [
        {
          d: 'M285,237 A38,38 0 1,0 285,313 A38,38 0 1,0 285,237 M285,247 A28,28 0 1,1 285,303 A28,28 0 1,1 285,247 Z',
          part: 'dümen çemberi',
          fill: '#b45309',
        },
        { d: circle(285, 275, 11), part: 'dümen göbeği', fill: '#ffd23f' },
        { d: 'M285,224 L285,326', part: 'dikey parmaklık' },
        { d: 'M234,275 L336,275', part: 'yatay parmaklık' },
        { d: 'M249,239 L321,311', part: 'sağ çapraz parmaklık' },
        { d: 'M249,311 L321,239', part: 'sol çapraz parmaklık' },
      ],
    },
    {
      say: 'Dümeni sımsıkı tutan iki kol ve denizcinin ellerini ekle.',
      shapes: [
        { d: 'M165,225 L215,255 A8,8 0 0,0 226,245 L176,218', part: 'sol kol', fill: '#ffffff' },
        { d: circle(224, 252, 5), part: 'sol el', fill: '#ffe1cc' },
        { d: 'M235,225 L268,245 A8,8 0 0,0 274,235 L242,218', part: 'sağ kol', fill: '#ffffff' },
        { d: circle(272, 240, 5), part: 'sağ el', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Tişörtün altına lacivert pantolonu ve beyaz güverte ayakkabılarını çiz.',
      shapes: [
        {
          d: 'M150,305 L146,358 L186,358 L198,328 L210,358 L250,358 L246,305 Z',
          part: 'pantolon',
          fill: '#1e3a8a',
        },
        { d: 'M148,303 L248,303 L247,312 L149,312 Z', part: 'kemer', fill: '#ffd23f' },
        { d: ellipse(166, 365, 14, 7), part: 'sol ayakkabı', fill: '#ffffff' },
        { d: ellipse(230, 365, 14, 7), part: 'sağ ayakkabı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Güler yüzlü gözler, neşeli bir gülümseme ve yanaklarına sevimli çiller ekle.',
      shapes: [
        { d: ellipse(176, 182, 9, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(179, 177, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(224, 182, 9, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(227, 177, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M186,204 Q200,216 214,204', part: 'gülümseme' },
        { d: ellipse(160, 202, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 202, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default denizci;
