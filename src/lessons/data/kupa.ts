import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Sevimli Nesneler 6: Yuvarlak köşeli gövde + oval ağız + kulp = kupa. Dalgalı buhar çizgileri. */
const kupa: Lesson = {
  id: 'kupa',
  path: 'nesneler',
  title: 'Sıcak Kupa',
  emoji: '☕',
  order: 6,
  level: 1,
  skill: 'Yuvarlak köşeli bir gövdeye oval ağız ve kulp ekleyip dalgalı buhar çizmeyi öğrendin!',
  palette: ['#7ec8f0', '#c9ecff', '#a0673f', '#ffe0a3', '#2d2d2d', '#ffffff', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kupanın gövdesini çiz. Soldan aşağı in, altta yuvarlak köşeyle dön, sağdan yukarı çık.',
      shapes: [
        {
          d: 'M80,170 L80,318 Q80,348 110,348 L240,348 Q270,348 270,318 L270,170',
          part: 'gövde',
          fill: '#7ec8f0',
        },
      ],
    },
    {
      say: 'Kupanın tepesine yatık bir oval çiz. İçine de küçük bir oval koy, bu sıcak kakao.',
      shapes: [
        { d: ellipse(175, 170, 95, 22), part: 'kupa ağzı', fill: '#c9ecff' },
        { d: ellipse(175, 172, 78, 13), part: 'kakao', fill: '#a0673f' },
      ],
    },
    {
      say: 'Kupanın sağına kocaman bir kulp çiz. Dışını büyük, içini küçük bir yay gibi yap.',
      shapes: [
        {
          d: 'M270,200 C345,192 345,305 270,298 L270,272 C312,276 312,222 270,226 Z',
          part: 'kulp',
          fill: '#7ec8f0',
        },
      ],
    },
    {
      say: 'Kupanın altına yayvan bir tabak çiz. Kupanın iki yanından biraz taşsın.',
      shapes: [
        { d: 'M50,348 L320,348 Q312,372 280,372 L90,372 Q58,372 50,348 Z', part: 'tabak', fill: '#ffe0a3' },
      ],
    },
    {
      say: 'Kakaonun üstünden yukarı doğru üç dalgalı çizgi çiz. Bunlar sıcak buhar, ortadaki en uzun olsun.',
      shapes: [
        { d: 'M135,140 Q120,122 135,104 Q150,86 135,68', part: 'sol buhar' },
        { d: 'M175,138 Q160,116 175,94 Q190,72 175,50', part: 'orta buhar' },
        { d: 'M215,140 Q200,122 215,104 Q230,86 215,68', part: 'sağ buhar' },
      ],
    },
    {
      say: 'Kupanın ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar koy.',
      shapes: [
        { d: circle(143, 245, 14), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(148, 240, 5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: circle(207, 245, 14), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(212, 240, 5), part: 'sağ göz parıltısı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına tatlı bir gülümseme çiz. İki yanına da pembe yanaklar ekle.',
      shapes: [
        { d: 'M156,276 Q175,298 194,276', part: 'ağız' },
        { d: ellipse(115, 278, 14, 8), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(235, 278, 14, 8), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kupa;
