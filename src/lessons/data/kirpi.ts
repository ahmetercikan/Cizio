import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 23: Sivri zikzak dikenli, tatlı burunlu sevimli kirpi. */
const kirpi: Lesson = {
  id: 'kirpi',
  path: 'hayvanlar',
  title: 'Dikenli Kirpi',
  emoji: '🦔',
  order: 23,
  level: 1,
  skill: 'Zikzak çizgileri birleştirerek sivri dikenler ve sevimli bir burun yapmayı öğrendin!',
  palette: ['#8d5b38', '#e8c49e', '#fdecd2', '#ff9ebb', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce kirpimizin tombul gövdesi ve sola uzanan burnu için sevimli bir hat çiz.',
      shapes: [
        {
          d: 'M90,230 C110,185 160,150 220,150 C285,150 330,195 330,240 C330,280 280,285 240,285 L140,285 C115,285 100,260 90,230 Z',
          part: 'gövde',
          fill: '#e8c49e',
        },
      ],
    },
    {
      say: 'Şimdi kirpinin sırtına baştan kuyruğa kadar uzanan sivri zikzak dikenler çiz.',
      shapes: [
        {
          d: 'M160,160 L175,128 L190,148 L210,118 L228,142 L250,118 L265,145 L288,130 L298,160 L325,155 L322,188 L348,195 L332,222 L345,235 L328,255 L335,272 L305,278 C315,245 305,190 260,165 C220,145 180,152 160,160 Z',
          part: 'sırt dikenleri',
          fill: '#8d5b38',
        },
      ],
    },
    {
      say: 'Dikenlerin hemen önüne yuvarlak bir kulak ve yüzünü ayıran kavisli bir çizgi çiz.',
      shapes: [
        {
          d: 'M150,195 C140,185 155,168 170,178 C175,188 165,205 150,195 Z',
          part: 'kulak',
          fill: '#e8c49e',
        },
        {
          d: 'M153,192 C146,186 156,175 166,182 C168,188 162,198 153,192 Z',
          part: 'kulak içi',
          fill: '#ff9ebb',
        },
        {
          d: 'M160,160 C155,185 160,225 180,255 L180,285',
          part: 'yüz çizgisi',
        },
      ],
    },
    {
      say: 'Gövdenin altına pıtır pıtır yürüyen dört minik yuvarlak pati ekle.',
      shapes: [
        { d: 'M125,283 C120,296 145,296 145,283', part: 'sol ön pati', fill: '#e8c49e' },
        { d: 'M165,283 C160,296 185,296 185,283', part: 'sağ ön pati', fill: '#e8c49e' },
        { d: 'M245,283 C240,296 265,296 265,283', part: 'sol arka pati', fill: '#e8c49e' },
        { d: 'M285,281 C280,294 305,294 305,281', part: 'sağ arka pati', fill: '#e8c49e' },
      ],
    },
    {
      say: 'Burnun ucuna parlak siyah bir burun düğmesi, sevimli bir göz ve gülen bir ağız koy.',
      shapes: [
        { d: circle(88, 228, 8), part: 'burun ucu', fill: '#2d2d2d' },
        { d: circle(86, 226, 2.5), part: 'burun parıltısı', fill: '#ffffff' },
        { d: circle(128, 205, 8.5), part: 'göz', fill: '#2d2d2d' },
        { d: circle(130, 202, 3), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M108,240 Q118,250 128,242', part: 'ağız' },
      ],
    },
    {
      say: 'Gözün altına pembe bir yanak ve karnına açık renkli yumuşak bir göbek ekle.',
      shapes: [
        { d: ellipse(120, 222, 10, 7), part: 'yanak', fill: '#ff9ebb' },
        { d: ellipse(230, 260, 48, 18), part: 'karın yaması', fill: '#fdecd2' },
      ],
    },
    {
      say: 'Son olarak sırtın içine minik V şeklinde dikenler çiz. Kirpin çok tatlı oldu!',
      shapes: [
        { d: 'M195,175 L205,158 L215,175', part: 'diken motifi' },
        { d: 'M235,165 L245,148 L255,165', part: 'diken motifi' },
        { d: 'M275,175 L285,158 L295,175', part: 'diken motifi' },
        { d: 'M210,205 L220,188 L230,205', part: 'diken motifi' },
        { d: 'M250,205 L260,188 L270,205', part: 'diken motifi' },
        { d: 'M285,215 L295,198 L305,215', part: 'diken motifi' },
        { d: 'M235,238 L245,222 L255,238', part: 'diken motifi' },
      ],
    },
  ],
};

export default kirpi;
