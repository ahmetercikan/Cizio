import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 14: Kabarık yeleli, oturan sevimli bir aslan. */
const aslan: Lesson = {
  id: 'aslan',
  path: 'hayvanlar',
  title: 'Yeleli Aslan',
  emoji: '🦁',
  order: 14,
  level: 3,
  skill: 'Aynı küçük yayı tekrar tekrar çizerek kocaman bir yele yaptın. Arkadaki parçaları önce çizmeyi de öğrendin!',
  palette: ['#f7c25a', '#e0782c', '#fff1d6', '#8a4b2a', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce gövde için büyük bir U çiz. Soldan aşağı in, altı düz olsun, sağdan yukarı çık.',
      shapes: [{ d: 'M150,236.6 C105,265 95,350 160,350 L240,350 C305,350 295,265 250,236.6', part: 'gövde', fill: '#f7c25a' }],
    },
    {
      say: 'Gövdenin üstüne kocaman bir yele çiz. Tepeden başla, yan yana küçük yaylarla bir çiçek gibi dön.',
      shapes: [
        {
          d: 'M200,50 A28,28 0 0,1 250,63.4 A28,28 0 0,1 286.6,100 A28,28 0 0,1 300,150 A28,28 0 0,1 286.6,200 A28,28 0 0,1 250,236.6 A28,28 0 0,1 200,250 A28,28 0 0,1 150,236.6 A28,28 0 0,1 113.4,200 A28,28 0 0,1 100,150 A28,28 0 0,1 113.4,100 A28,28 0 0,1 150,63.4 A28,28 0 0,1 200,50 Z',
          part: 'yele',
          fill: '#e0782c',
        },
      ],
    },
    {
      say: 'Yelenin ortasına büyük, yuvarlak bir kafa çiz. Altında biraz yele görünsün.',
      shapes: [{ d: circle(200, 155, 70), part: 'kafa', fill: '#f7c25a' }],
    },
    {
      say: 'Kafanın üstüne iki yuvarlak kulak ekle. İçlerine de küçük daireler çiz.',
      shapes: [
        { d: 'M138.6,121.5 A22,22 0 1,1 164.3,94.8', part: 'sol kulak', fill: '#f7c25a' },
        { d: 'M235.7,94.8 A22,22 0 1,1 261.4,121.5', part: 'sağ kulak', fill: '#f7c25a' },
        { d: circle(140, 97, 10), part: 'sol kulak içi', fill: '#e0782c' },
        { d: circle(260, 97, 10), part: 'sağ kulak içi', fill: '#e0782c' },
      ],
    },
    {
      say: 'Gövdenin altına iki tombul pati çiz. Her patiye iki kısa çizgi çekerek parmak yap.',
      shapes: [
        { d: 'M150,350 C136,380 196,382 190,350', part: 'sol pati', fill: '#f7c25a' },
        { d: 'M210,350 C204,382 264,380 250,350', part: 'sağ pati', fill: '#f7c25a' },
        { d: 'M163,362 L163,371 M177,362 L177,371', part: 'sol parmaklar' },
        { d: 'M223,362 L223,371 M237,362 L237,371', part: 'sağ parmaklar' },
      ],
    },
    {
      say: 'Göğsüne açık renkli bir oval çiz. Sağ yandan yukarı kıvrılan bir kuyruk ve ucuna püskül ekle.',
      shapes: [
        { d: ellipse(200, 302, 42, 34), part: 'göğüs', fill: '#fff1d6' },
        { d: 'M285.9,310 C322,312 336,290 330,262', part: 'kuyruk' },
        { d: 'M330,262 Q310,252 318,234 Q328,224 340,234 Q350,252 330,262 Z', part: 'kuyruk püskülü', fill: '#e0782c' },
      ],
    },
    {
      say: 'Kafanın alt kısmına açık renkli bir burun ovali çiz. Üstüne de yuvarlak bir burun ekle.',
      shapes: [
        { d: ellipse(200, 183, 38, 26), part: 'burun ovali', fill: '#fff1d6' },
        { d: 'M186,168 Q200,159 214,168 Q208,180 200,181 Q192,180 186,168 Z', part: 'burun', fill: '#8a4b2a' },
      ],
    },
    {
      say: 'Burun ovalinin üstüne iki parlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(170, 138, 13), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(230, 138, 13), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(174.5, 133.5, 4.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(234.5, 133.5, 4.5), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Burnun altına gülen bir ağız çiz. İki yana da pembe yanaklar ekle. Aslan gülümsüyor!',
      shapes: [
        { d: 'M200,181 L200,190 M186,192 Q193,200 200,190 Q207,200 214,192', part: 'ağız' },
        { d: ellipse(147, 175, 10, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(253, 175, 10, 7), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default aslan;
