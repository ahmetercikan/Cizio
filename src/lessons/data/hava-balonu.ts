import type { Lesson } from '../types';

/** Kabarık bulut: altı düz, üstü üç tümsekli. */
const cloud = (cx: number, cy: number, w: number) =>
  `M${cx - w},${cy} A${w * 0.4},${w * 0.4} 0 0,1 ${cx - w * 0.35},${cy - w * 0.35} ` +
  `A${w * 0.45},${w * 0.45} 0 0,1 ${cx + w * 0.4},${cy - w * 0.3} A${w * 0.35},${w * 0.35} 0 0,1 ${cx + w},${cy} Z`;

/** Taşıtlar 8: Çizgili bir sıcak hava balonu, ipleri ve sepeti. */
const havaBalonu: Lesson = {
  id: 'hava-balonu',
  path: 'tasitlar',
  title: 'Sıcak Hava Balonu',
  emoji: '🎈',
  order: 8,
  level: 2,
  skill: 'Kocaman bir balonu kavisli çizgilerle dilimleyip altına iplerle bir sepet asmayı öğrendin!',
  palette: ['#ff6b6b', '#ffd23f', '#c98a4b', '#ffffff', '#2d2d2d', '#aee3ff'],
  steps: [
    {
      say: 'Önce kocaman bir balon çiz. Üstü yuvarlak olsun, aşağı doğru daralıp küçük bir ağızla bitsin.',
      shapes: [
        {
          d: 'M170,248 Q74,200 74,130 Q74,34 200,34 Q326,34 326,130 Q326,200 230,248 Z',
          part: 'balon',
          fill: '#ff6b6b',
        },
      ],
    },
    {
      say: 'Balonun tepesinden ağzına kadar iki kavisli çizgi çek. Aralarında geniş bir dilim kalsın.',
      shapes: [
        { d: 'M200,34 Q86,140 178,248 L222,248 Q314,140 200,34 Z', part: 'geniş dilim', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Geniş dilimin ortasına biraz daha ince bir dilim çiz. Balon çizgili oldu!',
      shapes: [{ d: 'M200,34 Q144,140 190,248 L210,248 Q256,140 200,34 Z', part: 'orta dilim', fill: '#ff6b6b' }],
    },
    {
      say: 'Balonun ağzına küçük bir şerit çiz. Altından iki eğik ip sarkıt.',
      shapes: [
        { d: 'M170,248 L230,248 L228,262 L172,262 Z', part: 'şerit', fill: '#c98a4b' },
        { d: 'M176,262 L164,318', part: 'sol ip' },
        { d: 'M224,262 L236,318', part: 'sağ ip' },
      ],
    },
    {
      say: 'İplerin ucuna bir sepet çiz. Üstü geniş, altı biraz dar olsun.',
      shapes: [
        { d: 'M154,318 L246,318 L236,366 Q235,372 228,372 L172,372 Q165,372 164,366 Z', part: 'sepet', fill: '#c98a4b' },
      ],
    },
    {
      say: 'Sepetin üstüne bir kenar çizgisi, ortasına da iki dikey çizgi çiz. Hasır sepet gibi görünsün.',
      shapes: [
        { d: 'M156,332 L244,332', part: 'sepet kenarı' },
        { d: 'M186,332 L188,372', part: 'sol örgü' },
        { d: 'M214,332 L212,372', part: 'sağ örgü' },
      ],
    },
    {
      say: 'Balonun iki yanına birer kabarık bulut çiz. Altları düz olsun.',
      shapes: [
        { d: cloud(84, 318, 52), part: 'sol bulut', fill: '#ffffff' },
        { d: cloud(318, 284, 46), part: 'sağ bulut', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gökyüzüne kanat çırpan iki minik kuş çiz. Balon süzülerek uçuyor!',
      shapes: [
        { d: 'M326,62 Q336,50 346,62 Q356,50 366,62', part: 'büyük kuş' },
        { d: 'M38,196 Q46,186 54,196 Q62,186 70,196', part: 'küçük kuş' },
      ],
    },
  ],
};

export default havaBalonu;
