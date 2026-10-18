import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const cekici: Lesson = {
  id: 'cekici',
  path: 'tasitlar',
  title: 'Çekici (TIR)',
  emoji: '🚛',
  order: 19,
  level: 2,
  skill: 'Kabin ve uzun dorse parçalarını birbirine bağlayıp çok tekerlekli büyük bir TIR çizmeyi öğrendin!',
  palette: ['#3a86ff', '#8338ec', '#d0d4dc', '#3a3a4a', '#ffe066', '#aee3ff'],
  steps: [
    {
      say: 'Önce çekicinin yüksek ve güçlü mavi kabinini çiz.',
      shapes: [
        {
          d:
            'M240,265 L240,150 Q240,135 252,135 L310,135 Q325,135 335,150 ' +
            'L345,190 Q350,200 350,215 L350,265 L335,265 A30,30 0 0,0 275,265 L240,265 Z',
          part: 'çekici kabini',
          fill: '#3a86ff',
        },
      ],
    },
    {
      say: 'Kabinin önüne büyük ön camı ve yan kapı camını ekle.',
      shapes: [
        { d: 'M295,145 L322,145 L335,185 L295,185 Z', part: 'ön cam', fill: '#aee3ff' },
        { d: 'M255,145 L288,145 L288,185 L255,185 Z', part: 'yan cam', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Kabinin arkasına göğe uzanan parlak egzoz borusunu ve siperliği çiz.',
      shapes: [
        { d: 'M244,190 L244,105 Q244,98 250,98 L254,98 L254,190 Z', part: 'egzoz borusu', fill: '#d0d4dc' },
        { d: 'M290,140 L330,140 L334,148 L290,148 Z', part: 'güneşlik siperliği', fill: '#222225' },
      ],
    },
    {
      say: 'Kabinin arkasına yük taşıyan uzun ve geniş dorseyi bağla.',
      shapes: [
        {
          d: 'M55,145 L225,145 Q230,145 230,150 L230,250 Q230,255 225,255 L55,255 Q50,255 50,250 L50,150 Q50,145 55,145 Z',
          part: 'yük dorsesi',
          fill: '#8338ec',
        },
        { d: 'M230,245 L245,245 L245,255 L230,255 Z', part: 'bağlantı demiri', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Dorsenin üstüne eşit aralıklarla dikey konteyner çizgileri çek.',
      shapes: [
        {
          d: 'M80,150 L80,250 M110,150 L110,250 M140,150 L140,250 M170,150 L170,250 M200,150 L200,250',
          part: 'konteyner çizgileri',
        },
      ],
    },
    {
      say: 'Dorsenin ve kabinin altına sağlam tekerlekleri ve jantları çiz.',
      shapes: [
        { d: circle(85, 265, 26), part: 'arka sol tekerlek', fill: '#3a3a4a' },
        { d: circle(85, 265, 10), part: 'arka sol jant', fill: '#e8ecf2' },
        { d: circle(140, 265, 26), part: 'arka sağ tekerlek', fill: '#3a3a4a' },
        { d: circle(140, 265, 10), part: 'arka sağ jant', fill: '#e8ecf2' },
        { d: circle(305, 265, 26), part: 'ön tekerlek', fill: '#3a3a4a' },
        { d: circle(305, 265, 10), part: 'ön jant', fill: '#e8ecf2' },
      ],
    },
    {
      say: 'Kabin önüne parlayan krom ızgarayı, farı ve tamponu yerleştir.',
      shapes: [
        { d: 'M338,205 L350,205 L350,245 L338,245 Z', part: 'krom ızgara', fill: '#d0d4dc' },
        { d: 'M340,215 H348 M340,225 H348 M340,235 H348', part: 'ızgara çizgileri' },
        { d: 'M342,248 Q352,248 352,256 L342,256 Z', part: 'ön far', fill: '#ffe066' },
        { d: 'M335,260 L355,260 L355,270 L335,270 Z', part: 'ön tampon', fill: '#3a3a4a' },
      ],
    },
    {
      say: "Koca TIR'ın altına uzun bir otoyol ve yol şeritleri çiz.",
      shapes: [
        { d: 'M30,292 L370,292', part: 'otoyol' },
        { d: 'M60,310 L105,310 M155,310 L200,310 M250,310 L295,310 M335,310 L370,310', part: 'yol şeritleri' },
      ],
    },
  ],
};

export default cekici;
