import type { Lesson } from '../types';

/** Temeller 4: Kare, üçgen, dikdörtgen — şirin bir ev ve yanında bir çam ağacı. */
const sekiller: Lesson = {
  id: 'sekiller',
  path: 'temeller',
  title: 'Şekillerden Ev',
  emoji: '🏠',
  order: 4,
  level: 1,
  skill: 'Kare, üçgen ve dikdörtgenleri birleştirip resim yapmayı öğrendin!',
  palette: ['#ffd6a5', '#ff6b6b', '#9b5de5', '#8ecae6', '#6fcf97', '#b5835a'],
  steps: [
    {
      say: 'Büyük bir kare çiz: sağa, aşağı, sola ve yukarı. Bu evimizin duvarı.',
      shapes: [{ d: 'M45,170 L235,170 L235,355 L45,355 Z', part: 'duvar', fill: '#ffd6a5' }],
    },
    {
      say: 'Karenin üstüne kocaman bir üçgen çatı çiz. Yukarı sivri bir tepe yap.',
      shapes: [{ d: 'M30,170 L140,65 L250,170 Z', part: 'çatı', fill: '#ff6b6b' }],
    },
    {
      say: 'Çatının sağına bir baca ekle. Yukarı çık, sağa git, sonra çatıya in.',
      shapes: [{ d: 'M190,113 L190,70 L218,70 L218,140', part: 'baca', fill: '#b5835a' }],
    },
    {
      say: 'Duvarın ortasına uzun bir dikdörtgen kapı çiz. Yanına küçük bir kapı kolu koy.',
      shapes: [
        { d: 'M113,355 L113,265 L167,265 L167,355', part: 'kapı', fill: '#9b5de5' },
        { d: 'M155,305 A6,6 0 1,1 155,317 A6,6 0 1,1 155,305 Z', part: 'kapı kolu', fill: '#ffd166' },
      ],
    },
    {
      say: 'Duvarın üst kısmına, yan yana iki küçük kare pencere çiz.',
      shapes: [
        { d: 'M68,195 L116,195 L116,243 L68,243 Z', part: 'sol pencere', fill: '#8ecae6' },
        { d: 'M164,195 L212,195 L212,243 L164,243 Z', part: 'sağ pencere', fill: '#8ecae6' },
      ],
    },
    {
      say: 'Pencerelerin ortasına artı işareti çiz. Bir dikey, bir yatay çizgi.',
      shapes: [
        { d: 'M92,195 L92,243', part: 'sol pencere çıtası' },
        { d: 'M68,219 L116,219', part: 'sol pencere çıtası' },
        { d: 'M188,195 L188,243', part: 'sağ pencere çıtası' },
        { d: 'M164,219 L212,219', part: 'sağ pencere çıtası' },
      ],
    },
    {
      say: 'Evin yanına bir çam ağacı yap. Önce ince bir dikdörtgen gövde, sonra üstüne büyük bir üçgen.',
      shapes: [
        { d: 'M300,355 L300,300 L326,300 L326,355', part: 'ağaç gövdesi', fill: '#b5835a' },
        { d: 'M263,308 L313,140 L363,308 Z', part: 'ağacın yaprakları', fill: '#6fcf97' },
      ],
    },
  ],
};

export default sekiller;
