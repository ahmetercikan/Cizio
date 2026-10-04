import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
/** Tekerleğin merkezinden geçen bir tel (çap): `deg` açısında, `r` yarıçaplı. */
const spoke = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const dx = Math.round(r * Math.cos(a)), dy = Math.round(r * Math.sin(a));
  return `M${cx - dx},${cy - dy} L${cx + dx},${cy + dy}`;
};

/** Taşıtlar 9: Telli tekerlekleri, üçgen kadrosu, selesi ve gidonuyla bir bisiklet. */
const bisiklet: Lesson = {
  id: 'bisiklet',
  path: 'tasitlar',
  title: 'Bisiklet',
  emoji: '🚲',
  order: 9,
  level: 3,
  skill: 'İki tekerleği iki üçgenle birleştirip tel, sele ve pedal gibi küçük parçaları doğru yere koymayı öğrendin!',
  palette: ['#4fa3ff', '#3a3a4a', '#ffd23f', '#ff6b6b', '#c98a4b', '#2d2d2d'],
  steps: [
    {
      say: 'Sol alta kocaman bir yuvarlak çiz. İçine biraz daha küçük bir yuvarlak koy. Bu arka tekerlek.',
      shapes: [
        { d: circle(108, 270, 68), part: 'arka lastik', fill: '#4fa3ff' },
        { d: circle(108, 270, 54), part: 'arka jant', fill: '#e6f4ff' },
      ],
    },
    {
      say: 'Sağ alta aynı büyüklükte ikinci tekerleği çiz. İçine yine küçük bir yuvarlak koy.',
      shapes: [
        { d: circle(292, 270, 68), part: 'ön lastik', fill: '#4fa3ff' },
        { d: circle(292, 270, 54), part: 'ön jant', fill: '#e6f4ff' },
      ],
    },
    {
      say: 'Arka tekerleğin ortasından geçen üç düz tel çiz. Ortasına da küçük bir göbek koy.',
      shapes: [
        { d: spoke(108, 270, 54, 0), part: 'arka yatay tel' },
        { d: spoke(108, 270, 54, 60), part: 'arka sağ tel' },
        { d: spoke(108, 270, 54, 120), part: 'arka sol tel' },
        { d: circle(108, 270, 9), part: 'arka göbek', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Ön tekerleğe de aynı üç teli ve ortadaki göbeği çiz.',
      shapes: [
        { d: spoke(292, 270, 54, 0), part: 'ön yatay tel' },
        { d: spoke(292, 270, 54, 60), part: 'ön sağ tel' },
        { d: spoke(292, 270, 54, 120), part: 'ön sol tel' },
        { d: circle(292, 270, 9), part: 'ön göbek', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Arka göbekten başlayıp iki üçgen çiz. Biri arkada küçük, öteki önde büyük olsun. Bu kadro.',
      shapes: [
        { d: 'M108,270 L192,274 L164,176 Z', part: 'arka üçgen' },
        { d: 'M164,176 L262,170 L272,204 L192,274', part: 'ön üçgen' },
      ],
    },
    {
      say: 'Kadronun önünden ön göbeğe eğik bir çatal çiz. Yukarı da bir gidon uzat, ucuna tutamak koy.',
      shapes: [
        { d: 'M272,204 L292,270', part: 'çatal' },
        { d: 'M262,170 L254,132 Q250,114 230,116', part: 'gidon' },
        { d: ellipse(222, 117, 13, 7), part: 'tutamak', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Arka üçgenin tepesinden kısa bir çubuk çık. Üstüne yumuşak, uzunca bir sele çiz.',
      shapes: [
        { d: 'M164,176 L158,152', part: 'sele borusu' },
        { d: 'M126,146 Q150,134 184,140 Q190,152 168,154 L140,154 Q124,154 126,146 Z', part: 'sele', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Kadronun alt köşesine yuvarlak bir dişli çiz. Dişliden aşağı eğik bir kol, ucuna da bir pedal çiz.',
      shapes: [
        { d: circle(192, 274, 18), part: 'dişli', fill: '#ffd23f' },
        { d: 'M192,274 L204,308', part: 'pedal kolu' },
        { d: 'M192,308 L218,308 L218,316 L192,316 Z', part: 'pedal', fill: '#3a3a4a' },
      ],
    },
    {
      say: 'Gidonun önüne küçük bir sepet çiz, ortasına bir çizgi çek. İçine de bir çiçek koy. Haydi pedal çevir!',
      shapes: [
        { d: 'M274,150 L336,150 L328,196 L282,196 Z', part: 'sepet', fill: '#c98a4b' },
        { d: 'M278,172 L332,172', part: 'sepet çizgisi' },
        { d: 'M300,150 L300,136', part: 'çiçek sapı' },
        { d: circle(300, 126, 11), part: 'çiçek', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default bisiklet;
