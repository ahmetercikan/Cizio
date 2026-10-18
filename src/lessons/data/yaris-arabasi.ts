import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const yarisArabasi: Lesson = {
  id: 'yaris-arabasi',
  path: 'tasitlar',
  title: 'Yarış Arabası',
  emoji: '🏎️',
  order: 18,
  level: 2,
  skill: 'Alçak yarış çizgileri, spoyler ve hız detaylarıyla bir yarış arabası tasarlamayı öğrendin!',
  palette: ['#ff3344', '#ffffff', '#222225', '#ffd166', '#aee3ff', '#a0aab8'],
  steps: [
    {
      say: 'Önce yere yakın, rüzgar gibi hızlı yarış arabasının gövdesini çiz.',
      shapes: [
        {
          d:
            'M70,225 L100,225 A35,35 0 0,1 160,225 L235,225 A35,35 0 0,1 295,225 ' +
            'L340,240 Q350,242 350,250 L350,260 L65,260 Q60,260 60,250 L60,235 Q60,225 70,225 Z',
          part: 'alt şasi',
          fill: '#ff3344',
        },
        {
          d: 'M140,225 Q170,165 220,165 Q250,165 270,225 Z',
          part: 'kokpit gövdesi',
          fill: '#ff3344',
        },
      ],
    },
    {
      say: 'Kokpit camını ve kaskını takmış cesur yarış pilotunu ekle.',
      shapes: [
        { d: 'M180,175 Q215,175 235,200 L170,200 Z', part: 'kokpit camı', fill: '#aee3ff' },
        { d: circle(200, 185, 12), part: 'pilot kaskı', fill: '#ffd166' },
        { d: 'M198,183 Q208,183 211,187 L206,191 Q198,188 198,183 Z', part: 'kask vizörü', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Arka kısma arabayı yere bastıran yüksek rüzgarlığı (spoyler) çiz.',
      shapes: [
        { d: 'M75,225 L65,185 M85,225 L75,185', part: 'spoyler ayakları' },
        { d: 'M45,185 L95,175 Q98,175 98,180 L95,188 L45,198 Z', part: 'spoyler kanadı', fill: '#2d2d2d' },
        { d: 'M42,175 L52,172 L50,200 L40,203 Z', part: 'spoyler yan plakası', fill: '#ff3344' },
      ],
    },
    {
      say: 'Burnun ucuna keskin ön kanadı yerleştir.',
      shapes: [
        { d: 'M330,248 L365,248 Q370,248 370,255 L370,260 L330,260 Z', part: 'ön kanat', fill: '#2d2d2d' },
        { d: 'M362,240 L368,240 L368,260 L362,260 Z', part: 'ön kanat ucu', fill: '#ff3344' },
      ],
    },
    {
      say: 'Geniş yarış tekerleklerini ve altın sarısı jantlarını çiz.',
      shapes: [
        { d: circle(130, 245, 32), part: 'arka lastik', fill: '#222225' },
        { d: circle(130, 245, 14), part: 'arka jant', fill: '#ffd166' },
        { d: circle(265, 245, 32), part: 'ön lastik', fill: '#222225' },
        { d: circle(265, 245, 14), part: 'ön jant', fill: '#ffd166' },
      ],
    },
    {
      say: 'Gövdenin ortasına beyaz daire içinde 1 numarasını yaz.',
      shapes: [
        { d: circle(200, 232, 16), part: 'numara zemini', fill: '#ffffff' },
        { d: 'M196,224 L202,220 L202,244 M194,244 L208,244', part: 'bir rakamı' },
      ],
    },
    {
      say: 'Gövde boyunca uzanan havalı yarış şeritlerini çek.',
      shapes: [
        { d: 'M110,215 Q180,205 285,232', part: 'üst yarış şeridi' },
        { d: 'M115,220 Q180,212 280,237', part: 'alt yarış şeridi' },
      ],
    },
    {
      say: 'Egzozdan çıkan küçük alevi ve etraftaki hız çizgilerini ekle.',
      shapes: [
        { d: 'M58,248 Q38,248 42,242 Q48,245 58,245 Z', part: 'egzoz alevi', fill: '#ffe066' },
        { d: 'M30,278 L370,278', part: 'yarış pisti' },
        { d: 'M30,210 L50,210 M25,230 L45,230 M310,185 L350,185', part: 'hız rüzgarları' },
      ],
    },
  ],
};

export default yarisArabasi;
