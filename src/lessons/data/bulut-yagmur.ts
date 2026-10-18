import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const bulutYagmur: Lesson = {
  id: 'bulut-yagmur',
  path: 'doga',
  title: 'Yağmurlu Bulut',
  emoji: '🌧️',
  order: 17,
  level: 1,
  skill: 'Tombul bir bulut ve altındaki şemsiyeyle eğlenceli bir yağmur günü çizdin!',
  palette: ['#bde0fe', '#48cae4', '#ff4d6d', '#ffb703', '#1d3557', '#a2d2ff'],
  steps: [
    {
      say: 'Sayfanın üst kısmına kabarık, tombul tümsekleri olan büyük bir bulut çiz.',
      shapes: [
        {
          d: 'M110,140 C80,140 70,105 95,90 C90,65 125,55 155,70 C175,45 225,45 245,70 C275,55 310,65 305,90 C330,105 320,140 290,140 Q200,146 110,140 Z',
          part: 'yağmur bulutu',
          fill: '#bde0fe',
        },
      ],
    },
    {
      say: 'Bulutumuza iki mutlu göz ve tatlı bir gülümseme ekle.',
      shapes: [
        { d: circle(170, 102, 6), part: 'sol göz', fill: '#1d3557' },
        { d: circle(230, 102, 6), part: 'sağ göz', fill: '#1d3557' },
        { d: circle(168, 100, 2), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(228, 100, 2), part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M188,116 Q200,126 212,116', part: 'gülümseme' },
        { d: ellipse(152, 114, 8, 5), part: 'sol yanak', fill: '#ffafcc' },
        { d: ellipse(248, 114, 8, 5), part: 'sağ yanak', fill: '#ffafcc' },
      ],
    },
    {
      say: 'Bulutun altından aşağıya doğru süzülen damla damla yağmurlar çiz.',
      shapes: [
        { d: 'M125,170 C120,180 115,190 125,195 C135,190 130,180 125,170 Z', part: 'yağmur damlası', fill: '#48cae4' },
        { d: 'M165,190 C160,200 155,210 165,215 C175,210 170,200 165,190 Z', part: 'yağmur damlası', fill: '#48cae4' },
        { d: 'M200,165 C195,175 190,185 200,190 C210,185 205,175 200,165 Z', part: 'yağmur damlası', fill: '#48cae4' },
        { d: 'M235,190 C230,200 225,210 235,215 C245,210 240,200 235,190 Z', part: 'yağmur damlası', fill: '#48cae4' },
        { d: 'M275,170 C270,180 265,190 275,195 C285,190 280,180 275,170 Z', part: 'yağmur damlası', fill: '#48cae4' },
      ],
    },
    {
      say: 'Bulutun altına yağmurdan koruyan geniş, kubbe gibi bir şemsiye çiz.',
      shapes: [
        {
          d: 'M110,285 C110,230 290,230 290,285 Q260,274 230,285 Q200,274 170,285 Q140,274 110,285 Z',
          part: 'şemsiye kubbesi',
          fill: '#ff4d6d',
        },
      ],
    },
    {
      say: 'Şemsiyenin tepesine minik bir uç ve kubbesine kavisli dilimler ekle.',
      shapes: [
        { d: 'M197,235 L197,222 L203,222 L203,235 Z', part: 'şemsiye ucu', fill: '#ffb703' },
        { d: 'M200,235 Q176,256 170,285', part: 'şemsiye çizgisi' },
        { d: 'M200,235 Q224,256 230,285', part: 'şemsiye çizgisi' },
      ],
    },
    {
      say: 'Şemsiyenin altına kıvrık bir kulp çiz ve yere sıçrayan su damlaları ekle.',
      shapes: [
        {
          d: 'M197,280 L197,344 C197,362 176,362 176,344 C176,338 182,338 182,344 C182,356 191,356 191,344 L191,280 Z',
          part: 'şemsiye sapı',
          fill: '#8d99ae',
        },
        { d: 'M90,368 Q130,360 170,368 Q130,376 90,368 Z', part: 'su birikintisi', fill: '#a2d2ff' },
        { d: 'M230,370 Q270,362 310,370 Q270,378 230,370 Z', part: 'su birikintisi', fill: '#a2d2ff' },
      ],
    },
  ],
};

export default bulutYagmur;
