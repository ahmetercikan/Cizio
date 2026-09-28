import type { Lesson } from '../types';

const panda: Lesson = {
  id: 'panda',
  path: 'hayvanlar',
  title: 'Tombul Panda',
  emoji: '🐼',
  order: 6,
  level: 3,
  skill: 'Arkada kalan gövdeyi önce çizdin, kafayı onun üstüne yerleştirdin. Katman katman çizmeyi öğrendin!',
  palette: ['#ffffff', '#2d2d2d', '#ff9eb5', '#ff7f9c', '#d7f5d0'],
  steps: [
    {
      say: 'Önce gövde için kocaman bir U çiz. Soldan başla, aşağı in ve sağda yukarı çık.',
      shapes: [{ d: 'M132.6,201.6 C78,240 78,350 200,350 C322,350 322,240 267.4,201.6', part: 'gövde', fill: '#ffffff' }],
    },
    {
      say: 'U harfinin iki ucuna değen büyük, yuvarlak bir kafa çiz.',
      shapes: [{ d: 'M112,145 A88,88 0 1,0 288,145 A88,88 0 1,0 112,145 Z', part: 'kafa', fill: '#ffffff' }],
    },
    {
      say: 'Kafanın üstüne iki yuvarlak kulak ekle. Kafadan başla, kafada bitir.',
      shapes: [
        { d: 'M132.6,88.4 A26,26 0 1,1 169.9,62.3', part: 'sol kulak', fill: '#2d2d2d' },
        { d: 'M230.1,62.3 A26,26 0 1,1 267.4,88.4', part: 'sağ kulak', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Yüzüne iki eğik oval çiz. Alt uçları dışa doğru baksın. Bunlar pandanın göz lekeleri.',
      shapes: [
        { d: 'M142.95,139 A22,30 30 1,0 181.05,161 A22,30 30 1,0 142.95,139 Z', part: 'sol göz lekesi', fill: '#2d2d2d' },
        { d: 'M218.95,161 A22,30 -30 1,0 257.05,139 A22,30 -30 1,0 218.95,161 Z', part: 'sağ göz lekesi', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Lekelerin içine beyaz, parlak birer daire çiz. Gözler ışıl ışıl oldu!',
      shapes: [
        { d: 'M158,145 A9,9 0 1,0 176,145 A9,9 0 1,0 158,145 Z', part: 'sol göz', fill: '#ffffff' },
        { d: 'M224,145 A9,9 0 1,0 242,145 A9,9 0 1,0 224,145 Z', part: 'sağ göz', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ortaya küçük bir burun, altına gülümseyen bir ağız, iki yana da pembe yanaklar çiz.',
      shapes: [
        { d: 'M188,180 Q200,173 212,180 Q207,192 200,193 Q193,192 188,180 Z', part: 'burun', fill: '#2d2d2d' },
        { d: 'M184,204 Q192,214 200,198 Q208,214 216,204', part: 'ağız' },
        { d: 'M140,193 A12,7 0 1,0 164,193 A12,7 0 1,0 140,193 Z', part: 'sol yanak', fill: '#ff9eb5' },
        { d: 'M236,193 A12,7 0 1,0 260,193 A12,7 0 1,0 236,193 Z', part: 'sağ yanak', fill: '#ff9eb5' },
      ],
    },
    {
      say: 'Gövdenin iki yanına eğik birer oval kol çiz. Panda kendine sarılıyor gibi!',
      shapes: [
        { d: 'M113.87,280.45 A20,34 -25 1,0 150.13,263.55 A20,34 -25 1,0 113.87,280.45 Z', part: 'sol kol', fill: '#2d2d2d' },
        { d: 'M249.87,263.55 A20,34 25 1,0 286.13,280.45 A20,34 25 1,0 249.87,263.55 Z', part: 'sağ kol', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Son olarak altına iki tombul ayak çiz. Gövdeden başla, gövdede bitir.',
      shapes: [
        { d: 'M141,338 C128,372 190,378 183,349', part: 'sol ayak', fill: '#2d2d2d' },
        { d: 'M217,349 C210,378 272,372 259,338', part: 'sağ ayak', fill: '#2d2d2d' },
      ],
    },
  ],
};

export default panda;
