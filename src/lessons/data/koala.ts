import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 27: Dala sımsıkı sarılan, pofuduk kulaklı ve iri burunlu sevimli koala. */
const koala: Lesson = {
  id: 'koala',
  path: 'hayvanlar',
  title: 'Uykucu Koala',
  emoji: '🐨',
  order: 27,
  level: 2,
  skill: 'Ağaca sarılan kollar, büyük karakteristik bir burun ve pofuduk kulaklar çizmeyi öğrendin!',
  palette: ['#9aa0a6', '#d7dadc', '#8d6e63', '#66bb6a', '#a5d6a7', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce koalamızın sarılacağı kalın bir okaliptüs dalı ve ucuna taze yeşil yapraklar çiz.',
      shapes: [
        {
          d: 'M112,30 L108,380 L144,380 L140,30 Z',
          part: 'ağaç gövdesi',
          fill: '#8d6e63',
        },
        { d: 'M122,80 L122,140 M130,220 L130,270 M124,320 L124,360', part: 'kabuk çizgileri' },
        { d: 'M110,95 Q70,90 55,75', part: 'yaprak dalı' },
        { d: 'M55,75 Q40,65 30,75 Q42,88 55,75 Z', part: 'yaprak', fill: '#66bb6a' },
        { d: 'M65,88 Q60,110 48,118 Q46,100 65,88 Z', part: 'yaprak', fill: '#66bb6a' },
        { d: 'M78,92 Q85,115 100,118 Q98,100 78,92 Z', part: 'yaprak', fill: '#a5d6a7' },
      ],
    },
    {
      say: 'Dala yaslanan yuvarlak sevimli bir kafa ve altına tombul bir gövde ekle.',
      shapes: [
        {
          d: ellipse(215, 255, 58, 68),
          part: 'gövde',
          fill: '#9aa0a6',
        },
        {
          d: ellipse(215, 142, 54, 50),
          part: 'kafa',
          fill: '#9aa0a6',
        },
      ],
    },
    {
      say: 'Kafanın iki yanına koalanın meşhur kocaman, pofuduk kulaklarını çiz.',
      shapes: [
        { d: circle(156, 105, 28), part: 'sol kulak', fill: '#9aa0a6' },
        { d: circle(158, 106, 18), part: 'sol kulak içi', fill: '#d7dadc' },
        { d: circle(274, 105, 28), part: 'sağ kulak', fill: '#9aa0a6' },
        { d: circle(272, 106, 18), part: 'sağ kulak içi', fill: '#d7dadc' },
      ],
    },
    {
      say: 'Gövdeden ağaca sımsıkı sarılan tombul kolları ve bacakları uzat.',
      shapes: [
        {
          d: 'M180,185 C145,180 115,175 105,190 C100,205 130,215 170,210 Z',
          part: 'kol',
          fill: '#9aa0a6',
        },
        { d: 'M105,190 C98,185 96,198 103,205', part: 'kol pençesi' },
        {
          d: 'M190,285 C155,282 120,280 112,298 C108,315 135,322 185,315 Z',
          part: 'bacak',
          fill: '#9aa0a6',
        },
        { d: 'M112,298 C105,295 104,308 112,314', part: 'ayak pençesi' },
      ],
    },
    {
      say: 'Yüzün ortasına koalanın büyük koyu burnunu ve karnına açık renkli kürkünü ekle.',
      shapes: [
        { d: ellipse(215, 258, 36, 45), part: 'açık renkli göğüs', fill: '#d7dadc' },
        { d: ellipse(215, 148, 18, 25), part: 'büyük burun', fill: '#2d2d2d' },
        { d: ellipse(212, 140, 7, 10), part: 'burun parıltısı', fill: '#5f6368' },
      ],
    },
    {
      say: 'Burnun iki yanına neşeli gözler ve burnun hemen altına tatlı bir tebessüm çiz.',
      shapes: [
        { d: circle(180, 136, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(182, 133, 2.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(250, 136, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(252, 133, 2.5), part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M204,180 Q215,188 226,180', part: 'gülümseme' },
      ],
    },
    {
      say: 'Son olarak yanaklarına tatlı allıklar ve kulaklarına yumuşak tüy çizgileri ekle.',
      shapes: [
        { d: ellipse(172, 155, 10, 7), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(258, 155, 10, 7), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M130,95 L140,105 M128,108 L138,114 M132,122 L142,122', part: 'sol kulak tüyleri' },
        { d: 'M298,95 L288,105 M302,108 L292,114 M298,122 L288,122', part: 'sağ kulak tüyleri' },
      ],
    },
  ],
};

export default koala;
