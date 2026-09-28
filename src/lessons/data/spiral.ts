import type { Lesson } from '../types';

/** Temeller 5: Spiraller ve kıvrımlar — kabuğu spiralli, gülümseyen bir salyangoz. */
const spiral: Lesson = {
  id: 'spiral',
  path: 'temeller',
  title: 'Neşeli Salyangoz',
  emoji: '🐌',
  order: 5,
  level: 2,
  skill: 'Ortadan dışa doğru dönen spiraller çizmeyi öğrendin!',
  palette: ['#ffd6a5', '#f78fb3', '#cdeffd', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce salyangozun uzun, yumuşak gövdesini çiz. Soldaki ucu sivri, sağdaki ucu kafa gibi yuvarlak.',
      shapes: [
        {
          d: 'M45,322 Q180,338 300,332 Q358,330 358,285 L358,215 Q358,178 325,178 Q292,178 292,215 L292,262 Q190,272 45,322 Z',
          part: 'gövde',
          fill: '#ffd6a5',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne büyük bir daire çiz. Bu salyangozun kabuğu olacak.',
      shapes: [{ d: 'M193,136 A84,84 0 1,1 193,304 A84,84 0 1,1 193,136 Z', part: 'kabuk', fill: '#f78fb3' }],
    },
    {
      say: 'Kabuğun tam ortasından başla. Dön dön, her turda biraz büyüyerek dışarı doğru spiral çiz.',
      shapes: [
        {
          d: 'M193,220 A12,12 0 0,1 217,220 A24,24 0 0,1 169,220 A36,36 0 0,1 241,220 A48,48 0 0,1 145,220 A60,60 0 0,1 265,220 A72,72 0 0,1 121,220',
          part: 'spiral',
        },
      ],
    },
    {
      say: 'Kafanın üstüne iki uzun anten çiz. Biri sola, biri sağa doğru uzansın.',
      shapes: [
        { d: 'M312,180 Q302,150 296,126', part: 'sol anten' },
        { d: 'M340,182 Q348,150 354,126', part: 'sağ anten' },
      ],
    },
    {
      say: 'Antenlerin ucuna iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: 'M296,100 A14,14 0 1,1 296,128 A14,14 0 1,1 296,100 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M300,104 A5,5 0 1,1 300,114 A5,5 0 1,1 300,104 Z', part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: 'M354,100 A14,14 0 1,1 354,128 A14,14 0 1,1 354,100 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M358,104 A5,5 0 1,1 358,114 A5,5 0 1,1 358,104 Z', part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Kafaya kocaman bir gülümseme çiz. Salyangoz çok mutlu!',
      shapes: [{ d: 'M308,222 Q325,240 342,222', part: 'ağız' }],
    },
    {
      say: 'Gökyüzüne kabarık bir bulut çiz. Kıvrım kıvrım tepecikler yap, altını düz kapat.',
      shapes: [
        {
          d: 'M55,122 A22,22 0 0,1 66,80 A28,28 0 0,1 118,64 A25,25 0 0,1 160,90 A17,17 0 0,1 152,122 Z',
          part: 'bulut',
          fill: '#cdeffd',
        },
      ],
    },
  ],
};

export default spiral;
