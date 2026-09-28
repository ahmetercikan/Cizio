import type { Lesson } from '../types';

/** Temeller 2: Zikzaklar ve dalgalar — karlı dağlar ve dalgalı deniz. */
const dalgalar: Lesson = {
  id: 'dalgalar',
  path: 'temeller',
  title: 'Dağlar ve Deniz',
  emoji: '🌊',
  order: 2,
  level: 1,
  skill: 'Sivri zikzaklar ve yumuşak dalgalar çizmeyi öğrendin!',
  palette: ['#9d8df1', '#ffffff', '#4cc9f0', '#1f8fd6', '#2d2d2d'],
  steps: [
    {
      say: 'Soldan başla ve zikzak çiz: yukarı, aşağı, yukarı, aşağı. Sivri dağlar olacak!',
      shapes: [
        {
          d: 'M40,262 L100,120 L160,200 L230,75 L300,175 L360,262',
          part: 'dağlar',
          fill: '#9d8df1',
        },
      ],
    },
    {
      say: 'Dağların tepesine karlı başlıklar ekle. Altını minik bir zikzakla kapat.',
      shapes: [
        { d: 'M85,155 L100,120 L126,155 L115,148 L106,160 L96,149 Z', part: 'küçük dağın karı', fill: '#ffffff' },
        { d: 'M205,120 L230,75 L261,120 L249,113 L239,126 L228,113 L216,125 Z', part: 'büyük dağın karı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Şimdi denizi çiz. Dalgalı bir çizgiyle sağa git, sonra aşağı in ve kutu gibi kapat.',
      shapes: [
        {
          d: 'M40,245 Q60,225 80,245 Q100,265 120,245 Q140,225 160,245 Q180,265 200,245 Q220,225 240,245 Q260,265 280,245 Q300,225 320,245 Q340,265 360,245 L360,360 L40,360 Z',
          part: 'deniz',
          fill: '#4cc9f0',
        },
      ],
    },
    {
      say: 'Denizin içine iki dalga daha çiz. Yumuşacık, inip çıkan çizgiler.',
      shapes: [
        {
          d: 'M80,290 Q100,270 120,290 Q140,310 160,290 Q180,270 200,290 Q220,310 240,290 Q260,270 280,290 Q300,310 320,290',
          part: 'üst dalga',
        },
        {
          d: 'M60,330 Q80,310 100,330 Q120,350 140,330 Q160,310 180,330 Q200,350 220,330 Q240,310 260,330 Q280,350 300,330 Q320,310 340,330',
          part: 'alt dalga',
        },
      ],
    },
    {
      say: 'Gökyüzüne iki martı çiz. Her biri iki küçük tepecikten oluşan bir dalga.',
      shapes: [
        { d: 'M50,70 Q63,50 77,68 Q91,50 104,70', part: 'birinci martı' },
        { d: 'M270,50 Q283,30 297,48 Q311,30 324,50', part: 'ikinci martı' },
      ],
    },
  ],
};

export default dalgalar;
