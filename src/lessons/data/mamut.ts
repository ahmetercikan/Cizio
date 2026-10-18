import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Dinozorlar 13: Yünlü kürkü, kıvrık dev dişleri ve uzun hortumu olan Mamut. */
const mamut: Lesson = {
  id: 'mamut',
  path: 'dinozor',
  title: 'Yünlü Mamut',
  emoji: '🦣',
  order: 13,
  level: 3,
  skill: 'Dalgalı ve zikzak çizgilerle kalın yünlü bir kürk, yukarı kıvrılan kocaman fildişleri çizdin!',
  palette: ['#8d5b4c', '#63382b', '#d4a373', '#fffbeb', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Önce sağ üste yüksek kubbeli, tepesinde yünlü saçları olan bir kafa çiz.',
      shapes: [
        {
          d: 'M245,150 C235,115 250,75 285,75 C320,75 345,105 345,145 C345,175 320,195 285,195 C255,195 245,175 245,150 Z',
          part: 'kafa',
          fill: '#8d5b4c',
        },
        {
          d: 'M270,78 Q285,52 300,75 Q315,55 325,82 Z',
          part: 'saç püskülü',
          fill: '#63382b',
        },
      ],
    },
    {
      say: 'Kafanın önünden aşağı inip ucu yukarı kıvrılan bir hortum çiz.',
      shapes: [
        {
          d: 'M320,150 C345,165 365,195 360,230 C355,255 330,270 310,260 C295,250 305,232 320,232 C335,232 340,218 338,205 C335,185 315,180 305,175 Z',
          part: 'hortum',
          fill: '#8d5b4c',
        },
      ],
    },
    {
      say: 'Kafanın arkasından yüksek bir kambur sırt ve altı püsküllü kalın gövde çiz.',
      shapes: [
        {
          d: 'M250,135 C220,115 175,130 140,165 C105,205 100,250 115,280 C125,270 140,285 155,272 C170,288 185,272 200,286 C220,270 240,288 255,270 C270,260 275,230 270,195 C265,165 260,145 250,135 Z',
          part: 'gövde',
          fill: '#8d5b4c',
        },
      ],
    },
    {
      say: 'Gövdenin altına dört kalın bacak çiz. Ayakları yere sağlam bassın.',
      shapes: [
        {
          d: 'M120,275 L120,345 Q120,358 138,358 Q152,358 152,345 L152,275 Z',
          part: 'arka uzak bacak',
          fill: '#63382b',
        },
        {
          d: 'M155,275 L155,350 Q155,364 175,364 Q192,364 192,350 L192,275 Z',
          part: 'arka yakın bacak',
          fill: '#8d5b4c',
        },
        {
          d: 'M225,275 L225,345 Q225,358 242,358 Q258,358 258,345 L258,265 Z',
          part: 'ön uzak bacak',
          fill: '#63382b',
        },
        {
          d: 'M260,268 L260,350 Q260,364 280,364 Q298,364 298,350 L298,255 Z',
          part: 'ön yakın bacak',
          fill: '#8d5b4c',
        },
      ],
    },
    {
      say: 'Gövdenin sol arkasına ucu püsküllü minik bir kuyruk çiz.',
      shapes: [
        {
          d: 'M115,205 C95,215 88,235 92,250 C98,250 102,240 105,230 L112,225 Z',
          part: 'kuyruk',
          fill: '#8d5b4c',
        },
        {
          d: 'M88,245 C80,255 82,268 92,268 C96,262 98,252 92,245 Z',
          part: 'kuyruk püskülü',
          fill: '#63382b',
        },
      ],
    },
    {
      say: 'Hortumun iki yanından yukarı doğru kıvrılan iki kocaman fildişi çiz.',
      shapes: [
        {
          d: 'M310,185 C330,205 350,240 360,250 C370,260 382,245 385,200 C386,188 380,186 376,198 C370,225 362,240 350,235 C335,230 320,200 305,195 Z',
          part: 'ön fildişi',
          fill: '#fffbeb',
        },
        {
          d: 'M295,180 C310,195 325,225 335,235 C345,245 352,235 355,205 C356,196 350,194 348,202 C344,220 338,230 328,225 C316,220 306,195 292,190 Z',
          part: 'arka fildişi',
          fill: '#fffbeb',
        },
      ],
    },
    {
      say: 'Kafanın arkasına minik, yünlü bir kulak ve içine pembe bir kıvrım çiz.',
      shapes: [
        {
          d: 'M252,142 C235,142 225,160 232,178 C242,185 255,180 260,165 Z',
          part: 'kulak',
          fill: '#8d5b4c',
        },
        { d: ellipse(246, 162, 7, 10), part: 'kulak içi', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Göğsüne ve sırtına soğuktan koruyan dalgalı kürk çizgileri ekle.',
      shapes: [
        { d: 'M270,185 C265,210 270,230 282,242', part: 'göğüs kürkü' },
        { d: 'M165,150 C185,165 210,160 230,145', part: 'sırt kürkü' },
        { d: 'M135,195 C155,210 180,205 200,190', part: 'yan kürk' },
        { d: 'M330,175 Q340,180 345,190', part: 'hortum boğumu' },
      ],
    },
    {
      say: 'Son olarak dost canlısı parlak bir göz ve tatlı pembe bir yanak ekle.',
      shapes: [
        { d: circle(292, 130, 11), part: 'göz', fill: '#2d2d2d' },
        { d: circle(289, 126, 4), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M280,118 Q294,112 306,120', part: 'kaş' },
        { d: ellipse(282, 155, 10, 6), part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default mamut;
