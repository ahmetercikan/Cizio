import type { Lesson } from '../types';

/** Temeller 3: Daireler ve ovaller — yaprağın üstünde tombul bir tırtıl. */
const daireler: Lesson = {
  id: 'daireler',
  path: 'temeller',
  title: 'Tombul Tırtıl',
  emoji: '🐛',
  order: 3,
  level: 1,
  skill: 'Yuvarlak daireler ve yayvan ovaller çizmeyi öğrendin!',
  palette: ['#6fcf97', '#ffd166', '#ffb703', '#ff8fab', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce büyük, yayvan bir oval çiz. Bu, tırtılın oturduğu yaprak olacak.',
      shapes: [{ d: 'M200,255 A160,45 0 1,1 200,345 A160,45 0 1,1 200,255 Z', part: 'yaprak', fill: '#6fcf97' }],
    },
    {
      say: 'Yaprağın solunda küçük bir daire çiz. Üstten başla, dön dön, başladığın yere gel.',
      shapes: [{ d: 'M72,224 A34,34 0 1,1 72,292 A34,34 0 1,1 72,224 Z', part: 'kuyruk', fill: '#ffd166' }],
    },
    {
      say: 'Yanına biraz daha büyük iki daire ekle. Birbirlerine değsinler.',
      shapes: [
        { d: 'M132,196 A42,42 0 1,1 132,280 A42,42 0 1,1 132,196 Z', part: 'birinci gövde halkası', fill: '#ffb703' },
        { d: 'M200,206 A44,44 0 1,1 200,294 A44,44 0 1,1 200,206 Z', part: 'ikinci gövde halkası', fill: '#ffd166' },
      ],
    },
    {
      say: 'Şimdi en büyük daireyi çiz. Bu, tırtılımızın kocaman kafası!',
      shapes: [{ d: 'M282,136 A64,64 0 1,1 282,264 A64,64 0 1,1 282,136 Z', part: 'kafa', fill: '#ffb703' }],
    },
    {
      say: 'Kafaya iki yuvarlak göz çiz. İçlerine de minicik beyaz parıltılar koy.',
      shapes: [
        { d: 'M260,178 A14,14 0 1,1 260,206 A14,14 0 1,1 260,178 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M264,182 A5,5 0 1,1 264,192 A5,5 0 1,1 264,182 Z', part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: 'M304,178 A14,14 0 1,1 304,206 A14,14 0 1,1 304,178 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M308,182 A5,5 0 1,1 308,192 A5,5 0 1,1 308,182 Z', part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına gülen bir ağız çiz. İki yanına da küçük pembe ovaller koy.',
      shapes: [
        { d: 'M264,224 Q282,244 300,224', part: 'ağız' },
        { d: 'M225,222 A13,8 0 1,1 251,222 A13,8 0 1,1 225,222 Z', part: 'sol yanak', fill: '#ff8fab' },
        { d: 'M313,222 A13,8 0 1,1 339,222 A13,8 0 1,1 313,222 Z', part: 'sağ yanak', fill: '#ff8fab' },
      ],
    },
    {
      say: 'Son olarak iki kıvrık anten çiz. Uçlarına da minik daireler ekle.',
      shapes: [
        { d: 'M262,142 Q248,100 222,88', part: 'sol anten' },
        { d: 'M214,74 A10,10 0 1,1 214,94 A10,10 0 1,1 214,74 Z', part: 'sol anten topu', fill: '#ff8fab' },
        { d: 'M302,142 Q316,100 342,88', part: 'sağ anten' },
        { d: 'M350,74 A10,10 0 1,1 350,94 A10,10 0 1,1 350,74 Z', part: 'sağ anten topu', fill: '#ff8fab' },
      ],
    },
  ],
};

export default daireler;
