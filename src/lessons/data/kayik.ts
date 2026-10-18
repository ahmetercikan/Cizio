import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const kayik: Lesson = {
  id: 'kayik',
  path: 'tasitlar',
  title: 'Tahta Kayık',
  emoji: '🚣',
  order: 14,
  level: 1,
  skill: 'Kıvrımlı çizgilerle dengeli bir kayık çizip tahta desenleri ve kürek eklemeyi öğrendin!',
  palette: ['#c28245', '#965b25', '#e8c39e', '#4fa3ff', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce kayığın kıvrımlı tahta gövdesini çiz. Uçları havaya baksın.',
      shapes: [
        {
          d: 'M70,210 Q95,275 200,275 Q305,275 330,210 Q280,230 200,230 Q120,230 70,210 Z',
          part: 'gövde',
          fill: '#c28245',
        },
      ],
    },
    {
      say: 'Kayığın içine oturmak için tahta bir bank ekle.',
      shapes: [
        {
          d: 'M80,212 Q130,224 200,224 Q270,224 320,212 Q270,218 200,218 Q130,218 80,212 Z',
          part: 'iç kenar',
          fill: '#965b25',
        },
        { d: 'M175,223 L225,223 L225,235 L175,235 Z', part: 'oturak', fill: '#e8c39e' },
      ],
    },
    {
      say: 'Gövdenin üstüne kayığı oluşturan tahta çizgilerini çek.',
      shapes: [
        { d: 'M85,230 Q195,250 315,230', part: 'üst tahta çizgisi' },
        { d: 'M105,250 Q200,265 295,250', part: 'alt tahta çizgisi' },
      ],
    },
    {
      say: 'Kayığın kenarına kürek sapını çapraz bir çizgiyle yerleştir.',
      shapes: [
        { d: circle(190, 222, 5), part: 'kürek yuvası', fill: '#2d2d2d' },
        { d: 'M160,160 L240,310', part: 'kürek sapı' },
        { d: 'M154,152 L166,168', part: 'kürek tutacağı' },
      ],
    },
    {
      say: 'Kürek sapının ucuna geniş bir kürek palası çiz.',
      shapes: [
        {
          d: 'M232,295 L252,330 Q258,340 248,342 Q238,344 235,335 L222,300 Z',
          part: 'kürek palası',
          fill: '#c28245',
        },
      ],
    },
    {
      say: 'Kayığın etrafına ve küreğin ucuna su dalgaları ekle.',
      shapes: [
        {
          d: 'M45,265 Q90,250 135,265 Q180,280 225,265 Q270,250 315,265 Q340,275 365,265',
          part: 'ön dalgalar',
        },
        {
          d: 'M70,290 Q120,278 170,290 Q220,302 270,290 Q310,280 345,290',
          part: 'alt dalgalar',
        },
        { d: 'M220,345 Q245,355 265,345', part: 'kürek halkası' },
      ],
    },
  ],
};

export default kayik;
