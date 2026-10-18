import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

const mercan: Lesson = {
  id: 'mercan',
  path: 'deniz',
  title: 'Renkli Mercan',
  emoji: '🪸',
  order: 14,
  level: 1,
  skill: 'Yukarı doğru çatallanarak uzayan dallar ve sevimli deniz tabanı çizmeyi öğrendin!',
  palette: ['#ff5964', '#ff924c', '#ffbf69', '#35a7ff', '#38b000', '#ffffff', '#2d2d2d'],
  steps: [
    {
      say: 'Önce alta hafif dalgalı bir deniz tabanı ve iki pürüzsüz taş çiz.',
      shapes: [
        { d: 'M35,360 Q200,340 365,360 L365,378 L35,378 Z', part: 'deniz tabanı', fill: '#ffbf69' },
        { d: ellipse(85, 355, 22, 11), part: 'sol taş', fill: '#ff924c' },
        { d: ellipse(315, 355, 24, 12), part: 'sağ taş', fill: '#ff924c' },
      ],
    },
    {
      say: 'Tabandan yukarı yükselen, tepesi parmaklar gibi çatallanan ana mercan gövdesini çiz.',
      shapes: [
        {
          d: 'M178,345 C178,285 165,225 158,165 C154,135 178,125 184,150 C190,125 210,125 216,150 C222,115 246,120 242,165 C235,225 222,285 222,345 Z',
          part: 'ana mercan gövdesi',
          fill: '#ff5964',
        },
      ],
    },
    {
      say: 'Ana gövdenin sol tarafından yana doğru uzanan kıvrımlı ikinci bir dal ekle.',
      shapes: [
        {
          d: 'M172,268 C138,260 108,225 95,178 C86,148 110,138 120,162 C125,138 144,142 144,172 C148,206 166,232 170,242 Z',
          part: 'sol mercan dalı',
          fill: '#ff924c',
        },
      ],
    },
    {
      say: 'Şimdi de gövdenin sağ tarafından yükselen neşeli bir diğer mercan dalı çiz.',
      shapes: [
        {
          d: 'M228,268 C262,260 292,225 305,178 C314,148 290,138 280,162 C275,138 256,142 256,172 C252,206 234,232 230,242 Z',
          part: 'sağ mercan dalı',
          fill: '#ff924c',
        },
      ],
    },
    {
      say: 'Mercanın ana gövdesine iki büyük göz, sevimli pembe yanaklar ve gülen bir ağız koy.',
      shapes: [
        { d: circle(188, 225, 8), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(186, 223, 2.5), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(212, 225, 8), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(210, 223, 2.5), part: 'sağ parıltı', fill: '#ffffff' },
        { d: 'M194,238 Q200,245 206,238', part: 'ağız' },
        { d: circle(176, 233, 5), part: 'sol yanak', fill: '#ffbf69' },
        { d: circle(224, 233, 5), part: 'sağ yanak', fill: '#ffbf69' },
      ],
    },
    {
      say: 'Son olarak mercanın üstüne renkli benekler, alta minik bir deniz yıldızı ve baloncuklar ekle.',
      shapes: [
        { d: circle(184, 175, 5), part: 'orta sol benek', fill: '#ffbf69' },
        { d: circle(216, 175, 5), part: 'orta sağ benek', fill: '#ffbf69' },
        { d: circle(122, 195, 5), part: 'sol dal beneği', fill: '#ffbf69' },
        { d: circle(278, 195, 5), part: 'sağ dal beneği', fill: '#ffbf69' },
        {
          d: 'M65,325 L68,333 L76,333 L70,338 L72,346 L65,341 L58,346 L60,338 L54,333 L62,333 Z',
          part: 'minik deniz yıldızı',
          fill: '#35a7ff',
        },
        { d: circle(325, 100, 10), part: 'büyük baloncuk', fill: '#35a7ff' },
        { d: circle(345, 75, 6), part: 'küçük baloncuk', fill: '#35a7ff' },
      ],
    },
  ],
};

export default mercan;
