import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const star = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? R : R * 0.45;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
};

/** Karakterler 16: Yıldızlı cüppesi, sihirli asası ve büyü kitabıyla usta bir büyücü. */
const buyucu: Lesson = {
  id: 'buyucu',
  path: 'masal',
  title: 'Sihirbaz',
  emoji: '🧙',
  order: 8,
  level: 3,
  skill: 'Yıldızlı cüppesi, elindeki büyü kitabı ve kıvılcımlar saçan sihirli asasıyla harika bir büyücü çizmeyi öğrendin!',
  palette: ['#312e81', '#ffd23f', '#38bdf8', '#ffe1cc', '#f1f5f9', '#854d0e', '#2d2d2d'],
  steps: [
    {
      say: 'Önce büyücünün geniş siperlikli, ucu yana kıvrılan sivri şapkasını çiz.',
      shapes: [
        {
          d: 'M95,135 C130,158 270,158 305,135 C270,122 130,122 95,135 Z',
          part: 'şapka siperliği',
          fill: '#312e81',
        },
        {
          d: 'M145,128 C160,80 175,40 235,25 C215,55 235,90 255,128 Z',
          part: 'sivri tepe',
          fill: '#312e81',
        },
        {
          d: 'M147,120 Q200,132 253,120 L254,128 Q200,140 146,128 Z',
          part: 'şapka bandı',
          fill: '#ffd23f',
        },
        { d: star(190, 75, 10), part: 'şapka yıldızı', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Şapkanın altına sevimli bir yüz ve aşağıya sarkan upuzun, bembeyaz bir sakal çiz.',
      shapes: [
        { d: 'M150,145 Q150,205 200,205 Q250,205 250,145', part: 'yüz', fill: '#ffe1cc' },
        {
          d: 'M150,175 C130,220 150,265 190,285 C200,290 205,290 210,285 C250,265 270,220 250,175 C240,195 220,205 200,205 C180,205 160,195 150,175 Z',
          part: 'uzun sakal',
          fill: '#f1f5f9',
        },
        {
          d: 'M175,185 Q195,195 200,185 Q205,195 225,185 Q200,175 175,185 Z',
          part: 'bıyık',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kafanın altına yere kadar uzanan gösterişli büyücü cüppesini çiz.',
      shapes: [
        {
          d: 'M168,205 L135,355 Q200,368 265,355 L232,205 Z',
          part: 'büyücü cüppesi',
          fill: '#3730a3',
        },
        {
          d: 'M135,355 Q200,368 265,355 L263,363 Q200,376 137,363 Z',
          part: 'etek bordürü',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Cüppenin üstüne sihirli altın yıldızlar ve hilal şeklinde bir ay deseni ekle.',
      shapes: [
        { d: star(165, 290, 8), part: 'sol yıldız deseni', fill: '#ffd23f' },
        { d: star(235, 305, 8), part: 'sağ yıldız deseni', fill: '#ffd23f' },
        { d: star(180, 335, 7), part: 'alt yıldız deseni', fill: '#ffd23f' },
        {
          d: 'M224,260 A9,9 0 1,0 234,274 A7,7 0 1,1 224,260 Z',
          part: 'hilal deseni',
          fill: '#ffd23f',
        },
      ],
    },
    {
      say: 'Cüppenin iki yanına dökümlü geniş kollar ve minik eller çiz.',
      shapes: [
        { d: 'M168,212 L120,262 L150,278 L175,236 Z', part: 'sol geniş kol', fill: '#312e81' },
        { d: circle(126, 268, 5), part: 'sol el', fill: '#ffe1cc' },
        { d: 'M232,212 L280,226 L268,252 L228,236 Z', part: 'sağ geniş kol', fill: '#312e81' },
        { d: circle(282, 230, 5), part: 'sağ el', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Büyücünün sol eline sayfaları açık duran bir büyü kitabı yerleştir.',
      shapes: [
        { d: 'M78,250 L124,256 L122,292 L76,286 Z', part: 'sol sayfa', fill: '#fef3c7' },
        { d: 'M124,256 L148,248 L146,284 L122,292 Z', part: 'sağ sayfa', fill: '#fef3c7' },
        { d: 'M74,288 L122,294 L150,286', part: 'kitap kapağı altı', fill: '#854d0e' },
        { d: circle(100, 271, 4), part: 'kitap simgesi' },
        { d: 'M100,263 L100,279 M92,271 L108,271', part: 'simge haçı' },
      ],
    },
    {
      say: 'Sağ eline tepesinde mavi kristal küre parlayan bir sihirli asa çiz.',
      shapes: [
        { d: 'M278,232 L322,162 L326,158 L282,228 Z', part: 'asa gövdesi', fill: '#854d0e' },
        { d: circle(328, 155, 9), part: 'kristal küre', fill: '#38bdf8' },
        { d: circle(328, 155, 14), part: 'kristal aurası' },
      ],
    },
    {
      say: 'Asanın ucundan fışkıran sihirli kıvılcımlar ve parıldayan yıldızlar ekle.',
      shapes: [
        { d: 'M335,145 Q360,130 350,110 Q335,95 320,115', part: 'sihir sarmalı' },
        {
          d: 'M365,115 L368,122 L375,125 L368,128 L365,135 L362,128 L355,125 L362,122 Z',
          part: 'büyük kıvılcım',
          fill: '#ffd23f',
        },
        {
          d: 'M310,95 L312,100 L317,102 L312,104 L310,109 L308,104 L303,102 L308,100 Z',
          part: 'küçük kıvılcım',
          fill: '#ffd23f',
        },
        { d: circle(355, 155, 3), part: 'parıltı noktası', fill: '#38bdf8' },
      ],
    },
    {
      say: 'Bilge ve sevimli bakan gözler, gür kaşlar ve cüppenin altından çıkan ayakkabıları çiz.',
      shapes: [
        { d: 'M170,140 Q180,132 192,140', part: 'sol kaş' },
        { d: 'M208,140 Q220,132 230,140', part: 'sağ kaş' },
        { d: ellipse(180, 150, 6, 7), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(182, 148, 2.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(220, 150, 6, 7), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(222, 148, 2.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: ellipse(165, 160, 6, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(235, 160, 6, 4), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M160,360 Q145,365 140,372 L175,372 Z', part: 'sol ayakkabı', fill: '#1e1b4b' },
        { d: 'M225,372 L260,372 Q255,365 240,360 Z', part: 'sağ ayakkabı', fill: '#1e1b4b' },
      ],
    },
  ],
};

export default buyucu;
