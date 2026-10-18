import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 18: Kaskı, sarı çizmeleri ve su hortumuyla cesur itfaiyeci. */
const itfaiyeciKarakter: Lesson = {
  id: 'itfaiyeci-karakter',
  path: 'karakterler',
  title: 'Cesur İtfaiyeci',
  emoji: '👨‍🚒',
  order: 18,
  level: 2,
  skill: 'Sağlam itfaiyeci kaskı, fosforlu şeritleri ve tazyikli su hortumuyla cesur bir kahraman çizmeyi öğrendin!',
  palette: ['#dc2626', '#facc15', '#1e293b', '#38bdf8', '#ffe1cc', '#ffb3c1', '#2d2d2d'],
  steps: [
    {
      say: 'Önce itfaiyecinin geniş siperlikli kırmızı kaskını ve önündeki altın armayı çiz.',
      shapes: [
        {
          d: 'M142,138 C138,76 262,76 258,138 Z',
          part: 'kask kubbesi',
          fill: '#dc2626',
        },
        {
          d: 'M130,138 Q200,156 270,138 L285,150 Q200,168 115,150 Z',
          part: 'kask siperliği',
          fill: '#b91c1c',
        },
        {
          d: 'M192,100 L208,100 L205,122 L200,126 L195,122 Z',
          part: 'kask arması',
          fill: '#facc15',
        },
        { d: 'M200,105 L200,120', part: 'arma çizgisi' },
      ],
    },
    {
      say: 'Kaskın altına güler yüzlü bir çene ve iki yana kulaklarını ekle.',
      shapes: [
        { d: 'M145,155 Q145,225 200,225 Q255,225 255,155', part: 'yüz', fill: '#ffe1cc' },
        { d: 'M142,175 Q126,180 128,194 Q130,204 144,198', part: 'sol kulak', fill: '#ffe1cc' },
        { d: 'M258,175 Q274,180 272,194 Q270,204 256,198', part: 'sağ kulak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Kafanın altına koruyucu itfaiyeci ceketini ve üzerindeki sarı güvenlik şeritlerini çiz.',
      shapes: [
        { d: 'M162,220 L138,310 L262,310 L238,220 Z', part: 'itfaiyeci ceketi', fill: '#dc2626' },
        { d: 'M178,220 L200,238 L222,220', part: 'yaka' },
        { d: 'M152,260 L248,260 L246,272 L154,272 Z', part: 'göğüs fosfor şeridi', fill: '#facc15' },
        { d: 'M140,300 L260,300 L258,310 L142,310 Z', part: 'etek fosfor şeridi', fill: '#facc15' },
      ],
    },
    {
      say: 'İtfaiyecinin elinde tuttuğu sarı pirinç nozulu ve kıvrılan kalın yangın hortumunu çiz.',
      shapes: [
        { d: 'M244,230 L276,220 L282,226 L250,236 Z', part: 'su vanası nozulu', fill: '#facc15' },
        { d: 'M276,218 L286,221 L284,228 L274,225 Z', part: 'nozul ucu', fill: '#94a3b8' },
        {
          d: 'M80,340 C100,340 120,310 145,290 C165,275 185,275 205,255 L242,238 L248,248 C220,265 200,285 180,285 C155,285 130,320 100,352 Z',
          part: 'yangın hortumu',
          fill: '#475569',
        },
      ],
    },
    {
      say: 'Hortumu sımsıkı tutan iki güçlü kol ve kalın koruyucu eldivenler ekle.',
      shapes: [
        { d: 'M165,225 L200,248 A9,9 0 0,0 212,240 L178,220', part: 'sol kol', fill: '#dc2626' },
        { d: ellipse(206, 246, 7, 7), part: 'sol eldiven', fill: '#1e293b' },
        { d: 'M235,225 L252,236 A9,9 0 0,0 262,228 L242,220', part: 'sağ kol', fill: '#dc2626' },
        { d: ellipse(256, 234, 7, 7), part: 'sağ eldiven', fill: '#1e293b' },
      ],
    },
    {
      say: 'Ceketin altına koyu renk pantolonu ve parlak sarı itfaiyeci çizmelerini çiz.',
      shapes: [
        {
          d: 'M152,310 L148,352 L188,352 L200,325 L212,352 L252,352 L248,310 Z',
          part: 'pantolon',
          fill: '#1e293b',
        },
        { d: 'M150,342 L186,342 M214,342 L250,342', part: 'pantolon şeritleri', fill: '#facc15' },
        {
          d: 'M148,352 L144,374 L132,374 Q130,384 146,384 L188,384 L188,352 Z',
          part: 'sol çizme',
          fill: '#facc15',
        },
        { d: 'M132,374 Q130,384 146,384 L152,384 L152,374 Z', part: 'sol çizme burnu', fill: '#0f172a' },
        {
          d: 'M212,352 L212,384 L254,384 Q270,384 268,374 L256,374 L252,352 Z',
          part: 'sağ çizme',
          fill: '#facc15',
        },
        { d: 'M248,374 L248,384 L254,384 Q270,384 268,374 Z', part: 'sağ çizme burnu', fill: '#0f172a' },
      ],
    },
    {
      say: 'Hortumun ucundan fışkıran tazyikli mavi suyu ve sıçrayan su damlacıklarını çiz.',
      shapes: [
        {
          d: 'M284,222 Q325,198 358,214 Q335,232 286,226 Z',
          part: 'su fışkırması',
          fill: '#38bdf8',
        },
        { d: circle(345, 194, 5), part: 'üst su damlası', fill: '#38bdf8' },
        { d: circle(368, 212, 4), part: 'orta su damlası', fill: '#38bdf8' },
        { d: circle(350, 236, 4), part: 'alt su damlası', fill: '#38bdf8' },
      ],
    },
    {
      say: 'Cesur bakan güler yüzlü gözler, tatlı bir gülümseme ve pembe yanaklar ekle.',
      shapes: [
        { d: ellipse(176, 185, 9, 12), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(179, 180, 4), part: 'sol göz parıltısı', fill: '#ffffff' },
        { d: ellipse(224, 185, 9, 12), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(227, 180, 4), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: 'M186,206 Q200,218 214,206', part: 'gülümseme' },
        { d: ellipse(160, 203, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 203, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default itfaiyeciKarakter;
