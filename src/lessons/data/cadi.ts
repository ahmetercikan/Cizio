import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const star = (cx: number, cy: number, R: number) => {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = ((-90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? R : R * 0.45;
    pts.push(`${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
};

/** Karakterler 13: Sivri şapkalı, süpürgeli ve yıldız asalı minik cadı. */
const cadi: Lesson = {
  id: 'cadi',
  path: 'karakterler',
  title: 'Minik Cadı',
  emoji: '🧙‍♀️',
  order: 13,
  level: 2,
  skill: 'Sivri cadı şapkası, uçan süpürgesi ve yıldızlı asasıyla sevimli bir cadı çizmeyi öğrendin!',
  palette: ['#4a2574', '#ffe1cc', '#ffd23f', '#ff85a1', '#854d0e', '#a855f7', '#2d2d2d'],
  steps: [
    {
      say: 'Önce minik cadının geniş siperlikli ve yana bükülen sivri şapkasını çiz.',
      shapes: [
        {
          d: 'M80,140 C110,165 290,165 320,140 C280,128 120,128 80,140 Z',
          part: 'şapka siperliği',
          fill: '#4a2574',
        },
        {
          d: 'M145,134 C160,80 180,45 230,30 C220,55 235,90 255,134 Z',
          part: 'sivri tepe',
          fill: '#4a2574',
        },
        {
          d: 'M147,126 Q200,136 253,126 L254,136 Q200,146 146,136 Z',
          part: 'şapka kemeri',
          fill: '#a855f7',
        },
        { d: ellipse(200, 134, 10, 7), part: 'şapka tokası', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Şapkanın altına yuvarlak bir yüz ve yanlardan dökülen dalgalı saçlar ekle.',
      shapes: [
        { d: 'M145,152 Q145,224 200,224 Q255,224 255,152', part: 'yüz', fill: '#ffe1cc' },
        {
          d: 'M146,152 Q170,172 195,155 Q220,172 254,152',
          part: 'kâküller',
          fill: '#ff85a1',
        },
        {
          d: 'M140,154 Q124,198 136,226 Q146,200 148,168',
          part: 'sol saç buklesi',
          fill: '#ff85a1',
        },
        {
          d: 'M260,154 Q276,198 264,226 Q254,200 252,168',
          part: 'sağ saç buklesi',
          fill: '#ff85a1',
        },
      ],
    },
    {
      say: 'Kafanın altına aşağı doğru genişleyen sihirbaz elbisesini çiz.',
      shapes: [
        {
          d: 'M175,224 L142,320 Q200,332 258,320 L225,224 Z',
          part: 'cadı elbisesi',
          fill: '#3b1d61',
        },
        { d: 'M182,224 L200,242 L218,224', part: 'yaka' },
      ],
    },
    {
      say: 'Elbisenin altına çizgili çoraplar ve uçları kıvrık sevimli ayakkabılar ekle.',
      shapes: [
        { d: 'M168,322 L168,358 L180,358 L180,322 Z', part: 'sol bacak', fill: '#a855f7' },
        { d: 'M220,322 L220,358 L232,358 L232,322 Z', part: 'sağ bacak', fill: '#a855f7' },
        { d: 'M168,334 L180,334 M168,346 L180,346 M220,334 L232,334 M220,346 L232,346', part: 'çorap çizgileri' },
        {
          d: 'M168,358 L168,372 Q145,372 138,362 Q148,362 180,372 L180,358 Z',
          part: 'sol ayakkabı',
          fill: '#241038',
        },
        {
          d: 'M220,358 L220,372 Q245,372 262,362 Q252,362 232,372 L232,358 Z',
          part: 'sağ ayakkabı',
          fill: '#241038',
        },
      ],
    },
    {
      say: 'Cadının yanına sihirli uçan süpürgesini çiz. Ucundaki çalılar püskül gibi dursun.',
      shapes: [
        { d: 'M85,268 L320,348 L316,358 L81,278 Z', part: 'süpürge sapı', fill: '#854d0e' },
        {
          d: 'M58,242 C92,260 98,284 76,302 C50,292 40,266 58,242 Z',
          part: 'süpürge çalıları',
          fill: '#d97706',
        },
        { d: 'M74,264 L80,276', part: 'süpürge bağı' },
      ],
    },
    {
      say: 'Elbisenin kollarını çiz; biri süpürgeyi tutsun, diğeri asayı kaldırsın.',
      shapes: [
        { d: 'M170,230 L118,266 A8,8 0 0,0 126,276 L164,248', part: 'sol kol', fill: '#3b1d61' },
        { d: circle(122, 270, 5), part: 'sol el', fill: '#ffe1cc' },
        { d: 'M230,230 L274,244 A8,8 0 0,0 282,234 L236,224', part: 'sağ kol', fill: '#3b1d61' },
        { d: circle(280, 238, 5), part: 'sağ el', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Cadının eline parıldayan yıldızlı bir sihir asası ve etrafına minik ışıltılar ekle.',
      shapes: [
        { d: 'M282,242 L320,186', part: 'asa çubuğu', fill: '#ffd23f' },
        { d: star(324, 180, 15), part: 'asa yıldızı', fill: '#ffd23f' },
        { d: 'M344,166 L344,174 M340,170 L348,170', part: 'sağ ışıltı' },
        { d: 'M304,162 L304,170 M300,166 L308,166', part: 'sol ışıltı' },
      ],
    },
    {
      say: 'Son olarak kocaman parıldayan gözler, tatlı bir gülümseme ve pembe yanaklar çiz.',
      shapes: [
        { d: ellipse(176, 185, 9, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(179, 180, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(224, 185, 9, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(227, 180, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M188,206 Q200,216 212,206', part: 'gülümseme' },
        { d: ellipse(160, 203, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 203, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default cadi;
