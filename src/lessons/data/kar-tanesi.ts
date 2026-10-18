import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const karTanesi: Lesson = {
  id: 'kar-tanesi',
  path: 'doga',
  title: 'Buz Kristali',
  emoji: '❄️',
  order: 15,
  level: 2,
  skill: 'Altı kollu kusursuz bir simetri kurarak buz kristali çizmeyi başardın!',
  palette: ['#0077b6', '#0096c7', '#48cae4', '#90e0ef', '#caf0f8', '#ffffff'],
  steps: [
    {
      say: 'Kristalimizin merkezine minik, parıldayan bir altıgen çiz.',
      shapes: [
        {
          d: 'M200,176 L221,188 L221,212 L200,224 L179,212 L179,188 Z',
          part: 'kristal çekirdeği',
          fill: '#caf0f8',
        },
      ],
    },
    {
      say: 'Altıgenin üstünden ve altından dışa doğru iki dik ana kol uzat.',
      shapes: [
        { d: 'M200,176 L200,50', part: 'üst ana kol' },
        { d: 'M200,224 L200,350', part: 'alt ana kol' },
      ],
    },
    {
      say: 'Şimdi de köşelerden çapraz uzanan dört tane ana kol daha çiz.',
      shapes: [
        { d: 'M221,188 L330,125', part: 'sağ üst ana kol' },
        { d: 'M221,212 L330,275', part: 'sağ alt ana kol' },
        { d: 'M179,212 L70,275', part: 'sol alt ana kol' },
        { d: 'M179,188 L70,125', part: 'sol üst ana kol' },
      ],
    },
    {
      say: 'Her kolun orta kısmına dışa bakan minik V şeklinde dallar ekle.',
      shapes: [
        { d: 'M185,145 L200,130 L215,145', part: 'üst iç dal' },
        { d: 'M185,255 L200,270 L215,255', part: 'alt iç dal' },
        { d: 'M248,154 L261,165 L258,179', part: 'sağ üst iç dal' },
        { d: 'M258,221 L261,235 L248,246', part: 'sağ alt iç dal' },
        { d: 'M142,221 L139,235 L152,246', part: 'sol alt iç dal' },
        { d: 'M152,154 L139,165 L142,179', part: 'sol üst iç dal' },
      ],
    },
    {
      say: 'Uçlara yakın kısımlara biraz daha geniş V dalları kondur.',
      shapes: [
        { d: 'M180,105 L200,85 L220,105', part: 'üst dış dal' },
        { d: 'M180,295 L200,315 L220,295', part: 'alt dış dal' },
        { d: 'M283,128 L300,142 L296,160', part: 'sağ üst dış dal' },
        { d: 'M296,240 L300,258 L283,272', part: 'sağ alt dış dal' },
        { d: 'M104,240 L100,258 L117,272', part: 'sol alt dış dal' },
        { d: 'M117,128 L100,142 L104,160', part: 'sol üst dış dal' },
      ],
    },
    {
      say: 'Altı kolun ucuna küçük elmas uçlar çizerek buz kristalleri yap.',
      shapes: [
        { d: 'M200,36 L208,50 L200,64 L192,50 Z', part: 'üst elmas', fill: '#90e0ef' },
        { d: 'M200,336 L208,350 L200,364 L192,350 Z', part: 'alt elmas', fill: '#90e0ef' },
        { d: 'M323,113 L340,119 L337,137 L320,131 Z', part: 'sağ üst elmas', fill: '#90e0ef' },
        { d: 'M320,269 L337,263 L340,281 L323,287 Z', part: 'sağ alt elmas', fill: '#90e0ef' },
        { d: 'M77,287 L60,281 L63,263 L80,269 Z', part: 'sol alt elmas', fill: '#90e0ef' },
        { d: 'M80,131 L63,137 L60,119 L77,113 Z', part: 'sol üst elmas', fill: '#90e0ef' },
      ],
    },
    {
      say: 'Kristalin göbeğine parıltılı bir yıldız çizip süslemeyi bitir.',
      shapes: [
        {
          d: 'M200,186 L204,196 L214,200 L204,204 L200,214 L196,204 L186,200 L196,196 Z',
          part: 'merkez yıldızı',
          fill: '#0077b6',
        },
        { d: circle(200, 200, 4), part: 'merkez parıltı', fill: '#ffffff' },
        { d: circle(245, 115, 3.5), part: 'ışıltı', fill: '#caf0f8' },
        { d: circle(155, 115, 3.5), part: 'ışıltı', fill: '#caf0f8' },
        { d: circle(245, 285, 3.5), part: 'ışıltı', fill: '#caf0f8' },
        { d: circle(155, 285, 3.5), part: 'ışıltı', fill: '#caf0f8' },
      ],
    },
  ],
};

export default karTanesi;
