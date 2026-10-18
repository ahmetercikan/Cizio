import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const yeniYil: Lesson = {
  id: 'yeni-yil',
  path: 'ozel',
  title: 'Yeni Yıl Havai Fişeği',
  emoji: '🎆',
  order: 15,
  level: 2,
  skill: 'Merkezden dışa doğru yayılan ışık ışınları, parıldayan kıvılcımlar ve renkli havai fişek patlamalarını çizmeyi öğrendin!',
  palette: ['#1a103c', '#ff007f', '#7928ca', '#00f5d4', '#fee440', '#ff5400', '#ffffff'],
  steps: [
    {
      say: 'Önce gecenin karanlığında havai fişekleri izleyeceğimiz ışıklı küçük şehir siluetini çizelim.',
      shapes: [
        {
          d: 'M20,380 L20,350 L55,350 L55,335 L90,335 L90,360 L130,360 L130,325 L165,325 L165,370 L195,370 L195,340 L235,340 L235,365 L270,365 L270,330 L305,330 L305,355 L345,355 L345,340 L380,340 L380,380 Z',
          part: 'şehir silueti',
          fill: '#1a103c',
        },
        { d: 'M65,345 L75,345 L75,355 L65,355 Z', part: 'sol bina penceresi', fill: '#fee440' },
        { d: 'M140,335 L150,335 L150,345 L140,345 Z', part: 'orta bina penceresi', fill: '#fee440' },
        { d: 'M280,340 L290,340 L290,350 L280,350 Z', part: 'sağ bina penceresi', fill: '#fee440' },
      ],
    },
    {
      say: 'Şehirden gökyüzüne doğru hızla yükselen kıvrımlı roket izlerini çizelim.',
      shapes: [
        { d: 'M200,340 Q190,260 200,165', part: 'orta roket izi' },
        { d: circle(200, 165, 4), part: 'orta roket ucu', fill: '#fee440' },
        { d: 'M90,335 Q80,235 100,110', part: 'sol roket izi' },
        { d: circle(100, 110, 3.5), part: 'sol roket ucu', fill: '#00f5d4' },
        { d: 'M305,330 Q325,255 300,180', part: 'sağ roket izi' },
        { d: circle(300, 180, 3.5), part: 'sağ roket ucu', fill: '#ff007f' },
      ],
    },
    {
      say: 'Ortadaki büyük fişeğin patladığı parlak merkezi ve ilk ışıltı halkasını çizelim.',
      shapes: [
        {
          d: 'M200,153 L203,162 L212,165 L203,168 L200,177 L197,168 L188,165 L197,162 Z',
          part: 'merkez patlama yıldızı',
          fill: '#ffffff',
        },
        { d: circle(200, 143, 4), part: 'iç ışık üst', fill: '#fee440' },
        { d: circle(216, 149, 4), part: 'iç ışık sağ üst', fill: '#fee440' },
        { d: circle(222, 165, 4), part: 'iç ışık sağ', fill: '#fee440' },
        { d: circle(216, 181, 4), part: 'iç ışık sağ alt', fill: '#fee440' },
        { d: circle(200, 187, 4), part: 'iç ışık alt', fill: '#fee440' },
        { d: circle(184, 181, 4), part: 'iç ışık sol alt', fill: '#fee440' },
        { d: circle(178, 165, 4), part: 'iç ışık sol', fill: '#fee440' },
        { d: circle(184, 149, 4), part: 'iç ışık sol üst', fill: '#fee440' },
      ],
    },
    {
      say: 'Merkezden gökyüzünün her yanına yayılan uzun, kavisli havai fişek ışık kollarını çizelim.',
      shapes: [
        { d: 'M200,143 Q195,100 190,75', part: 'üst ışık kolu' },
        { d: 'M216,149 Q245,120 270,105', part: 'sağ üst ışık kolu' },
        { d: 'M222,165 Q265,160 295,170', part: 'sağ ışık kolu' },
        { d: 'M216,181 Q250,215 270,240', part: 'sağ alt ışık kolu' },
        { d: 'M200,187 Q205,225 210,255', part: 'alt ışık kolu' },
        { d: 'M184,181 Q150,215 130,240', part: 'sol alt ışık kolu' },
        { d: 'M178,165 Q135,160 105,170', part: 'sol ışık kolu' },
        { d: 'M184,149 Q155,120 130,105', part: 'sol üst ışık kolu' },
      ],
    },
    {
      say: 'Işık kollarının uçlarına patlayan parlak pembe kıvılcımları ve süzülen ışıltıları ekleyelim.',
      shapes: [
        { d: circle(190, 75, 5), part: 'üst kıvılcım', fill: '#ff007f' },
        { d: circle(188, 88, 3), part: 'üst süzülen damla', fill: '#fee440' },
        { d: circle(270, 105, 5), part: 'sağ üst kıvılcım', fill: '#ff007f' },
        { d: circle(260, 116, 3), part: 'sağ üst süzülen damla', fill: '#fee440' },
        { d: circle(295, 170, 5), part: 'sağ kıvılcım', fill: '#ff007f' },
        { d: circle(284, 174, 3), part: 'sağ süzülen damla', fill: '#fee440' },
        { d: circle(270, 240, 5), part: 'sağ alt kıvılcım', fill: '#ff007f' },
        { d: circle(262, 230, 3), part: 'sağ alt süzülen damla', fill: '#fee440' },
        { d: circle(210, 255, 5), part: 'alt kıvılcım', fill: '#ff007f' },
        { d: circle(207, 242, 3), part: 'alt süzülen damla', fill: '#fee440' },
        { d: circle(130, 240, 5), part: 'sol alt kıvılcım', fill: '#ff007f' },
        { d: circle(138, 230, 3), part: 'sol alt süzülen damla', fill: '#fee440' },
        { d: circle(105, 170, 5), part: 'sol kıvılcım', fill: '#ff007f' },
        { d: circle(116, 174, 3), part: 'sol süzülen damla', fill: '#fee440' },
        { d: circle(130, 105, 5), part: 'sol üst kıvılcım', fill: '#ff007f' },
        { d: circle(140, 116, 3), part: 'sol üst süzülen damla', fill: '#fee440' },
      ],
    },
    {
      say: 'Sol tarafa turkuaz, sağ tarafa ise altın sarısı ve turuncu renkte patlayan iki havai fişek daha çizelim.',
      shapes: [
        { d: circle(100, 110, 5), part: 'sol merkez', fill: '#ffffff' },
        {
          d: 'M100,110 L100,70 M100,110 L132,90 M100,110 L135,125 M100,110 L118,145 M100,110 L75,138 M100,110 L65,100 M100,110 L78,78',
          part: 'sol ışık demeti',
        },
        { d: circle(100, 70, 3.5), part: 'sol üst damla', fill: '#00f5d4' },
        { d: circle(132, 90, 3.5), part: 'sol sağ üst damla', fill: '#00f5d4' },
        { d: circle(135, 125, 3.5), part: 'sol sağ alt damla', fill: '#00f5d4' },
        { d: circle(65, 100, 3.5), part: 'sol sol damla', fill: '#00f5d4' },
        { d: circle(78, 78, 3.5), part: 'sol sol üst damla', fill: '#00f5d4' },
        { d: circle(300, 180, 5), part: 'sağ merkez', fill: '#ffffff' },
        {
          d: 'M300,180 L300,140 M300,180 L332,160 M300,180 L335,195 M300,180 L320,215 M300,180 L275,208 M300,180 L265,170 M300,180 L278,150',
          part: 'sağ ışık demeti',
        },
        { d: circle(300, 140, 3.5), part: 'sağ üst damla', fill: '#ff5400' },
        { d: circle(332, 160, 3.5), part: 'sağ sağ üst damla', fill: '#fee440' },
        { d: circle(335, 195, 3.5), part: 'sağ sağ alt damla', fill: '#ff5400' },
        { d: circle(265, 170, 3.5), part: 'sağ sol damla', fill: '#fee440' },
        { d: circle(278, 150, 3.5), part: 'sağ sol üst damla', fill: '#ff5400' },
      ],
    },
    {
      say: 'Gökyüzünü rengarenk konfetiler ve parıldayan kutlama yıldızlarıyla dolduralım. Yeni yıl kutlu olsun!',
      shapes: [
        {
          d: 'M50,38 Q50,45 43,45 Q50,45 50,52 Q50,45 57,45 Q50,45 50,38 Z',
          part: 'sol gök yıldızı',
          fill: '#fee440',
        },
        {
          d: 'M350,58 Q350,65 343,65 Q350,65 350,72 Q350,65 357,65 Q350,65 350,58 Z',
          part: 'sağ gök yıldızı',
          fill: '#fee440',
        },
        {
          d: 'M200,28 Q200,35 193,35 Q200,35 200,42 Q200,35 207,35 Q200,35 200,28 Z',
          part: 'tepe gök yıldızı',
          fill: '#ffffff',
        },
        { d: 'M45,175 Q60,188 50,205 Q40,222 55,235', part: 'sol konfeti şeridi' },
        { d: 'M355,240 Q340,255 355,275 Q370,295 350,308', part: 'sağ konfeti şeridi' },
        { d: circle(165, 55, 3), part: 'gök ışıltısı 1', fill: '#fee440' },
        { d: circle(235, 55, 3), part: 'gök ışıltısı 2', fill: '#00f5d4' },
        { d: circle(345, 125, 3), part: 'gök ışıltısı 3', fill: '#ff007f' },
        { d: circle(45, 125, 3), part: 'gök ışıltısı 4', fill: '#fee440' },
      ],
    },
  ],
};

export default yeniYil;
