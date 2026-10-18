import type { Lesson } from '../types';

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 17: Katlı sandviç. Ekmekler, marul, köfte, sarkan peynir, domates ve susamlar. */
const sandvic: Lesson = {
  id: 'sandvic',
  path: 'nesneler',
  title: 'Katlı Sandviç',
  emoji: '🥪',
  order: 17,
  level: 1,
  skill: 'Farklı şekilleri üst üste dizerek lezzetli katmanlar oluşturmayı öğrendin!',
  palette: ['#e1a35f', '#78e08f', '#c87f3b', '#fed330', '#e55039', '#fffae6'],
  steps: [
    {
      say: 'Önce sandviçin tabanı için geniş ve yumuşak bir alt ekmek dilimi çiz.',
      shapes: [{ d: 'M70,310 Q200,325 330,310 L320,350 Q200,368 80,350 Z', part: 'alt ekmek', fill: '#e1a35f' }],
    },
    {
      say: 'Ekmeğin üzerine kenarları kıvrım kıvrım taptaze bir marul yaprağı ser.',
      shapes: [
        {
          d: 'M60,285 Q75,270 95,285 Q115,270 135,285 Q155,270 175,285 Q195,270 215,285 Q235,270 255,285 Q275,270 295,285 Q315,270 340,285 L330,312 Q200,326 70,312 Z',
          part: 'kıvırcık marul',
          fill: '#78e08f',
        },
      ],
    },
    {
      say: 'Marulun üstüne doyurucu ve kalın bir köfte katmanı yerleştir.',
      shapes: [{ d: 'M75,260 Q200,270 325,260 L325,286 Q200,296 75,286 Z', part: 'köfte', fill: '#c87f3b' }],
    },
    {
      say: 'Köftenin üzerine kenarlarından aşağı üçgen uçları sarkan sarı peynir koy.',
      shapes: [
        {
          d: 'M65,246 L335,246 L320,266 L260,266 L240,292 L220,266 L160,266 L140,296 L120,266 L80,266 Z',
          part: 'eriyen peynir',
          fill: '#fed330',
        },
      ],
    },
    {
      say: 'Peynirin üzerine iki dilim sulu kırmızı domates ekle.',
      shapes: [
        { d: ellipse(140, 226, 55, 18), part: 'sol domates', fill: '#e55039' },
        { d: ellipse(260, 226, 55, 18), part: 'sağ domates', fill: '#e55039' },
      ],
    },
    {
      say: 'Tüm bu lezzetlerin üstünü kubbe gibi kabarık üst ekmekle kapat.',
      shapes: [
        { d: 'M68,220 Q200,115 332,220 Q200,236 68,220 Z', part: 'üst ekmek', fill: '#e1a35f' },
      ],
    },
    {
      say: 'Son olarak üst ekmeğin üzerine minik susam taneleri serp!',
      shapes: [
        { d: 'M135,170 Q142,165 146,172 Q139,177 135,170 Z', part: 'susam 1', fill: '#fffae6' },
        { d: 'M195,148 Q202,143 206,150 Q199,155 195,148 Z', part: 'susam 2', fill: '#fffae6' },
        { d: 'M255,165 Q262,160 266,167 Q259,172 255,165 Z', part: 'susam 3', fill: '#fffae6' },
        { d: 'M165,190 Q172,185 176,192 Q169,197 165,190 Z', part: 'susam 4', fill: '#fffae6' },
        { d: 'M225,188 Q232,183 236,190 Q229,195 225,188 Z', part: 'susam 5', fill: '#fffae6' },
      ],
    },
  ],
};

export default sandvic;
