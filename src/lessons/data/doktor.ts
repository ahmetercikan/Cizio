import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 17: Beyaz önlüklü, stetoskoplu ve ilk yardım çantalı sevimli doktor. */
const doktor: Lesson = {
  id: 'doktor',
  path: 'meslekler',
  title: 'Doktor',
  emoji: '👨‍⚕️',
  order: 2,
  level: 2,
  skill: 'Beyaz hekim önlüğü, boynundaki stetoskopu ve acil çantasıyla sevimli bir doktor çizmeyi öğrendin!',
  palette: ['#f8fafc', '#b91c1c', '#0ea5e9', '#ffe1cc', '#334155', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce doktorun başını, düzenli taranmış saçlarını ve alnındaki muayene aynasını çiz.',
      shapes: [
        { d: circle(200, 130, 48), part: 'baş', fill: '#ffe1cc' },
        {
          d: 'M152,130 C150,85 180,75 200,75 C225,75 250,85 248,130 C242,106 218,102 200,108 C182,102 158,106 152,130 Z',
          part: 'saç',
          fill: '#475569',
        },
        { d: 'M152,130 Q138,135 140,145 Q142,155 154,150', part: 'sol kulak', fill: '#ffe1cc' },
        { d: 'M248,130 Q262,135 260,145 Q258,155 246,150', part: 'sağ kulak', fill: '#ffe1cc' },
        { d: circle(200, 95, 9), part: 'muayene aynası', fill: '#cbd5e1' },
        { d: circle(200, 95, 3), part: 'ayna deliği', fill: '#64748b' },
      ],
    },
    {
      say: 'Kafanın altına beyaz doktor önlüğünü, kravatını ve cebindeki kalemi çiz.',
      shapes: [
        { d: 'M165,178 L142,308 L258,308 L235,178 Z', part: 'beyaz önlük', fill: '#f8fafc' },
        { d: 'M180,178 L200,220 L200,308', part: 'önlük çizgisi' },
        { d: 'M196,196 L204,196 L202,218 L198,218 Z', part: 'kravat', fill: '#0ea5e9' },
        { d: 'M156,245 L176,245 L176,262 L156,262 Z', part: 'önlük cebi', fill: '#f1f5f9' },
        { d: 'M164,238 L164,250', part: 'kalem', fill: '#0ea5e9' },
      ],
    },
    {
      say: 'Boynuna kıvrılan stetoskopu ve göğsüne inen yuvarlak ses alıcısını çiz.',
      shapes: [
        { d: 'M156,154 Q172,174 186,184', part: 'sol stetoskop borusu' },
        { d: 'M244,154 Q228,174 214,184', part: 'sağ stetoskop borusu' },
        { d: 'M186,184 Q200,196 214,184', part: 'boyun halkası' },
        { d: 'M200,194 Q192,224 210,238', part: 'alt hortum' },
        { d: circle(216, 245, 9), part: 'stetoskop diski', fill: '#94a3b8' },
        { d: circle(216, 245, 5), part: 'disk merkezi', fill: '#0ea5e9' },
      ],
    },
    {
      say: 'Önlüğün iki yanına beyaz kolları ve elleri ekle.',
      shapes: [
        { d: 'M165,185 L132,238 A8,8 0 0,0 144,248 L170,208', part: 'sol kol', fill: '#f8fafc' },
        { d: circle(136, 246, 5), part: 'sol el', fill: '#ffe1cc' },
        { d: 'M235,185 L268,222 A8,8 0 0,1 258,234 L230,208', part: 'sağ kol', fill: '#f8fafc' },
        { d: circle(264, 226, 5), part: 'sağ el', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Doktorun eline üzerinde beyaz artı işareti olan kırmızı bir sağlık çantası çiz.',
      shapes: [
        {
          d: 'M105,255 L155,255 Q158,255 158,258 L158,295 Q158,298 155,298 L105,298 Q102,298 102,295 L102,258 Q102,255 105,255 Z',
          part: 'sağlık çantası',
          fill: '#b91c1c',
        },
        { d: 'M120,255 Q130,242 140,255', part: 'çanta sapı' },
        {
          d: 'M126,273 L134,273 L134,265 L138,265 L138,273 L146,273 L146,277 L138,277 L138,285 L134,285 L134,277 L126,277 Z',
          part: 'beyaz artı simgesi',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Önlüğün altına koyu renk pantolonu ve temiz ayakkabıları çiz.',
      shapes: [
        {
          d: 'M162,308 L158,360 L194,360 L200,332 L206,360 L242,360 L238,308 Z',
          part: 'pantolon',
          fill: '#334155',
        },
        { d: ellipse(174, 366, 14, 7), part: 'sol ayakkabı', fill: '#0f172a' },
        { d: ellipse(226, 366, 14, 7), part: 'sağ ayakkabı', fill: '#0f172a' },
      ],
    },
    {
      say: 'Güven veren güler yüzlü gözler, tatlı bir tebessüm ve pembe yanaklar çiz.',
      shapes: [
        { d: ellipse(180, 132, 8, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(182, 128, 3.5), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(220, 132, 8, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(222, 128, 3.5), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M188,148 Q200,160 212,148', part: 'gülümseme' },
        { d: ellipse(166, 146, 7, 4), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(234, 146, 7, 4), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default doktor;
