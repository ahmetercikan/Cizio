import type { Lesson } from '../types';

const dag: Lesson = {
  id: 'dag',
  path: 'doga',
  title: 'Karlı Dağ',
  emoji: '🏔️',
  order: 14,
  level: 1,
  skill: 'Zirvelere zikzaklı karlar ve eteğe ağaçlar ekleyerek harika bir manzara kurdun!',
  palette: ['#f8f9fa', '#6c757d', '#495057', '#38b000', '#1b4332', '#7f4f24'],
  steps: [
    {
      say: 'Sayfanın ortasına göğe uzanan sivri ve devasa bir üçgen dağ çiz.',
      shapes: [
        {
          d: 'M190,75 L315,340 L50,340 Z',
          part: 'büyük dağ',
          fill: '#6c757d',
        },
      ],
    },
    {
      say: 'Büyük dağın sağına daha küçük, sevimli bir kardeş tepe ekle.',
      shapes: [
        {
          d: 'M265,240 L310,150 L375,340 L215,340 Z',
          part: 'küçük dağ',
          fill: '#495057',
        },
      ],
    },
    {
      say: 'Zirvelere bembeyaz karlı takkeler giydir. Zikzak uçlarla bitir!',
      shapes: [
        {
          d: 'M190,75 L232,160 L218,150 L204,170 L190,152 L174,168 L160,155 L145,165 Z',
          part: 'büyük kar takkesi',
          fill: '#f8f9fa',
        },
        {
          d: 'M310,150 L340,210 L328,202 L316,216 L304,204 L290,210 Z',
          part: 'küçük kar takkesi',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Zirvelerden aşağı inen bir sırt çizgisi çizerek dağa derinlik ver.',
      shapes: [
        { d: 'M190,75 Q182,200 175,340', part: 'ana sırt çizgisi' },
        { d: 'M310,150 Q318,240 325,340', part: 'küçük sırt çizgisi' },
        { d: 'M180,210 L155,245', part: 'yamaç çizgisi' },
        { d: 'M185,270 L160,305', part: 'yamaç çizgisi' },
      ],
    },
    {
      say: 'Dağın eteğine yumuşak tepeler ve yeşil bir zemin çizgisi çiz.',
      shapes: [
        {
          d: 'M20,350 Q105,325 190,345 Q285,325 380,350 L380,380 L20,380 Z',
          part: 'etek tepeleri',
          fill: '#38b000',
        },
      ],
    },
    {
      say: 'Dağın eteklerine üç minik çam ağacı kondur. Manzaramız hazır!',
      shapes: [
        { d: 'M85,315 L102,342 L68,342 Z', part: 'çam ağacı', fill: '#1b4332' },
        { d: 'M82,342 L88,342 L88,354 L82,354 Z', part: 'ağaç gövdesi', fill: '#7f4f24' },
        { d: 'M135,305 L155,340 L115,340 Z', part: 'çam ağacı', fill: '#2d6a4f' },
        { d: 'M132,340 L138,340 L138,352 L132,352 Z', part: 'ağaç gövdesi', fill: '#7f4f24' },
        { d: 'M270,310 L290,342 L250,342 Z', part: 'çam ağacı', fill: '#1b4332' },
        { d: 'M267,342 L273,342 L273,354 L267,354 Z', part: 'ağaç gövdesi', fill: '#7f4f24' },
      ],
    },
  ],
};

export default dag;
