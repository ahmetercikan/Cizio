import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Temeller 13: Örüntü Treni - daire ve üçgen desenlerini sırayla dizerek ritmik örüntü kuralı. */
const oruntu: Lesson = {
  id: 'oruntu',
  path: 'temeller',
  title: 'Örüntü Treni',
  emoji: '🚂',
  order: 13,
  level: 1,
  skill: 'Vagonlara sırayla bir daire bir üçgen ekleyerek eğlenceli bir şekil örüntüsü oluşturmayı öğrendin!',
  palette: ['#4d96ff', '#6bcb77', '#9b5de5', '#ffd166', '#ff6b6b', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce trenimizin güçlü lokomotifini çizelim. Ön gövdeyi, yüksek kabini ve bacayı ekle.',
      shapes: [
        {
          d: 'M30,200 L75,200 L75,160 L125,160 L125,260 L30,260 Q20,230 30,200 Z',
          part: 'lokomotif gövdesi',
          fill: '#4d96ff',
        },
        { d: 'M70,160 L130,160 L126,150 L74,150 Z', part: 'kabin çatısı', fill: '#ff6b6b' },
        { d: 'M44,200 L44,175 L38,170 L62,170 L56,175 L56,200 Z', part: 'baca', fill: '#ffd166' },
        { d: 'M85,175 L115,175 L115,205 L85,205 Z', part: 'kabin penceresi', fill: '#ffffff' },
      ],
    },
    {
      say: 'Lokomotifin arkasına dört vagon kutusu ve onları birbirine bağlayan demirleri çiz.',
      shapes: [
        { d: 'M115,245 L130,245', part: '1. bağlantı demiri' },
        {
          d: 'M130,202 Q130,195 137,195 L178,195 Q185,195 185,202 L185,260 L130,260 Z',
          part: '1. vagon',
          fill: '#6bcb77',
        },
        { d: 'M185,245 L200,245', part: '2. bağlantı demiri' },
        {
          d: 'M200,202 Q200,195 207,195 L248,195 Q255,195 255,202 L255,260 L200,260 Z',
          part: '2. vagon',
          fill: '#9b5de5',
        },
        { d: 'M255,245 L270,245', part: '3. bağlantı demiri' },
        {
          d: 'M270,202 Q270,195 277,195 L318,195 Q325,195 325,202 L325,260 L270,260 Z',
          part: '3. vagon',
          fill: '#6bcb77',
        },
        { d: 'M325,245 L340,245', part: '4. bağlantı demiri' },
        {
          d: 'M340,202 Q340,195 347,195 L388,195 Q395,195 395,202 L395,260 L340,260 Z',
          part: '4. vagon',
          fill: '#9b5de5',
        },
      ],
    },
    {
      say: 'Tüm vagonların ve lokomotifin altına dönen tekerlekleri ve tren rayını çiz.',
      shapes: [
        { d: 'M20,290 L395,290 M20,298 L395,298', part: 'tren rayı' },
        { d: circle(52, 272, 14), part: 'lokomotif ön tekerlek', fill: '#2d2d2d' },
        { d: circle(100, 270, 17), part: 'lokomotif büyük tekerlek', fill: '#2d2d2d' },
        { d: circle(144, 274, 11), part: '1. vagon sol tekerlek', fill: '#2d2d2d' },
        { d: circle(171, 274, 11), part: '1. vagon sağ tekerlek', fill: '#2d2d2d' },
        { d: circle(214, 274, 11), part: '2. vagon sol tekerlek', fill: '#2d2d2d' },
        { d: circle(241, 274, 11), part: '2. vagon sağ tekerlek', fill: '#2d2d2d' },
        { d: circle(284, 274, 11), part: '3. vagon sol tekerlek', fill: '#2d2d2d' },
        { d: circle(311, 274, 11), part: '3. vagon sağ tekerlek', fill: '#2d2d2d' },
        { d: circle(354, 274, 11), part: '4. vagon sol tekerlek', fill: '#2d2d2d' },
        { d: circle(381, 274, 11), part: '4. vagon sağ tekerlek', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Şimdi örüntüyü başlatalım! Birinci vagona bir daire, ikinci vagona sivri bir üçgen çiz.',
      shapes: [
        { d: circle(157.5, 227, 14), part: '1. vagon dairesi', fill: '#ffd166' },
        { d: 'M227.5,212 L214,242 L241,242 Z', part: '2. vagon üçgeni', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Örüntü kuralını devam ettir: Daireden sonra ne gelir? Üçüncüye daire, dördüncüye üçgen çiz!',
      shapes: [
        { d: circle(297.5, 227, 14), part: '3. vagon dairesi', fill: '#ffd166' },
        { d: 'M367.5,212 L354,242 L381,242 Z', part: '4. vagon üçgeni', fill: '#ff6b6b' },
      ],
    },
    {
      say: 'Son olarak bacadan gökyüzüne puf puf dumanlar savur ve lokomotifin neşeli farını yak!',
      shapes: [
        { d: 'M22,225 L12,220 L12,240 L22,235 Z', part: 'ön far', fill: '#ffd166' },
        { d: circle(50, 142, 11), part: 'küçük duman', fill: '#ffffff' },
        { d: circle(38, 114, 15), part: 'orta duman', fill: '#ffffff' },
        { d: circle(22, 82, 19), part: 'büyük duman', fill: '#ffffff' },
      ],
    },
  ],
};

export default oruntu;
