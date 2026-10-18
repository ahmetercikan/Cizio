import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const ramazanFeneri: Lesson = {
  id: 'ramazan-feneri',
  path: 'ozel',
  title: 'Ramazan Feneri',
  emoji: '🏮',
  order: 12,
  level: 2,
  skill: 'Simetrik oymalı fener gövdesini, sıcacık yanan kandil ışığını ve camındaki hilal ile yıldızı çizmeyi öğrendin!',
  palette: ['#f9c74f', '#277da1', '#f3722c', '#f8961e', '#ffffff', '#ffd166', '#ffeaa7'],
  steps: [
    {
      say: 'Önce fenerimizi asacağımız yuvarlak halkayı ve altındaki sivri oymalı kubbeyi çizelim.',
      shapes: [
        { d: circle(200, 42, 14), part: 'asma halkası dış', fill: '#f9c74f' },
        { d: circle(200, 42, 7), part: 'asma halkası iç', fill: '#ffffff' },
        { d: 'M196,56 L204,56 L200,48 Z', part: 'kubbe ucu', fill: '#f9c74f' },
        {
          d: 'M200,56 C212,75 240,95 260,115 L140,115 C160,95 188,75 200,56 Z',
          part: 'kubbe',
          fill: '#277da1',
        },
      ],
    },
    {
      say: 'Kubbenin altına fenerin pencereli geniş gövde çerçevesini çizelim.',
      shapes: [
        { d: 'M130,115 L270,115 L270,128 L130,128 Z', part: 'üst çerçeve şeridi', fill: '#f9c74f' },
        {
          d: 'M135,128 L265,128 L285,190 L265,265 L135,265 L115,190 Z',
          part: 'fener gövdesi',
          fill: '#fffdf5',
        },
      ],
    },
    {
      say: 'Fenerin altına oymalı geniş kaidesini ve ucunda sallanan zarif püskülünü ekleyelim.',
      shapes: [
        { d: 'M125,265 L275,265 L275,278 L125,278 Z', part: 'alt çerçeve şeridi', fill: '#f9c74f' },
        { d: 'M135,278 L265,278 L280,312 L120,312 Z', part: 'kaide', fill: '#277da1' },
        { d: 'M110,312 L290,312 L285,325 L115,325 Z', part: 'kaide tabanı', fill: '#f9c74f' },
        { d: 'M194,325 L206,325 L204,352 L200,366 L196,352 Z', part: 'alt püskül', fill: '#f8961e' },
      ],
    },
    {
      say: 'Fenerin gövdesine ortadaki büyük kemerli pencereyi ve yan cam bölmelerini çizelim.',
      shapes: [
        {
          d: 'M160,260 L160,165 C160,138 200,132 200,132 C200,132 240,138 240,165 L240,260 Z',
          part: 'orta kemerli pencere',
          fill: '#ffeaa7',
        },
        { d: 'M123,190 L138,132 L154,132 L154,260 L138,260 L123,190 Z', part: 'sol cam bölme', fill: '#fed7aa' },
        { d: 'M277,190 L262,132 L246,132 L246,260 L262,260 L277,190 Z', part: 'sağ cam bölme', fill: '#fed7aa' },
      ],
    },
    {
      say: 'Orta pencerenin içine parıldayan sıcacık mumumuzu ve dans eden alevini çizelim.',
      shapes: [
        { d: circle(200, 212, 22), part: 'ışık halesi', fill: '#fff3b0' },
        { d: 'M191,232 L209,232 L209,260 L191,260 Z', part: 'mum gövdesi', fill: '#ffffff' },
        { d: 'M200,232 L200,223', part: 'mum fitili' },
        {
          d: 'M200,197 C207,208 207,220 200,223 C193,220 193,208 200,197 Z',
          part: 'mum alevi',
          fill: '#f3722c',
        },
        {
          d: 'M200,205 C204,213 204,221 200,222 C196,221 196,213 200,205 Z',
          part: 'alev çekirdeği',
          fill: '#ffd166',
        },
      ],
    },
    {
      say: 'Fenerimizin camına Ramazan’ın müjdecisi parlak bir hilal ve yıldız konduralım.',
      shapes: [
        {
          d: 'M203,148 A13,13 0 1,0 203,174 A10.2,10.2 0 1,1 203,148 Z',
          part: 'cam hilali',
          fill: '#f9c74f',
        },
        {
          d: 'M215,158 L216.5,161.5 L220,162 L217.5,164.5 L218,168 L215,166 L212,168 L212.5,164.5 L210,162 L213.5,161.5 Z',
          part: 'cam yıldızı',
          fill: '#f9c74f',
        },
      ],
    },
    {
      say: 'Kubbedeki ışık deliklerini ve etrafa saçılan ışıltıları ekleyelim. Fenerimiz ışıl ışıl parıldıyor!',
      shapes: [
        { d: circle(200, 84, 4), part: 'kubbe ışık deliği', fill: '#ffd166' },
        { d: circle(180, 96, 3), part: 'sol kubbe deliği', fill: '#ffd166' },
        { d: circle(220, 96, 3), part: 'sağ kubbe deliği', fill: '#ffd166' },
        {
          d: 'M95,145 Q95,155 85,155 Q95,155 95,165 Q95,155 105,155 Q95,155 95,145 Z',
          part: 'sol ışıltı yıldızı',
          fill: '#ffd166',
        },
        {
          d: 'M305,145 Q305,155 295,155 Q305,155 305,165 Q305,155 315,155 Q305,155 305,145 Z',
          part: 'sağ ışıltı yıldızı',
          fill: '#ffd166',
        },
        { d: circle(115, 75, 3), part: 'sol minik ışıltı', fill: '#ffd166' },
        { d: circle(285, 75, 3), part: 'sağ minik ışıltı', fill: '#ffd166' },
      ],
    },
  ],
};

export default ramazanFeneri;
