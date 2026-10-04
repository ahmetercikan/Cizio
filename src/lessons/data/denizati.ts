import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Deniz 8: Uzun burunlu, kıvrık kuyruklu ve sırt yüzgeçli sevimli bir denizatı. */
const denizati: Lesson = {
  id: 'denizati',
  path: 'deniz',
  title: 'Denizatı',
  emoji: '🌊',
  order: 8,
  level: 2,
  skill: 'S harfi gibi kıvrılan bir gövde ve sarmal bir kuyruk çizdin. Kıvrımlar çizime hareket katar!',
  palette: ['#ffc94d', '#fff1b8', '#ff9f43', '#9bdcff', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce sola uzanan boru gibi bir burnu olan yuvarlak bir baş çiz. Burnun ucu yuvarlak olsun.',
      shapes: [
        {
          d: 'M160,92 C168,64 196,48 228,50 C266,53 292,82 284,116 C278,140 252,152 222,150 C205,149 190,143 180,134 C160,128 128,128 102,126 C86,125 85,97 101,95 C122,94 145,95 160,92 Z',
          part: 'baş',
          fill: '#ffc94d',
        },
      ],
    },
    {
      say: 'Başın altından tombul bir gövde indir. Aşağıda kuyruğu içe doğru kıvır ve başa geri dön.',
      shapes: [
        {
          d: 'M278,134 C300,170 306,230 286,268 C276,305 268,345 236,362 C206,376 172,358 174,328 C176,302 202,292 220,304 C230,312 228,326 216,328 C204,330 192,322 192,336 C194,350 214,352 228,344 C244,334 246,300 240,272 C200,262 150,230 152,195 C154,172 166,150 182,138',
          part: 'gövde ve kuyruk',
          fill: '#ffc94d',
        },
      ],
    },
    {
      say: 'Gövdenin önüne ay gibi açık renkli bir karın çiz. İçine de üç kısa çizgi ekle.',
      shapes: [
        {
          d: 'M182,138 C166,150 154,172 152,195 C150,230 200,262 240,272 C214,240 204,190 212,145 C204,142 192,140 182,138 Z',
          part: 'karın',
          fill: '#fff1b8',
        },
        { d: 'M155,180 Q182,188 209,179', part: 'üst karın çizgisi' },
        { d: 'M156,214 Q185,222 213,213', part: 'orta karın çizgisi' },
        { d: 'M181,243 Q203,250 223,245', part: 'alt karın çizgisi' },
      ],
    },
    {
      say: 'Sırtının ortasına yelpaze gibi bir yüzgeç çiz. İçine iki küçük çizgi ekle.',
      shapes: [
        { d: 'M292,166 C326,148 358,176 354,224 C338,224 316,224 298,222', part: 'sırt yüzgeci', fill: '#ff9f43' },
        { d: 'M295,182 L338,172', part: 'üst yüzgeç çizgisi' },
        { d: 'M298,203 L348,200', part: 'alt yüzgeç çizgisi' },
      ],
    },
    {
      say: 'Başının tepesine üç küçük sivri diken çiz. Taç gibi dursun!',
      shapes: [
        { d: 'M209,51 L214,28 L228,50', part: 'ön diken', fill: '#ff9f43' },
        { d: 'M249,55 L262,32 L266,65', part: 'orta diken', fill: '#ff9f43' },
        { d: 'M274,71 L298,64 L283,88', part: 'arka diken', fill: '#ff9f43' },
      ],
    },
    {
      say: 'Başına parlak bir göz, burnun ucuna minik bir gülümseme ve pembe bir yanak çiz.',
      shapes: [
        { d: circle(232, 98, 17), part: 'göz', fill: '#2d2d2d' },
        { d: circle(226, 91.5, 5.5), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M96,116 Q106,124 118,117', part: 'ağız' },
        { d: ellipse(256, 128, 13, 8), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Son olarak burnunun önüne üç baloncuk çiz. Büyükten küçüğe doğru yukarı çıksınlar.',
      shapes: [
        { d: circle(84, 176, 14), part: 'büyük baloncuk', fill: '#9bdcff' },
        { d: circle(58, 148, 9), part: 'orta baloncuk', fill: '#9bdcff' },
        { d: circle(48, 120, 6), part: 'minik baloncuk', fill: '#9bdcff' },
      ],
    },
  ],
};

export default denizati;
