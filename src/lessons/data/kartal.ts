import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Hayvanlar 25: Gökyüzünde süzülen, geniş kanatlı, kıvrık gagalı ve pençeli kartal. */
const kartal: Lesson = {
  id: 'kartal',
  path: 'hayvanlar',
  title: 'Süzülen Kartal',
  emoji: '🦅',
  order: 25,
  level: 3,
  skill: 'Geniş açılan simetrik kanatlar, kıvrık gaga ve güçlü pençelerle havalı bir kartal çizmeyi başardın!',
  palette: ['#5c3d2e', '#8b5a3e', '#ffffff', '#ffd166', '#f4a261', '#2d2d2d', '#b0bec5'],
  steps: [
    {
      say: 'Önce kartalın güçlü gövdesini oluşturmak için dik duran bir gövde formu çiz.',
      shapes: [
        {
          d: 'M175,140 C160,175 160,225 180,248 C192,255 208,255 220,248 C240,225 240,175 225,140 Z',
          part: 'gövde',
          fill: '#5c3d2e',
        },
      ],
    },
    {
      say: 'Gövdenin üstüne boyun tüyleri tırtıklı, asil beyaz bir baş ekle.',
      shapes: [
        {
          d: 'M175,138 C170,110 174,80 200,75 C226,80 230,110 225,138 L218,146 L210,138 L200,147 L190,138 L182,146 Z',
          part: 'kafa',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Kartalın sol tarafına gökyüzünde süzülen kocaman ve sivri uçlu bir kanat çiz.',
      shapes: [
        {
          d: 'M175,148 C140,130 95,108 45,95 C36,110 35,128 48,136 C36,146 38,165 56,170 C48,180 54,196 74,198 C66,208 75,222 96,218 C90,228 104,236 122,230 C128,236 145,238 162,225 L175,205 Z',
          part: 'sol kanat',
          fill: '#5c3d2e',
        },
      ],
    },
    {
      say: 'Şimdi sağ tarafa da aynı ihtişamda gökyüzüne uzanan sağ kanadı çiz.',
      shapes: [
        {
          d: 'M225,148 C260,130 305,108 355,95 C364,110 365,128 352,136 C364,146 362,165 344,170 C352,180 346,196 326,198 C334,208 325,222 304,218 C310,228 296,236 278,230 C272,236 255,238 238,225 L225,205 Z',
          part: 'sağ kanat',
          fill: '#5c3d2e',
        },
      ],
    },
    {
      say: 'Kanatların iç kısımlarına kat kat duran daha açık renkli tüy katmanları ekle.',
      shapes: [
        {
          d: 'M175,155 C150,145 115,135 80,132 C75,142 80,154 95,156 C88,164 96,175 112,175 C108,185 120,192 135,188 L175,185 Z',
          part: 'sol iç kanat',
          fill: '#8b5a3e',
        },
        {
          d: 'M225,155 C250,145 285,135 320,132 C325,142 320,154 305,156 C312,164 304,175 288,175 C292,185 280,192 265,188 L225,185 Z',
          part: 'sağ iç kanat',
          fill: '#8b5a3e',
        },
      ],
    },
    {
      say: 'Gövdenin altından yelpaze gibi açılan bembeyaz kuyruk tüylerini çiz.',
      shapes: [
        {
          d: 'M182,242 L160,305 C174,313 187,316 200,316 C213,316 226,313 240,305 L218,242 Z',
          part: 'kuyruk tüyleri',
          fill: '#ffffff',
        },
        { d: 'M180,310 L190,250', part: 'kuyruk çizgisi' },
        { d: 'M200,316 L200,250', part: 'kuyruk çizgisi' },
        { d: 'M220,310 L210,250', part: 'kuyruk çizgisi' },
      ],
    },
    {
      say: 'Kafanın ortasına aşağı kıvrılan sivri, güçlü sarı bir gaga ve gaga çizgisi çiz.',
      shapes: [
        {
          d: 'M190,122 C190,115 210,115 210,122 C210,134 208,145 200,153 C192,145 190,134 190,122 Z',
          part: 'sarı gaga',
          fill: '#ffd166',
        },
        { d: 'M190,128 Q200,133 210,128', part: 'gaga çizgisi' },
        { d: 'M195,123 L197,125 M205,123 L203,125', part: 'burun delikleri' },
      ],
    },
    {
      say: 'Gaganın iki yanına kartala özgü kararlı kaşlar ve parlayan gözler ekle.',
      shapes: [
        { d: 'M178,110 L193,115', part: 'sol kaş' },
        { d: 'M222,110 L207,115', part: 'sağ kaş' },
        { d: circle(184, 118, 5), part: 'sol göz halkası', fill: '#ffd166' },
        { d: circle(185, 118, 2.5), part: 'sol göz bebeği', fill: '#2d2d2d' },
        { d: circle(186, 117, 1), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(216, 118, 5), part: 'sağ göz halkası', fill: '#ffd166' },
        { d: circle(215, 118, 2.5), part: 'sağ göz bebeği', fill: '#2d2d2d' },
        { d: circle(216, 117, 1), part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Son olarak gövdenin altına kıvrık keskin sarı pençeler ve göğsüne tüy desenleri ekle.',
      shapes: [
        {
          d: 'M178,245 L170,270 Q167,276 162,274 M184,245 L182,274 Q181,280 176,278 M190,245 L194,271 Q196,276 193,277',
          part: 'sol pençe',
        },
        {
          d: 'M210,245 L206,271 Q204,276 207,277 M216,245 L218,274 Q219,280 224,278 M222,245 L230,270 Q233,276 238,274',
          part: 'sağ pençe',
        },
        { d: 'M190,175 Q200,183 210,175', part: 'göğüs tüyü' },
        { d: 'M184,195 Q200,205 216,195', part: 'göğüs tüyü' },
        { d: 'M190,215 Q200,223 210,215', part: 'göğüs tüyü' },
      ],
    },
  ],
};

export default kartal;
