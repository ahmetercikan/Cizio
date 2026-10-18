import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const n = (v: number) => Math.round(v * 100) / 100;

const heart = (cx: number, top: number, w: number, h: number) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const dip = top + h * 0.22, mid = top + h * 0.34, tip = top + h;
  return (
    `M${n(cx)},${n(dip)} C${n(cx - w * 0.12)},${n(top - h * 0.05)} ${n(x0)},${n(top)} ${n(x0)},${n(mid)} ` +
    `C${n(x0)},${n(top + h * 0.62)} ${n(cx - w * 0.3)},${n(top + h * 0.78)} ${n(cx)},${n(tip)} ` +
    `C${n(cx + w * 0.3)},${n(top + h * 0.78)} ${n(x1)},${n(top + h * 0.62)} ${n(x1)},${n(mid)} ` +
    `C${n(x1)},${n(top)} ${n(cx + w * 0.12)},${n(top - h * 0.05)} ${n(cx)},${n(dip)} Z`
  );
};

const sevgililerGunu: Lesson = {
  id: 'sevgililer-gunu',
  path: 'ozel',
  title: 'Sevgi Kutusu',
  emoji: '💝',
  order: 13,
  level: 1,
  skill: 'Kalp biçiminde derinliği olan bir hediye kutusu çizmeyi ve içine lezzetli çikolatalar yerleştirmeyi öğrendin!',
  palette: ['#e63946', '#ff758f', '#ffccd5', '#582f0e', '#7f4f24', '#f4a261', '#ffd166', '#ffffff'],
  steps: [
    {
      say: 'Önce sevgi kutumuzun kocaman kalp tabanını ve kutunun kenar derinliğini çizelim.',
      shapes: [
        { d: heart(200, 95, 260, 230), part: 'kutu alt kenarı', fill: '#9b2226' },
        { d: heart(200, 75, 260, 230), part: 'kutu gövdesi', fill: '#e63946' },
      ],
    },
    {
      say: 'Kutumuzun kalın duvarlarını ve içindeki kadife yastığı göstermek için içine daha küçük bir kalp çizelim.',
      shapes: [
        { d: heart(200, 92, 226, 196), part: 'kutu içi kadife', fill: '#ffccd5' },
      ],
    },
    {
      say: 'Kutunun içine çikolataların duracağı beyaz fırfırlı kağıt kalıpları yerleştirelim.',
      shapes: [
        { d: circle(200, 195, 22), part: 'orta kalıp', fill: '#ffffff' },
        { d: circle(150, 155, 18), part: 'sol üst kalıp', fill: '#ffffff' },
        { d: circle(250, 155, 18), part: 'sağ üst kalıp', fill: '#ffffff' },
        { d: circle(165, 225, 17), part: 'sol alt kalıp', fill: '#ffffff' },
        { d: circle(235, 225, 17), part: 'sağ alt kalıp', fill: '#ffffff' },
      ],
    },
    {
      say: 'Şimdi bölmelere nefis çikolatalar yerleştirelim: ortada kalp çikolata, etrafında trüf ve pralinler!',
      shapes: [
        { d: heart(200, 182, 28, 25), part: 'orta kalp çikolata', fill: '#582f0e' },
        { d: 'M192,192 Q200,186 208,194', part: 'çilekli sos' },
        { d: circle(150, 155, 14), part: 'yuvarlak trüf', fill: '#3d1e03' },
        { d: 'M145,152 Q150,148 154,152 Q155,158 149,158', part: 'beyaz krema çizgisi' },
        { d: 'M238,143 L262,143 L262,167 L238,167 Z', part: 'kare pralin', fill: '#7f4f24' },
        { d: circle(250, 155, 5), part: 'fındık parçası', fill: '#f4a261' },
        { d: circle(165, 225, 13), part: 'çilekli çikolata', fill: '#ff758f' },
        { d: circle(163, 222, 3), part: 'çikolata ışıltısı', fill: '#ffffff' },
        { d: circle(235, 225, 13), part: 'altın kaplı çikolata', fill: '#ffd166' },
        { d: 'M226,225 L244,225', part: 'yaldız yatay çizgi' },
        { d: 'M235,216 L235,234', part: 'yaldız dikey çizgi' },
      ],
    },
    {
      say: 'Kutumuzun köşesine ipekten sarı parlak bir hediye kurdelesi ve fiyonk bağlayalım.',
      shapes: [
        { d: circle(105, 95, 9), part: 'fiyonk düğümü', fill: '#ffd166' },
        { d: 'M100,92 C75,65 55,95 98,100 Z', part: 'sol fiyonk kanadı', fill: '#ffbe0b' },
        { d: 'M110,92 C135,65 155,95 112,100 Z', part: 'sağ fiyonk kanadı', fill: '#ffbe0b' },
        {
          d: 'M100,102 Q80,130 75,160 Q85,155 92,150 Q96,130 106,104 Z',
          part: 'sol kurdele ucu',
          fill: '#ffd166',
        },
        {
          d: 'M107,102 Q120,130 130,155 Q122,152 115,148 Q110,128 104,104 Z',
          part: 'sağ kurdele ucu',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Kutunun etrafına uçuşan minik kalpler ve ışıltılar serpelim. Sevgi kutumuz hazır!',
      shapes: [
        { d: heart(65, 220, 26, 24), part: 'sol uçan kalp', fill: '#ff758f' },
        { d: heart(335, 120, 24, 22), part: 'sağ üst uçan kalp', fill: '#ff758f' },
        { d: heart(325, 260, 28, 26), part: 'sağ alt uçan kalp', fill: '#e63946' },
        {
          d: 'M65,70 Q65,80 55,80 Q65,80 65,90 Q65,80 75,80 Q65,80 65,70 Z',
          part: 'sol parıltı',
          fill: '#ffd166',
        },
        {
          d: 'M340,195 Q340,205 330,205 Q340,205 340,215 Q340,205 350,205 Q340,205 340,195 Z',
          part: 'sağ parıltı',
          fill: '#ffd166',
        },
      ],
    },
  ],
};

export default sevgililerGunu;
