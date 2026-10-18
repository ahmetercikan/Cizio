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

/** İş Makineleri 11: Tekerlekli şasisi, uzayan teleskopik bomu ve kancası olan bir mobil vinç. */
const mobilVinc: Lesson = {
  id: 'mobil-vinc',
  path: 'ismakineleri',
  title: 'Mobil Vinç',
  emoji: '🏗️',
  order: 11,
  level: 2,
  skill: 'Teleskopik bomu eğik açıyla uzatmayı, halat ve kancayla ağırlık taşımayı öğrendin!',
  palette: ['#facc15', '#f59e0b', '#374151', '#bae6fd', '#e11d48', '#94a3b8'],
  steps: [
    {
      say: 'Önce kamyonun uzun şasisini ve sağ tarafa eğik camlı sürücü kabinini çiz.',
      shapes: [
        { d: rect(45, 246, 235, 26, 6), part: 'şasi', fill: '#374151' },
        {
          d: 'M195,246 L195,175 Q195,165 208,165 L255,165 Q268,165 274,176 L288,210 Q292,218 292,228 L292,246 Z',
          part: 'kabin',
          fill: '#facc15',
        },
        { d: 'M208,175 L252,175 Q260,175 264,182 L276,212 L208,212 Z', part: 'ön cam', fill: '#bae6fd' },
      ],
    },
    {
      say: 'Şasinin altına dört sağlam tekerlek ve vincin devrilmesini önleyen iki destek ayağı çiz.',
      shapes: [
        { d: circle(74, 298, 24), part: 'arka sol tekerlek', fill: '#374151' },
        { d: circle(74, 298, 10), part: 'arka sol jant', fill: '#94a3b8' },
        { d: circle(126, 298, 24), part: 'arka sağ tekerlek', fill: '#374151' },
        { d: circle(126, 298, 10), part: 'arka sağ jant', fill: '#94a3b8' },
        { d: circle(204, 298, 24), part: 'ön sol tekerlek', fill: '#374151' },
        { d: circle(204, 298, 10), part: 'ön sol jant', fill: '#94a3b8' },
        { d: circle(256, 298, 24), part: 'ön sağ tekerlek', fill: '#374151' },
        { d: circle(256, 298, 10), part: 'ön sağ jant', fill: '#94a3b8' },
        { d: 'M54,266 L30,320 L46,320 L70,266 Z', part: 'arka destek ayağı', fill: '#f59e0b' },
        { d: rect(20, 318, 36, 6, 2), part: 'arka ayak pabucu', fill: '#374151' },
        { d: 'M264,266 L288,320 L272,320 L248,266 Z', part: 'ön destek ayağı', fill: '#f59e0b' },
        { d: rect(266, 318, 36, 6, 2), part: 'ön ayak pabucu', fill: '#374151' },
      ],
    },
    {
      say: 'Gövdenin üstüne döner vinç platformu, arkaya ağır karşı ağırlık ve vinç kabinini çiz.',
      shapes: [
        { d: rect(52, 234, 126, 12, 3), part: 'döner tabla', fill: '#475569' },
        { d: rect(48, 182, 40, 52, 5), part: 'karşı ağırlık', fill: '#374151' },
        { d: 'M48,199 L88,199 M48,216 L88,216', part: 'ağırlık çizgileri' },
        { d: rect(104, 175, 44, 59, 5), part: 'vinç kabini', fill: '#facc15' },
        { d: rect(110, 183, 32, 30, 4), part: 'vinç camı', fill: '#bae6fd' },
      ],
    },
    {
      say: 'Platformdan göğe doğru uzanan kalın ana bomu ve onu kaldıran hidrolik silindiri çiz.',
      shapes: [
        { d: circle(88, 204, 8), part: 'bom mafsalı', fill: '#64748b' },
        { d: 'M81,193 L216,99 L230,121 L95,215 Z', part: 'ana bom', fill: '#f59e0b' },
        { d: 'M212,96 L222,89 L236,111 L226,118 Z', part: 'bom kelepçesi', fill: '#374151' },
        { d: 'M110,240 L142,192 L152,198 L120,246 Z', part: 'piston kovanı', fill: '#64748b' },
        { d: 'M142,192 L160,165 L166,169 L148,196 Z', part: 'piston mili', fill: '#cbd5e1' },
      ],
    },
    {
      say: 'Ana bomun içinden göğe doğru uzayan ikinci teleskopik bomu ve uçtaki tepe makarasını çiz.',
      shapes: [
        { d: 'M218,103 L340,38 L350,52 L228,117 Z', part: 'ikinci bom', fill: '#facc15' },
        { d: circle(346, 45, 9), part: 'tepe makarası', fill: '#475569' },
      ],
    },
    {
      say: 'Makaradan aşağı sarkan çelik halatı, makara bloğunu ve güçlü kaldırma kancasını çiz.',
      shapes: [
        { d: 'M350,48 L350,140', part: 'çelik halat' },
        { d: rect(342, 140, 16, 20, 4), part: 'makara bloğu', fill: '#374151' },
        { d: 'M350,160 L350,174 C350,188 332,188 332,178 C332,171 339,171 339,176', part: 'kanca' },
      ],
    },
    {
      say: 'Kancadan iki askı halatı sarkıt ve kancaya asılı ağır kırmızı çelik bir kiriş çiz.',
      shapes: [
        { d: 'M350,176 L320,202 M350,176 L384,202', part: 'askı halatları' },
        { d: rect(312, 202, 78, 6, 2), part: 'kiriş üst flanşı', fill: '#e11d48' },
        { d: rect(318, 208, 66, 12, 1), part: 'kiriş gövdesi', fill: '#be123c' },
        { d: rect(312, 220, 78, 6, 2), part: 'kiriş alt flanşı', fill: '#e11d48' },
      ],
    },
    {
      say: 'Kamyonun kabinine gülen gözler, pembe yanaklar, farlar ve tepeye turuncu bir lamba çiz.',
      shapes: [
        { d: circle(224, 190, 7), part: 'sol göz', fill: '#1e293b' },
        { d: circle(226, 187, 2), part: 'sol göz ışıltısı', fill: '#ffffff' },
        { d: circle(248, 190, 7), part: 'sağ göz', fill: '#1e293b' },
        { d: circle(250, 187, 2), part: 'sağ göz ışıltısı', fill: '#ffffff' },
        { d: 'M232,228 Q240,235 248,228', part: 'ağız' },
        { d: ellipse(220, 228, 5, 3), part: 'sol yanak', fill: '#fda4af' },
        { d: ellipse(260, 228, 5, 3), part: 'sağ yanak', fill: '#fda4af' },
        { d: rect(280, 220, 12, 12, 3), part: 'far', fill: '#fef08a' },
        { d: rect(276, 238, 16, 8, 2), part: 'tampon', fill: '#64748b' },
        { d: 'M232,165 L232,155 Q232,148 241,148 Q250,148 250,155 L250,165 Z', part: 'tepe lambası', fill: '#f97316' },
        { d: 'M15,322 L385,322', part: 'yer çizgisi' },
      ],
    },
  ],
};

export default mobilVinc;
