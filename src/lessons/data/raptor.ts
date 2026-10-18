import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 10: Çevik koşan, orak pençeli sevimli bir Raptor. */
const raptor: Lesson = {
  id: 'raptor',
  path: 'dinozor',
  title: 'Hızlı Raptor',
  emoji: '🦖',
  order: 10,
  level: 2,
  skill: 'Dinozora koşan eğik bir duruş verip büyük orak pençesini havada çizdin. Çizimin çok enerjik oldu!',
  palette: ['#4db6ac', '#00897b', '#ffd54f', '#ff7043', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce sağ üste öne doğru uzanan çevik bir kafa ve burun çiz.',
      shapes: [
        {
          d: 'M250,135 C245,95 285,75 325,82 C355,88 375,108 375,128 C365,142 340,145 315,145 C285,145 265,155 250,135 Z',
          part: 'kafa',
          fill: '#4db6ac',
        },
        {
          d: 'M312,148 C338,148 360,146 368,136 C362,156 340,165 315,165 C295,165 282,156 278,148 Z',
          part: 'çene',
          fill: '#4db6ac',
        },
      ],
    },
    {
      say: 'Kafanın altından öne eğik, çevik ve ince bir gövde uzat.',
      shapes: [
        {
          d: 'M255,125 C230,135 195,170 170,210 C155,235 155,260 175,275 C205,290 235,270 248,240 C260,210 268,175 278,148 Z',
          part: 'gövde',
          fill: '#4db6ac',
        },
        {
          d: 'M195,215 C180,240 185,265 200,274 C220,278 238,260 244,235 C230,225 210,218 195,215 Z',
          part: 'karın',
          fill: '#ffd54f',
        },
      ],
    },
    {
      say: 'Gövdenin arkasından sola doğru dümdüz uzanan uzun bir kuyruk çiz.',
      shapes: [
        {
          d: 'M172,212 C130,215 80,205 30,190 C75,225 125,245 174,255 Z',
          part: 'kuyruk',
          fill: '#4db6ac',
        },
        {
          d: 'M30,190 C22,185 20,195 24,202 C40,206 55,212 70,220 Z',
          part: 'kuyruk tüyü',
          fill: '#ff7043',
        },
      ],
    },
    {
      say: 'Koşan iki güçlü bacak ve havaya kalkan büyük bir orak pençe çiz.',
      shapes: [
        {
          d: 'M165,245 C150,270 145,300 135,320 L155,320 C162,305 170,285 180,265 Z',
          part: 'arka uzak bacak',
          fill: '#00897b',
        },
        {
          d: 'M215,250 C235,275 220,310 210,345 L240,345 C252,315 255,280 238,245 Z',
          part: 'arka yakın bacak',
          fill: '#4db6ac',
        },
        {
          d: 'M210,345 C195,335 192,318 205,310 C208,322 218,332 230,335 Z',
          part: 'orak pençe',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Göğsüne öne uzanan iki ince kol ve minik pençeler ekle.',
      shapes: [
        {
          d: 'M250,185 C270,190 285,185 298,178 L306,184 L298,188 L305,193 L292,194 C278,202 262,202 248,198 Z',
          part: 'sağ kol',
          fill: '#4db6ac',
        },
        {
          d: 'M235,195 C248,202 258,205 270,202 L275,208 L268,211 L274,215 L263,216 C252,218 242,214 232,206 Z',
          part: 'sol kol',
          fill: '#00897b',
        },
      ],
    },
    {
      say: 'Kafasına keskin ama sevimli bir göz ve neşeli dişler çiz.',
      shapes: [
        { d: circle(310, 108, 12), part: 'göz', fill: '#2d2d2d' },
        { d: circle(313, 105, 4), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(358, 106, 3), part: 'burun deliği', fill: '#2d2d2d' },
        { d: 'M320,145 L325,152 L330,145 L335,152 L340,145 L345,152 L350,145', part: 'dişler' },
        { d: ellipse(285, 125, 9, 6), part: 'yanak', fill: '#ff7043' },
      ],
    },
    {
      say: 'Son olarak kafasına ve sırtına renkli hız tüyleri ekle.',
      shapes: [
        {
          d: 'M265,95 C250,70 230,70 215,82 C235,90 248,102 255,115 Z',
          part: 'tüy ibik',
          fill: '#ff7043',
        },
        {
          d: 'M230,145 C215,130 195,135 185,148 C200,152 215,160 220,170 Z',
          part: 'sırt tüyü',
          fill: '#ff7043',
        },
        { d: 'M170,225 Q185,220 200,228', part: 'desen' },
      ],
    },
  ],
};

export default raptor;
