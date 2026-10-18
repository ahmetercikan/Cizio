import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const gonca: Lesson = {
  id: 'gonca',
  path: 'doga',
  title: 'Tomurcuk Gül',
  emoji: '🌹',
  order: 21,
  level: 1,
  skill: 'Kapalı taç yaprakları ve çanak yaprakları birleştirerek zarif bir tomurcuk gül çizmeyi öğrendin!',
  palette: ['#e63946', '#ff4d6d', '#2d6a4f', '#74c69d', '#52b788', '#a2d2ff', '#ffffff'],
  steps: [
    {
      say: 'Önce kâğıdın üst kısmına ucu sivri, altı tombul ve yuvarlak bir gonca gövdesi çizelim.',
      shapes: [
        {
          d: 'M200,75 C240,105 250,155 235,190 C222,208 178,208 165,190 C150,155 160,105 200,75 Z',
          part: 'gonca gövdesi',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Goncanın içine birbiri üstüne sarılan zarif taç yaprak çizgileri ekleyelim.',
      shapes: [
        {
          d: 'M170,140 C175,175 220,185 232,165 C225,192 185,195 168,172 C160,158 164,146 170,140 Z',
          part: 'taç yaprak',
          fill: '#ff4d6d',
        },
        {
          d: 'M192,85 C208,82 222,96 215,115 C206,128 190,122 195,110 C198,102 206,104 204,110',
          part: 'iç kıvrım',
        },
        {
          d: 'M180,105 C190,130 216,138 226,125',
          part: 'orta yaprak kıvrımı',
        },
      ],
    },
    {
      say: 'Goncanın altını saran sivri uçlu yeşil çanak yaprakları konduralım.',
      shapes: [
        {
          d: 'M168,190 C145,182 130,165 125,148 C135,175 152,198 175,202 Z',
          part: 'sol çanak yaprak',
          fill: '#52b788',
        },
        {
          d: 'M232,190 C255,182 270,165 275,148 C265,175 248,198 225,202 Z',
          part: 'sağ çanak yaprak',
          fill: '#52b788',
        },
        {
          d: 'M178,200 C182,216 218,216 222,200 C212,212 188,212 178,200 Z',
          part: 'çanak tabanı',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'Çanak yaprakların altından aşağıya doğru uzanan ince bir gül dalı ve minik dikenler çizelim.',
      shapes: [
        {
          d: 'M197,208 C197,260 203,310 196,365 L204,365 C211,310 205,260 203,208 Z',
          part: 'gül dalı',
          fill: '#2d6a4f',
        },
        {
          d: 'M197,255 C189,257 183,263 180,268 C187,268 194,265 198,262 Z',
          part: 'sol diken',
          fill: '#2d6a4f',
        },
        {
          d: 'M203,298 C211,300 217,306 220,311 C213,311 206,308 202,305 Z',
          part: 'sağ diken',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'Daldan sol tarafa doğru uzanan damarlı, güzel bir gül yaprağı ekleyelim.',
      shapes: [
        { d: 'M198,272 C178,268 160,265 148,262', part: 'sol dal bağlantısı' },
        {
          d: 'M148,262 C125,232 78,236 70,250 C76,276 122,282 148,262 Z',
          part: 'sol yaprak',
          fill: '#74c69d',
        },
        {
          d: 'M148,262 C120,256 88,252 75,250 M128,260 L120,248 M122,261 L115,270 M105,256 L98,248 M100,257 L94,266',
          part: 'sol yaprak damarları',
        },
      ],
    },
    {
      say: 'Sağ tarafa da bir yaprak çizip goncanın üstüne parıldayan minik bir çiy damlası konduralım.',
      shapes: [
        { d: 'M202,240 C222,236 240,233 252,230', part: 'sağ dal bağlantısı' },
        {
          d: 'M252,230 C275,200 322,204 330,218 C324,244 278,250 252,230 Z',
          part: 'sağ yaprak',
          fill: '#74c69d',
        },
        {
          d: 'M252,230 C280,224 312,220 325,218 M272,228 L280,216 M278,229 L285,238 M295,224 L302,216 M300,225 L306,234',
          part: 'sağ yaprak damarları',
        },
        { d: circle(220, 135, 5), part: 'çiy damlası', fill: '#a2d2ff' },
        { d: circle(221.5, 133.5, 1.5), part: 'çiy parıltısı', fill: '#ffffff' },
      ],
    },
  ],
};

export default gonca;
