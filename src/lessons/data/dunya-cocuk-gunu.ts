import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Özel Günler 17: Dünya Çocuk Günü - Dünya üzerinde el ele tutuşan çocuklar, barış güvercini ve yıldızlar. */
const dunyaCocukGunu: Lesson = {
  id: 'dunya-cocuk-gunu',
  path: 'ozel',
  title: 'Dünya Çocuk Günü',
  emoji: '🌍',
  order: 17,
  level: 2,
  skill: 'Dünya küresi etrafında el ele tutuşan çocuklar ve barış güvercini çizerek birlik ve dostluğu resmetmeyi öğrendin!',
  palette: ['#4ea8de', '#52b788', '#ffd166', '#ff70a6', '#06d6a0', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce ortada parıldayan kocaman mavi Dünya küresini çizelim.',
      shapes: [
        { d: circle(200, 245, 105), part: 'dünya küresi', fill: '#4ea8de' },
      ],
    },
    {
      say: 'Dünya küresinin üzerine yeşil kıtaları ve kara parçalarını yerleştir.',
      shapes: [
        {
          d: 'M125,200 C140,185 170,195 180,215 C190,235 165,260 145,255 C125,250 115,220 125,200 Z',
          part: 'sol kıta',
          fill: '#52b788',
        },
        {
          d: 'M185,240 C210,230 225,245 220,270 C215,295 190,320 175,305 C170,290 175,255 185,240 Z',
          part: 'orta kıta',
          fill: '#52b788',
        },
        {
          d: 'M240,190 C265,185 285,205 280,235 C275,250 255,260 240,245 C230,230 230,200 240,190 Z',
          part: 'sağ kıta',
          fill: '#52b788',
        },
        {
          d: 'M150,335 C180,325 220,325 250,335 C235,348 165,348 150,335 Z',
          part: 'alt kıta',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Dünyanın üzerinde duran üç dost çocuğun yuvarlak kafalarını ve saçlarını çiz.',
      shapes: [
        { d: circle(125, 110, 14), part: 'sol çocuk başı', fill: '#f4a261' },
        {
          d: 'M111,110 C108,94 125,88 139,94 C145,102 142,112 139,115 C135,98 120,98 111,110 Z',
          part: 'sol çocuk saçı',
          fill: '#4a2810',
        },
        { d: circle(200, 88, 14), part: 'orta çocuk başı', fill: '#ffe5d9' },
        {
          d: 'M186,88 C186,72 214,72 214,88 C214,94 210,95 208,90 C200,80 192,86 186,88 Z',
          part: 'orta çocuk saçı',
          fill: '#e76f51',
        },
        { d: circle(275, 110, 14), part: 'sağ çocuk başı', fill: '#b07d62' },
        {
          d: 'M261,110 C258,94 275,88 289,94 C295,102 292,112 289,115 C285,98 270,98 261,110 Z',
          part: 'sağ çocuk saçı',
          fill: '#2d2d2d',
        },
        { d: circle(260, 95, 6), part: 'sol saç topuzu', fill: '#2d2d2d' },
        { d: circle(290, 95, 6), part: 'sağ saç topuzu', fill: '#2d2d2d' },
      ],
    },
    {
      say: 'Çocukların renkli kıyafetlerini çiz. Yeşil tişört, sarı elbise ve pembe bluz!',
      shapes: [
        { d: 'M113,124 L137,124 L142,152 L108,152 Z', part: 'sol tişört', fill: '#06d6a0' },
        { d: 'M108,152 L142,152 L140,166 L110,166 Z', part: 'sol şort', fill: '#118ab2' },
        { d: 'M190,102 L210,102 L218,134 L182,134 Z', part: 'orta elbise', fill: '#ffd166' },
        { d: 'M263,124 L287,124 L292,152 L258,152 Z', part: 'sağ bluz', fill: '#ff70a6' },
        { d: 'M258,152 L292,152 L294,166 L256,166 Z', part: 'sağ etek', fill: '#9b5de5' },
      ],
    },
    {
      say: 'Şimdi birbirine uzanan kolları, el ele kenetlenen elleri ve minik bacakları çiz.',
      shapes: [
        { d: 'M113,128 L94,118', part: 'sol çocuğun açık kolu' },
        { d: 'M137,128 L162,122', part: 'sol çocuğun sağ kolu' },
        { d: 'M190,108 L162,122', part: 'orta çocuğun sol kolu' },
        { d: circle(162, 122, 3.5), part: '1. birleşen eller', fill: '#fcd5ce' },
        { d: 'M210,108 L238,122', part: 'orta çocuğun sağ kolu' },
        { d: 'M263,128 L238,122', part: 'sağ çocuğun sol kolu' },
        { d: circle(238, 122, 3.5), part: '2. birleşen eller', fill: '#fcd5ce' },
        { d: 'M287,128 L306,118', part: 'sağ çocuğun açık kolu' },
        { d: 'M116,166 L114,178 M134,166 L136,178', part: 'sol bacaklar' },
        { d: 'M194,134 L194,146 M206,134 L206,146', part: 'orta bacaklar' },
        { d: 'M264,166 L264,178 M284,166 L286,178', part: 'sağ bacaklar' },
      ],
    },
    {
      say: 'Çocukların neşeli gülen yüzlerini, gözlerini ve pembe yanaklarını çiz.',
      shapes: [
        { d: circle(121, 109, 1.5), part: 'sol göz 1', fill: '#2d2d2d' },
        { d: circle(129, 109, 1.5), part: 'sol göz 2', fill: '#2d2d2d' },
        { d: 'M122,115 Q125,119 128,115', part: 'sol gülümseme' },
        { d: circle(118, 114, 2), part: 'sol yanak 1', fill: '#ffb4a2' },
        { d: circle(132, 114, 2), part: 'sol yanak 2', fill: '#ffb4a2' },
        { d: circle(196, 87, 1.5), part: 'orta göz 1', fill: '#2d2d2d' },
        { d: circle(204, 87, 1.5), part: 'orta göz 2', fill: '#2d2d2d' },
        { d: 'M197,93 Q200,97 203,93', part: 'orta gülümseme' },
        { d: circle(193, 92, 2), part: 'orta yanak 1', fill: '#ffb4a2' },
        { d: circle(207, 92, 2), part: 'orta yanak 2', fill: '#ffb4a2' },
        { d: circle(271, 109, 1.5), part: 'sağ göz 1', fill: '#2d2d2d' },
        { d: circle(279, 109, 1.5), part: 'sağ göz 2', fill: '#2d2d2d' },
        { d: 'M272,115 Q275,119 278,115', part: 'sağ gülümseme' },
        { d: circle(268, 114, 2), part: 'sağ yanak 1', fill: '#ffb4a2' },
        { d: circle(282, 114, 2), part: 'sağ yanak 2', fill: '#ffb4a2' },
      ],
    },
    {
      say: 'Tepede uçan beyaz barış güvercinini ve gagasındaki zeytin dalını çiz.',
      shapes: [
        {
          d: 'M185,45 C190,38 202,36 212,42 C222,46 226,52 216,56 C206,58 190,54 185,45 Z',
          part: 'güvercin gövdesi',
          fill: '#ffffff',
        },
        { d: circle(182, 42, 6), part: 'güvercin başı', fill: '#ffffff' },
        { d: 'M176,42 L168,44 L176,46 Z', part: 'güvercin gagası', fill: '#ffd166' },
        { d: circle(181, 41, 1), part: 'güvercin gözü', fill: '#2d2d2d' },
        {
          d: 'M192,42 C185,22 170,18 165,22 C175,28 185,35 190,44 Z',
          part: 'sol güvercin kanadı',
          fill: '#ffffff',
        },
        {
          d: 'M200,42 C206,24 218,20 224,24 C216,30 208,36 204,44 Z',
          part: 'sağ güvercin kanadı',
          fill: '#ffffff',
        },
        { d: 'M216,54 L232,58 L228,64 L214,58 Z', part: 'güvercin kuyruğu', fill: '#ffffff' },
        { d: 'M168,44 C158,48 152,42 146,45', part: 'zeytin sapı' },
        {
          d: 'M160,44 Q155,38 150,42 Q155,46 160,44 Z',
          part: 'zeytin yaprağı 1',
          fill: '#52b788',
        },
        {
          d: 'M152,44 Q148,50 144,46 Q148,42 152,44 Z',
          part: 'zeytin yaprağı 2',
          fill: '#52b788',
        },
      ],
    },
    {
      say: 'Son olarak gökyüzüne parıldayan sarı yıldızlar ve sevgi dolu kalpler ekle!',
      shapes: [
        {
          d: 'M55,50 L58,58 L66,60 L58,62 L55,70 L52,62 L44,60 L52,58 Z',
          part: 'sol yıldız',
          fill: '#ffd166',
        },
        {
          d: 'M345,50 L348,58 L356,60 L348,62 L345,70 L342,62 L334,60 L342,58 Z',
          part: 'sağ yıldız',
          fill: '#ffd166',
        },
        { d: circle(58, 110, 3), part: 'sol minik yıldız', fill: '#ffd166' },
        { d: circle(342, 110, 3), part: 'sağ minik yıldız', fill: '#ffd166' },
        {
          d: 'M85,150 C80,140 68,140 68,148 C68,158 85,168 85,168 C85,168 102,158 102,148 C102,140 90,140 85,150 Z',
          part: 'sol sevgi kalbi',
          fill: '#ff70a6',
        },
        {
          d: 'M315,150 C310,140 298,140 298,148 C298,158 315,168 315,168 C315,168 332,158 332,148 C332,140 320,140 315,150 Z',
          part: 'sağ sevgi kalbi',
          fill: '#ff70a6',
        },
      ],
    },
  ],
};

export default dunyaCocukGunu;
