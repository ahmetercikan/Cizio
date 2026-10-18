import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 14: Çalar saat. Yuvarlak gövde, çanlar, ayaklar, akrep ve yelkovan. */
const saat: Lesson = {
  id: 'saat',
  path: 'nesneler',
  title: 'Çalar Saat',
  emoji: '⏰',
  order: 14,
  level: 1,
  skill: 'Daireden saat kadranı yapıp çanlar, akrep ve yelkovan yerleştirmeyi öğrendin!',
  palette: ['#ff4757', '#ffffff', '#ffa502', '#2f3542', '#ced6e0'],
  steps: [
    {
      say: 'Önce saatin yuvarlak gövdesi için büyük ve düzgün bir daire çiz.',
      shapes: [{ d: circle(200, 220, 105), part: 'saat kasası', fill: '#ff4757' }],
    },
    {
      say: 'Gövdenin içine zamanı göstereceğimiz beyaz bir iç daire yerleştir.',
      shapes: [{ d: circle(200, 220, 85), part: 'kadran', fill: '#ffffff' }],
    },
    {
      say: 'Saatin tepesine sağa ve sola iki sevimli çalar çan ekle.',
      shapes: [
        { d: 'M95,140 C85,95 135,75 160,110 Z', part: 'sol çan', fill: '#ffa502' },
        { d: 'M125,135 L140,152', part: 'sol çan desteği' },
        { d: 'M240,110 C265,75 315,95 305,140 Z', part: 'sağ çan', fill: '#ffa502' },
        { d: 'M275,135 L260,152', part: 'sağ çan desteği' },
      ],
    },
    {
      say: 'Çanların arasına zili çalan minik çekici ve tutma kulpunu çiz.',
      shapes: [
        { d: 'M160,115 C160,75 240,75 240,115', part: 'tutma kulpu' },
        { d: 'M200,125 L200,105', part: 'tokmak sapı' },
        { d: circle(200, 100, 7), part: 'çan tokmağı', fill: '#ced6e0' },
      ],
    },
    {
      say: 'Saatin masada dengede durabilmesi için altına iki küçük ayak yerleştir.',
      shapes: [
        { d: 'M120,310 L95,355 L120,360 L145,320 Z', part: 'sol ayak', fill: '#ffa502' },
        { d: 'M280,310 L305,355 L280,360 L255,320 Z', part: 'sağ ayak', fill: '#ffa502' },
      ],
    },
    {
      say: 'Kadranın dört bir yanına 12, 3, 6 ve 9 saat işaretlerini koy.',
      shapes: [
        { d: circle(200, 150, 5), part: '12 işareti', fill: '#2f3542' },
        { d: circle(270, 220, 5), part: '3 işareti', fill: '#2f3542' },
        { d: circle(200, 290, 5), part: '6 işareti', fill: '#2f3542' },
        { d: circle(130, 220, 5), part: '9 işareti', fill: '#2f3542' },
      ],
    },
    {
      say: 'Son olarak saatin tam ortasına zamanı gösteren akrep ve yelkovanı çiz!',
      shapes: [
        { d: circle(200, 220, 6), part: 'orta vida', fill: '#2f3542' },
        { d: 'M196,224 L160,184 L168,176 L204,216 Z', part: 'akrep', fill: '#2f3542' },
        { d: 'M197,222 L245,160 L251,165 L203,227 Z', part: 'yelkovan', fill: '#ff4757' },
      ],
    },
  ],
};

export default saat;
