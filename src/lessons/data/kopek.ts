import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 7: Sarkık kulaklı, oturan sevimli bir yavru köpek. */
const kopek: Lesson = {
  id: 'kopek',
  path: 'hayvanlar',
  title: 'Sadık Köpek',
  emoji: '🐶',
  order: 7,
  level: 1,
  skill: 'Gövdeyi önce, kafayı üstüne çizdin. Sarkık kulaklarla köpeğine sevimli bir hava verdin!',
  palette: ['#e9b77c', '#a86b3c', '#fff3e0', '#ff7f9c', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce gövde için büyük bir U çiz. Soldan aşağı in, altı düz olsun, sağda yukarı çık.',
      shapes: [{ d: 'M140,215.6 C95,250 92,350 150,350 L250,350 C308,350 305,250 260,215.6', part: 'gövde', fill: '#e9b77c' }],
    },
    {
      say: 'U harfinin iki ucuna değen kocaman, yayvan bir oval çiz. Bu köpeğin kafası.',
      shapes: [{ d: ellipse(200, 150, 100, 82), part: 'kafa', fill: '#e9b77c' }],
    },
    {
      say: 'Kafanın iki yanından aşağı sarkan uzun kulaklar çiz. Damla gibi düşün!',
      shapes: [
        { d: 'M118,103.1 C78,90 48,140 58,200 C64,240 106,248 116.4,195', part: 'sol kulak', fill: '#a86b3c' },
        { d: 'M282,103.1 C322,90 352,140 342,200 C336,240 294,248 283.6,195', part: 'sağ kulak', fill: '#a86b3c' },
      ],
    },
    {
      say: 'Gövdenin altına iki tombul pati, sağ yanına da yukarı kalkan sallanan bir kuyruk ekle.',
      shapes: [
        { d: 'M136,350 C122,382 194,384 188,350', part: 'sol pati', fill: '#e9b77c' },
        { d: 'M212,350 C206,384 278,382 264,350', part: 'sağ pati', fill: '#e9b77c' },
        { d: 'M293.4,300 C335,298 352,262 345,228 C333,252 318,266 291.2,270', part: 'kuyruk', fill: '#a86b3c' },
      ],
    },
    {
      say: 'Göğsüne açık renkli bir oval, yüzün altına bir burun ovali, sol göz olacak yere de bir leke çiz.',
      shapes: [
        { d: ellipse(200, 295, 48, 42), part: 'göğüs', fill: '#fff3e0' },
        { d: ellipse(200, 192, 42, 30), part: 'burun ovali', fill: '#fff3e0' },
        { d: ellipse(160, 143, 30, 26), part: 'göz lekesi', fill: '#a86b3c' },
      ],
    },
    {
      say: 'Burun ovalinin üstüne iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(162, 148, 15), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(238, 148, 15), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(167, 143, 5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(243, 143, 5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ovalin üst kısmına yuvarlak, kocaman bir burun çiz. Altına da gülen bir ağız ekle.',
      shapes: [
        { d: 'M184,174 Q200,164 216,174 Q209,189 200,190 Q191,189 184,174 Z', part: 'burun', fill: '#2d2d2d' },
        { d: 'M200,190 L200,200 M180,202 Q190,214 200,200 Q210,214 220,202', part: 'ağız' },
      ],
    },
    {
      say: 'Ağzın altından sarkan pembe bir dil çiz. İki yanına da yuvarlak yanaklar ekle.',
      shapes: [
        { d: 'M191,208 Q190,228 200,228 Q210,228 209,208', part: 'dil', fill: '#ff7f9c' },
        { d: ellipse(140, 196, 14, 9), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(260, 196, 14, 9), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kopek;
