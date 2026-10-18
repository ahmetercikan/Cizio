import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const orkide: Lesson = {
  id: 'orkide',
  path: 'doga',
  title: 'Zarif Orkide',
  emoji: '🌺',
  order: 18,
  level: 3,
  skill: 'Farklı yaprak katmanları, dal kıvrımı ve beneklerle zarif bir orkide yarattın!',
  palette: ['#f472b6', '#fce7f3', '#be185d', '#831843', '#2d6a4f', '#ede0d4'],
  steps: [
    {
      say: 'Önce orkidemizin durduğu şık bir saksı ve kenarlardan taşan geniş yapraklar çiz.',
      shapes: [
        { d: 'M145,320 L155,380 L245,380 L255,320 Z', part: 'saksı', fill: '#ede0d4' },
        { d: 'M140,312 L260,312 L260,322 L140,322 Z', part: 'saksı kenarı', fill: '#ddb892' },
        {
          d: 'M150,320 C100,315 80,335 60,345 C95,355 130,345 155,335 Z',
          part: 'sol yaprak',
          fill: '#2d6a4f',
        },
        {
          d: 'M250,320 C300,315 320,335 340,345 C305,355 270,345 245,335 Z',
          part: 'sağ yaprak',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'Saksıdan yukarı doğru zarifçe kıvrılan uzun bir dal ve destek çubuğu çiz.',
      shapes: [
        { d: 'M196,312 C180,240 165,180 190,120 C205,85 245,70 270,82', part: 'orkide dalı' },
        { d: 'M180,312 L172,160', part: 'destek çubuğu' },
        { d: 'M170,210 Q180,210 183,205', part: 'dal klipsi' },
      ],
    },
    {
      say: 'Dalın ucuna açılmayı bekleyen üç minik orkide tomurcuğu ekle.',
      shapes: [
        { d: 'M270,82 C275,74 285,74 290,82 C285,90 275,90 270,82 Z', part: 'uç tomurcuk', fill: '#74c69d' },
        { d: 'M250,72 C254,64 262,64 266,72 C262,79 254,79 250,72 Z', part: 'orta tomurcuk', fill: '#74c69d' },
        { d: 'M232,70 C235,63 242,63 245,70 C242,76 235,76 232,70 Z', part: 'küçük tomurcuk', fill: '#95d5b2' },
      ],
    },
    {
      say: 'Çiçeğin dış kısmındaki üç zarif çanak yaprağını çiz: tepe, sol ve sağ alt.',
      shapes: [
        {
          d: 'M185,175 C170,140 170,95 185,82 C200,95 200,140 185,175 Z',
          part: 'üst çanak yaprak',
          fill: '#fce7f3',
        },
        {
          d: 'M185,175 C155,188 125,215 125,235 C145,235 172,210 185,175 Z',
          part: 'sol çanak yaprak',
          fill: '#fce7f3',
        },
        {
          d: 'M185,175 C215,188 245,215 245,235 C225,235 198,210 185,175 Z',
          part: 'sağ çanak yaprak',
          fill: '#fce7f3',
        },
      ],
    },
    {
      say: 'Şimdi çiçeğin iki yanına kanat gibi açılan iki büyük, geniş taç yaprak çiz.',
      shapes: [
        {
          d: 'M185,170 C150,135 100,140 90,165 C90,195 145,200 185,175 Z',
          part: 'sol taç yaprak',
          fill: '#f472b6',
        },
        {
          d: 'M185,170 C220,135 270,140 280,165 C280,195 225,200 185,175 Z',
          part: 'sağ taç yaprak',
          fill: '#f472b6',
        },
      ],
    },
    {
      say: 'Orkidenin tam ortasına o meşhur gösterişli dudak yaprağını kondur.',
      shapes: [
        {
          d: 'M175,175 C165,185 160,205 175,218 C185,226 195,218 205,205 C215,185 200,175 185,175 Z',
          part: 'dudak yaprağı',
          fill: '#be185d',
        },
        { d: 'M175,175 C168,170 162,182 170,190 Z', part: 'yan dudak', fill: '#9d174d' },
        { d: 'M195,175 C202,170 208,182 200,190 Z', part: 'yan dudak', fill: '#9d174d' },
        { d: circle(185, 172, 5.5), part: 'çiçek sütunu', fill: '#fbbf24' },
      ],
    },
    {
      say: 'Taç yaprakların ve dudağın üzerine minik, zarif benekler serpiştir.',
      shapes: [
        { d: circle(135, 165, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(150, 158, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(160, 168, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(235, 165, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(220, 158, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(210, 168, 2.5), part: 'benek', fill: '#831843' },
        { d: circle(180, 198, 2), part: 'dudak benegi', fill: '#fef08a' },
        { d: circle(190, 198, 2), part: 'dudak benegi', fill: '#fef08a' },
        { d: circle(185, 206, 2), part: 'dudak benegi', fill: '#fef08a' },
      ],
    },
    {
      say: 'Dalın biraz yukarısına açılmakta olan ikinci bir küçük çiçek ekle.',
      shapes: [
        { d: 'M235,115 C226,102 240,96 245,110 Z', part: 'küçük çanak', fill: '#fce7f3' },
        { d: 'M235,115 C246,105 260,110 252,124 Z', part: 'küçük taç yaprak', fill: '#f472b6' },
        { d: 'M235,115 C230,128 216,124 226,115 Z', part: 'küçük taç yaprak', fill: '#f472b6' },
        { d: 'M235,115 C237,122 243,122 241,116 Z', part: 'küçük dudak', fill: '#be185d' },
        { d: 'M215,118 L235,115', part: 'çiçek sapı' },
      ],
    },
  ],
};

export default orkide;
