import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const motor: Lesson = {
  id: 'motor',
  path: 'tasitlar',
  title: 'Motosiklet',
  emoji: '🏍️',
  order: 12,
  level: 3,
  skill: 'İki tekerlek üzerine karmaşık gövde, motor ve egzoz parçalarını adım adım birleştirmeyi öğrendin!',
  palette: ['#ff4d4d', '#3a3a4a', '#a0aab8', '#ffe066', '#e8ecf2', '#222225'],
  steps: [
    {
      say: 'Önce motosikletin ön ve arka tekerlekleri için iki büyük daire çiz.',
      shapes: [
        { d: circle(95, 270, 42), part: 'arka tekerlek', fill: '#3a3a4a' },
        { d: circle(305, 270, 42), part: 'ön tekerlek', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Tekerleklerin içine jantları ve ortadaki milleri ekle.',
      shapes: [
        { d: circle(95, 270, 24), part: 'arka jant', fill: '#d0d4dc' },
        { d: circle(95, 270, 10), part: 'arka mil', fill: '#707884' },
        { d: circle(305, 270, 24), part: 'ön jant', fill: '#d0d4dc' },
        { d: circle(305, 270, 10), part: 'ön mil', fill: '#707884' },
      ],
    },
    {
      say: 'Ön tekerleğe eğimli çatalı, arkaya da tekerlek kolunu çiz.',
      shapes: [
        { d: 'M300,270 L245,145 L255,142 L310,267 Z', part: 'ön çatal', fill: '#a0aab8' },
        { d: 'M95,270 L180,255 L180,268 L95,275 Z', part: 'arka maşa', fill: '#a0aab8' },
      ],
    },
    {
      say: 'İki tekerleğin arasına motor bloğunu ve soğutma çizgilerini yerleştir.',
      shapes: [
        { d: 'M150,225 L225,225 L220,275 L155,275 Z', part: 'motor bloğu', fill: '#707884' },
        { d: 'M156,238 L220,238 M156,250 L218,250 M158,262 L216,262', part: 'soğutma kanatları' },
      ],
    },
    {
      say: 'Çatalın gerisine kıvrımlı kırmızı bir benzin deposu çiz.',
      shapes: [
        {
          d: 'M245,145 Q210,135 185,160 L165,195 Q205,200 240,175 Q248,160 245,145 Z',
          part: 'benzin deposu',
          fill: '#ff4d4d',
        },
        { d: circle(215, 148, 5), part: 'depo kapağı', fill: '#d0d4dc' },
      ],
    },
    {
      say: 'Deponun arkasına rahat bir deri sele ve sivri arka kuyruğu ekle.',
      shapes: [
        { d: 'M165,195 Q145,195 130,205 L125,215 Q145,210 168,206 Z', part: 'sele', fill: '#222225' },
        { d: 'M130,205 L80,185 Q75,185 75,192 L80,205 L125,215 Z', part: 'arka kuyruk', fill: '#ff4d4d' },
      ],
    },
    {
      say: 'Öne yukarı doğru yükselen gidonu ve rüzgarlık camını çiz.',
      shapes: [
        { d: 'M248,142 L230,125 Q225,120 220,125 L215,130', part: 'gidon' },
        { d: 'M215,130 L208,136', part: 'elcik' },
        { d: 'M250,140 Q265,125 275,130 L260,152 Z', part: 'ön cam', fill: '#aee3ff' },
      ],
    },
    {
      say: 'Öne parlayan bir far, motordan arkaya uzanan parlak bir egzoz ekle.',
      shapes: [
        { d: 'M268,145 Q285,150 282,165 L260,165 Z', part: 'ön far', fill: '#ffe066' },
        {
          d: 'M185,260 Q165,270 145,270 L80,250 Q75,248 78,242 L145,260 Q168,260 185,252 Z',
          part: 'egzoz borusu',
          fill: '#e8ecf2',
        },
        { d: 'M78,242 L72,246 L76,250 Z', part: 'egzoz ucu', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Tekerleklerin üstüne çamurlukları ve altlarına hızlı yol çizgilerini çiz.',
      shapes: [
        { d: 'M280,238 A35,35 0 0,1 332,245 L328,238 A42,42 0 0,0 276,232 Z', part: 'ön çamurluk', fill: '#ff4d4d' },
        { d: 'M70,245 A40,40 0 0,1 120,235 L122,240 A35,35 0 0,0 74,250 Z', part: 'arka çamurluk', fill: '#ff4d4d' },
        { d: 'M40,320 L360,320', part: 'yol' },
        { d: 'M50,332 L150,332 M220,332 L350,332', part: 'hız çizgileri' },
      ],
    },
  ],
};

export default motor;
