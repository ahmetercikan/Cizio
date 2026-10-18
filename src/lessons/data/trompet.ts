import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 22: Parlak trompet. Ana borular, kalak, ağızlık, 3 piston ve müzik notaları. */
const trompet: Lesson = {
  id: 'trompet',
  path: 'nesneler',
  title: 'Parlak Trompet',
  emoji: '🎺',
  order: 22,
  level: 2,
  skill: 'Genişleyen boru kıvrımlarını ve piston tuşlarını çizerek nefesli çalgı oluşturmayı öğrendin!',
  palette: ['#f1c40f', '#f39c12', '#d35400', '#ecf0f1', '#bdc3c7', '#2c3e50', '#ffffff'],
  steps: [
    {
      say: 'Önce trompetin arkasında kıvrılan ana boru hatlarını paralel çizgilerle çiz.',
      shapes: [
        {
          d: 'M95,172 L245,172 L245,182 L95,182 C82,182 82,208 95,208 L245,208 L245,218 L95,218 C70,218 70,172 95,172 Z',
          part: 'ana borular',
          fill: '#f1c40f',
        },
      ],
    },
    {
      say: 'Boruyu sağa doğru genişleterek müziğin sesini yayan kalak kısmını uzat.',
      shapes: [
        {
          d: 'M245,172 Q290,170 335,135 L335,255 Q290,220 245,218 Z',
          part: 'kalak gövdesi',
          fill: '#f1c40f',
        },
      ],
    },
    {
      say: 'Kalak ucuna sesin çıktığı kocaman ve parlak bir oval ağız ekle.',
      shapes: [
        { d: ellipse(335, 195, 16, 60), part: 'kalak ağzı', fill: '#f39c12' },
        { d: ellipse(335, 195, 10, 52), part: 'kalak içi', fill: '#d35400' },
      ],
    },
    {
      say: 'En sol uca trompete üflediğimiz metal ağızlığı yerleştir.',
      shapes: [
        { d: 'M95,174 L65,174 L65,180 L95,180 Z', part: 'ağızlık borusu', fill: '#bdc3c7' },
        { d: 'M65,168 L48,162 L48,192 L65,186 Z', part: 'ağızlık çanağı', fill: '#ecf0f1' },
        { d: ellipse(48, 177, 3, 15), part: 'ağızlık halkası', fill: '#bdc3c7' },
      ],
    },
    {
      say: 'Trompetin ortasına ses tonunu değiştiren üç dikey piston silindiri çiz.',
      shapes: [
        { d: 'M162,145 L178,145 L178,242 L162,242 Z', part: '1. piston', fill: '#f39c12' },
        { d: 'M192,145 L208,145 L208,242 L192,242 Z', part: '2. piston', fill: '#f39c12' },
        { d: 'M222,145 L238,145 L238,242 L222,242 Z', part: '3. piston', fill: '#f39c12' },
      ],
    },
    {
      say: 'Silindirlerin tepesine parmaklarımızla bastığımız üç parlak tuş koy.',
      shapes: [
        { d: 'M168,145 L168,128 L172,128 L172,145 Z', part: '1. tuş sapı', fill: '#bdc3c7' },
        { d: ellipse(170, 126, 8, 4), part: '1. tuş', fill: '#ecf0f1' },
        { d: 'M198,145 L198,128 L202,128 L202,145 Z', part: '2. tuş sapı', fill: '#bdc3c7' },
        { d: ellipse(200, 126, 8, 4), part: '2. tuş', fill: '#ecf0f1' },
        { d: 'M228,145 L228,128 L232,128 L232,145 Z', part: '3. tuş sapı', fill: '#bdc3c7' },
        { d: ellipse(230, 126, 8, 4), part: '3. tuş', fill: '#ecf0f1' },
      ],
    },
    {
      say: 'Pistonların altına kıvrılan küçük akort borusunu ve destek çubuklarını ekle.',
      shapes: [
        { d: 'M178,228 L178,265 Q200,282 222,265 L222,228', part: 'akort borusu' },
        { d: 'M125,172 L125,218', part: 'ön destek çubuğu' },
        { d: 'M260,172 L260,218', part: 'arka destek çubuğu' },
      ],
    },
    {
      say: 'Kalaktan dışarı süzülen neşeli müzik notaları ve parlak ışıltılar çiz!',
      shapes: [
        { d: 'M355,130 L368,120 L368,142', part: 'nota sapı 1' },
        { d: circle(355, 142, 5), part: 'nota başı 1', fill: '#2c3e50' },
        { d: 'M362,180 L376,170 L376,192', part: 'nota sapı 2' },
        { d: circle(362, 192, 5), part: 'nota başı 2', fill: '#2c3e50' },
        { d: 'M295,165 L295,185', part: 'parıltı dikey' },
        { d: 'M285,175 L305,175', part: 'parıltı yatay' },
      ],
    },
  ],
};

export default trompet;
