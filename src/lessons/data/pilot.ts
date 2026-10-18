import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Karakterler 20: Havalı güneş gözlükleri, bröveli üniforması ve kasketiyle kaptan pilot. */
const pilot: Lesson = {
  id: 'pilot',
  path: 'karakterler',
  title: 'Kaptan Pilot',
  emoji: '✈️',
  order: 20,
  level: 2,
  skill: 'Kaptan şapkası, havalı pilot gözlükleri ve altın apoletleriyle göklerde süzülen bir pilot çizmeyi öğrendin!',
  palette: ['#1e293b', '#ffffff', '#ffd23f', '#38bdf8', '#ffe1cc', '#0f172a', '#ffb3c1'],
  steps: [
    {
      say: 'Önce kaptan pilotun kasketini, parlak siyah siperliğini ve altın kanatlı armasını çiz.',
      shapes: [
        {
          d: 'M138,125 C132,75 268,75 262,125 Z',
          part: 'şapka tepesi',
          fill: '#ffffff',
        },
        {
          d: 'M132,122 Q200,136 268,122 L269,136 Q200,150 131,136 Z',
          part: 'şapka bandı',
          fill: '#1e293b',
        },
        {
          d: 'M126,134 Q200,152 274,134 C264,152 235,162 200,162 C165,162 136,152 126,134 Z',
          part: 'parlak siperlik',
          fill: '#0f172a',
        },
        {
          d: 'M182,124 Q200,128 218,124 Q200,134 182,124 Z',
          part: 'kanatlı arma',
          fill: '#ffd23f',
        },
        { d: circle(200, 126, 3), part: 'arma göbeği', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Kasketin altına yüzünü ve iki sevimli kulağını çiz.',
      shapes: [
        { d: 'M142,152 Q142,224 200,224 Q258,224 258,152', part: 'yüz', fill: '#ffe1cc' },
        { d: 'M142,174 Q126,178 128,192 Q130,202 144,196', part: 'sol kulak', fill: '#ffe1cc' },
        { d: 'M258,174 Q274,178 272,192 Q270,202 256,196', part: 'sağ kulak', fill: '#ffe1cc' },
      ],
    },
    {
      say: 'Yüzüne havalı damla şeklinde pilot güneş gözlükleri ve cam parıltıları ekle.',
      shapes: [
        { d: 'M160,172 L240,172', part: 'gözlük üst çerçevesi' },
        { d: 'M196,178 Q200,174 204,178', part: 'burun köprüsü' },
        {
          d: 'M162,174 C162,168 194,168 194,174 C194,196 186,204 176,204 C166,204 162,196 162,174 Z',
          part: 'sol gözlük camı',
          fill: '#1e293b',
        },
        {
          d: 'M206,174 C206,168 238,168 238,174 C238,196 234,204 224,204 C214,204 206,196 206,174 Z',
          part: 'sağ gözlük camı',
          fill: '#1e293b',
        },
        { d: 'M168,178 L176,178 L170,198 L164,198 Z', part: 'sol cam parıltısı', fill: '#38bdf8' },
        { d: 'M212,178 L220,178 L214,198 L208,198 Z', part: 'sağ cam parıltısı', fill: '#38bdf8' },
      ],
    },
    {
      say: 'Kafanın altına pilot ceketini, beyaz gömleğini, kravatını ve omuz apoletlerini çiz.',
      shapes: [
        { d: 'M165,220 L140,312 L260,312 L235,220 Z', part: 'pilot ceketi', fill: '#1e293b' },
        { d: 'M182,220 L200,250 L218,220', part: 'beyaz gömlek', fill: '#ffffff' },
        { d: 'M196,236 L204,236 L202,260 L198,260 Z', part: 'kravat', fill: '#0f172a' },
        { d: 'M144,220 L168,220 L168,228 L144,228 Z', part: 'sol apolet', fill: '#ffd23f' },
        { d: 'M232,220 L256,220 L256,228 L232,228 Z', part: 'sağ apolet', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Göğsün sol tarafına kaptan pilotun altın kanatlı brövesini ve cebini ekle.',
      shapes: [
        {
          d: 'M156,248 Q174,242 192,248 Q174,256 156,248 Z',
          part: 'kaptan brövesi',
          fill: '#ffd23f',
        },
        { d: ellipse(174, 248, 4, 5), part: 'bröve arması', fill: '#ffffff' },
        { d: 'M160,260 L188,260 L188,276 L160,276 Z', part: 'ceb' },
      ],
    },
    {
      say: 'Pilotun bir eliyle şapkasına selam durduğu kollarını ve altın bilek şeritlerini çiz.',
      shapes: [
        {
          d: 'M235,224 L276,212 L256,176 L250,182 L268,214 L240,230',
          part: 'sağ selam kolu',
          fill: '#1e293b',
        },
        { d: circle(253, 178, 6), part: 'sağ el', fill: '#ffe1cc' },
        { d: 'M165,224 L134,260 A8,8 0 0,0 144,272 L168,245', part: 'sol kol', fill: '#1e293b' },
        { d: circle(138, 268, 5), part: 'sol el', fill: '#ffe1cc' },
        { d: 'M138,252 L148,258', part: 'kol sırması', fill: '#ffd23f' },
      ],
    },
    {
      say: 'Ceketin altına lacivert pantolonunu ve cilalı ayakkabılarını çiz.',
      shapes: [
        {
          d: 'M152,312 L148,364 L188,364 L200,336 L212,364 L252,364 L248,312 Z',
          part: 'pantolon',
          fill: '#1e293b',
        },
        { d: ellipse(168, 370, 14, 7), part: 'sol ayakkabı', fill: '#0f172a' },
        { d: ellipse(232, 370, 14, 7), part: 'sağ ayakkabı', fill: '#0f172a' },
      ],
    },
    {
      say: 'Kendinden emin bir gülümseme, pembe yanaklar ve arkada uçan minik bir uçak ekle!',
      shapes: [
        { d: 'M186,212 Q200,222 214,212', part: 'gülümseme' },
        { d: ellipse(160, 210, 8, 5), part: 'sol yanak', fill: '#ffb3c1' },
        { d: ellipse(240, 210, 8, 5), part: 'sağ yanak', fill: '#ffb3c1' },
        { d: 'M65,95 L95,85 L105,95 L65,95 Z', part: 'uçak gövdesi', fill: '#ffffff' },
        { d: 'M75,95 L60,115 L70,115 L88,95 Z', part: 'uçak kanadı', fill: '#38bdf8' },
        { d: 'M40,95 Q52,94 65,95', part: 'buhar izi' },
      ],
    },
  ],
};

export default pilot;
