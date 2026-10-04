import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 5: Sırtı plakalı, kuyruğu dikenli, sevimli bir stegozor. */
const stegozor: Lesson = {
  id: 'stegozor',
  path: 'dinozor',
  title: 'Stegozor',
  emoji: '🦕',
  order: 5,
  level: 2,
  skill: 'Kemer gibi bir sırtın üstüne sıra sıra plakalar dizdin. Ortadakileri büyük, uçtakileri küçük yapmak güzel durdu!',
  palette: ['#7cc96b', '#5fae55', '#ff9f43', '#ffc94d', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce ortaya kemer gibi yüksek, altı düz kocaman bir gövde çiz.',
      shapes: [
        {
          d: 'M90,262 C92,182 152,132 212,132 C272,132 312,180 318,236 C318,262 280,280 210,282 C150,284 108,280 90,262 Z',
          part: 'gövde',
          fill: '#7cc96b',
        },
      ],
    },
    {
      say: 'Gövdenin sağ altına yuvarlak, küçük bir baş çiz. Gövdeden başla, gövdede bitir.',
      shapes: [
        {
          d: 'M314,212 C330,194 368,192 380,218 C390,240 374,264 344,265 C328,266 316,262 308,257',
          part: 'baş',
          fill: '#7cc96b',
        },
      ],
    },
    {
      say: 'Gövdenin solundan sola doğru uzanan, ucu sivri bir kuyruk çiz.',
      shapes: [{ d: 'M92,228 C60,228 36,222 22,200 C36,240 64,258 92,262', part: 'kuyruk', fill: '#7cc96b' }],
    },
    {
      say: 'Gövdenin altına dört tombul bacak çiz. Arkadaki bacaklar biraz daha kısa olsun.',
      shapes: [
        { d: 'M110,274 L110,330 Q110,344 126,344 Q142,344 142,330 L142,281', part: 'arka uzak bacak', fill: '#5fae55' },
        { d: 'M150,282 L150,346 Q150,360 168,360 Q186,360 186,346 L186,282', part: 'arka yakın bacak', fill: '#7cc96b' },
        { d: 'M232,280 L232,330 Q232,344 248,344 Q264,344 264,330 L264,276', part: 'ön uzak bacak', fill: '#5fae55' },
        { d: 'M270,275 L270,346 Q270,360 288,360 Q306,360 306,346 L306,258', part: 'ön yakın bacak', fill: '#7cc96b' },
      ],
    },
    {
      say: 'Sırtına dört yaprak gibi plaka çiz. Ortadakiler büyük, kenardakiler küçük olsun.',
      shapes: [
        { d: 'M122.6,174 C100,142.8 86.7,109.5 102.6,98 C118.5,86.5 145.3,109.9 167.9,141.1', part: 'sol plaka', fill: '#ff9f43' },
        { d: 'M176.5,137.8 C169.3,94.4 168.7,56.6 181.1,54.6 C193.5,52.5 204.8,88.6 212,132', part: 'orta plaka', fill: '#ff9f43' },
        { d: 'M226,132.9 C239.4,96.8 257.8,67.3 272.1,72.7 C286.4,78 280.4,111.8 267,147.9', part: 'sağ plaka', fill: '#ff9f43' },
        { d: 'M273.5,152.5 C291.6,135.6 310.9,124.5 319.2,133.4 C327.5,142.3 315.3,160.9 297.2,177.8', part: 'küçük plaka', fill: '#ff9f43' },
      ],
    },
    {
      say: 'Kuyruğun üstüne yukarı bakan üç sivri diken çiz. Her diken kuyruktan çıkıp kuyruğa dönsün.',
      shapes: [
        { d: 'M87.3,228 L74,182 L65.4,226.1', part: 'birinci diken', fill: '#ffc94d' },
        { d: 'M60.6,225.2 L48,180 L43.5,219.4', part: 'ikinci diken', fill: '#ffc94d' },
        { d: 'M39.7,217.3 L26,176 L26.5,206.1', part: 'üçüncü diken', fill: '#ffc94d' },
      ],
    },
    {
      say: 'Son olarak başına parlak bir göz, gülen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(346, 222, 12), part: 'göz', fill: '#2d2d2d' },
        { d: circle(342, 217.5, 4), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M348,250 Q364,258 378,242', part: 'ağız' },
        { d: ellipse(330, 244, 10, 6), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default stegozor;
