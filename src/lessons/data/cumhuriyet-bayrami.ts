import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const cumhuriyetBayrami: Lesson = {
  id: 'cumhuriyet-bayrami',
  path: 'ozel',
  title: '29 Ekim Kutlaması',
  emoji: '🇹🇷',
  order: 16,
  level: 2,
  skill: "Cumhuriyetimizin kurucusu Atatürk'ün asil siluetini, dalgalanan al bayraklarımızı ve bayram coşkusunu çizmeyi öğrendin!",
  palette: ['#e30a17', '#ffffff', '#1e293b', '#ffd166', '#ff4d6d', '#2ec4b6'],
  steps: [
    {
      say: 'Önce cumhuriyet güneşini simgeleyen büyük ve parlak altın çemberi çizelim.',
      shapes: [
        { d: circle(200, 172, 78), part: 'altın çember dış', fill: '#fff9db' },
        { d: circle(200, 172, 73), part: 'çember çerçevesi', fill: '#ffffff' },
      ],
    },
    {
      say: "Çemberin içine Atatürk'ün başını, asil profilini ve geriye taranmış saçlarını çizelim.",
      shapes: [
        {
          d: 'M175,115 C185,98 208,98 218,122 C222,126 228,142 228,146 C228,149 220,153 220,154 C224,158 223,161 218,163 C222,166 222,170 217,173 C223,178 223,184 218,188 C208,198 198,202 195,204 L185,204 C175,190 166,165 168,140 C169,128 171,120 175,115 Z',
          part: 'baş ve yüz silueti',
          fill: '#1e293b',
        },
        { d: 'M185,103 Q198,110 208,106', part: 'üst saç dalgası' },
        { d: 'M178,118 Q192,124 205,120', part: 'orta saç dalgası' },
        { d: 'M174,132 Q188,136 198,132', part: 'alt saç dalgası' },
      ],
    },
    {
      say: 'Silueti tamamlamak için şık ceket yakasını, beyaz gömleğini ve kravatını ekleyelim.',
      shapes: [
        {
          d: 'M160,230 L228,230 C225,212 215,202 195,204 C175,202 165,212 160,230 Z',
          part: 'ceket gövdesi',
          fill: '#1e293b',
        },
        { d: 'M188,204 L196,220 L204,204 Z', part: 'gömlek yakası', fill: '#ffffff' },
        { d: 'M194,208 L198,208 L200,230 L192,230 Z', part: 'kravat', fill: '#e30a17' },
      ],
    },
    {
      say: 'Sol tarafa göndere çekilmiş, rüzgarda gururla dalgalanan bir bayrak çizelim.',
      shapes: [
        { d: 'M65,70 L65,270', part: 'sol bayrak direği' },
        { d: circle(65, 66, 6), part: 'sol direk tepesi', fill: '#ffd166' },
        {
          d: 'M65,74 Q95,62 125,76 Q135,80 145,74 L145,134 Q135,140 125,136 Q95,122 65,134 Z',
          part: 'sol dalgalanan bayrak',
          fill: '#e30a17',
        },
      ],
    },
    {
      say: 'Sağ tarafa da aynı gururla dalgalanan ikinci al bayrağımızı ekleyelim.',
      shapes: [
        { d: 'M335,70 L335,270', part: 'sağ bayrak direği' },
        { d: circle(335, 66, 6), part: 'sağ direk tepesi', fill: '#ffd166' },
        {
          d: 'M335,74 Q305,62 275,76 Q265,80 255,74 L255,134 Q265,140 275,136 Q305,122 335,134 Z',
          part: 'sağ dalgalanan bayrak',
          fill: '#e30a17',
        },
      ],
    },
    {
      say: 'Her iki bayrağımızın üstüne bağımsızlığımızın simgesi ay ve yıldızı çizelim.',
      shapes: [
        {
          d: 'M95,94 A11,11 0 1,0 95,116 A8.8,8.8 0 1,1 95,94 Z',
          part: 'sol bayrak hilali',
          fill: '#ffffff',
        },
        {
          d: 'M111,100.5 L112.5,103.5 L116,104 L113.5,106.5 L114,110 L111,108 L108,110 L108.5,106.5 L106,104 L109.5,103.5 Z',
          part: 'sol bayrak yıldızı',
          fill: '#ffffff',
        },
        {
          d: 'M305,94 A11,11 0 1,1 305,116 A8.8,8.8 0 1,0 305,94 Z',
          part: 'sağ bayrak hilali',
          fill: '#ffffff',
        },
        {
          d: 'M289,100.5 L290.5,103.5 L294,104 L291.5,106.5 L292,110 L289,108 L286,110 L286.5,106.5 L284,104 L287.5,103.5 Z',
          part: 'sağ bayrak yıldızı',
          fill: '#ffffff',
        },
      ],
    },
    {
      say: 'Siluetin altına zafer ve barışı simgeleyen altın defne çelengini ve kırmızı fiyongunu ekleyelim.',
      shapes: [
        { d: 'M125,255 Q150,290 200,295', part: 'sol defne dalı' },
        { d: 'M138,260 Q130,250 142,248 Q148,255 138,260 Z', part: 'sol yaprak 1', fill: '#ffd166' },
        { d: 'M156,274 Q150,264 162,262 Q167,270 156,274 Z', part: 'sol yaprak 2', fill: '#ffd166' },
        { d: 'M178,285 Q174,275 186,274 Q189,282 178,285 Z', part: 'sol yaprak 3', fill: '#ffd166' },
        { d: 'M275,255 Q250,290 200,295', part: 'sağ defne dalı' },
        { d: 'M262,260 Q270,250 258,248 Q252,255 262,260 Z', part: 'sağ yaprak 1', fill: '#ffd166' },
        { d: 'M244,274 Q250,264 238,262 Q233,270 244,274 Z', part: 'sağ yaprak 2', fill: '#ffd166' },
        { d: 'M222,285 Q226,275 214,274 Q211,282 222,285 Z', part: 'sağ yaprak 3', fill: '#ffd166' },
        { d: circle(200, 297, 6), part: 'çelenk kurdele düğümü', fill: '#e30a17' },
        { d: 'M196,295 C185,285 180,305 195,302 Z', part: 'çelenk sol kurdele', fill: '#e30a17' },
        { d: 'M204,295 C215,285 220,305 205,302 Z', part: 'çelenk sağ kurdele', fill: '#e30a17' },
      ],
    },
    {
      say: 'Gökyüzüne rengarenk konfetiler ve kutlama yıldızları serpelim. 29 Ekim kutlu olsun!',
      shapes: [
        { d: 'M130,325 L270,325 L260,355 L140,355 Z', part: 'bayram şeridi', fill: '#e30a17' },
        { d: 'M136,329 L264,329 L256,351 L144,351 Z', part: 'şerit içi zemin', fill: '#ffffff' },
        { d: 'M50,170 Q70,185 55,205 Q40,225 60,240', part: 'sol konfeti kıvrımı' },
        { d: 'M350,170 Q330,185 345,205 Q360,225 340,240', part: 'sağ konfeti kıvrımı' },
        { d: 'M80,45 L88,42 L91,50 L83,53 Z', part: 'sol kırmızı konfeti', fill: '#e30a17' },
        { d: 'M310,45 L318,42 L321,50 L313,53 Z', part: 'sağ sarı konfeti', fill: '#ffd166' },
        { d: circle(105, 335, 4), part: 'sol alt altın pul', fill: '#ffd166' },
        { d: circle(295, 335, 4), part: 'sağ alt altın pul', fill: '#ffd166' },
        { d: circle(200, 48, 4), part: 'tepe kutlama ışıltısı', fill: '#ffd166' },
        { d: circle(45, 105, 3), part: 'sol minik pul', fill: '#e30a17' },
        { d: circle(355, 105, 3), part: 'sağ minik pul', fill: '#e30a17' },
      ],
    },
  ],
};

export default cumhuriyetBayrami;
