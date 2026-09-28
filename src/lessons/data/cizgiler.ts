import type { Lesson } from '../types';

/** Temeller 1: Düz çizgiler (yatay, dikey, eğik) — rengarenk bir bahçe çiti. */
const cizgiler: Lesson = {
  id: 'cizgiler',
  path: 'temeller',
  title: 'Rengarenk Çit',
  emoji: '📏',
  order: 1,
  level: 1,
  skill: 'Yatay, dikey ve eğik düz çizgiler çekmeyi öğrendin!',
  palette: ['#ff8fab', '#ffd166', '#7bd389', '#72ddf7', '#b69cff'],
  steps: [
    {
      say: 'Soldan sağa uzun, düz bir çizgi çek. Burası çitimizin durduğu yer olacak.',
      shapes: [{ d: 'M40,340 L360,340', part: 'yer çizgisi' }],
    },
    {
      say: 'Şimdi ilk tahtayı çiz. Yukarı düz çık, sivri bir tepe yap, sonra düz aşağı in.',
      shapes: [{ d: 'M58,340 L58,175 L80,145 L102,175 L102,340', part: 'ilk tahta', fill: '#ff8fab' }],
    },
    {
      say: 'Harika! Yanına aynı tahtadan dört tane daha çiz. Hepsi dimdik dursun.',
      shapes: [
        { d: 'M118,340 L118,175 L140,145 L162,175 L162,340', part: 'ikinci tahta', fill: '#ffd166' },
        { d: 'M178,340 L178,175 L200,145 L222,175 L222,340', part: 'üçüncü tahta', fill: '#7bd389' },
        { d: 'M238,340 L238,175 L260,145 L282,175 L282,340', part: 'dördüncü tahta', fill: '#72ddf7' },
        { d: 'M298,340 L298,175 L320,145 L342,175 L342,340', part: 'beşinci tahta', fill: '#b69cff' },
      ],
    },
    {
      say: 'Tahtaları birleştirelim. Soldan sağa iki uzun, düz çizgi çek.',
      shapes: [
        { d: 'M40,215 L360,215', part: 'üst kiriş' },
        { d: 'M40,290 L360,290', part: 'alt kiriş' },
      ],
    },
    {
      say: 'Sağ üste parlak bir güneş yapalım. Bir yatay, bir dikey, iki de eğik çizgi çek.',
      shapes: [
        { d: 'M258,85 L342,85', part: 'yatay ışın' },
        { d: 'M300,43 L300,127', part: 'dikey ışın' },
        { d: 'M270,55 L330,115', part: 'eğik ışın' },
        { d: 'M330,55 L270,115', part: 'öbür eğik ışın' },
      ],
    },
    {
      say: 'Son olarak iki kuş çiz. Eğik çizgilerle yukarı, aşağı, yukarı, aşağı git.',
      shapes: [
        { d: 'M55,90 L73,72 L91,90 L109,72 L127,90', part: 'birinci kuş' },
        { d: 'M140,55 L156,40 L172,55 L188,40 L204,55', part: 'ikinci kuş' },
      ],
    },
  ],
};

export default cizgiler;
