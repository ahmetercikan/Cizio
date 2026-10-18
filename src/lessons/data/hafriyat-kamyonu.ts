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

/** İş Makineleri 14: İnsan boyunu aşan dev tekerlekleri ve koca kasası olan dev maden hafriyat kamyonu. */
const hafriyatKamyonu: Lesson = {
  id: 'hafriyat-kamyonu',
  path: 'ismakineleri',
  title: 'Dev Hafriyat Kamyonu',
  emoji: '🚚',
  order: 14,
  level: 2,
  skill: 'Kocaman tekerlekler ve basamaklar çizerek bir aracın ne kadar devasa olduğunu göstermeyi öğrendin!',
  palette: ['#fbbf24', '#f59e0b', '#1e293b', '#64748b', '#bae6fd', '#78716c'],
  steps: [
    {
      say: 'Önce kamyonun taşıyacağı devasa ön ve arka tekerlekleri, iç jantlarıyla çiz.',
      shapes: [
        { d: circle(110, 284, 46), part: 'arka tekerlek', fill: '#1e293b' },
        { d: circle(110, 284, 22), part: 'arka jant', fill: '#64748b' },
        { d: circle(110, 284, 9), part: 'arka jant göbeği', fill: '#374151' },
        { d: circle(295, 284, 46), part: 'ön tekerlek', fill: '#1e293b' },
        { d: circle(295, 284, 22), part: 'ön jant', fill: '#64748b' },
        { d: circle(295, 284, 9), part: 'ön jant göbeği', fill: '#374151' },
      ],
    },
    {
      say: 'Tekerleklerin etrafına kalın tırtık dişleri ve aralarına ağır şasi kirişini çiz.',
      shapes: [
        { d: rect(95, 246, 215, 30, 6), part: 'şasi kirişi', fill: '#334155' },
        { d: 'M68,264 L60,260 M64,284 L56,284 M68,304 L60,308 M152,264 L160,260 M156,284 L164,284 M152,304 L160,308', part: 'arka teker dişleri' },
        { d: 'M253,264 L245,260 M249,284 L241,284 M253,304 L245,308 M337,264 L345,260 M341,284 L349,284 M337,304 L345,308', part: 'ön teker dişleri' },
      ],
    },
    {
      say: 'Ön tarafa devasa radyatör ızgara kulesini, ızgara çizgilerini ve kalın çelik tamponu çiz.',
      shapes: [
        { d: rect(258, 185, 78, 58, 6), part: 'radyatör ızgarası', fill: '#f59e0b' },
        { d: 'M268,198 L328,198 M268,210 L328,210 M268,222 L328,222 M268,234 L328,234', part: 'ızgara telleri' },
        { d: rect(250, 245, 96, 18, 4), part: 'çelik tampon', fill: '#475569' },
      ],
    },
    {
      say: 'Tampondan yukarı çıkan çapraz tırmanma merdivenini ve korkuluklu üst yürüyüş platformunu çiz.',
      shapes: [
        { d: 'M256,252 L326,182', part: 'merdiven kolu' },
        { d: 'M268,240 L276,244 M284,224 L292,228 M300,208 L308,212 M316,192 L324,196', part: 'merdiven basamakları' },
        { d: rect(224, 175, 122, 8, 2), part: 'platform tabanı', fill: '#374151' },
        { d: 'M226,175 L226,150 L344,150 L344,175', part: 'güvenlik korkuluğu' },
      ],
    },
    {
      say: 'Platformun üstüne yüksek sürücü kabinini ve geniş renkli ön camını çiz.',
      shapes: [
        { d: rect(234, 118, 52, 57, 6), part: 'sürücü kabini', fill: '#facc15' },
        { d: rect(242, 125, 38, 26, 4), part: 'ön cam', fill: '#bae6fd' },
      ],
    },
    {
      say: 'Kamyonun arkasına koca hafriyat kasasını ve kabinin üstünü örten siperliği çiz.',
      shapes: [
        {
          d: 'M40,165 L68,246 L234,236 L234,106 L305,92 L305,82 L224,96 L40,154 Z',
          part: 'damperli kasa',
          fill: '#fbbf24',
        },
        { d: 'M96,242 L72,162 M142,240 L118,158 M188,238 L164,154', part: 'kasa güçlendirme kirişleri' },
      ],
    },
    {
      say: 'Kasanın içine tepeleme dolu dev kaya parçaları ve toprak öbekleri çiz.',
      shapes: [
        { d: 'M68,160 Q82,125 106,132 Q118,145 108,160 Z', part: 'büyük kaya 1', fill: '#78716c' },
        { d: 'M102,156 Q122,110 152,118 Q162,138 148,156 Z', part: 'büyük kaya 2', fill: '#a8a29e' },
        { d: 'M144,154 Q172,98 206,112 Q218,135 196,152 Z', part: 'büyük kaya 3', fill: '#78716c' },
        { d: circle(88, 138, 5), part: 'küçük taş 1', fill: '#f59e0b' },
        { d: circle(136, 128, 6), part: 'küçük taş 2', fill: '#f59e0b' },
        { d: circle(182, 122, 5), part: 'küçük taş 3', fill: '#f59e0b' },
      ],
    },
    {
      say: 'Kabine gülen gözler, pembe yanaklar, tampona parlak farlar ve tepeye sarı lambayı ekle.',
      shapes: [
        { d: circle(250, 140, 6), part: 'sol göz', fill: '#1e293b' },
        { d: circle(252, 138, 1.8), part: 'sol göz ışıltısı', fill: '#ffffff' },
        { d: circle(268, 140, 6), part: 'sağ göz', fill: '#1e293b' },
        { d: circle(270, 138, 1.8), part: 'sağ göz ışıltısı', fill: '#ffffff' },
        { d: 'M254,153 Q259,158 264,153', part: 'ağız' },
        { d: ellipse(244, 151, 4, 2.5), part: 'sol yanak', fill: '#fda4af' },
        { d: ellipse(274, 151, 4, 2.5), part: 'sağ yanak', fill: '#fda4af' },
        { d: rect(256, 248, 14, 10, 2), part: 'sol far', fill: '#fef08a' },
        { d: rect(324, 248, 14, 10, 2), part: 'sağ far', fill: '#fef08a' },
        { d: 'M270,82 L270,72 Q270,66 277,66 Q284,66 284,72 L284,82 Z', part: 'tepe lambası', fill: '#f59e0b' },
        { d: 'M20,330 L380,330', part: 'yer çizgisi' },
      ],
    },
  ],
};

export default hafriyatKamyonu;
