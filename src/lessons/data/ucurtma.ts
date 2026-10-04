import type { Lesson } from '../types';

/** Fiyonk: ortada buluşan iki üçgen, tek hamlede çizilir. */
const bow = (x: number, y: number) =>
  `M${x - 22},${y - 14} L${x + 22},${y + 14} L${x + 22},${y - 14} L${x - 22},${y + 14} Z`;

/** Özel Günler 9: 23 Nisan için kuyruğu fiyonklu baklava biçiminde bir uçurtma. */
const ucurtma: Lesson = {
  id: 'ucurtma',
  path: 'ozel',
  title: '23 Nisan Uçurtması',
  emoji: '🪁',
  order: 9,
  level: 2,
  skill: 'Baklava dilimi biçimini ve onu ikiye bölen çubukları çizmeyi öğrendin! Uçurtman gökyüzünde süzülsün.',
  palette: ['#ff4d4d', '#ffd23f', '#3fa7ff', '#6ccf7f', '#ff8fc8', '#eaf6ff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kocaman bir baklava dilimi çiz. Tepeden başla, sağa in, alttaki uca git, soldan geri dön.',
      shapes: [{ d: 'M200,30 L286,128 L200,240 L114,128 Z', part: 'uçurtma', fill: '#ff4d4d' }],
    },
    {
      say: 'İçine aynı biçimde daha küçük bir baklava dilimi çiz. Köşeleri büyüğünün köşelerine baksın.',
      shapes: [{ d: 'M200,69 L252,128 L200,195 L148,128 Z', part: 'iç baklava', fill: '#ffd23f' }],
    },
    {
      say: 'Uçurtmanın çubuklarını çiz. Biri tepeden alt uca, diğeri soldan sağa uzansın.',
      shapes: [
        { d: 'M200,30 L200,240', part: 'dik çubuk' },
        { d: 'M114,128 L286,128', part: 'yatay çubuk' },
      ],
    },
    {
      say: 'Alttaki uçtan aşağı doğru kıvrım kıvrım bir kuyruk çiz. Yılan gibi sağa sola kıvrılsın.',
      shapes: [{ d: 'M200,240 Q246,264 212,296 Q178,328 214,362', part: 'kuyruk' }],
    },
    {
      say: 'Kuyruğun üstüne üç renkli fiyonk çiz. Her fiyonk ortada buluşan iki üçgen olsun.',
      shapes: [
        { d: bow(226, 266), part: 'üst fiyonk', fill: '#3fa7ff' },
        { d: bow(196, 328), part: 'orta fiyonk', fill: '#6ccf7f' },
        { d: bow(214, 360), part: 'alt fiyonk', fill: '#ff8fc8' },
      ],
    },
    {
      say: 'Çubukların kesiştiği yerden sol alt köşeye uzun, kavisli bir ip çiz.',
      shapes: [{ d: 'M200,128 Q150,270 60,368', part: 'ip' }],
    },
    {
      say: 'Gökyüzüne iki pamuk gibi bulut çiz. Biri sol üstte, biri sağ altta olsun. İyi uçuşlar!',
      shapes: [
        { d: 'M50,96 Q38,74 62,70 Q66,48 92,54 Q112,42 124,64 Q146,66 138,96 Z', part: 'sol bulut', fill: '#eaf6ff' },
        { d: 'M276,250 Q266,230 286,226 Q292,206 316,212 Q336,204 344,224 Q362,228 354,250 Z', part: 'sağ bulut', fill: '#eaf6ff' },
      ],
    },
  ],
};

export default ucurtma;
