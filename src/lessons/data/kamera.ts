import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 16: Fotoğraf makinesi. Dikdörtgen gövde, tepe kontrolleri ve katmanlı objektif. */
const kamera: Lesson = {
  id: 'kamera',
  path: 'nesneler',
  title: 'Fotoğraf Makinesi',
  emoji: '📷',
  order: 16,
  level: 2,
  skill: 'Yuvarlatılmış dikdörtgen gövdeye halkalar ekleyerek gerçekçi bir lens çizmeyi öğrendin!',
  palette: ['#4b7bec', '#3867d6', '#a5b1c2', '#4b6584', '#fed330', '#2d3436', '#ffffff'],
  steps: [
    {
      say: 'Önce fotoğraf makinesinin gövdesi için köşeleri yuvarlatılmış geniş bir dikdörtgen çiz.',
      shapes: [
        {
          d: 'M72,145 L328,145 Q350,145 350,167 L350,313 Q350,335 328,335 L72,335 Q50,335 50,313 L50,167 Q50,145 72,145 Z',
          part: 'kamera gövdesi',
          fill: '#4b7bec',
        },
      ],
    },
    {
      say: 'Gövdenin tepesine vizör çıkıntısını, deklanşör düğmesini ve ayar çarkını ekle.',
      shapes: [
        { d: 'M145,145 L160,115 L240,115 L255,145 Z', part: 'vizör çıkıntısı', fill: '#3867d6' },
        { d: 'M80,145 L80,125 L115,125 L115,145 Z', part: 'deklanşör düğmesi', fill: '#a5b1c2' },
        { d: 'M285,145 L285,130 L320,130 L320,145 Z', part: 'ayar çarkı', fill: '#a5b1c2' },
      ],
    },
    {
      say: 'Gövdenin köşesine parlayan flaşı ve ortadaki vizör penceresini yerleştir.',
      shapes: [
        { d: 'M270,165 L325,165 L325,190 L270,190 Z', part: 'flaş lambası', fill: '#fed330' },
        { d: circle(297, 177, 6), part: 'flaş ampulü', fill: '#ffffff' },
        { d: 'M180,122 L220,122 L220,138 L180,138 Z', part: 'vizör penceresi', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gövdenin tam ortasına objektifin büyük yuvarlak çerçevesini çiz.',
      shapes: [{ d: circle(200, 240, 70), part: 'dış lens çerçevesi', fill: '#a5b1c2' }],
    },
    {
      say: 'Objektifin içine doğru derinleşen iki yuvarlak halka daha ekle.',
      shapes: [
        { d: circle(200, 240, 54), part: 'orta lens halkası', fill: '#4b6584' },
        { d: circle(200, 240, 38), part: 'lens camı', fill: '#2d3436' },
      ],
    },
    {
      say: 'Objektif camına ışıl ışıl parlayan iki beyaz ışık yansıması kondur.',
      shapes: [
        {
          d: 'M178,220 A26,26 0 0,1 222,220 A20,20 0 0,0 178,220 Z',
          part: 'büyük lens yansıması',
          fill: '#ffffff',
        },
        { d: circle(222, 252, 5), part: 'küçük lens yansıması', fill: '#ffffff' },
      ],
    },
    {
      say: 'Son olarak gövdenin soluna tutmayı kolaylaştıran dokulu kavrama bandını ekle!',
      shapes: [
        { d: 'M65,185 L105,185 L105,295 L65,295 Z', part: 'kavrama bandı', fill: '#3867d6' },
        { d: 'M72,215 L98,215', part: 'doku çizgisi 1' },
        { d: 'M72,240 L98,240', part: 'doku çizgisi 2' },
        { d: 'M72,265 L98,265', part: 'doku çizgisi 3' },
      ],
    },
  ],
};

export default kamera;
