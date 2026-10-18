import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 11: Geniş şapkalı, fularlı ve mahmuzlu çizmeleri olan cesur kovboy. */
const kovboy: Lesson = {
  id: 'kovboy',
  path: 'karakterler',
  title: 'Kovboy',
  emoji: '🤠',
  order: 11,
  level: 2,
  skill: 'Geniş kovboy şapkası, boynundaki bandanası ve çizmeleriyle bir vahşi batı kahramanı çizmeyi öğrendin!',
  palette: ['#8b5a2b', '#ffe1cc', '#e63946', '#2563eb', '#ffd23f', '#fdf0d5', '#2d2d2d'],
  steps: [
    {
      say: 'Önce kovboyun kıvrık kenarlı geniş şapkasını ve ortası çukur tepesini çiz.',
      shapes: [
        {
          d: 'M75,148 C100,172 150,176 200,176 C250,176 300,172 325,148 C342,134 320,124 290,134 C240,150 160,150 110,134 C80,124 58,134 75,148 Z',
          part: 'şapka siperliği',
          fill: '#8b5a2b',
        },
        {
          d: 'M136,144 L142,82 C164,96 186,76 200,82 C214,76 236,96 258,82 L264,144 Z',
          part: 'şapka tepesi',
          fill: '#8b5a2b',
        },
        {
          d: 'M136,136 Q200,148 264,136 L265,144 Q200,156 135,144 Z',
          part: 'şapka bandı',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Şapkanın altına güler yüzlü bir çene ve yanlarına iki sevimli kulak ekle.',
      shapes: [
        {
          d: 'M142,160 Q142,228 200,228 Q258,228 258,160',
          part: 'yüz',
          fill: '#ffe1cc',
        },
        {
          d: 'M140,178 Q122,184 124,198 Q126,210 140,204',
          part: 'sol kulak',
          fill: '#ffe1cc',
        },
        {
          d: 'M260,178 Q278,184 276,198 Q274,210 260,204',
          part: 'sağ kulak',
          fill: '#ffe1cc',
        },
      ],
    },
    {
      say: 'Boynuna üçgen şeklinde sarkan kırmızı bir bandana bağla ve üzerine beyaz benekler koy.',
      shapes: [
        {
          d: 'M150,222 Q200,232 250,222 L215,268 Q200,274 185,268 Z',
          part: 'bandana',
          fill: '#e63946',
        },
        { d: circle(200, 252, 3), part: 'orta benek', fill: '#ffffff' },
        { d: circle(186, 244, 2.5), part: 'sol benek', fill: '#ffffff' },
        { d: circle(214, 244, 2.5), part: 'sağ benek', fill: '#ffffff' },
      ],
    },
    {
      say: 'Bandananın altına gömleği ve üstüne deri yeleği çiz. Yeleğe bir şerif rozeti tak.',
      shapes: [
        { d: 'M160,244 L146,308 L254,308 L240,244 Z', part: 'gömlek', fill: '#fdf0d5' },
        { d: 'M160,244 L146,308 L180,308 L188,254 Z', part: 'sol yelek', fill: '#8b5a2b' },
        { d: 'M240,244 L254,308 L220,308 L212,254 Z', part: 'sağ yelek', fill: '#8b5a2b' },
        { d: circle(172, 274, 6), part: 'şerif rozeti', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Beline büyük tokalı bir kemer ve altına mavi kot pantolonunu çiz.',
      shapes: [
        { d: 'M148,306 L252,306 L250,320 L150,320 Z', part: 'kemer', fill: '#5c3a21' },
        { d: ellipse(200, 313, 12, 8), part: 'kemer tokası', fill: '#ffd23f' },
        {
          d: 'M150,320 L146,358 L188,358 L200,332 L212,358 L254,358 L250,320 Z',
          part: 'pantolon',
          fill: '#2563eb',
        },
      ],
    },
    {
      say: 'İki yana elleri belinde duran kollar ekle.',
      shapes: [
        { d: 'M156,248 L124,272 A8,8 0 0,0 130,286 L148,278', part: 'sol kol', fill: '#fdf0d5' },
        { d: 'M244,248 L276,272 A8,8 0 0,1 270,286 L252,278', part: 'sağ kol', fill: '#fdf0d5' },
      ],
    },
    {
      say: 'Pantolonun altına kovboy çizmeleri ve topuklarına döner mahmuzlar çiz.',
      shapes: [
        { d: 'M146,358 L142,374 L132,374 Q130,382 144,382 L186,382 L188,358 Z', part: 'sol çizme', fill: '#8b5a2b' },
        { d: 'M212,358 L214,382 L256,382 Q270,382 268,374 L258,374 L254,358 Z', part: 'sağ çizme', fill: '#8b5a2b' },
        { d: circle(128, 376, 5), part: 'sol mahmuz', fill: '#ffd23f' },
        { d: circle(272, 376, 5), part: 'sağ mahmuz', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Kovboyun kocaman gülen gözlerini, tatlı gülümsemesini ve pembe yanaklarını çiz.',
      shapes: [
        { d: ellipse(176, 185, 9, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(179, 180, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(224, 185, 9, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(227, 180, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M186,206 Q200,218 214,206', part: 'gülümseme' },
        { d: ellipse(160, 204, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 204, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kovboy;
