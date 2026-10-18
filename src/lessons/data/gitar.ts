import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Sevimli Nesneler 13: Akustik gitar. Kıvrımlı gövde, sap, perdeler ve teller. */
const gitar: Lesson = {
  id: 'gitar',
  path: 'nesneler',
  title: 'Akustik Gitar',
  emoji: '🎸',
  order: 13,
  level: 2,
  skill: 'Kavisli gövde hatlarını çizip sap, perdeler ve tellerle müzik aleti çizmeyi öğrendin!',
  palette: ['#df9a57', '#5a2d0c', '#c27838', '#f5f6fa', '#dcdde1', '#333333'],
  steps: [
    {
      say: 'Önce gitarın kıvrımlı gövdesini çiz. Üstü dar, altı geniş bir sekiz gibi düşün.',
      shapes: [
        {
          d: 'M185,185 C145,185 130,220 148,255 C160,278 140,295 120,325 C100,355 145,375 200,375 C255,375 300,355 280,325 C260,295 240,278 252,255 C270,220 255,185 215,185 Z',
          part: 'gitar gövdesi',
          fill: '#df9a57',
        },
      ],
    },
    {
      say: 'Gövdenin ortasına yuvarlak bir ses deliği ve etrafına süslü bir halka çiz.',
      shapes: [
        { d: circle(200, 250, 28), part: 'ses deliği', fill: '#5a2d0c' },
        { d: 'M166,250 A34,34 0 1,0 234,250 A34,34 0 1,0 166,250 Z', part: 'rozet halkası' },
      ],
    },
    {
      say: 'Ses deliğinin altına telleri tutacak ahşap köprüyü ve beyaz eşiği yerleştir.',
      shapes: [
        {
          d: 'M165,320 L235,320 Q240,320 240,325 L240,332 Q240,337 235,337 L165,337 Q160,337 160,332 L160,325 Q160,320 165,320 Z',
          part: 'köprü',
          fill: '#5a2d0c',
        },
        { d: 'M172,326 L228,326 L228,330 L172,330 Z', part: 'eşik', fill: '#f5f6fa' },
      ],
    },
    {
      say: 'Gövdenin üstünden yukarıya doğru uzun ve düz bir sap uzat.',
      shapes: [{ d: 'M188,185 L188,75 L212,75 L212,185 Z', part: 'gitar sapı', fill: '#c27838' }],
    },
    {
      say: 'Sapın tepesine akort burgularının takılacağı gitar kafasını ekle.',
      shapes: [{ d: 'M185,75 L180,30 Q200,20 220,30 L215,75 Z', part: 'gitar kafası', fill: '#5a2d0c' }],
    },
    {
      say: 'Gitarın kafasına sağa ve sola üçer tane akort burgusu koy.',
      shapes: [
        { d: 'M181,42 L168,42', part: 'sol burgu sapı 1' },
        { d: circle(164, 42, 4), part: 'sol burgu 1', fill: '#dcdde1' },
        { d: 'M182,55 L168,55', part: 'sol burgu sapı 2' },
        { d: circle(164, 55, 4), part: 'sol burgu 2', fill: '#dcdde1' },
        { d: 'M183,68 L168,68', part: 'sol burgu sapı 3' },
        { d: circle(164, 68, 4), part: 'sol burgu 3', fill: '#dcdde1' },
        { d: 'M219,42 L232,42', part: 'sağ burgu sapı 1' },
        { d: circle(236, 42, 4), part: 'sağ burgu 1', fill: '#dcdde1' },
        { d: 'M218,55 L232,55', part: 'sağ burgu sapı 2' },
        { d: circle(236, 55, 4), part: 'sağ burgu 2', fill: '#dcdde1' },
        { d: 'M217,68 L232,68', part: 'sağ burgu sapı 3' },
        { d: circle(236, 68, 4), part: 'sağ burgu 3', fill: '#dcdde1' },
      ],
    },
    {
      say: 'Sapın üzerine parmaklarımızı basacağımız metal perde çizgilerini çek.',
      shapes: [
        { d: 'M188,98 L212,98', part: 'perde 1' },
        { d: 'M188,118 L212,118', part: 'perde 2' },
        { d: 'M188,138 L212,138', part: 'perde 3' },
        { d: 'M188,158 L212,158', part: 'perde 4' },
        { d: 'M188,175 L212,175', part: 'perde 5' },
      ],
    },
    {
      say: 'Son olarak saptan köprüye kadar inen parıl parıl altı teli çiz!',
      shapes: [
        { d: 'M191,75 L191,326', part: 'tel 1' },
        { d: 'M195,75 L195,326', part: 'tel 2' },
        { d: 'M198,75 L198,326', part: 'tel 3' },
        { d: 'M202,75 L202,326', part: 'tel 4' },
        { d: 'M205,75 L205,326', part: 'tel 5' },
        { d: 'M209,75 L209,326', part: 'tel 6' },
      ],
    },
  ],
};

export default gitar;
