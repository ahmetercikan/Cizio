import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const balikciTeknesi: Lesson = {
  id: 'balikci-teknesi',
  path: 'tasitlar',
  title: 'Balıkçı Teknesi',
  emoji: '🚢',
  order: 20,
  level: 1,
  skill: 'Kamaralı bir tekne kurup olta, balık ağı ve dalgalarla sevimli bir balıkçı sahnesi çizmeyi öğrendin!',
  palette: ['#3a86ff', '#ff6b6b', '#ffffff', '#aee3ff', '#ffd166', '#2d2d2d'],
  steps: [
    {
      say: 'Önce balıkçı teknesinin gövdesini ve altındaki kırmızı şeridi çiz.',
      shapes: [
        {
          d: 'M65,210 L300,210 Q325,210 335,190 L330,235 Q320,280 270,280 L90,280 Q65,280 65,210 Z',
          part: 'tekne gövdesi',
          fill: '#3a86ff',
        },
        {
          d: 'M75,250 L315,250 Q305,280 270,280 L90,280 Q75,280 75,250 Z',
          part: 'alt şerit',
          fill: '#ff6b6b',
        },
      ],
    },
    {
      say: 'Güvertenin üstüne kaptan kamarasını ve siperliğini ekle.',
      shapes: [
        {
          d: 'M105,210 L105,135 Q105,130 115,130 L190,130 Q198,130 200,138 L200,210 Z',
          part: 'kaptan kamarası',
          fill: '#ffffff',
        },
        { d: 'M98,130 L207,130 L207,124 L98,124 Z', part: 'kamara siperliği', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Kamaraya pencereleri ve kenarına can simidini yerleştir.',
      shapes: [
        { d: 'M160,140 L192,140 L192,170 L160,170 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: 'M115,140 L148,140 L148,170 L115,170 Z', part: 'yan cam', fill: '#aee3ff' },
        { d: circle(132, 190, 11), part: 'can simidi halkası', fill: '#ffffff' },
        { d: circle(132, 190, 5), part: 'can simidi deliği', fill: '#3a86ff' },
        { d: 'M132,179 L132,185 M132,195 L132,201 M121,190 L127,190 M137,190 L143,190', part: 'can simidi şeritleri' },
      ],
    },
    {
      say: 'Tavanın üstüne telsiz direğini ve kırmızı bayrağı dik.',
      shapes: [
        { d: 'M150,124 L150,70', part: 'direk' },
        { d: 'M138,85 L162,85', part: 'çapraz çubuk' },
        { d: 'M150,70 L175,78 L150,86 Z', part: 'küçük bayrak', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Teknenin burnuna denize uzanan bir olta ve misina çiz.',
      shapes: [
        { d: 'M275,215 L350,140', part: 'olta kamışı' },
        { d: 'M350,140 Q365,220 355,270', part: 'misina' },
        { d: circle(355, 270, 5), part: 'şamandıra', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Arka tarafa balık ağını ve ucundaki sarı mantarları ekle.',
      shapes: [
        {
          d: 'M65,225 Q40,240 50,285 Q70,285 75,250 Z',
          part: 'balık ağı',
          fill: '#e8ecf2',
        },
        { d: 'M52,240 L70,270 M45,255 L65,280 M48,270 L60,250 M55,280 L73,260', part: 'ağ gözleri' },
        {
          d: `${circle(58, 230, 3)} ${circle(50, 245, 3)} ${circle(46, 260, 3)}`,
          part: 'ağ mantarları',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Teknenin altına deniz dalgalarını ve sudan sıçrayan balığı çiz.',
      shapes: [
        {
          d: 'M30,280 Q60,268 90,280 Q120,292 150,280 Q180,268 210,280 Q240,292 270,280 Q300,268 330,280 Q355,290 375,280',
          part: 'üst dalga',
        },
        {
          d: 'M40,305 Q80,295 120,305 Q160,315 200,305 Q240,295 280,305 Q320,315 360,305',
          part: 'alt dalga',
        },
        {
          d: 'M310,245 Q325,235 335,245 Q325,255 310,245 Z',
          part: 'balık gövdesi',
          fill: '#ffd166',
        },
        { d: 'M310,245 L300,240 L303,245 L300,250 Z', part: 'balık kuyruğu', fill: '#ffd166' },
        { d: circle(330, 244, 2), part: 'balık gözü', fill: '#2d2d2d' },
      ],
    },
  ],
};

export default balikciTeknesi;
