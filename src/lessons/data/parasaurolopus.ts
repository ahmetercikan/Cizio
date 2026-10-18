import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 12: Uzun boru ibikli ve ördek gagalı Parasaurolophus. */
const parasaurolopus: Lesson = {
  id: 'parasaurolopus',
  path: 'dinozor',
  title: 'Tepelikli Parasaur',
  emoji: '🦕',
  order: 12,
  level: 2,
  skill: 'Başın arkasına geriye kıvrılan uzun bir boru ibik ekledin. Eğri çizgilerle dinozora zarafet kattın!',
  palette: ['#2dd4bf', '#0f766e', '#fb923c', '#fed7aa', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce başı ve kafanın arkasından geriye uzanan kıvrık boru ibiği çiz.',
      shapes: [
        {
          d: 'M245,125 C230,95 200,65 160,45 C145,38 140,50 155,62 C190,88 215,118 225,145 Z',
          part: 'ibik',
          fill: '#fb923c',
        },
        {
          d: 'M220,135 C230,115 260,115 285,130 C305,142 320,158 322,175 C315,188 290,188 270,185 C245,182 230,170 220,135 Z',
          part: 'kafa',
          fill: '#2dd4bf',
        },
      ],
    },
    {
      say: 'Kafanın önüne hafif yayvan, tatlı bir ördek gagası çiz.',
      shapes: [
        {
          d: 'M305,155 C325,158 348,162 355,172 C352,185 330,188 300,186 C295,175 298,165 305,155 Z',
          part: 'gaga',
          fill: '#fed7aa',
        },
      ],
    },
    {
      say: 'Başın altından aşağı inen zarif bir boyun ve tombul bir gövde çiz.',
      shapes: [
        {
          d: 'M235,170 C220,195 190,220 170,250 C150,280 155,315 190,325 C235,335 270,305 275,260 C280,225 270,195 255,175 Z',
          part: 'gövde',
          fill: '#2dd4bf',
        },
      ],
    },
    {
      say: 'Gövdenin arkasından yere doğru kıvrılan zarif bir kuyruk uzat.',
      shapes: [
        {
          d: 'M172,255 C130,270 85,295 40,335 C80,330 130,325 178,312 Z',
          part: 'kuyruk',
          fill: '#2dd4bf',
        },
      ],
    },
    {
      say: 'Gövdenin altına ayakta durmasını sağlayan iki kalın bacak çiz.',
      shapes: [
        {
          d: 'M175,305 C165,325 160,350 150,366 L175,366 C185,348 190,330 195,312 Z',
          part: 'arka uzak bacak',
          fill: '#0f766e',
        },
        {
          d: 'M220,310 C215,330 210,352 205,368 L238,368 C248,348 252,328 245,305 Z',
          part: 'arka yakın bacak',
          fill: '#2dd4bf',
        },
      ],
    },
    {
      say: 'Göğsüne öne doğru uzanan iki kibar ön kol ekle.',
      shapes: [
        {
          d: 'M255,225 C275,230 290,240 292,252 L282,256 C272,248 262,242 248,238 Z',
          part: 'ön yakın kol',
          fill: '#2dd4bf',
        },
        {
          d: 'M245,215 C260,220 272,228 274,238 L266,242 C256,236 248,230 238,225 Z',
          part: 'ön uzak kol',
          fill: '#0f766e',
        },
      ],
    },
    {
      say: 'İbiğin ve sırtın üstüne neşeli süs çizgileri çiz.',
      shapes: [
        { d: 'M190,60 L200,85', part: 'ibik şeridi' },
        { d: 'M165,75 L175,100', part: 'ibik şeridi' },
        { d: 'M215,225 C205,240 195,245 185,245', part: 'sırt şeridi' },
        { d: 'M200,255 C190,270 180,275 170,275', part: 'sırt şeridi' },
        {
          d: 'M225,230 C205,260 205,295 220,315 C240,312 255,285 258,255 Z',
          part: 'karın',
          fill: '#fed7aa',
        },
      ],
    },
    {
      say: 'Son olarak parlak bir göz, minik burun ve tatlı bir yanak ekle.',
      shapes: [
        { d: circle(275, 145, 11), part: 'göz', fill: '#2d2d2d' },
        { d: circle(272, 141, 3.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: circle(335, 166, 3), part: 'burun deliği', fill: '#2d2d2d' },
        { d: 'M310,175 Q328,182 342,175', part: 'ağız' },
        { d: ellipse(260, 165, 8, 5), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default parasaurolopus;
