import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 10: Papyonlu, yumurta gövdeli tombul bir penguen. */
const penguen: Lesson = {
  id: 'penguen',
  path: 'hayvanlar',
  title: 'Penguen',
  emoji: '🐧',
  order: 10,
  level: 2,
  skill: 'Büyük bir yumurta şeklinin içine ikinci bir şekil çizerek iki renkli bir penguen yaptın!',
  palette: ['#3d4f73', '#ffffff', '#ffa630', '#ff5a6e', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir yumurta çiz. Üstü dar, altı geniş olsun. Bu penguenin gövdesi.',
      shapes: [
        {
          d: 'M200,55 C290,55 320,190 315,260 C310,330 260,345 200,345 C140,345 90,330 85,260 C80,190 110,55 200,55 Z',
          part: 'gövde',
          fill: '#3d4f73',
        },
      ],
    },
    {
      say: 'İçine beyaz bir yüz ve karın çiz. Üstte iki tümsek yap, sonra aşağı doğru genişlet.',
      shapes: [
        {
          d: 'M200,120 C185,90 130,90 125,140 C118,190 108,250 122,292 C136,324 170,332 200,332 C230,332 264,324 278,292 C292,250 282,190 275,140 C270,90 215,90 200,120 Z',
          part: 'yüz ve karın',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Gövdenin iki yanına aşağı doğru sivrilen kanatlar çiz. Penguen el sallıyor gibi!',
      shapes: [
        { d: 'M91.7,180 C60,200 40,260 50,290 C62,295 75,275 84.6,250', part: 'sol kanat', fill: '#3d4f73' },
        { d: 'M308.3,180 C340,200 360,260 350,290 C338,295 325,275 315.4,250', part: 'sağ kanat', fill: '#3d4f73' },
      ],
    },
    {
      say: 'Altına iki turuncu ayak, başının tepesine de kıvrık, minik bir perçem ekle.',
      shapes: [
        { d: 'M135,335.6 C116,374 188,380 185,344.6', part: 'sol ayak', fill: '#ffa630' },
        { d: 'M215,344.6 C212,380 284,374 265,335.6', part: 'sağ ayak', fill: '#ffa630' },
        { d: 'M190,55.5 Q176,26 210,24 Q192,38 212,56', part: 'perçem', fill: '#3d4f73' },
      ],
    },
    {
      say: 'Beyaz tümseklerin içine iki yuvarlak göz çiz. Minik beyaz parıltıları da ekle.',
      shapes: [
        { d: circle(163, 146, 15), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(237, 146, 15), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(168, 141, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(242, 141, 5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin arasına aşağı bakan turuncu bir gaga çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M182,166 Q200,156 218,166 Q210,182 200,190 Q190,182 182,166 Z', part: 'gaga', fill: '#ffa630' },
        { d: ellipse(145, 182, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(255, 182, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak boynuna şık bir papyon çiz. Ortaya bir daire, iki yanına üçgen gibi kanatlar!',
      shapes: [
        { d: 'M193,222 L170,207 Q163,222 170,237 Z', part: 'papyonun solu', fill: '#ff5a6e' },
        { d: 'M207,222 L230,207 Q237,222 230,237 Z', part: 'papyonun sağı', fill: '#ff5a6e' },
        { d: circle(200, 222, 8), part: 'papyon düğümü', fill: '#ff5a6e' },
      ],
    },
  ],
};

export default penguen;
