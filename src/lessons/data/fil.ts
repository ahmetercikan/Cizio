import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 11: Kocaman kulaklı, hortumu kıvrık minik bir fil. */
const fil: Lesson = {
  id: 'fil',
  path: 'hayvanlar',
  title: 'Minik Fil',
  emoji: '🐘',
  order: 11,
  level: 2,
  skill: 'Arkada kalan kulakları önce çizdin, kafayı üstlerine koydun. Kıvrık bir hortumla fili canlandırdın!',
  palette: ['#a9b8d0', '#ffc2d1', '#ffffff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce gövde için büyük bir U çiz. Soldan aşağı in, altını yuvarla, sağdan yukarı çık.',
      shapes: [{ d: 'M150,204.9 C100,230 95,345 200,345 C305,345 300,230 250,204.9', part: 'gövde', fill: '#a9b8d0' }],
    },
    {
      say: 'Gövdenin üstünde iki yana kocaman kulaklar çiz. Yelpaze gibi geniş ve yuvarlak olsunlar!',
      shapes: [
        { d: 'M140,95.2 C85,50 25,100 35,165 C42,215 95,232 126.7,171.7', part: 'sol kulak', fill: '#a9b8d0' },
        { d: 'M260,95.2 C315,50 375,100 365,165 C358,215 305,232 273.3,171.7', part: 'sağ kulak', fill: '#a9b8d0' },
      ],
    },
    {
      say: 'Kulakların arasına büyük, yuvarlak bir kafa çiz. Altında hortum için küçük bir boşluk bırak.',
      shapes: [{ d: 'M168,216.1 A78,78 0 1,1 232,216.1', part: 'kafa', fill: '#a9b8d0' }],
    },
    {
      say: 'Boşluktan aşağı inen kalın bir hortum çiz. Ucunu sağa doğru yukarı kıvır, üstüne iki çizgi çek.',
      shapes: [
        {
          d: 'M168,216.1 C166,250 170,285 186,300 C204,316 240,312 256,292 C266,278 260,260 246,263 C234,266 238,280 226,284 C214,288 210,272 213,258 C216,240 230,232 232,216.1',
          part: 'hortum',
          fill: '#a9b8d0',
        },
        { d: 'M169,238 Q194,246 220,236 M171,258 Q192,265 213,258', part: 'hortum çizgileri' },
      ],
    },
    {
      say: 'Gövdenin altına iki kalın, kısa bacak çiz. Her ayağın altına üçer minik yarım daire tırnak ekle.',
      shapes: [
        { d: 'M127,310 L127,358 Q127,372 141,372 L171,372 Q185,372 185,358 L185,344.1', part: 'sol ayak', fill: '#a9b8d0' },
        { d: 'M215,344.1 L215,358 Q215,372 229,372 L259,372 Q273,372 273,358 L273,310', part: 'sağ ayak', fill: '#a9b8d0' },
        { d: 'M133,372 A7,11 0 0,1 147,372 M149,372 A7,11 0 0,1 163,372 M165,372 A7,11 0 0,1 179,372', part: 'sol tırnaklar', fill: '#ffffff' },
        { d: 'M221,372 A7,11 0 0,1 235,372 M237,372 A7,11 0 0,1 251,372 M253,372 A7,11 0 0,1 267,372', part: 'sağ tırnaklar', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kulakların içine daha küçük, pembe birer şekil çiz. Kulağın kenarına paralel gitsin.',
      shapes: [
        { d: 'M118,112 C92,92 58,118 62,160 C65,188 92,196 112,175 C104,152 106,128 118,112 Z', part: 'sol kulak içi', fill: '#ffc2d1' },
        { d: 'M282,112 C308,92 342,118 338,160 C335,188 308,196 288,175 C296,152 294,128 282,112 Z', part: 'sağ kulak içi', fill: '#ffc2d1' },
      ],
    },
    {
      say: 'Hortumun iki yanına, biraz yukarıya iki parlak göz çiz. Minik parıltıları unutma!',
      shapes: [
        { d: circle(170, 138, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(230, 138, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(174.5, 133.5, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(234.5, 133.5, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Pembe yanaklar, hortumun yanına gülen bir ağız, kafanın tepesine de üç minik tüy çiz.',
      shapes: [
        { d: ellipse(152, 175, 13, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(248, 175, 13, 8), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M233,197 Q241,205 249,196', part: 'ağız' },
        { d: 'M190,68 Q186,54 178,46 M200,67 L200,44 M210,68 Q214,54 222,46', part: 'tüyler' },
      ],
    },
  ],
};

export default fil;
