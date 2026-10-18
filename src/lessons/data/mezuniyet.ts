import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const mezuniyet: Lesson = {
  id: 'mezuniyet',
  path: 'ozel',
  title: 'Mezuniyet Kepi',
  emoji: '🎓',
  order: 14,
  level: 1,
  skill: 'Perspektifli mezuniyet kepini, altın rengi püskülü ve kırmızı kurdeleli diplomayı çizmeyi öğrendin!',
  palette: ['#1d3557', '#457b9d', '#e63946', '#fdf0d5', '#ffd166', '#ffb703', '#ffffff'],
  steps: [
    {
      say: 'Önce kepimizin üstündeki geniş baklava dilimini çizelim. Dört köşeyi düz çizgilerle birleştir.',
      shapes: [
        {
          d: 'M200,50 L345,105 L200,160 L55,105 Z',
          part: 'kep üstü',
          fill: '#1d3557',
        },
      ],
    },
    {
      say: 'Kepin başa oturan alt kısmını, hafif kavisli çizgilerle aşağı doğru uzatalım.',
      shapes: [
        {
          d: 'M120,130 L200,160 L280,130 L265,185 Q200,205 135,185 Z',
          part: 'kep alt gövdesi',
          fill: '#14253d',
        },
      ],
    },
    {
      say: 'Kepin tam ortasına küçük bir düğme koyup, sol yana doğru sarkan püskül ipini çizelim.',
      shapes: [
        { d: circle(200, 105, 7), part: 'orta düğme', fill: '#ffd166' },
        { d: 'M200,105 Q145,105 105,125 Q85,145 85,180', part: 'püskül ipi' },
      ],
    },
    {
      say: 'İpin ucuna sallanan altın sarısı püskülü ve ucundaki tel saçakları ekleyelim.',
      shapes: [
        { d: circle(85, 183, 5), part: 'püskül başlığı', fill: '#ffd166' },
        { d: 'M80,186 L90,186 L96,225 L74,225 Z', part: 'püskül gövdesi', fill: '#ffb703' },
        { d: 'M77,225 L77,235 M85,225 L85,238 M93,225 L93,235', part: 'püskül saçakları' },
      ],
    },
    {
      say: 'Kepin altına rulo yapılmış mezuniyet diplomasını ve kıvrık uçlarını çizelim.',
      shapes: [
        {
          d: 'M100,270 A8,20 0 1,0 100,310 L300,310 A8,20 0 1,0 300,270 L100,270 Z',
          part: 'diploma kağıdı',
          fill: '#fdf0d5',
        },
        { d: ellipse(300, 290, 8, 20), part: 'diploma sağ kıvrım', fill: '#fff7ed' },
        { d: ellipse(100, 290, 6, 17), part: 'diploma sol rulo içi', fill: '#e2d4b7' },
      ],
    },
    {
      say: 'Diplomayı sımsıkı saran kırmızı kurdeleyi, fiyonku ve etrafa saçılan başarı yıldızlarını ekleyelim. Tebrikler mezun!',
      shapes: [
        { d: 'M190,268 L210,268 L210,312 L190,312 Z', part: 'diploma kurdele bandı', fill: '#e63946' },
        { d: circle(200, 290, 6), part: 'kurdele düğümü', fill: '#e63946' },
        { d: 'M198,287 C180,275 175,295 196,293 Z', part: 'sol kurdele kanadı', fill: '#c1121f' },
        { d: 'M202,287 C220,275 225,295 204,293 Z', part: 'sağ kurdele kanadı', fill: '#c1121f' },
        {
          d: 'M196,295 Q185,320 178,340 L188,335 L193,345 Q198,322 200,296 Z',
          part: 'sol sarkan kurdele',
          fill: '#e63946',
        },
        {
          d: 'M204,295 Q215,320 222,340 L212,335 L207,345 Q202,322 200,296 Z',
          part: 'sağ sarkan kurdele',
          fill: '#e63946',
        },
        {
          d: 'M60,265 Q60,273 52,273 Q60,273 60,281 Q60,273 68,273 Q60,273 60,265 Z',
          part: 'sol tebrik yıldızı',
          fill: '#ffd166',
        },
        {
          d: 'M340,240 Q340,248 332,248 Q340,248 340,256 Q340,248 348,248 Q340,248 340,240 Z',
          part: 'sağ tebrik yıldızı',
          fill: '#ffd166',
        },
        { d: circle(330, 75, 4), part: 'üst başarı ışıltısı', fill: '#ffd166' },
      ],
    },
  ],
};

export default mezuniyet;
