import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 11: Dilim pizza. Üçgen taban, çıtır kenar ve lezzetli malzemeler. */
const pizza: Lesson = {
  id: 'pizza',
  path: 'nesneler',
  title: 'Dilim Pizza',
  emoji: '🍕',
  order: 11,
  level: 1,
  skill: 'Üçgen bir dilim çizip üzerine peynir akıntıları ve lezzetli malzemeler eklemeyi öğrendin!',
  palette: ['#ffd666', '#e89547', '#fffae6', '#d63031', '#2d3436', '#2ed763'],
  steps: [
    {
      say: 'Önce pizzanın üçgen dilimini çiz. Ucu aşağı baksın, üst tarafı hafif kavisli olsun.',
      shapes: [{ d: 'M200,360 L70,110 Q200,70 330,110 Z', part: 'dilim gövdesi', fill: '#ffd666' }],
    },
    {
      say: 'Dilimin üst kısmına puf puf kabarmış kalın ve çıtır bir pizza kenarı ekle.',
      shapes: [
        {
          d: 'M65,115 Q200,65 335,115 Q345,90 330,75 Q200,35 70,75 Q55,90 65,115 Z',
          part: 'pizza kenarı',
          fill: '#e89547',
        },
      ],
    },
    {
      say: 'Kenarın hemen altına eriyip aşağı doğru dalgalanan lezzetli peynir katmanını çiz.',
      shapes: [
        {
          d: 'M70,115 Q105,145 130,120 Q160,160 190,125 Q225,165 260,125 Q295,150 330,115 Q200,75 70,115 Z',
          part: 'erimiş peynir',
          fill: '#fffae6',
        },
      ],
    },
    {
      say: 'Peynirin üzerine yuvarlak ve kırmızı sucuk dilimleri yerleştir.',
      shapes: [
        { d: circle(160, 185, 22), part: 'sol sucuk', fill: '#d63031' },
        { d: circle(240, 205, 20), part: 'sağ sucuk', fill: '#d63031' },
        { d: circle(195, 275, 18), part: 'alt sucuk', fill: '#d63031' },
      ],
    },
    {
      say: 'Dilimin aralarına ortası delik siyah zeytin halkaları ekle.',
      shapes: [
        { d: circle(135, 240, 12), part: 'sol zeytin', fill: '#2d3436' },
        { d: circle(135, 240, 5), part: 'sol zeytin deliği', fill: '#ffd666' },
        { d: circle(255, 160, 12), part: 'sağ üst zeytin', fill: '#2d3436' },
        { d: circle(255, 160, 5), part: 'sağ üst zeytin deliği', fill: '#ffd666' },
        { d: circle(225, 260, 11), part: 'sağ alt zeytin', fill: '#2d3436' },
        { d: circle(225, 260, 5), part: 'sağ alt zeytin deliği', fill: '#ffd666' },
      ],
    },
    {
      say: 'Son olarak pizzanın üzerine kıvrık yeşil biber dilimleri serp.',
      shapes: [
        { d: 'M120,155 Q145,145 155,165 Q140,175 120,155 Z', part: 'üst biber', fill: '#2ed763' },
        { d: 'M210,230 Q235,220 240,245 Q225,250 210,230 Z', part: 'orta biber', fill: '#2ed763' },
        { d: 'M160,305 Q180,295 185,320 Q170,325 160,305 Z', part: 'alt biber', fill: '#2ed763' },
      ],
    },
  ],
};

export default pizza;
