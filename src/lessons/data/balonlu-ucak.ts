import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Taşıtlar 21: Balonlu Uçak - Rengarenk balonların havaya kaldırdığı sevimli küçük uçak. */
const balonluUcak: Lesson = {
  id: 'balonlu-ucak',
  path: 'tasitlar',
  title: 'Balonlu Uçak',
  emoji: '🎈',
  order: 21,
  level: 1,
  skill: 'Uçağın gövdesine renkli balonlar bağlayarak hayal gücüyle uçan bir taşıt çizmeyi öğrendin!',
  palette: ['#ff6b8b', '#ffd166', '#06d6a0', '#48cae4', '#ff9f1c', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce uçağın tombul gövdesini ve arkasındaki dik kuyruk yüzgecini çizelim.',
      shapes: [
        {
          d: 'M120,245 C150,225 240,225 285,250 C295,255 295,265 285,270 C240,295 150,295 120,265 Z',
          part: 'uçak gövdesi',
          fill: '#ff6b8b',
        },
        { d: 'M120,245 L95,195 L125,195 L145,235 Z', part: 'dikey kuyruk', fill: '#ff9f1c' },
        { d: 'M105,255 L82,250 L82,262 L112,262 Z', part: 'yatay kuyruk', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Uçağın burnuna dönen pervanesini ve gövdenin altındaki kanadı çiz.',
      shapes: [
        { d: 'M285,252 C295,252 295,268 285,268 Z', part: 'burun konisi', fill: '#ffd166' },
        {
          d: 'M288,260 C294,235 304,235 294,258 C304,285 294,285 288,260 Z',
          part: 'pervane',
          fill: '#48cae4',
        },
        { d: 'M170,260 L240,255 L225,290 L155,292 Z', part: 'ana kanat', fill: '#ff9f1c' },
      ],
    },
    {
      say: 'Gövdeye kubbe şeklinde kabin camı, iniş tekerlekleri ve sevimli bir gülen yüz ekle.',
      shapes: [
        { d: 'M190,230 C205,202 245,202 258,232 Z', part: 'kabin camı', fill: '#ffffff' },
        { d: 'M188,292 L185,322 M215,292 L212,322', part: 'tekerlek bacakları' },
        { d: circle(184, 324, 9), part: 'sol tekerlek', fill: '#2d2d2d' },
        { d: circle(211, 324, 9), part: 'sağ tekerlek', fill: '#2d2d2d' },
        { d: circle(268, 256, 3), part: 'uçak gözü', fill: '#2d2d2d' },
        { d: 'M265,265 Q273,273 280,266', part: 'uçak gülümsemesi' },
        { d: ellipse(258, 267, 5, 3), part: 'yanak allığı', fill: '#ffccd5' },
      ],
    },
    {
      say: 'Uçağın üstünden gökyüzüne doğru uzanan üç balon ipi ve bir kurdele çiz.',
      shapes: [
        { d: 'M205,225 C185,190 145,170 135,143', part: 'sol ip' },
        { d: 'M205,225 L205,123', part: 'orta ip' },
        { d: 'M205,225 C225,190 265,170 275,143', part: 'sağ ip' },
        {
          d: 'M205,225 C195,215 195,235 205,225 C215,235 215,215 205,225 Z',
          part: 'bağlama fiyonku',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'İplerin ucuna gökyüzünde süzülen üç büyük renkli balon çiz. Kırmızı, sarı ve yeşil!',
      shapes: [
        { d: 'M135,138 L131,143 L139,143 Z', part: 'sol balon düğümü', fill: '#ff6b8b' },
        {
          d: 'M135,138 C108,133 95,110 95,85 C95,60 113,46 135,46 C157,46 175,60 175,85 C175,110 162,133 135,138 Z',
          part: 'sol balon',
          fill: '#ff6b8b',
        },
        { d: 'M205,118 L201,123 L209,123 Z', part: 'orta balon düğümü', fill: '#ffd166' },
        {
          d: 'M205,118 C178,113 165,90 165,65 C165,40 183,26 205,26 C227,26 245,40 245,65 C245,90 232,113 205,118 Z',
          part: 'orta balon',
          fill: '#ffd166',
        },
        { d: 'M275,138 L271,143 L279,143 Z', part: 'sağ balon düğümü', fill: '#06d6a0' },
        {
          d: 'M275,138 C248,133 235,110 235,85 C235,60 253,46 275,46 C297,46 315,60 315,85 C315,110 302,133 275,138 Z',
          part: 'sağ balon',
          fill: '#06d6a0',
        },
      ],
    },
    {
      say: 'Balonların parıltılarını ve gökyüzünde süzülen sevimli puf bulutları çiz.',
      shapes: [
        { d: 'M115,65 Q112,85 125,95', part: 'sol balon ışıltısı' },
        { d: 'M185,45 Q182,65 195,75', part: 'orta balon ışıltısı' },
        { d: 'M255,65 Q252,85 265,95', part: 'sağ balon ışıltısı' },
        {
          d: 'M35,335 C20,335 15,315 28,308 C25,295 40,288 52,295 C62,285 82,290 85,305 C98,310 95,335 78,335 Z',
          part: 'sol bulut',
          fill: '#ffffff',
        },
        {
          d: 'M315,185 C305,185 300,172 310,166 C308,155 318,150 327,155 C335,147 350,150 352,162 C362,166 360,185 348,185 Z',
          part: 'sağ bulut',
          fill: '#ffffff',
        },
      ],
    },
  ],
};

export default balonluUcak;
