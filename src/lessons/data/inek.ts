import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 17: Benekli İnek — Dikdörtgen gövde, boynuzlar, benekler ve sevimli yüz. */
const inek: Lesson = {
  id: 'inek',
  path: 'hayvanlar',
  title: 'Benekli İnek',
  emoji: '🐄',
  order: 17,
  level: 2,
  skill: 'Karemsi gövde, boynuzlar ve sevimli beneklerle çiftlik ineği çizmeyi öğrendin!',
  palette: ['#ffffff', '#2d2d2d', '#ffccd5', '#ffe6a7', '#ffb3c1', '#e5e5e5'],
  steps: [
    {
      say: 'İneğimiz için köşeleri yumuşak, büyük ve yatay bir dikdörtgen gövde çizelim.',
      shapes: [
        {
          d: 'M110,180 L270,180 C290,180 300,195 300,215 L300,290 C300,305 285,315 270,315 L110,315 C95,315 85,305 85,290 L85,215 C85,195 95,180 110,180 Z',
          part: 'gövde',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Gövdenin sağ önüne karemsi bir kafa ve altına tombul pembe bir burun çizelim.',
      shapes: [
        { d: 'M270,120 C270,105 325,105 325,120 L330,175 L265,175 Z', part: 'kafa', fill: '#ffffff' },
        { d: ellipse(297, 190, 36, 24), part: 'burun', fill: '#ffccd5' },
      ],
    },
    {
      say: 'Kafanın üstüne iki sivri boynuz ve iki yanına sarkan sevimli kulaklar ekleyelim.',
      shapes: [
        { d: 'M275,115 C268,90 278,80 282,85 C285,92 283,105 283,115 Z', part: 'sol boynuz', fill: '#ffe6a7' },
        { d: 'M315,115 C322,90 312,80 308,85 C305,92 307,105 307,115 Z', part: 'sağ boynuz', fill: '#ffe6a7' },
        { d: 'M265,130 C240,135 235,155 255,155 C265,155 268,145 268,135 Z', part: 'sol kulak', fill: '#ffffff' },
        { d: 'M325,130 C350,135 355,155 335,155 C325,155 322,145 322,135 Z', part: 'sağ kulak', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gövdenin altına dört güçlü bacak ve uçlarına koyu renkli toynaklar çizelim.',
      shapes: [
        { d: 'M240,315 L240,370 L260,370 L260,315 Z', part: 'ön sol bacak', fill: '#ffffff' },
        { d: 'M240,358 L260,358 L260,370 L240,370 Z', part: 'ön sol toynak', fill: '#2d2d2d' },
        { d: 'M270,305 L270,365 L288,365 L288,305 Z', part: 'ön sağ bacak', fill: '#e5e5e5' },
        { d: 'M270,353 L288,353 L288,365 L270,365 Z', part: 'ön sağ toynak', fill: '#2d2d2d' },
        { d: 'M105,315 L105,370 L125,370 L125,315 Z', part: 'arka sol bacak', fill: '#ffffff' },
        { d: 'M105,358 L125,358 L125,370 L105,370 Z', part: 'arka sol toynak', fill: '#2d2d2d' },
        { d: 'M135,305 L135,365 L153,365 L153,305 Z', part: 'arka sağ bacak', fill: '#e5e5e5' },
        { d: 'M135,353 L153,353 L153,365 L135,365 Z', part: 'arka sağ toynak', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Gövdenin üstüne büyük, dalgalı inek benekleri çizip içlerini siyaha boyayalım.',
      shapes: [
        { d: 'M120,180 C130,200 155,200 160,225 C150,245 125,240 110,230 C95,220 95,195 110,180 Z', part: 'sırt beneği', fill: '#2d2d2d' },
        { d: 'M200,210 C220,195 245,210 250,230 C245,255 225,260 210,250 C195,240 190,220 200,210 Z', part: 'orta benek', fill: '#2d2d2d' },
        { d: 'M140,280 C160,270 175,285 170,305 C160,315 145,315 135,300 C130,290 135,282 140,280 Z', part: 'alt benek', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Gövdenin arkasına püsküllü uzun bir kuyruk ve gövdenin altına pembe bir meme çizelim.',
      shapes: [
        { d: 'M88,205 C70,220 65,260 70,295 L76,295 C72,260 76,225 90,212 Z', part: 'kuyruk', fill: '#ffffff' },
        { d: 'M68,290 C58,310 65,330 75,325 C82,320 80,305 76,290 Z', part: 'kuyruk püskülü', fill: '#2d2d2d' },
        { d: 'M170,315 C170,332 205,332 205,315', part: 'meme', fill: '#ffccd5' },
      ],
    },
    {
      say: 'Pembe burnun üstüne iki yuvarlak burun deliği ve neşeli bir ağız ekleyelim.',
      shapes: [
        { d: ellipse(287, 185, 4, 6), part: 'sol burun deliği', fill: '#5c3d2e' },
        { d: ellipse(307, 185, 4, 6), part: 'sağ burun deliği', fill: '#5c3d2e' },
        { d: 'M287,198 Q297,208 307,198', part: 'ağız' },
      ],
    },
    {
      say: 'İneğimizin yüzüne iki parlak göz, pembe yanaklar ve kafasına küçük bir leke konduralım.',
      shapes: [
        { d: 'M270,135 C275,120 295,120 295,140 C295,155 275,155 270,140 Z', part: 'göz lekesi', fill: '#2d2d2d' },
        { d: circle(282, 138, 5), part: 'sol göz', fill: '#ffffff' },
        { d: circle(283, 138, 2.5), part: 'sol göz bebeği', fill: '#2d2d2d' },
        { d: circle(310, 138, 5), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(311, 136, 1.8), part: 'sağ göz parıltısı', fill: '#ffffff' },
        { d: circle(268, 162, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: circle(324, 162, 5), part: 'sağ yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default inek;
