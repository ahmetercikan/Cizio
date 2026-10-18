import type { Lesson } from '../types';

const camAgaci: Lesson = {
  id: 'cam-agaci',
  path: 'doga',
  title: 'Çam Ağacı',
  emoji: '🌲',
  order: 20,
  level: 1,
  skill: 'Yukarıdan aşağıya genişleyen üç katmanla dengeli bir çam ağacı çizmeyi öğrendin!',
  palette: ['#2d6a4f', '#1b4332', '#52b788', '#7f4f24', '#936639', '#40916c'],
  steps: [
    {
      say: 'Tepeden başlayalım! Sayfanın üst kısmına sivri uçlu küçük bir çam üçgeni çiz.',
      shapes: [
        {
          d: 'M200,60 L245,150 Q200,138 155,150 Z',
          part: 'tepe katı',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'Tepe katının hemen altından başlayan biraz daha geniş bir ikinci kat çiz.',
      shapes: [
        {
          d: 'M175,140 L130,225 Q200,210 270,225 L225,140 Z',
          part: 'orta kat',
          fill: '#1b4332',
        },
      ],
    },
    {
      say: 'Şimdi de en alta ağacımızın en geniş ve görkemli üçüncü katını ekle.',
      shapes: [
        {
          d: 'M155,215 L100,305 Q200,285 300,305 L245,215 Z',
          part: 'alt kat',
          fill: '#2d6a4f',
        },
      ],
    },
    {
      say: 'En alt katın ortasından aşağıya doğru inen kalın, güçlü bir gövde çiz.',
      shapes: [
        {
          d: 'M182,298 L175,365 L225,365 L218,298 Z',
          part: 'gövde',
          fill: '#7f4f24',
        },
      ],
    },
    {
      say: 'Gövdeye ağaç kabuğu çizgileri ve ağacın altına yeşil çimenlik zemin çiz.',
      shapes: [
        { d: 'M194,315 L194,350', part: 'kabuk çizgisi' },
        { d: 'M206,310 L206,354', part: 'kabuk çizgisi' },
        {
          d: 'M70,365 Q200,345 330,365 L330,380 Q200,360 70,380 Z',
          part: 'çimenlik zemin',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Katların üzerine kavisli iğne yaprak çizgileri ve minik bir kozalak ekle.',
      shapes: [
        { d: 'M180,120 Q200,130 220,120', part: 'dal çizgisi' },
        { d: 'M160,192 Q200,204 240,192', part: 'dal çizgisi' },
        { d: 'M135,270 Q200,285 265,270', part: 'dal çizgisi' },
        {
          d: 'M135,290 C128,305 142,316 142,305 C142,295 138,290 135,290 Z',
          part: 'kozalak',
          fill: '#936639',
        },
      ],
    },
  ],
};

export default camAgaci;
