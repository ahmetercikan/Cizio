import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 11: Timsah burunlu ve devasa sırt yelkenli Spinozor. */
const spinozor: Lesson = {
  id: 'spinozor',
  path: 'dinozor',
  title: 'Yelkenli Spinozor',
  emoji: '🦕',
  order: 11,
  level: 3,
  skill: 'Sırtına devasa bir yelken ve timsah gibi uzun bir çene çizdin. Büyük şekilleri orantılamak harika bir ustalıktır!',
  palette: ['#3b82f6', '#1d4ed8', '#f97316', '#fdba74', '#fef08a', '#2d2d2d'],
  steps: [
    {
      say: 'Önce sağa doğru uzanan timsah gibi uzun bir kafa çiz.',
      shapes: [
        {
          d: 'M240,180 C240,145 275,140 310,148 C345,155 375,158 385,170 C380,185 350,185 320,182 C290,180 260,195 240,180 Z',
          part: 'kafa',
          fill: '#3b82f6',
        },
      ],
    },
    {
      say: 'Kafanın altına uzun ve güçlü bir alt çene ekle.',
      shapes: [
        {
          d: 'M265,190 C300,188 340,188 375,176 C370,195 345,202 310,202 C285,202 265,198 255,192 Z',
          part: 'alt çene',
          fill: '#3b82f6',
        },
      ],
    },
    {
      say: 'Kafanın arkasından sola doğru uzanan güçlü bir gövde çiz.',
      shapes: [
        {
          d: 'M245,160 C210,165 180,195 150,230 C130,255 140,285 175,295 C220,305 260,280 270,240 C275,210 265,185 255,165 Z',
          part: 'gövde',
          fill: '#3b82f6',
        },
      ],
    },
    {
      say: 'Gövdenin arkasından sola doğru uzanan geniş ve yassı bir kuyruk çiz.',
      shapes: [
        {
          d: 'M155,232 C115,225 75,220 25,230 C65,258 110,280 165,285 Z',
          part: 'kuyruk',
          fill: '#3b82f6',
        },
      ],
    },
    {
      say: 'Şimdi sırtın üstüne devasa, yarım daire gibi büyük bir yelken çiz.',
      shapes: [
        {
          d: 'M145,230 C135,165 155,75 205,65 C250,55 275,115 260,215 Z',
          part: 'yelken',
          fill: '#f97316',
        },
      ],
    },
    {
      say: 'Yelkenin içine yukarı doğru uzanan ışın çizgileri ve desenler çiz.',
      shapes: [
        { d: 'M155,215 C160,160 170,120 180,80', part: 'yelken ışını' },
        { d: 'M180,200 C190,140 195,100 205,65', part: 'yelken ışını' },
        { d: 'M210,195 C218,140 225,100 230,72', part: 'yelken ışını' },
        { d: 'M240,200 C245,150 250,115 252,95', part: 'yelken ışını' },
        { d: 'M155,145 Q205,120 252,140', part: 'yelken deseni' },
      ],
    },
    {
      say: 'Gövdenin altına iki güçlü bacak ve öne uzanan bir kol çiz.',
      shapes: [
        {
          d: 'M165,275 C160,305 150,335 140,355 L170,355 C180,335 190,305 195,285 Z',
          part: 'arka bacak',
          fill: '#1d4ed8',
        },
        {
          d: 'M235,270 C240,300 240,330 235,355 L265,355 C275,330 275,295 265,265 Z',
          part: 'ön bacak',
          fill: '#3b82f6',
        },
        {
          d: 'M265,220 C285,225 300,235 305,248 L295,252 L302,256 L288,256 C275,250 265,240 258,230 Z',
          part: 'ön kol',
          fill: '#1d4ed8',
        },
      ],
    },
    {
      say: 'Karnına açık renkli bir göbek, kuyruğun üstüne de küçük yüzgeç ekle.',
      shapes: [
        {
          d: 'M180,250 C185,275 205,290 235,288 C255,275 258,255 255,240 C235,245 205,245 180,250 Z',
          part: 'karın',
          fill: '#fef08a',
        },
        {
          d: 'M145,232 C110,218 70,215 35,222 C70,228 105,230 135,236 Z',
          part: 'kuyruk yüzgeci',
          fill: '#fdba74',
        },
      ],
    },
    {
      say: 'Son olarak parlak bir göz, burun deliği ve timsah dişleri çiz.',
      shapes: [
        { d: circle(275, 160, 11), part: 'göz', fill: '#2d2d2d' },
        { d: circle(273, 157, 3.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(365, 162, 3), part: 'burun deliği', fill: '#2d2d2d' },
        {
          d: 'M285,182 L292,190 L300,182 L308,190 L316,182 L324,190 L332,182 L340,190 L348,182 L356,190 L364,180',
          part: 'dişler',
        },
        { d: ellipse(262, 175, 8, 5), part: 'yanak', fill: '#fdba74' },
      ],
    },
  ],
};

export default spinozor;
