import type { Lesson } from '../types';

const denizManzarasi: Lesson = {
  id: 'deniz-manzarasi',
  path: 'doga',
  title: 'Deniz Manzarası',
  emoji: '🌅',
  order: 22,
  level: 2,
  skill: 'Ufuk çizgisi, su yansıması ve siluet palmiye kullanarak derinlik hissi veren bir manzara çizmeyi öğrendin!',
  palette: ['#ff7b00', '#ffb703', '#1d3557', '#e9c46a', '#264653', '#1b4332', '#e76f51'],
  steps: [
    {
      say: 'Kâğıdın ortasına düz bir ufuk çizgisi ve tam üstüne batan yarım bir güneş çizelim.',
      shapes: [
        { d: 'M20,210 L380,210', part: 'ufuk çizgisi' },
        {
          d: 'M150,210 A50,50 0 0,1 250,210 Z',
          part: 'batan güneş',
          fill: '#ff7b00',
        },
      ],
    },
    {
      say: 'Güneşin çevresine sıcak akşam bulutları ve gökyüzü parıltısı ekleyelim.',
      shapes: [
        {
          d: 'M130,210 A70,70 0 0,1 270,210',
          part: 'güneş parıltısı',
        },
        {
          d: 'M40,115 C55,100 80,100 95,112 C108,102 128,102 140,115 L140,122 L40,122 Z',
          part: 'sol bulut',
          fill: '#ffb703',
        },
        {
          d: 'M245,130 C260,118 282,118 295,128 C308,118 328,118 340,130 L340,137 L245,137 Z',
          part: 'sağ bulut',
          fill: '#ffb703',
        },
      ],
    },
    {
      say: 'Ufuk çizgisinin altına denizin sakin, masmavi sularını yerleştirelim.',
      shapes: [
        {
          d: 'M20,210 L380,210 L380,310 Q200,320 20,305 Z',
          part: 'deniz',
          fill: '#1d3557',
        },
      ],
    },
    {
      say: 'Su yüzeyinde güneşin altın sarısı yansımalarını gösteren yatay çizgiler çizelim.',
      shapes: [
        {
          d: 'M185,220 L215,220 M178,235 L222,235 M170,252 L230,252 M162,270 L238,270 M155,290 L245,290',
          part: 'güneş yansıması',
        },
      ],
    },
    {
      say: 'Alt kısma kavisli bir kumsal şeridi ve kıyıya vuran minik dalga çizgisi yapalım.',
      shapes: [
        {
          d: 'M20,305 Q200,320 380,310 L380,380 L20,380 Z',
          part: 'kumsal',
          fill: '#e9c46a',
        },
        {
          d: 'M20,305 Q110,314 200,314 T380,310',
          part: 'köpüklü dalga',
        },
      ],
    },
    {
      say: 'Kumsalın sağından gökyüzüne doğru kıvrılarak uzanan bir palmiye gövdesi çizelim.',
      shapes: [
        {
          d: 'M330,375 C335,290 315,215 305,140 L317,140 C327,215 348,290 348,375 Z',
          part: 'palmiye gövdesi',
          fill: '#264653',
        },
        {
          d: 'M328,325 L344,327 M322,275 L337,277 M316,225 L330,227 M310,180 L322,182',
          part: 'gövde çizgileri',
        },
      ],
    },
    {
      say: 'Palmiyenin tepesinden çevreye sarkan büyük, tropik yapraklar ekleyelim.',
      shapes: [
        {
          d: 'M310,140 Q240,120 185,160 Q245,142 310,140 Z',
          part: 'sol yaprak',
          fill: '#1b4332',
        },
        {
          d: 'M310,140 Q250,75 215,95 Q260,100 310,140 Z',
          part: 'üst sol yaprak',
          fill: '#1b4332',
        },
        {
          d: 'M310,140 Q305,55 295,65 Q315,85 310,140 Z',
          part: 'tepe yaprak',
          fill: '#1b4332',
        },
        {
          d: 'M310,140 Q365,75 385,105 Q355,115 310,140 Z',
          part: 'sağ yaprak',
          fill: '#1b4332',
        },
        {
          d: 'M310,140 Q370,145 375,185 Q350,160 310,140 Z',
          part: 'alt sağ yaprak',
          fill: '#1b4332',
        },
        {
          d: 'M310,140 Q290,170 275,210 Q290,180 310,140 Z',
          part: 'sarkan yaprak',
          fill: '#1b4332',
        },
      ],
    },
    {
      say: 'Son olarak gökyüzünde süzülen martılar ve kumsala minik bir deniz yıldızı konduralım.',
      shapes: [
        { d: 'M85,75 Q97,65 109,75 Q121,65 133,75', part: 'martı 1' },
        { d: 'M125,95 Q135,86 145,95 Q155,86 165,95', part: 'martı 2' },
        { d: 'M65,105 Q73,98 81,105 Q89,98 97,105', part: 'martı 3' },
        {
          d: 'M80,345 L84,335 L88,345 L98,346 L90,352 L93,361 L84,355 L75,361 L78,352 L70,346 Z',
          part: 'deniz yıldızı',
          fill: '#e76f51',
        },
      ],
    },
  ],
};

export default denizManzarasi;
