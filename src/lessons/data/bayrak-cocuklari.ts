import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const n = (v: number) => Math.round(v * 100) / 100;

const heart = (cx: number, top: number, w: number, h: number) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const dip = top + h * 0.22, mid = top + h * 0.34, tip = top + h;
  return (
    `M${n(cx)},${n(dip)} C${n(cx - w * 0.12)},${n(top - h * 0.05)} ${n(x0)},${n(top)} ${n(x0)},${n(mid)} ` +
    `C${n(x0)},${n(top + h * 0.62)} ${n(cx - w * 0.3)},${n(top + h * 0.78)} ${n(cx)},${n(tip)} ` +
    `C${n(cx + w * 0.3)},${n(top + h * 0.78)} ${n(x1)},${n(top + h * 0.62)} ${n(x1)},${n(mid)} ` +
    `C${n(x1)},${n(top)} ${n(cx + w * 0.12)},${n(top - h * 0.05)} ${n(cx)},${n(dip)} Z`
  );
};

const bayrakCocuklari: Lesson = {
  id: 'bayrak-cocuklari',
  path: 'ozel',
  title: '23 Nisan Çocukları',
  emoji: '🎈',
  order: 11,
  level: 2,
  skill: 'Yan yana durup el ele tutuşan sevimli çocukları, gökte dalgalanan al bayrağımızı ve uçan rengarenk balonları çizmeyi öğrendin!',
  palette: ['#e30a17', '#ffffff', '#ffd166', '#3fa7ff', '#ff85a1', '#2d2d2d', '#6ccf7f', '#ffeaa7'],
  steps: [
    {
      say: 'Önce yan yana duran iki neşeli çocuğumuz için iki yuvarlak kafa çizelim.',
      shapes: [
        { d: circle(145, 185, 26), part: 'sol çocuk kafa', fill: '#ffeaa7' },
        { d: circle(255, 185, 26), part: 'sağ çocuk kafa', fill: '#ffeaa7' },
      ],
    },
    {
      say: 'Çocuklarımızın saçlarını çizelim; birine tatlı kaküller, diğerine iki yana açılan neşeli örgüler yapalım.',
      shapes: [
        {
          d: 'M119,185 C118,155 172,155 171,185 C162,175 152,178 145,172 C138,178 128,175 119,185 Z',
          part: 'sol çocuk saç',
          fill: '#8d5b4c',
        },
        {
          d: 'M229,185 C228,155 282,155 281,185 C272,175 262,178 255,172 C248,178 238,175 229,185 Z',
          part: 'sağ çocuk saç',
          fill: '#4a3525',
        },
        { d: 'M229,180 C215,175 210,195 224,202 Z', part: 'sol saç örgüsü', fill: '#4a3525' },
        { d: 'M281,180 C295,175 300,195 286,202 Z', part: 'sağ saç örgüsü', fill: '#4a3525' },
        { d: circle(227, 184, 4), part: 'sol saç tokası', fill: '#ff85a1' },
        { d: circle(283, 184, 4), part: 'sağ saç tokası', fill: '#ff85a1' },
      ],
    },
    {
      say: 'Gözlerini, pembe al yanaklarını ve kocaman gülümseyen ağızlarını ekleyelim.',
      shapes: [
        { d: circle(137, 183, 3), part: 'sol çocuk sol göz', fill: '#2d2d2d' },
        { d: circle(153, 183, 3), part: 'sol çocuk sağ göz', fill: '#2d2d2d' },
        { d: 'M138,193 Q145,200 152,193', part: 'sol çocuk ağız' },
        { d: circle(132, 191, 3.5), part: 'sol çocuk sol yanak', fill: '#ff85a1' },
        { d: circle(158, 191, 3.5), part: 'sol çocuk sağ yanak', fill: '#ff85a1' },
        { d: circle(247, 183, 3), part: 'sağ çocuk sol göz', fill: '#2d2d2d' },
        { d: circle(263, 183, 3), part: 'sağ çocuk sağ göz', fill: '#2d2d2d' },
        { d: 'M248,193 Q255,200 262,193', part: 'sağ çocuk ağız' },
        { d: circle(242, 191, 3.5), part: 'sağ çocuk sol yanak', fill: '#ff85a1' },
        { d: circle(268, 191, 3.5), part: 'sağ çocuk sağ yanak', fill: '#ff85a1' },
      ],
    },
    {
      say: 'Bayramlık kıyafetlerini çizelim. Birine mavi tişört ve şort, diğerine beyaz kalpli al bir elbise.',
      shapes: [
        { d: 'M130,211 L160,211 L165,260 L125,260 Z', part: 'tişört', fill: '#3fa7ff' },
        {
          d: 'M126,260 L164,260 L164,285 L147,285 L147,272 L143,272 L143,285 L126,285 Z',
          part: 'şort',
          fill: '#2d3748',
        },
        { d: 'M242,211 L268,211 L282,285 L228,285 Z', part: 'elbise', fill: '#e30a17' },
        { d: heart(255, 235, 16, 15), part: 'elbise kalbi', fill: '#ffffff' },
      ],
    },
    {
      say: 'İki çocuğun ortada buluşup sımsıkı kenetlenen ellerini ve neşeyle duran bacaklarını çizelim.',
      shapes: [
        { d: 'M160,222 Q182,238 200,240', part: 'sol çocuk orta kol' },
        { d: 'M250,222 Q228,238 200,240', part: 'sağ çocuk orta kol' },
        { d: circle(200, 240, 6), part: 'kenetlenen eller', fill: '#ffeaa7' },
        { d: 'M133,285 L133,315', part: 'sol çocuk sol bacak' },
        { d: 'M157,285 L157,315', part: 'sol çocuk sağ bacak' },
        { d: 'M126,315 Q135,310 139,322 L126,322 Z', part: 'sol çocuk sol ayakkabı', fill: '#2d2d2d' },
        { d: 'M151,315 Q160,310 164,322 L151,322 Z', part: 'sol çocuk sağ ayakkabı', fill: '#2d2d2d' },
        { d: 'M243,285 L243,315', part: 'sağ çocuk sol bacak' },
        { d: 'M267,285 L267,315', part: 'sağ çocuk sağ bacak' },
        { d: 'M236,315 Q245,310 249,322 L236,322 Z', part: 'sağ çocuk sol ayakkabı', fill: '#e30a17' },
        { d: 'M261,315 Q270,310 274,322 L261,322 Z', part: 'sağ çocuk sağ ayakkabı', fill: '#e30a17' },
      ],
    },
    {
      say: 'Sol çocuğun balonları, sağ çocuğun ise bayrak direğini tutan kollarını çizelim.',
      shapes: [
        { d: 'M130,222 Q105,215 95,195', part: 'balon tutan kol' },
        { d: circle(93, 193, 5), part: 'balon tutan el', fill: '#ffeaa7' },
        { d: 'M270,222 Q295,220 305,200', part: 'bayrak tutan kol' },
        { d: circle(306, 198, 5), part: 'bayrak tutan el', fill: '#ffeaa7' },
        { d: 'M306,270 L306,60', part: 'bayrak direği' },
        { d: circle(306, 56, 5), part: 'direk tepesi', fill: '#ffd166' },
      ],
    },
    {
      say: 'Sol tarafa gökyüzüne süzülen kırmızı, sarı ve mavi balonlarımızı ekleyelim.',
      shapes: [
        { d: 'M93,193 Q85,150 70,112', part: 'kırmızı balon ipi' },
        { d: 'M93,193 Q98,140 100,87', part: 'sarı balon ipi' },
        { d: 'M93,193 Q120,150 125,121', part: 'mavi balon ipi' },
        { d: ellipse(70, 90, 18, 22), part: 'kırmızı balon', fill: '#e30a17' },
        { d: 'M67,112 L73,112 L70,116 Z', part: 'kırmızı balon düğümü', fill: '#e30a17' },
        { d: ellipse(100, 65, 17, 21), part: 'sarı balon', fill: '#ffd166' },
        { d: 'M97,86 L103,86 L100,90 Z', part: 'sarı balon düğümü', fill: '#ffd166' },
        { d: ellipse(125, 100, 16, 20), part: 'mavi balon', fill: '#3fa7ff' },
        { d: 'M122,120 L128,120 L125,124 Z', part: 'mavi balon düğümü', fill: '#3fa7ff' },
      ],
    },
    {
      say: 'Bayrağımıza bembeyaz hilal ile yıldızı, alta da yemyeşil çimeni çizelim. 23 Nisan kutlu olsun!',
      shapes: [
        {
          d: 'M306,62 Q335,50 365,65 Q375,69 385,62 L385,122 Q375,129 365,125 Q335,110 306,122 Z',
          part: 'dalgalanan bayrak',
          fill: '#e30a17',
        },
        {
          d: 'M336,82 A11,11 0 1,0 336,104 A8.8,8.8 0 1,1 336,82 Z',
          part: 'bayrak hilali',
          fill: '#ffffff',
        },
        {
          d: 'M352,88 L353.5,91.5 L357,92 L354.5,94.5 L355,98 L352,96 L349,98 L349.5,94.5 L347,92 L350.5,91.5 Z',
          part: 'bayrak yıldızı',
          fill: '#ffffff',
        },
        {
          d: 'M20,335 Q200,315 380,335 L380,360 L20,360 Z',
          part: 'bayram çimeni',
          fill: '#6ccf7f',
        },
      ],
    },
  ],
};

export default bayrakCocuklari;
