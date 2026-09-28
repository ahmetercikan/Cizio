import type { Lesson } from '../types';

const cicek: Lesson = {
  id: 'cicek',
  path: 'doga',
  title: 'Papatya',
  emoji: '🌼',
  order: 2,
  level: 1,
  skill: 'Yaprakları ortanın etrafına sırayla dizdin. Önce dört yön, sonra aralar: böylece hepsi eşit olur!',
  palette: ['#ffffff', '#ffcf3f', '#5cc56a', '#3f9e4d', '#ff9eb5', '#2d2d2d'],
  steps: [
    {
      say: 'Kesikli dairenin kenarından başla. Yukarı, sağa, aşağı ve sola birer uzun taç yaprağı çiz.',
      shapes: [
        { d: 'M158,150 A42,42 0 1,0 242,150 A42,42 0 1,0 158,150 Z', guide: true },
        { d: 'M183.9,111.2 C167,83.8 174,35 200,35 C226,35 233,83.8 216.1,111.2', part: 'üst yaprak', fill: '#ffffff' },
        { d: 'M238.8,133.9 C266.2,117 315,124 315,150 C315,176 266.2,183 238.8,166.1', part: 'sağ yaprak', fill: '#ffffff' },
        { d: 'M216.1,188.8 C233,216.2 226,265 200,265 C174,265 167,216.2 183.9,188.8', part: 'alt yaprak', fill: '#ffffff' },
        { d: 'M161.2,166.1 C133.8,183 85,176 85,150 C85,124 133.8,117 161.2,133.9', part: 'sol yaprak', fill: '#ffffff' },
      ],
    },
    {
      say: 'Yaprakların tam arasına dört yaprak daha çiz. Artık papatyan sekiz yapraklı!',
      shapes: [
        { d: 'M216.1,111.2 C223.5,79.8 262.9,50.3 281.3,68.7 C299.7,87.1 270.2,126.5 238.8,133.9', part: 'ara yaprak', fill: '#ffffff' },
        { d: 'M238.8,166.1 C270.2,173.5 299.7,212.9 281.3,231.3 C262.9,249.7 223.5,220.2 216.1,188.8', part: 'ara yaprak', fill: '#ffffff' },
        { d: 'M183.9,188.8 C176.5,220.2 137.1,249.7 118.7,231.3 C100.3,212.9 129.8,173.5 161.2,166.1', part: 'ara yaprak', fill: '#ffffff' },
        { d: 'M161.2,133.9 C129.8,126.5 100.3,87.1 118.7,68.7 C137.1,50.3 176.5,79.8 183.9,111.2', part: 'ara yaprak', fill: '#ffffff' },
      ],
    },
    {
      say: 'Ortaya, yaprakların başladığı yere yuvarlak bir göbek çiz.',
      shapes: [{ d: 'M158,150 A42,42 0 1,0 242,150 A42,42 0 1,0 158,150 Z', part: 'göbek', fill: '#ffcf3f' }],
    },
    {
      say: 'Alttaki yapraktan aşağıya doğru uzun, hafif kıvrık bir sap çiz.',
      shapes: [{ d: 'M200,265 Q192,315 200,365', part: 'sap' }],
    },
    {
      say: 'Sapın iki yanına birer yaprak ekle. Saptan başla, yine sapta bitir.',
      shapes: [
        { d: 'M196,318 Q165,270 116,300 Q147,348 196,318 Z', part: 'sol yaprak', fill: '#5cc56a' },
        { d: 'M197,338 Q231,290 282,320 Q248,368 197,338 Z', part: 'sağ yaprak', fill: '#5cc56a' },
      ],
    },
    {
      say: 'Göbeğe iki parlak göz ve tatlı bir gülümseme çiz. Papatyan gülüyor!',
      shapes: [
        { d: 'M171,146 A11,11 0 1,0 193,146 A11,11 0 1,0 171,146 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M207,146 A11,11 0 1,0 229,146 A11,11 0 1,0 207,146 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M173,142 A5,5 0 1,0 183,142 A5,5 0 1,0 173,142 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M209,142 A5,5 0 1,0 219,142 A5,5 0 1,0 209,142 Z', part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M185,165 Q200,178 215,165', part: 'ağız' },
      ],
    },
  ],
};

export default cicek;
