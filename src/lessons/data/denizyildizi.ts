import type { Lesson } from '../types';

const denizyildizi: Lesson = {
  id: 'denizyildizi',
  path: 'deniz',
  title: 'Deniz Yıldızı',
  emoji: '⭐',
  order: 2,
  level: 1,
  skill: 'Beş kolu ortadan dışarı doğru eşit açtın! Yumuşak köşeler çizmeyi de öğrendin.',
  palette: ['#ffa24c', '#fff0b0', '#ff6b81', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'En üstteki koldan başla ve beş kollu bir yıldız çiz. Kolların uçları yuvarlak ve yumuşak olsun.',
      shapes: [
        {
          d: 'M200,44 A30,30 0 0,1 229.1,66.6 L242.9,120.9 Q249.4,146 275.3,144.4 L331.2,140.8 A30,30 0 0,1 349.2,196.1 L301.9,226.1 Q279.9,240 289.5,264.1 L310.2,316.2 A30,30 0 0,1 263.1,350.4 L220,314.6 Q200,298 180,314.6 L136.9,350.4 A30,30 0 0,1 89.8,316.2 L110.5,264.1 Q120.1,240 98.1,226.1 L50.8,196.1 A30,30 0 0,1 68.8,140.8 L124.7,144.4 Q150.6,146 157.1,120.9 L170.9,66.6 A30,30 0 0,1 200,44 Z',
          part: 'gövde',
          fill: '#ffa24c',
        },
      ],
    },
    {
      say: 'Yıldızın ortasına iki yuvarlak göz çiz. İçlerine minik beyaz parıltılar ekle.',
      shapes: [
        { d: 'M161,204 A15,15 0 1,0 191,204 A15,15 0 1,0 161,204 Z', part: 'sol göz', fill: '#2d2d2d' },
        { d: 'M166,198 A5,5 0 1,0 176,198 A5,5 0 1,0 166,198 Z', part: 'sol parıltı', fill: '#ffffff' },
        { d: 'M209,204 A15,15 0 1,0 239,204 A15,15 0 1,0 209,204 Z', part: 'sağ göz', fill: '#2d2d2d' },
        { d: 'M214,198 A5,5 0 1,0 224,198 A5,5 0 1,0 214,198 Z', part: 'sağ parıltı', fill: '#ffffff' },
      ],
    },
    {
      say: 'Gözlerin altına kocaman bir gülümseme, iki yanına da pembe yanaklar çiz.',
      shapes: [
        { d: 'M180,232 Q200,254 220,232', part: 'ağız' },
        { d: 'M139,232 A12,8 0 1,0 163,232 A12,8 0 1,0 139,232 Z', part: 'sol yanak', fill: '#ff6b81' },
        { d: 'M237,232 A12,8 0 1,0 261,232 A12,8 0 1,0 237,232 Z', part: 'sağ yanak', fill: '#ff6b81' },
      ],
    },
    {
      say: 'Her kolun ucuna yakın yuvarlak bir benek çiz. Beş kol, beş benek!',
      shapes: [
        { d: 'M189,86 A11,11 0 1,0 211,86 A11,11 0 1,0 189,86 Z', part: 'uç benekleri', fill: '#fff0b0' },
        { d: 'M311,174 A11,11 0 1,0 333,174 A11,11 0 1,0 311,174 Z', part: 'uç benekleri', fill: '#fff0b0' },
        { d: 'M264,318 A11,11 0 1,0 286,318 A11,11 0 1,0 264,318 Z', part: 'uç benekleri', fill: '#fff0b0' },
        { d: 'M114,318 A11,11 0 1,0 136,318 A11,11 0 1,0 114,318 Z', part: 'uç benekleri', fill: '#fff0b0' },
        { d: 'M67,174 A11,11 0 1,0 89,174 A11,11 0 1,0 67,174 Z', part: 'uç benekleri', fill: '#fff0b0' },
      ],
    },
    {
      say: 'Şimdi her kola, ortaya daha yakın minik bir benek daha ekle. Deniz yıldızın pütür pütür oldu!',
      shapes: [
        { d: 'M193,120 A7,7 0 1,0 207,120 A7,7 0 1,0 193,120 Z', part: 'minik benekler', fill: '#fff0b0' },
        { d: 'M282,185 A7,7 0 1,0 296,185 A7,7 0 1,0 282,185 Z', part: 'minik benekler', fill: '#fff0b0' },
        { d: 'M248,290 A7,7 0 1,0 262,290 A7,7 0 1,0 248,290 Z', part: 'minik benekler', fill: '#fff0b0' },
        { d: 'M138,290 A7,7 0 1,0 152,290 A7,7 0 1,0 138,290 Z', part: 'minik benekler', fill: '#fff0b0' },
        { d: 'M104,185 A7,7 0 1,0 118,185 A7,7 0 1,0 104,185 Z', part: 'minik benekler', fill: '#fff0b0' },
      ],
    },
  ],
};

export default denizyildizi;
