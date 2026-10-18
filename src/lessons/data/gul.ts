import type { Lesson } from '../types';

const gul: Lesson = {
  id: 'gul',
  path: 'doga',
  title: 'Kırmızı Gül',
  emoji: '🌹',
  order: 12,
  level: 2,
  skill: 'İçten dışa kat kat taç yapraklar açarak gerçekçi bir gül çizmeyi öğrendin!',
  palette: ['#d90429', '#ef233c', '#e63946', '#c9184a', '#2d6a4f', '#52b788'],
  steps: [
    {
      say: 'Gülümüzün kalbinden başlayalım! Ortaya kıvrık, minik bir spiral gonca çiz.',
      shapes: [
        {
          d: 'M188,128 C184,112 196,98 208,102 C218,105 222,118 214,130 C206,140 192,138 188,128 Z',
          part: 'gonca merkezi',
          fill: '#d90429',
        },
        {
          d: 'M195,112 C202,108 212,114 206,124',
          part: 'spiral kıvrımı',
        },
      ],
    },
    {
      say: 'Goncanın iki yanına onu saran iki kavisli taç yaprak ekle.',
      shapes: [
        {
          d: 'M184,116 C168,128 172,154 196,164 C184,152 180,134 184,116 Z',
          part: 'sol iç taç yaprak',
          fill: '#ef233c',
        },
        {
          d: 'M216,116 C232,128 228,154 204,164 C216,152 220,134 216,116 Z',
          part: 'sağ iç taç yaprak',
          fill: '#ef233c',
        },
      ],
    },
    {
      say: 'Şimdi çiçeğimizi açtıralım! Yanlara doğru daha geniş iki taç yaprak çiz.',
      shapes: [
        {
          d: 'M168,118 C144,134 148,172 188,185 C164,172 156,145 168,118 Z',
          part: 'sol orta yaprak',
          fill: '#e63946',
        },
        {
          d: 'M232,118 C256,134 252,172 212,185 C236,172 244,145 232,118 Z',
          part: 'sağ orta yaprak',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Gülün altını saran büyük, yuvarlak çanak yaprakları çiz.',
      shapes: [
        {
          d: 'M146,142 C134,185 165,212 200,212 C235,212 266,185 254,142 C245,185 220,202 200,202 C180,202 155,185 146,142 Z',
          part: 'alt çanak taç yaprak',
          fill: '#c9184a',
        },
        {
          d: 'M152,130 C138,108 170,95 190,105',
          part: 'arka taç yaprak',
        },
        {
          d: 'M248,130 C262,108 230,95 210,105',
          part: 'arka taç yaprak',
        },
      ],
    },
    {
      say: 'Çiçeğin hemen altına yeşil, sivri çanak yaprakları ekle.',
      shapes: [
        {
          d: 'M170,204 C150,218 135,236 122,242 C138,234 158,226 178,214 Z',
          part: 'sol çanak yaprak',
          fill: '#40916c',
        },
        {
          d: 'M230,204 C250,218 265,236 278,242 C262,234 242,226 222,214 Z',
          part: 'sağ çanak yaprak',
          fill: '#40916c',
        },
        {
          d: 'M192,212 C196,232 200,248 200,248 C200,248 204,232 208,212 Z',
          part: 'orta çanak yaprak',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'Gülün dik durması için dikenli, güçlü ve uzun bir sap uzat.',
      shapes: [
        {
          d: 'M196,212 C196,260 204,310 197,370 L203,370 C210,310 202,260 202,212 Z',
          part: 'gül sapı',
          fill: '#2d6a4f',
        },
        {
          d: 'M197,258 L185,252 C192,260 196,263 198,266 Z',
          part: 'diken',
          fill: '#1b4332',
        },
        {
          d: 'M203,308 L215,302 C208,310 204,313 202,316 Z',
          part: 'diken',
          fill: '#1b4332',
        },
      ],
    },
    {
      say: 'Sapın sol tarafına sivri uçlu, güzel bir gül yaprağı ekle.',
      shapes: [
        {
          d: 'M198,276 C165,270 138,248 116,242 C122,264 148,292 198,286 Z',
          part: 'sol yaprak',
          fill: '#52b788',
        },
        {
          d: 'M198,281 Q155,268 120,244',
          part: 'sol yaprak damarı',
        },
      ],
    },
    {
      say: 'Sapın sağına da bir yaprak çizip muhteşem gülümüzü tamamlayalım!',
      shapes: [
        {
          d: 'M202,328 C235,322 262,300 284,294 C278,316 252,344 202,338 Z',
          part: 'sağ yaprak',
          fill: '#52b788',
        },
        {
          d: 'M202,333 Q245,320 280,296',
          part: 'sağ yaprak damarı',
        },
      ],
    },
  ],
};

export default gul;
