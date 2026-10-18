import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 19: Sahanda yumurta. Tava gövdesi, sap, dalgalı ak, sarı ve sevimli yüz. */
const kahvalti: Lesson = {
  id: 'kahvalti',
  path: 'nesneler',
  title: 'Sahanda Yumurta',
  emoji: '🍳',
  order: 19,
  level: 1,
  skill: 'Tavanın yuvarlak gövdesi ile sapını birleştirip dalgalı yumurta çizmeyi öğrendin!',
  palette: ['#2c3e50', '#7f8c8d', '#ecf0f1', '#f1c40f', '#ff7979', '#ffffff'],
  steps: [
    {
      say: 'Önce tavanın yuvarlak gövdesi için büyük ve düzgün bir daire çiz.',
      shapes: [{ d: circle(175, 190, 120), part: 'tava gövdesi', fill: '#2c3e50' }],
    },
    {
      say: 'Tavanın içine derinliğini gösteren biraz daha küçük bir daire yerleştir.',
      shapes: [{ d: circle(175, 190, 102), part: 'tava içi', fill: '#7f8c8d' }],
    },
    {
      say: 'Tavanın kenarına sağa doğru uzanan uzun bir sap ve ucuna asma deliği ekle.',
      shapes: [
        {
          d: 'M255,245 L345,315 C355,323 355,338 345,346 C337,354 322,354 314,346 L225,275 Z',
          part: 'tava sapı',
          fill: '#2c3e50',
        },
        { d: circle(332, 332, 7), part: 'asma deliği', fill: '#ffffff' },
      ],
    },
    {
      say: 'Tavanın ortasına kenarları kıvrım kıvrım yayılan bembeyaz yumurta akını çiz.',
      shapes: [
        {
          d: 'M135,145 Q175,128 210,142 Q245,158 242,192 Q248,230 215,245 Q168,258 135,240 Q105,220 112,185 Q110,155 135,145 Z',
          part: 'yumurta akı',
          fill: '#ecf0f1',
        },
      ],
    },
    {
      say: 'Yumurta akının tam ortasına tombul, sapsarı ve parlak bir yumurta sarısı kondur.',
      shapes: [
        { d: circle(175, 190, 32), part: 'yumurta sarısı', fill: '#f1c40f' },
        {
          d: 'M162,176 A18,18 0 0,1 188,176 A13,13 0 0,0 162,176 Z',
          part: 'sarının parıltısı',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Yumurta sarısına neşeli bir yüz ve beyazına minik karabiber taneleri serp!',
      shapes: [
        { d: circle(164, 188, 4), part: 'sol göz', fill: '#2c3e50' },
        { d: circle(186, 188, 4), part: 'sağ göz', fill: '#2c3e50' },
        { d: 'M168,197 Q175,204 182,197', part: 'gülen ağız' },
        { d: circle(158, 194, 3), part: 'sol yanak', fill: '#ff7979' },
        { d: circle(192, 194, 3), part: 'sağ yanak', fill: '#ff7979' },
        { d: circle(130, 168, 2), part: 'karabiber 1', fill: '#2c3e50' },
        { d: circle(222, 162, 2), part: 'karabiber 2', fill: '#2c3e50' },
        { d: circle(142, 222, 2), part: 'karabiber 3', fill: '#2c3e50' },
        { d: circle(212, 226, 2), part: 'karabiber 4', fill: '#2c3e50' },
      ],
    },
  ],
};

export default kahvalti;
