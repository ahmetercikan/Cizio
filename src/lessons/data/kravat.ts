import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Özel Günler 7: Babalar Günü için puantiyeli kravatlı gömlek. */
const kravat: Lesson = {
  id: 'kravat',
  path: 'ozel',
  title: 'Babalar Günü Kravatı',
  emoji: '👔',
  order: 7,
  level: 1,
  skill: 'Üçgen yaka ve uzun bir kravatla şık bir gömlek çizmeyi öğrendin! Babana sevgiyle hediye edebilirsin.',
  palette: ['#bfe0ff', '#ffffff', '#e8474c', '#ffd23f', '#ff5c8a', '#2d2d2d'],
  steps: [
    {
      say: 'Önce gömleği çiz. Omuzlardan yuvarlak in, iki yanı dik olsun, altını düz kapat.',
      shapes: [
        {
          d: 'M160,66 L240,66 Q318,86 330,140 L330,365 L70,365 L70,140 Q82,86 160,66 Z',
          part: 'gömlek',
          fill: '#bfe0ff',
        },
      ],
    },
    {
      say: 'Gömleğin tepesine iki üçgen yaka çiz. Uçları aşağıya ve iki yana baksın.',
      shapes: [
        { d: 'M160,66 L198,112 L138,136 Z', part: 'sol yaka', fill: '#ffffff' },
        { d: 'M240,66 L202,112 L262,136 Z', part: 'sağ yaka', fill: '#ffffff' },
      ],
    },
    {
      say: 'Yakaların ortasına küçük bir düğüm, altına da ucu sivri uzun bir kravat çiz.',
      shapes: [
        { d: 'M184,104 L216,104 L210,134 L190,134 Z', part: 'kravat düğümü', fill: '#e8474c' },
        { d: 'M190,134 L172,300 L200,334 L228,300 L210,134', part: 'kravat', fill: '#e8474c' },
      ],
    },
    {
      say: 'Kravatın üstüne yukarıdan aşağıya dört yuvarlak puantiye çiz. Aşağı indikçe büyüsünler.',
      shapes: [
        { d: circle(200, 166, 6), part: 'birinci puantiye', fill: '#ffd23f' },
        { d: circle(194, 208, 7), part: 'ikinci puantiye', fill: '#ffd23f' },
        { d: circle(207, 250, 8), part: 'üçüncü puantiye', fill: '#ffd23f' },
        { d: circle(198, 292, 9), part: 'dördüncü puantiye', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Gömleğin sol tarafına bir cep, içine de küçük bir kalp çiz. Babanın gömleği hazır!',
      shapes: [
        { d: 'M98,176 L148,176 L148,224 Q123,232 98,224 Z', part: 'cep', fill: '#a6d1f7' },
        { d: 'M123,214 L110,201 A9,9 0 0,1 123,190 A9,9 0 0,1 136,201 Z', part: 'cep kalbi', fill: '#ff5c8a' },
      ],
    },
  ],
};

export default kravat;
