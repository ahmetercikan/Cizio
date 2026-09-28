import type { Lesson } from '../types';

const kedi: Lesson = {
  id: 'kedi',
  path: 'hayvanlar',
  title: 'Sevimli Kedi',
  emoji: '🐱',
  order: 1,
  level: 1,
  skill: 'Büyük bir ovalden başlayıp parçaları üstüne eklemeyi öğrendin!',
  palette: ['#f6a74b', '#ffb3c1', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce büyük, yayvan bir oval çiz. Bu kedimizin kafası olacak.',
      shapes: [{ d: 'M80,220 A120,100 0 1,0 320,220 A120,100 0 1,0 80,220 Z', part: 'kafa', fill: '#f6a74b' }],
    },
    {
      say: 'Kafanın üstüne iki sivri kulak ekle. Üçgen gibi düşün!',
      shapes: [
        { d: 'M105,159 L120,70 L175,122', part: 'sol kulak', fill: '#f6a74b' },
        { d: 'M225,122 L280,70 L295,159', part: 'sağ kulak', fill: '#f6a74b' },
      ],
    },
    {
      say: 'Kulakların içine daha küçük üçgenler çiz.',
      shapes: [
        { d: 'M125,145 L132,98 L160,125', part: 'sol kulak içi', fill: '#ffb3c1' },
        { d: 'M240,125 L268,98 L275,145', part: 'sağ kulak içi', fill: '#ffb3c1' },
      ],
    },
    {
      say: 'Şimdi iki yuvarlak göz çiz. Aralarında biraz boşluk bırak.',
      shapes: [
        { d: 'M137,205 A18,18 0 1,0 173,205 A18,18 0 1,0 137,205 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M227,205 A18,18 0 1,0 263,205 A18,18 0 1,0 227,205 Z', part: 'sağ göz', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Ortaya minik bir üçgen burun, altına da gülümseyen bir ağız çiz.',
      shapes: [
        { d: 'M188,238 L212,238 L200,252 Z', part: 'burun', fill: '#ff7f9c' },
        { d: 'M176,264 Q188,280 200,254 Q212,280 224,264', part: 'ağız' },
      ],
    },
    {
      say: 'Son olarak iki yana bıyıklar ekle. Her tarafa ikişer tane!',
      shapes: [
        { d: 'M150,242 L82,232', part: 'bıyıklar' },
        { d: 'M150,256 L82,262', part: 'bıyıklar' },
        { d: 'M250,242 L318,232', part: 'bıyıklar' },
        { d: 'M250,256 L318,262', part: 'bıyıklar' },
      ],
    },
  ],
};

export default kedi;
