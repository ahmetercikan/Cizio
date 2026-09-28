import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const n = (v: number) => Math.round(v * 100) / 100;

/*
 * Türk Bayrağı Kanunu'ndaki oranlar (G = bayrağın eni):
 *   boy 1,5 G; dış ay merkezi gönderden 0,5 G; dış ay çapı 0,5 G; iç ay merkezi 1/16 G daha sağda;
 *   iç ay çapı 0,4 G; iç ay dairesi ile yıldız dairesi arası 1/3 G; yıldız dairesi çapı 1/4 G.
 * Yıldızın bir köşesi hilalin ortasına (gönder tarafına) bakar.
 */
const G = 210;
const X0 = 50; // gönder tarafı (direğin sağ kenarı)
const Y0 = 56;
const CY = Y0 + G / 2;
const outerX = X0 + G / 2;
const outerR = G / 4;
const innerX = outerX + G / 16;
const innerR = G / 5;
const starR = G / 8;
const starX = innerX - innerR + G / 3 + starR;

/** Hilal: üst uçtan başlayıp dış yayla sola dolan, iç yayla geri dönen tek çizgi. */
const crescent = (() => {
  // İki dairenin kesişimi (hilalin uçları).
  const tipX = (outerR ** 2 - innerR ** 2 + innerX ** 2 - outerX ** 2) / (2 * (innerX - outerX));
  const tipDy = Math.sqrt(outerR ** 2 - (tipX - outerX) ** 2);
  const top = `${n(tipX)},${n(CY - tipDy)}`;
  const bottom = `${n(tipX)},${n(CY + tipDy)}`;
  return `M${top} A${outerR},${outerR} 0 1,0 ${bottom} A${innerR},${innerR} 0 1,1 ${top} Z`;
})();

/** Beş köşeli düzgün yıldız; bir köşesi sola (hilale) bakar, oradan başlayıp tek hamlede çizilir. */
const star = (() => {
  const inner = starR * 0.382;
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((180 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? starR : inner;
    pts.push(`${n(starX + r * Math.cos(a))},${n(CY + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
})();

/** Özel Günler 1: Türk Bayrağı. Hilal ve yıldızı bayrağın boyuna göre orantılı çizmek. */
const turkBayragi: Lesson = {
  id: 'turk-bayragi',
  path: 'ozel',
  title: 'Türk Bayrağı',
  emoji: '🇹🇷',
  order: 1,
  level: 2,
  skill: 'Hilal ve yıldızı bayrağın boyuna göre orantılı çizmeyi öğrendin! Her parça doğru yerinde olunca bayrak göğe yakışır.',
  palette: ['#e30a17', '#ffffff', '#b8bec9', '#f2c14e', '#8d6e63'],
  steps: [
    {
      say: 'Önce uzun, dik bir direk çiz. Tepesine de yuvarlak, parlak bir top koy.',
      shapes: [
        { d: `M38,50 L${X0},50 L${X0},345 L38,345 Z`, part: 'direk', fill: '#b8bec9' },
        { d: circle(44, 42, 8), part: 'direk topu', fill: '#f2c14e' },
      ],
    },
    {
      say: 'Direğin yanına enine bir dikdörtgen çiz. Uzun kenarı, kısa kenarın bir buçuk katı olsun.',
      shapes: [
        { d: `M${X0},${Y0} L${X0 + 1.5 * G},${Y0} L${X0 + 1.5 * G},${Y0 + G} L${X0},${Y0 + G}`, part: 'bayrak', fill: '#e30a17' },
      ],
    },
    {
      say: 'Kesikli çizgi bayrağın ortası. Soluna, ağzı sağa bakan, boyu bayrağın yarısı kadar bir hilal çiz.',
      shapes: [
        { d: `M${X0},${CY} L${X0 + 1.5 * G},${CY}`, guide: true, part: 'orta çizgi' },
        { d: crescent, part: 'hilal', fill: '#ffffff' },
      ],
    },
    {
      say: 'Hilalin açık tarafına beş köşeli bir yıldız çiz. Bir köşesi hilale baksın.',
      shapes: [{ d: star, part: 'yıldız', fill: '#ffffff' }],
    },
    {
      say: 'Direğin dibine sağlam bir kaide çiz. Al bayrağımız hazır, eline sağlık!',
      shapes: [{ d: `M38,345 L30,345 L30,368 L${X0 + 8},368 L${X0 + 8},345 L${X0},345`, part: 'kaide', fill: '#8d6e63' }],
    },
  ],
};

export default turkBayragi;
