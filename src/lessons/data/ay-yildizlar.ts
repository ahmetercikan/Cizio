import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ayYildizlar: Lesson = {
  id: 'ay-yildizlar',
  path: 'uzay',
  title: 'Gece Gökyüzü',
  emoji: '🌙',
  order: 2,
  level: 1,
  skill: 'Hilal ve yıldızlarla büyüleyici, masalsı bir gece manzarası kurdun!',
  palette: ['#ffd166', '#ffe66d', '#1d2a44', '#141d30', '#2b3a67', '#ffffff'],
  steps: [
    {
      say: 'Gecenin zeminini oluşturan yumuşak bir tepe silüeti çiz.',
      shapes: [
        {
          d: 'M0,335 Q140,295 280,325 Q350,340 400,330 L400,400 L0,400 Z',
          part: 'gece tepesi',
          fill: '#1d2a44',
        },
      ],
    },
    {
      say: 'Tepenin üzerine küçük bir kulübe ve yanında bir çam ağacı kondur.',
      shapes: [
        { d: 'M80,312 L95,296 L110,312 L110,336 L80,336 Z', part: 'kulübe', fill: '#141d30' },
        { d: 'M100,292 L105,292 L105,302 L100,302 Z', part: 'baca', fill: '#141d30' },
        { d: 'M88,318 L102,318 L102,330 L88,330 Z', part: 'kulübe ışığı', fill: '#ffd166' },
        { d: 'M135,282 L146,302 L124,302 Z', part: 'ağaç', fill: '#0f172a' },
        { d: 'M135,296 L149,318 L121,318 Z', part: 'ağaç', fill: '#0f172a' },
        { d: 'M135,312 L152,336 L118,336 Z', part: 'ağaç', fill: '#0f172a' },
      ],
    },
    {
      say: 'Gökyüzüne kocaman, parlak sarı bir hilal ay çiz.',
      shapes: [
        {
          d: 'M140,65 C220,65 260,145 220,215 C185,250 145,240 130,225 C180,210 205,145 140,65 Z',
          part: 'hilal',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Hilalin üzerine tatlı bir uyuyan göz ve huzurlu bir gülümseme ekle.',
      shapes: [
        { d: 'M180,132 Q190,142 200,132', part: 'uyuyan göz' },
        { d: 'M184,136 L181,141', part: 'kirpik' },
        { d: 'M196,136 L199,141', part: 'kirpik' },
        { d: circle(182, 150, 7), part: 'yanak', fill: '#f4978e' },
        { d: 'M190,160 Q198,170 206,162', part: 'gülümseme' },
      ],
    },
    {
      say: 'Ayın yanına parıldayan büyük, beş köşeli bir yıldız çiz.',
      shapes: [
        {
          d: 'M290,70 L297,87 L314,87 L300,98 L306,115 L290,105 L274,115 L280,98 L266,87 L283,87 Z',
          part: 'büyük yıldız',
          fill: '#ffe66d',
        },
      ],
    },
    {
      say: 'Gökyüzüne iki sevimli yıldız daha ekleyerek geceyi aydınlat.',
      shapes: [
        {
          d: 'M240,140 L244,150 L255,150 L246,157 L250,168 L240,162 L230,168 L234,157 L225,150 L236,150 Z',
          part: 'ikinci yıldız',
          fill: '#ffe66d',
        },
        {
          d: 'M335,162 L339,171 L348,171 L341,177 L344,186 L335,181 L326,186 L329,177 L322,171 L331,171 Z',
          part: 'üçüncü yıldız',
          fill: '#ffe66d',
        },
      ],
    },
    {
      say: 'Ayın etrafına küçük ışıltı noktaları ve ince bir gece bulutu ekle.',
      shapes: [
        {
          d: 'M225,230 C225,215 245,210 260,218 C270,208 290,210 295,222 C310,222 320,232 315,242 C310,250 235,250 225,230 Z',
          part: 'gece bulutu',
          fill: '#2b3a67',
        },
        { d: 'M65,110 L67,118 L75,120 L67,122 L65,130 L63,122 L55,120 L63,118 Z', part: 'ışıltı', fill: '#ffffff' },
        { d: 'M315,37 L317,43 L323,45 L317,47 L315,53 L313,47 L307,45 L313,43 Z', part: 'ışıltı', fill: '#ffffff' },
      ],
    },
  ],
};

export default ayYildizlar;
