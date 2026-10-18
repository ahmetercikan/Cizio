import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Temeller 9: Noktaları birleştirme — noktaları birleştirerek şirin bir ev oluşturma. */
const noktalar: Lesson = {
  id: 'noktalar',
  path: 'temeller',
  title: 'Nokta Nokta Resim',
  emoji: '🔵',
  order: 9,
  level: 1,
  skill: 'Noktaları birleştirip şekil oluşturmayı öğrendin!',
  palette: ['#ffdfba', '#ff6b6b', '#4ea8de', '#ffd166', '#bde0fe', '#a7c957'],
  steps: [
    {
      say: 'Köşe noktalarını düz çizgilerle birleştirerek evin kare duvarını oluşturalım.',
      shapes: [
        { d: circle(100, 340, 5), guide: true },
        { d: circle(300, 340, 5), guide: true },
        { d: circle(300, 200, 5), guide: true },
        { d: circle(100, 200, 5), guide: true },
        { d: 'M100,340 L300,340 L300,200 L100,200 Z', part: 'duvarlar', fill: '#ffdfba' },
      ],
    },
    {
      say: 'Şimdi yukarıdaki tepe noktasına ve iki yana uzanıp üçgen çatıyı birleştirelim.',
      shapes: [
        { d: circle(200, 80, 5), guide: true },
        { d: circle(80, 200, 5), guide: true },
        { d: circle(320, 200, 5), guide: true },
        { d: 'M80,200 L200,80 L320,200 Z', part: 'üçgen çatı', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Evin altına kapı noktalarını birleştirerek bir kapı ve minik bir kol yapalım.',
      shapes: [
        { d: circle(170, 260, 4), guide: true },
        { d: circle(230, 260, 4), guide: true },
        { d: 'M170,340 L170,260 L230,260 L230,340 Z', part: 'kapı', fill: '#4ea8de' },
        { d: circle(220, 300, 4), part: 'kapı kolu', fill: '#ffd166' },
      ],
    },
    {
      say: 'Duvara iki küçük kare pencere noktalarını birleştirip artı işaretiyle camları bölelim.',
      shapes: [
        { d: 'M120,225 L155,225 L155,260 L120,260 Z', part: 'sol pencere', fill: '#bde0fe' },
        { d: 'M245,225 L280,225 L280,260 L245,260 Z', part: 'sağ pencere', fill: '#bde0fe' },
        { d: 'M137.5,225 L137.5,260', part: 'sol dikey çıta' },
        { d: 'M120,242.5 L155,242.5', part: 'sol yatay çıta' },
        { d: 'M262.5,225 L262.5,260', part: 'sağ dikey çıta' },
        { d: 'M245,242.5 L280,242.5', part: 'sağ yatay çıta' },
      ],
    },
    {
      say: 'Çatının tepesine yuvarlak bir çatı penceresi ve sağ tarafına bir baca konduralım.',
      shapes: [
        { d: circle(200, 145, 18), part: 'çatı penceresi', fill: '#bde0fe' },
        { d: 'M245,125 L245,75 L275,75 L275,155', part: 'baca', fill: '#c98a5e' },
      ],
    },
    {
      say: 'Gökyüzüne sıcacık bir güneş ve evin altına yeşil çimenler ekleyip resmimizi tamamlayalım!',
      shapes: [
        { d: circle(65, 75, 25), part: 'güneş', fill: '#ffd166' },
        { d: 'M65,40 L65,30 M65,110 L65,120 M30,75 L20,75 M100,75 L110,75 M40,50 L33,43 M90,100 L97,107 M40,100 L33,107 M90,50 L97,43', part: 'güneş ışınları' },
        { d: 'M40,340 L360,340', part: 'yer çizgisi' },
        { d: 'M70,340 Q85,310 100,340 M300,340 Q315,315 330,340', part: 'çimenler', fill: '#a7c957' },
      ],
    },
  ],
};

export default noktalar;
