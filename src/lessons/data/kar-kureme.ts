import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const karKureme: Lesson = {
  id: 'kar-kureme',
  path: 'tasitlar',
  title: 'Kar Küreme Aracı',
  emoji: '🚜',
  order: 17,
  level: 2,
  skill: 'Ön bıçak ve tuz haznesi gibi özel ekipmanları kamyona eklemeyi öğrendin!',
  palette: ['#ff9f1c', '#ffd166', '#e8ecf2', '#3a3a4a', '#a0aab8', '#ffffff'],
  steps: [
    {
      say: 'Önce turuncu kar küreme kamyonunun kabinini ve gövdesini çiz.',
      shapes: [
        {
          d:
            'M90,200 L210,200 L210,140 Q210,135 220,135 L285,135 Q295,135 305,150 ' +
            'L325,195 Q330,205 330,220 L330,260 L315,260 A35,35 0 0,0 245,260 ' +
            'L185,260 A35,35 0 0,0 115,260 L90,260 Z',
          part: 'kabin ve gövde',
          fill: '#ff9f1c',
        },
      ],
    },
    {
      say: 'Kamyonun arkasına tuz ve kum taşıyan büyük hazneyi ekle.',
      shapes: [
        { d: 'M100,150 L200,150 L200,200 L115,200 Z', part: 'tuz haznesi', fill: '#ffd166' },
        { d: 'M110,150 Q150,135 190,150 Z', part: 'tuz yığını', fill: '#ffffff' },
      ],
    },
    {
      say: 'Karda kaymayan iki büyük dişli kış tekerleği çiz.',
      shapes: [
        { d: circle(150, 260, 32), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(150, 260, 13), part: 'arka jant', fill: '#a0aab8' },
        { d: circle(280, 260, 32), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(280, 260, 13), part: 'ön jant', fill: '#a0aab8' },
      ],
    },
    {
      say: 'Kabine geniş pencereler ve tavana sarı çakar lamba ekle.',
      shapes: [
        { d: 'M265,145 L290,145 L310,190 L265,190 Z', part: 'ön pencere', fill: '#aee3ff' },
        { d: 'M225,145 L255,145 L255,190 L225,190 Z', part: 'yan pencere', fill: '#aee3ff' },
        { d: 'M245,135 L265,135 L265,130 L245,130 Z', part: 'lamba ayağı', fill: '#3a3a4a' },
        { d: 'M247,130 Q247,118 255,118 Q263,118 263,130 Z', part: 'çakar lamba', fill: '#ffe066' },
        { d: 'M240,118 L232,112 M270,118 L278,112 M255,112 L255,102', part: 'çakar ışınları' },
      ],
    },
    {
      say: 'Kamyonun önüne karları iten dev eğimli küreme bıçağını çiz.',
      shapes: [
        { d: 'M325,230 L345,230 M325,248 L345,248', part: 'bıçak kolları' },
        {
          d: 'M345,200 Q365,215 375,250 L370,278 L345,278 Q355,245 338,205 Z',
          part: 'küreme bıçağı',
          fill: '#e8ecf2',
        },
        { d: 'M342,275 L372,275', part: 'bıçak lastiği' },
      ],
    },
    {
      say: 'Arka tarafa yola tuz saçan döner serici mekanizmasını ekle.',
      shapes: [
        { d: 'M90,200 L82,245 L100,245 Z', part: 'dağıtım hunisi', fill: '#3a3a4a' },
        { d: ellipse(91, 252, 16, 6), part: 'döner fırça', fill: '#a0aab8' },
        { d: 'M70,265 L66,267 M78,272 L74,275 M86,276 L84,280 M96,275 L98,280', part: 'yere saçılan tuzlar' },
      ],
    },
    {
      say: 'Bıçağın önünden savrulan karları ve havada uçuşan kar tanelerini çiz.',
      shapes: [
        { d: 'M368,230 Q395,200 380,170 Q370,185 358,195', part: 'savrulan kar dalgası' },
        { d: circle(385, 180, 8), part: 'kar topu 1', fill: '#ffffff' },
        { d: circle(375, 155, 6), part: 'kar topu 2', fill: '#ffffff' },
        { d: 'M140,85 L150,85 M145,80 L145,90 M320,75 L330,75 M325,70 L325,80', part: 'kar taneleri' },
        { d: 'M50,292 L380,292', part: 'karlı yol' },
      ],
    },
  ],
};

export default karKureme;
