import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 22: Zarif S-boyunlu, tek ayak üzerinde duran sevimli pembe flamingo. */
const flamingo: Lesson = {
  id: 'flamingo',
  path: 'hayvanlar',
  title: 'Tek Ayaklı Flamingo',
  emoji: '🦩',
  order: 22,
  level: 2,
  skill: 'S harfi gibi kıvrılan zarif bir boyun ve tek ayak üstünde duran dengeli bacaklar çizmeyi öğrendin!',
  palette: ['#ff7597', '#ffa3b8', '#ffccd5', '#ffd166', '#ff8787', '#2d2d2d', '#74c0fc'],
  steps: [
    {
      say: 'Önce flamingomuzun gövdesi için yana doğru tombul, tatlı bir oval çiz.',
      shapes: [
        {
          d: 'M160,195 C160,160 200,150 245,155 C280,160 295,190 280,215 C260,240 195,245 165,220 C160,212 160,203 160,195 Z',
          part: 'gövde',
          fill: '#ff7597',
        },
      ],
    },
    {
      say: 'Gövdenin önünden yukarı doğru zarif bir S gibi kıvrılan boyun ve ucuna yuvarlak bir kafa ekle.',
      shapes: [
        {
          d: 'M175,190 C150,185 125,145 132,110 C138,88 150,78 162,76 C166,88 152,105 146,125 C140,150 165,182 192,192 Z',
          part: 'boyun',
          fill: '#ff7597',
        },
        {
          d: ellipse(172, 75, 24, 20),
          part: 'kafa',
          fill: '#ff7597',
        },
      ],
    },
    {
      say: 'Kafanın önüne aşağıya doğru kıvrılan iki renkli flamingo gagasını çiz.',
      shapes: [
        {
          d: 'M154,70 C144,72 135,80 132,95 L146,102 C152,94 156,86 158,84 Z',
          part: 'gaga tabanı',
          fill: '#ffd166',
        },
        {
          d: 'M132,95 C130,105 122,115 120,122 C125,125 133,120 138,111 L146,102 Z',
          part: 'gaga ucu',
          fill: '#2d2d2d',
        },
      ],
    },
    {
      say: 'Kafanın içine sevimli, parıldayan bir göz ve yanağına tatlı bir allık ekle.',
      shapes: [
        { d: circle(168, 68, 5), part: 'göz', fill: '#2d2d2d' },
        { d: circle(170, 66, 2), part: 'göz parıltısı', fill: '#ffffff' },
        { d: ellipse(178, 80, 7, 5), part: 'yanak', fill: '#ffa3b8' },
      ],
    },
    {
      say: 'Gövdenin üstüne kat kat tüyleri olan güzel bir kanat ve arkasına minik kuyruk tüyleri ekle.',
      shapes: [
        {
          d: 'M180,185 C205,165 248,168 268,185 C258,208 238,225 200,222 C185,220 178,205 180,185 Z',
          part: 'kanat',
          fill: '#ffa3b8',
        },
        {
          d: 'M195,192 C215,180 245,182 258,195 C248,210 230,218 208,215 Z',
          part: 'kanat içi',
          fill: '#ffccd5',
        },
        {
          d: 'M275,185 C298,180 308,192 288,200 C302,202 306,212 282,216 Z',
          part: 'kuyruk tüyleri',
          fill: '#ff7597',
        },
      ],
    },
    {
      say: 'Şimdi flamingo duruşu! Aşağı dümdüz inen bir bacak ve dizinden geriye bükülmüş diğer bacağı çiz.',
      shapes: [
        { d: 'M215,235 L215,360', part: 'dik bacak' },
        { d: circle(215, 295, 4), part: 'sol diz', fill: '#ff8787' },
        { d: 'M228,235 L190,280 L242,284', part: 'bükük bacak' },
        { d: circle(190, 280, 4), part: 'sağ diz', fill: '#ff8787' },
      ],
    },
    {
      say: 'Bacağın ucuna perdeli bir ayak ve suyun üstünde durduğunu gösteren minik dalgalar çiz.',
      shapes: [
        {
          d: 'M215,360 L198,368 C208,366 215,368 215,370 C215,368 222,366 232,368 L215,360 Z',
          part: 'perdeli ayak',
          fill: '#ff8787',
        },
        { d: 'M242,284 L252,279 M242,284 L255,285 M242,284 L251,291', part: 'bükük ayak parmakları' },
        { d: ellipse(215, 370, 36, 7), part: 'su dalgası' },
        { d: ellipse(215, 375, 22, 4.5), part: 'küçük su dalgası' },
      ],
    },
  ],
};

export default flamingo;
