import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const yunuslar: Lesson = {
  id: 'yunuslar',
  path: 'hayvanlar',
  title: 'Zıplayan Yunuslar',
  emoji: '🐬',
  order: 31,
  level: 2,
  skill: 'İki yunusu arka arkaya kavisli çizerek ve su sıçramaları ekleyerek hareketli bir deniz manzarası oluşturdun!',
  palette: ['#48cae4', '#90e0ef', '#0077b6', '#023e8a', '#ffb703', '#caf0f8', '#ff85a1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce gökyüzüne batmakta olan sıcacık, kocaman yuvarlak bir güneş çizelim.',
      shapes: [
        {
          d: circle(200, 165, 46),
          part: 'güneş',
          fill: '#ffb703',
        },
        {
          d: 'M130,165 A70,70 0 0,1 270,165',
          part: 'güneş parıltısı',
        },
      ],
    },
    {
      say: 'Güneşin altına denizin dalgalı yüzeyini ve masmavi sularını ekleyelim.',
      shapes: [
        {
          d: 'M20,270 Q110,255 200,270 T380,270 L380,380 L20,380 Z',
          part: 'deniz',
          fill: '#0077b6',
        },
        {
          d: 'M20,310 Q105,295 190,310 T380,310 L380,380 L20,380 Z',
          part: 'ön dalga',
          fill: '#023e8a',
        },
        {
          d: 'M25,272 Q70,262 115,272 M150,272 Q200,260 250,272 M290,272 Q335,262 375,272',
          part: 'dalga köpükleri',
        },
      ],
    },
    {
      say: 'Ön tarafta sudan yukarı fırlayan büyük yunusun yay gibi kavisli gövdesini çizelim.',
      shapes: [
        {
          d: 'M80,195 C88,187 98,184 112,182 C125,130 160,100 205,105 C238,110 262,138 282,180 L270,188 C245,155 224,142 195,142 C160,142 135,168 122,185 C112,193 96,193 88,188 Z',
          part: 'büyük yunus gövdesi',
          fill: '#48cae4',
        },
      ],
    },
    {
      say: 'Büyük yunusun sırt yüzgecini, karın yüzgecini ve iki yana açılan kuyruğunu yapalım.',
      shapes: [
        {
          d: 'M178,107 C184,88 198,76 215,72 C210,88 208,105 212,114 Z',
          part: 'büyük yunus sırt yüzgeci',
          fill: '#48cae4',
        },
        {
          d: 'M148,162 C154,180 162,192 174,194 C173,181 169,170 162,162 Z',
          part: 'büyük yunus yan yüzgeci',
          fill: '#48cae4',
        },
        {
          d: 'M282,180 C294,174 308,166 322,158 C318,175 306,185 292,190 C288,200 280,210 266,218 C267,203 273,192 270,188 Z',
          part: 'büyük yunus kuyruğu',
          fill: '#48cae4',
        },
      ],
    },
    {
      say: 'Şimdi onun hemen arkasından neşeyle zıplayan ikinci yunusun kavisli gövdesini çizelim.',
      shapes: [
        {
          d: 'M185,205 C190,198 198,195 210,193 C220,155 248,135 282,138 C305,142 322,165 336,198 L326,204 C308,180 290,168 268,168 C240,168 222,188 212,198 C204,205 194,205 189,200 Z',
          part: 'küçük yunus gövdesi',
          fill: '#90e0ef',
        },
      ],
    },
    {
      say: 'İkinci yunusun da sırt yüzgecini, yan yüzgecini ve çatal kuyruğunu ekleyelim.',
      shapes: [
        {
          d: 'M258,140 C263,126 274,116 286,112 C282,126 281,138 284,145 Z',
          part: 'küçük yunus sırt yüzgeci',
          fill: '#90e0ef',
        },
        {
          d: 'M235,185 C240,198 246,206 256,208 C255,198 251,190 245,185 Z',
          part: 'küçük yunus yan yüzgeci',
          fill: '#90e0ef',
        },
        {
          d: 'M336,198 C345,193 355,186 366,180 C363,193 353,201 342,205 C339,214 332,222 320,227 C321,216 327,208 326,204 Z',
          part: 'küçük yunus kuyruğu',
          fill: '#90e0ef',
        },
      ],
    },
    {
      say: 'İki sevimli yunusa da gülen bir ağız, parlak bir göz ve pembe yanak konduralım.',
      shapes: [
        { d: circle(118, 172, 4.5), part: 'büyük yunus gözü', fill: '#2d2d2d' },
        { d: circle(119.5, 170.5, 1.5), part: 'büyük yunus göz parıltısı', fill: '#ffffff' },
        { d: 'M95,190 Q106,196 116,186', part: 'büyük yunus gülümsemesi' },
        { d: circle(126, 182, 4), part: 'büyük yunus yanağı', fill: '#ff85a1' },
        { d: circle(215, 185, 3.5), part: 'küçük yunus gözü', fill: '#2d2d2d' },
        { d: circle(216, 184, 1.2), part: 'küçük yunus göz parıltısı', fill: '#ffffff' },
        { d: 'M196,200 Q204,205 212,197', part: 'küçük yunus gülümsemesi' },
        { d: circle(222, 194, 3), part: 'küçük yunus yanağı', fill: '#ff85a1' },
      ],
    },
    {
      say: 'Son olarak denize şıpır şıpır sıçrayan su damlaları ve köpükler ekleyelim.',
      shapes: [
        {
          d: 'M65,275 C60,250 80,240 85,255 C90,242 105,248 100,270 Z',
          part: 'sol sıçrama',
          fill: '#caf0f8',
        },
        {
          d: 'M270,275 C275,252 295,245 300,260 C308,248 325,255 320,275 Z',
          part: 'sağ sıçrama',
          fill: '#caf0f8',
        },
        { d: circle(55, 235, 3.5), part: 'damla 1', fill: '#caf0f8' },
        { d: circle(75, 225, 4), part: 'damla 2', fill: '#caf0f8' },
        { d: circle(290, 230, 4), part: 'damla 3', fill: '#caf0f8' },
        { d: circle(315, 238, 3.5), part: 'damla 4', fill: '#caf0f8' },
        { d: circle(340, 248, 3), part: 'damla 5', fill: '#caf0f8' },
      ],
    },
  ],
};

export default yunuslar;
