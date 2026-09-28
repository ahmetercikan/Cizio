import type { Lesson } from '../types';

const yunus: Lesson = {
  id: 'yunus',
  path: 'deniz',
  title: 'Neşeli Yunus',
  emoji: '🐬',
  order: 3,
  level: 2,
  skill: 'Kavisli bir gövde çizmeyi öğrendin! Gövdeyi gökkuşağı gibi eğince yunusun zıpladığı belli oldu.',
  palette: ['#5ab8f0', '#7fd3f5', '#2d2d2d', '#ffffff', '#ff8fb1'],
  steps: [
    {
      say: 'Burnun ucundan başla. Gökkuşağı gibi kavisli, sonu incelen uzun bir gövde çiz.',
      shapes: [
        {
          d: 'M54,210 C60,200 72,196 90,192 C88,140 135,96 200,94 C262,92 296,158 326,192 L312,206 C282,170 248,158 206,158 C166,158 140,202 116,220 C100,232 74,232 58,224 C48,222 46,213 54,210 Z',
          part: 'gövde',
          fill: '#5ab8f0',
        },
      ],
    },
    {
      say: 'Sırtın en yüksek yerine geriye yatık bir yüzgeç, karnının altına da küçük bir yüzgeç çiz.',
      shapes: [
        { d: 'M221.2,96 C226,76 242,58 266,50 C258,70 256,96 265.1,120.1', part: 'sırt yüzgeci', fill: '#5ab8f0' },
        { d: 'M224.4,158.9 C228.4,182.9 222,196 244,204 C244,188 262.2,178.4 258.2,166.4', part: 'karın yüzgeci', fill: '#5ab8f0' },
      ],
    },
    {
      say: 'Gövdenin ince ucuna iki yana açılan bir kuyruk çiz. Balina kuyruğu gibi!',
      shapes: [
        {
          d: 'M326,192 C338,190 352,186 368,180 C362,196 348,206 332,212 C328,224 318,236 302,250 C302,234 306,220 312,206',
          part: 'kuyruk',
          fill: '#5ab8f0',
        },
      ],
    },
    {
      say: 'Başına yuvarlak bir göz ve beyaz parıltısını çiz. Burnunun altına da gülen bir ağız ekle.',
      shapes: [
        { d: 'M113,162 A13,13 0 1,0 139,162 A13,13 0 1,0 113,162 Z', part: 'göz', fill: '#2d2d2d' },
        { d: 'M117.5,157 A4.5,4.5 0 1,0 126.5,157 A4.5,4.5 0 1,0 117.5,157 Z', part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M68,214 Q90,222 110,206', part: 'ağız' },
        { d: 'M131,180 A9,6 0 1,0 149,180 A9,6 0 1,0 131,180 Z', part: 'yanak', fill: '#ff8fb1' },
      ],
    },
    {
      say: 'Yunusun altına ucu kıvrılan küçük bir dalga çiz. Yunus onun üstünden atlıyor!',
      shapes: [
        {
          d: 'M70,350 C110,344 136,292 190,278 C236,266 272,284 268,310 C265,328 240,328 240,312 C244,334 284,348 330,350 Z',
          part: 'dalga',
          fill: '#7fd3f5',
        },
      ],
    },
    {
      say: 'Son olarak dalganın üstüne sıçrayan üç su damlası çiz. Yukarısı sivri, altı yuvarlak olsun.',
      shapes: [
        { d: 'M112,269 Q122,284 112,289 Q102,284 112,269 Z', part: 'sol damla', fill: '#7fd3f5' },
        { d: 'M300,259 Q310,274 300,279 Q290,274 300,259 Z', part: 'sağ damla', fill: '#7fd3f5' },
        { d: 'M330,289.6 Q338,301.6 330,305.6 Q322,301.6 330,289.6 Z', part: 'minik damla', fill: '#7fd3f5' },
      ],
    },
  ],
};

export default yunus;
