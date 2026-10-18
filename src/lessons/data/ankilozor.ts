import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 9: Zırhlı sırtı, dikenleri ve kuyruk tokmağı olan Ankilozor. */
const ankilozor: Lesson = {
  id: 'ankilozor',
  path: 'dinozor',
  title: 'Zırhlı Ankilozor',
  emoji: '🦕',
  order: 9,
  level: 2,
  skill: 'Geniş bir gövdeye sert zırh plakaları ve kuyruk tokmağı ekleyerek güçlü bir dinozor çizmeyi öğrendin!',
  palette: ['#7a9a5b', '#5c7842', '#d99e52', '#f3d37a', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce ortaya yayvan, hafif basık büyük bir gövde çiz. Bir tepe gibi olsun.',
      shapes: [
        {
          d: 'M110,240 C110,175 165,160 230,160 C290,160 325,185 325,240 C325,275 285,285 230,285 C165,285 110,275 110,240 Z',
          part: 'gövde',
          fill: '#7a9a5b',
        },
      ],
    },
    {
      say: 'Gövdenin sağına tombul bir baş ve arkasına iki küçük baş boynuzu çiz.',
      shapes: [
        {
          d: 'M312,225 C335,200 372,210 380,232 C386,254 365,270 335,268 C318,266 310,250 312,225 Z',
          part: 'kafa',
          fill: '#7a9a5b',
        },
        { d: 'M345,204 L360,188 L362,207 Z', part: 'baş boynuzu', fill: '#f3d37a' },
      ],
    },
    {
      say: 'Gövdenin soluna uzanan kalın bir kuyruk ve ucuna ağır bir tokmak çiz.',
      shapes: [
        { d: 'M115,232 C85,235 65,238 48,240 C65,255 85,262 115,260 Z', part: 'kuyruk', fill: '#7a9a5b' },
        { d: ellipse(38, 240, 16, 12), part: 'tokmak', fill: '#5c7842' },
      ],
    },
    {
      say: 'Gövdenin altına dört kısa ve tombul bacak çiz. Yere sağlam bassınlar.',
      shapes: [
        { d: 'M125,272 L125,325 Q125,338 140,338 Q155,338 155,325 L155,280', part: 'arka uzak bacak', fill: '#5c7842' },
        { d: 'M160,280 L160,342 Q160,356 178,356 Q196,356 196,342 L196,284', part: 'arka yakın bacak', fill: '#7a9a5b' },
        { d: 'M245,280 L245,325 Q245,338 260,338 Q275,338 275,325 L275,280', part: 'ön uzak bacak', fill: '#5c7842' },
        { d: 'M280,282 L280,342 Q280,356 298,356 Q316,356 316,342 L316,270', part: 'ön yakın bacak', fill: '#7a9a5b' },
      ],
    },
    {
      say: 'Sırtın iki yanına dışarı bakan sivri zırh dikenleri ekle.',
      shapes: [
        { d: 'M130,205 L108,198 L138,185 Z', part: 'sol diken', fill: '#f3d37a' },
        { d: 'M175,172 L160,148 L195,164 Z', part: 'orta diken', fill: '#f3d37a' },
        { d: 'M230,163 L235,138 L255,164 Z', part: 'sırt dikeni', fill: '#f3d37a' },
        { d: 'M285,178 L310,158 L298,195 Z', part: 'sağ diken', fill: '#f3d37a' },
      ],
    },
    {
      say: 'Sırtın üzerine koruyucu zırh şeritleri ve kemerler çiz.',
      shapes: [
        { d: 'M145,190 C155,225 155,255 145,275', part: 'zırh kemeri' },
        { d: 'M195,165 C205,215 205,260 195,285', part: 'zırh kemeri' },
        { d: 'M250,165 C260,215 260,260 250,285', part: 'zırh kemeri' },
        { d: 'M295,185 C302,220 300,250 292,275', part: 'zırh kemeri' },
      ],
    },
    {
      say: 'Zırhın üstüne küçük parlak yumrular ekle. Tam koruma sağlasın!',
      shapes: [
        { d: circle(170, 200, 7), part: 'zırh yumrusu', fill: '#d99e52' },
        { d: circle(170, 245, 7), part: 'zırh yumrusu', fill: '#d99e52' },
        { d: circle(225, 195, 8), part: 'zırh yumrusu', fill: '#d99e52' },
        { d: circle(225, 240, 8), part: 'zırh yumrusu', fill: '#d99e52' },
        { d: circle(275, 210, 7), part: 'zırh yumrusu', fill: '#d99e52' },
        { d: circle(275, 250, 7), part: 'zırh yumrusu', fill: '#d99e52' },
      ],
    },
    {
      say: 'Son olarak sevimli bir göz, minik bir gülümseme ve pembe yanak ekle.',
      shapes: [
        { d: circle(352, 226, 9), part: 'göz', fill: '#2d2d2d' },
        { d: circle(350, 223, 3), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M355,252 Q368,258 376,246', part: 'ağız' },
        { d: ellipse(340, 245, 8, 5), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default ankilozor;
