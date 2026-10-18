import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 24: Tombul pembe gövdeli, sevimli burunlu ve kıvrık kuyruklu domuzcuk. */
const domuz: Lesson = {
  id: 'domuz',
  path: 'hayvanlar',
  title: 'Tombul Domuz',
  emoji: '🐷',
  order: 24,
  level: 1,
  skill: 'Yuvarlak bir gövdeye burun deliği ve helezon kıvrık bir kuyruk eklemeyi öğrendin!',
  palette: ['#ffb3c6', '#ff8fab', '#fb6f92', '#ffe5ec', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce domuzcuğumuz için kocaman, yuvarlak ve tombul bir gövde çiz.',
      shapes: [
        {
          d: ellipse(200, 205, 115, 105),
          part: 'gövde',
          fill: '#ffb3c6',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne iki yana doğru kıvrılan sevimli kulaklar ekle.',
      shapes: [
        {
          d: 'M115,145 C100,90 145,80 155,115 C155,130 140,150 115,145 Z',
          part: 'sol kulak',
          fill: '#ff8fab',
        },
        {
          d: 'M125,135 C115,100 145,95 150,118 Z',
          part: 'sol kulak içi',
          fill: '#fb6f92',
        },
        {
          d: 'M285,145 C300,90 255,80 245,115 C245,130 260,150 285,145 Z',
          part: 'sağ kulak',
          fill: '#ff8fab',
        },
        {
          d: 'M275,135 C285,100 255,95 250,118 Z',
          part: 'sağ kulak içi',
          fill: '#fb6f92',
        },
      ],
    },
    {
      say: 'Yüzün tam ortasına yayvan bir burun ovali ve içine iki dik burun deliği çiz.',
      shapes: [
        {
          d: ellipse(200, 225, 45, 30),
          part: 'burun',
          fill: '#ff8fab',
        },
        {
          d: ellipse(186, 225, 6.5, 11),
          part: 'sol burun deliği',
          fill: '#2d2d2d',
        },
        {
          d: ellipse(214, 225, 6.5, 11),
          part: 'sağ burun deliği',
          fill: '#2d2d2d',
        },
      ],
    },
    {
      say: 'Burnun üstüne iki parlak göz, kenarlara pembe yanaklar ve alta tatlı bir gülümseme koy.',
      shapes: [
        { d: circle(150, 175, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(154, 171, 4), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(250, 175, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(254, 171, 4), part: 'sağ parıltı', fill: '#ffffff' },
        { d: ellipse(125, 220, 14, 9), part: 'sol yanak', fill: '#fb6f92' },
        { d: ellipse(275, 220, 14, 9), part: 'sağ yanak', fill: '#fb6f92' },
        { d: 'M185,268 Q200,280 215,268', part: 'gülümseme' },
      ],
    },
    {
      say: 'Gövdenin altına dört kısa tombul bacak ve minik toynak çizgileri çiz.',
      shapes: [
        {
          d: 'M142,295 L142,350 Q142,358 155,358 L172,358 Q182,358 182,350 L182,305 Z',
          part: 'sol ön bacak',
          fill: '#ff8fab',
        },
        { d: 'M162,342 L162,358', part: 'sol toynak çizgisi' },
        {
          d: 'M218,305 L218,350 Q218,358 228,358 L245,358 Q258,358 258,350 L258,295 Z',
          part: 'sağ ön bacak',
          fill: '#ff8fab',
        },
        { d: 'M238,342 L238,358', part: 'sağ toynak çizgisi' },
        {
          d: 'M95,265 C80,310 115,330 125,295 Z',
          part: 'sol arka bacak',
          fill: '#ff8fab',
        },
        {
          d: 'M305,265 C320,310 285,330 275,295 Z',
          part: 'sağ arka bacak',
          fill: '#ff8fab',
        },
      ],
    },
    {
      say: 'Son olarak domuzcuğumuza helezon gibi kıvrılan neşeli bir kuyruk ekle!',
      shapes: [
        {
          d: 'M312,215 C345,200 365,175 348,160 C332,145 318,170 338,185 C352,195 365,205 375,195',
          part: 'kıvrık kuyruk',
        },
        {
          d: ellipse(200, 282, 45, 16),
          part: 'karın aydınlığı',
          fill: '#ffe5ec',
        },
      ],
    },
  ],
};

export default domuz;
