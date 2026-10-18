import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 15: Sevimli Küçük At — Uzun boyun, rüzgarda dalgalanan yele, kuyruk ve dört bacak. */
const at: Lesson = {
  id: 'at',
  path: 'hayvanlar',
  title: 'Küçük At',
  emoji: '🐴',
  order: 15,
  level: 2,
  skill: 'Uzun boyun, gövde ve bacakları dengeli birleştirerek koşan sevimli bir at çizmeyi öğrendin!',
  palette: ['#c68b59', '#a46838', '#5c3d2e', '#f8d7da', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Atımızın gövdesi için ortada büyük, tombul bir oval çizelim.',
      shapes: [
        {
          d: ellipse(180, 240, 75, 48),
          part: 'gövde',
          fill: '#c68b59',
        },
      ],
    },
    {
      say: 'Gövdenin sağından yukarı doğru uzanan bir boyun ve ucuna sevimli bir kafa çizelim.',
      shapes: [
        {
          d: 'M210,210 L250,130 C265,115 315,115 325,140 C330,155 310,175 280,175 L255,235 Z',
          part: 'kafa ve boyun',
          fill: '#c68b59',
        },
      ],
    },
    {
      say: 'Kafanın üstüne iki dik kulak ve burnun ucuna açık renkli bir ağızlık ekleyelim.',
      shapes: [
        { d: 'M255,125 L260,85 L275,115 Z', part: 'sol kulak', fill: '#c68b59' },
        { d: 'M270,118 L280,82 L292,112 Z', part: 'sağ kulak', fill: '#a46838' },
        { d: 'M300,130 C318,125 330,140 325,155 C318,170 300,170 290,165 Z', part: 'burun', fill: '#f8d7da' },
        { d: circle(312, 145, 2.5), part: 'burun deliği', fill: '#5c3d2e' },
        { d: 'M308,156 Q315,160 320,155', part: 'ağız' },
      ],
    },
    {
      say: 'Gövdenin önünden aşağı iki düz bacak ve uçlarına toynaklar çizelim.',
      shapes: [
        { d: 'M220,270 L220,360 L238,360 L238,270', part: 'ön sol bacak', fill: '#c68b59' },
        { d: 'M220,345 L238,345 L238,360 L220,360 Z', part: 'ön sol toynak', fill: '#5c3d2e' },
        { d: 'M245,260 L245,355 L260,355 L260,260', part: 'ön sağ bacak', fill: '#a46838' },
        { d: 'M245,342 L260,342 L260,355 L245,355 Z', part: 'ön sağ toynak', fill: '#3d251a' },
      ],
    },
    {
      say: 'Gövdenin arkasına güçlü iki arka bacak ve toynaklarını ekleyelim.',
      shapes: [
        { d: 'M130,265 C120,290 120,320 120,360 L138,360 C138,320 145,295 155,275 Z', part: 'arka sol bacak', fill: '#c68b59' },
        { d: 'M120,345 L138,345 L138,360 L120,360 Z', part: 'arka sol toynak', fill: '#5c3d2e' },
        { d: 'M100,260 L95,355 L110,355 L118,260', part: 'arka sağ bacak', fill: '#a46838' },
        { d: 'M95,342 L110,342 L110,355 L95,355 Z', part: 'arka sağ toynak', fill: '#3d251a' },
      ],
    },
    {
      say: 'Boynun arkasından aşağı doğru dökülen dalgalı ve gür bir yele çizelim.',
      shapes: [
        {
          d: 'M255,100 C240,110 240,135 248,140 C235,145 235,170 245,180 C230,190 230,215 240,225 L220,215 C215,190 220,160 230,130 C235,115 245,105 255,100 Z',
          part: 'yele',
          fill: '#5c3d2e',
        },
        { d: 'M270,105 C265,95 280,95 285,110 Z', part: 'alın perçemi', fill: '#5c3d2e' },
      ],
    },
    {
      say: 'Gövdenin arkasından aşağı neşeyle sallanan uzun bir kuyruk ekleyelim.',
      shapes: [
        {
          d: 'M115,225 C80,220 50,260 55,310 C65,325 80,310 85,290 C95,270 105,255 125,245 Z',
          part: 'kuyruk',
          fill: '#5c3d2e',
        },
      ],
    },
    {
      say: 'Atımızın yüzüne ışıl ışıl bir göz, pembe bir yanak ve alnına beyaz bir yıldız konduralım.',
      shapes: [
        { d: circle(280, 132, 7), part: 'göz', fill: '#2d2d2d' },
        { d: circle(282, 130, 2.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: ellipse(275, 150, 7, 4), part: 'yanak', fill: '#ffb3c1' },
        { d: ellipse(292, 125, 4, 7), part: 'alın lekesi', fill: '#ffffff' },
      ],
    },
  ],
};

export default at;
