import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Köşeleri yuvarlatılmış dikdörtgen. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} ` +
  `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} ` +
  `L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;

/** İş Makineleri 15: Katlanır uzun bom kolu ve sarkan hortumuyla binalara beton döken mobil beton pompası. */
const betonPompasi: Lesson = {
  id: 'beton-pompasi',
  path: 'ismakineleri',
  title: 'Beton Pompası',
  emoji: '🏗️',
  order: 15,
  level: 3,
  skill: 'Zikzak gibi katlanan çok parçalı bom kolunu ve sarkan hortumu dengeli bir şekilde çizmeyi öğrendin!',
  palette: ['#ea580c', '#f97316', '#cbd5e1', '#334155', '#94a3b8', '#d97706', '#bae6fd'],
  steps: [
    {
      say: 'Önce kamyonun uzun şasisini ve sol tarafa dik camlı sürücü kabinini çiz.',
      shapes: [
        { d: rect(45, 260, 210, 24, 4), part: 'şasi', fill: '#1f2937' },
        {
          d: 'M45,260 L45,200 Q45,185 60,185 L105,185 Q118,185 118,198 L118,260 Z',
          part: 'sürücü kabini',
          fill: '#ea580c',
        },
        { d: 'M52,192 L105,192 Q110,192 110,198 L110,224 L52,224 Z', part: 'ön cam', fill: '#bae6fd' },
      ],
    },
    {
      say: 'Şasinin altına üç sağlam tekerlek, öne bir tampon ve parlak farları ekle.',
      shapes: [
        { d: circle(75, 302, 22), part: 'ön tekerlek', fill: '#334155' },
        { d: circle(75, 302, 9), part: 'ön jant', fill: '#94a3b8' },
        { d: circle(180, 302, 22), part: 'orta tekerlek', fill: '#334155' },
        { d: circle(180, 302, 9), part: 'orta jant', fill: '#94a3b8' },
        { d: circle(226, 302, 22), part: 'arka tekerlek', fill: '#334155' },
        { d: circle(226, 302, 9), part: 'arka jant', fill: '#94a3b8' },
        { d: rect(40, 252, 14, 12, 3), part: 'tampon', fill: '#64748b' },
        { d: rect(42, 236, 10, 10, 2), part: 'far', fill: '#fef08a' },
      ],
    },
    {
      say: 'Pompanın devrilmesini önleyen, yere sağlam basan iki açılır denge ayağı çiz.',
      shapes: [
        { d: 'M75,272 L38,323 L52,323 L85,272 Z', part: 'ön destek ayağı', fill: '#f97316' },
        { d: rect(26, 321, 34, 5, 2), part: 'ön ayak tabanı', fill: '#374151' },
        { d: 'M230,272 L260,323 L274,323 L242,272 Z', part: 'arka destek ayağı', fill: '#f97316' },
        { d: rect(252, 321, 34, 5, 2), part: 'arka ayak tabanı', fill: '#374151' },
      ],
    },
    {
      say: 'Kabinin arkasına döner kule kaidesini, kamyonun arkasına da beton döküm haznesini çiz.',
      shapes: [
        { d: rect(128, 228, 36, 32, 4), part: 'kule kaidesi', fill: '#ea580c' },
        { d: rect(124, 218, 44, 10, 3), part: 'döner halka', fill: '#334155' },
        {
          d: 'M232,242 L274,242 L268,272 L236,272 Z',
          part: 'beton haznesi',
          fill: '#475569',
        },
        { d: 'M242,242 L244,270 M253,242 L253,270 M264,242 L262,270', part: 'hazne ızgarası' },
      ],
    },
    {
      say: 'Kuleden göğe doğru yükselen birinci ana bom kolunu ve hidrolik kaldırma silindirini çiz.',
      shapes: [
        { d: circle(146, 215, 6), part: 'bom dip pimi', fill: '#94a3b8' },
        { d: 'M140,220 L179,112 L191,118 L152,224 Z', part: 'birinci ana bom', fill: '#cbd5e1' },
        { d: 'M156,238 L168,172 L174,174 L162,240 Z', part: 'kaldırma silindiri', fill: '#64748b' },
        { d: circle(185, 115, 6), part: 'birinci mafsal pimi', fill: '#475569' },
      ],
    },
    {
      say: 'Birinci kola bağlı geriye katlanan ikinci kolu ve ileri uzanan üçüncü bom kolunu çiz.',
      shapes: [
        { d: 'M188,110 L124,67 L116,77 L182,120 Z', part: 'ikinci bom', fill: '#e2e8f0' },
        { d: circle(120, 72, 5.5), part: 'ikinci mafsal pimi', fill: '#475569' },
        { d: 'M118,67 L253,43 L257,53 L122,77 Z', part: 'üçüncü bom', fill: '#cbd5e1' },
        { d: circle(255, 48, 5), part: 'üçüncü mafsal pimi', fill: '#475569' },
      ],
    },
    {
      say: 'Bomun ucuna dördüncü kolu ekle ve ucundan aşağı sarkan uzun esnek kauçuk hortumu çiz.',
      shapes: [
        { d: 'M253,44 L323,88 L329,96 L257,52 Z', part: 'dördüncü uç bom', fill: '#e2e8f0' },
        { d: circle(326, 92, 5), part: 'bom ucu dirseği', fill: '#475569' },
        {
          d: 'M323,92 Q326,140 321,180 Q317,215 323,252 L329,252 Q323,215 327,180 Q332,140 329,92 Z',
          part: 'kauçuk döküm hortumu',
          fill: '#1e293b',
        },
        { d: 'M321,130 L329,130 M319,190 L327,190 M322,240 L330,240', part: 'hortum kelepçeleri' },
      ],
    },
    {
      say: 'Sağ tarafa ahşap temel kalıbını ve hortumdan dökülen taze gri betonu çiz.',
      shapes: [
        { d: rect(285, 298, 92, 26, 3), part: 'ahşap temel kalıbı', fill: '#d97706' },
        { d: 'M285,311 L377,311 M315,298 L315,324 M345,298 L345,324', part: 'kalıp tahtaları' },
        {
          d: 'M323,252 Q320,270 315,285 L335,285 Q330,270 329,252 Z',
          part: 'akan beton harcı',
          fill: '#94a3b8',
        },
        {
          d: 'M292,302 Q330,296 370,302 Q372,318 330,318 Q290,318 292,302 Z',
          part: 'dökülen beton havuzu',
          fill: '#94a3b8',
        },
        { d: circle(308, 282, 3), part: 'harç damlası 1', fill: '#94a3b8' },
        { d: circle(342, 280, 3), part: 'harç damlası 2', fill: '#94a3b8' },
      ],
    },
    {
      say: 'Kamyon kabinine gülen gözler, pembe yanaklar, tepe lambası ve yer çizgisini ekle.',
      shapes: [
        { d: circle(70, 208, 6), part: 'sol göz', fill: '#1e293b' },
        { d: circle(72, 206, 1.8), part: 'sol göz ışıltısı', fill: '#ffffff' },
        { d: circle(92, 208, 6), part: 'sağ göz', fill: '#1e293b' },
        { d: circle(94, 206, 1.8), part: 'sağ göz ışıltısı', fill: '#ffffff' },
        { d: 'M77,218 Q81,223 85,218', part: 'ağız' },
        { d: ellipse(63, 218, 4, 2.5), part: 'sol yanak', fill: '#fda4af' },
        { d: ellipse(99, 218, 4, 2.5), part: 'sağ yanak', fill: '#fda4af' },
        { d: 'M78,185 L78,175 Q78,168 85,168 Q92,168 92,175 L92,185 Z', part: 'tepe lambası', fill: '#f59e0b' },
        { d: 'M15,325 L385,325', part: 'yer çizgisi' },
      ],
    },
  ],
};

export default betonPompasi;
