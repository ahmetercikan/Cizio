import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Deniz Canlıları 19: Melek Balığı - Zarif elmas gövde, yüksek sivri yüzgeçler ve dikey şeritler. */
const inciBaligi: Lesson = {
  id: 'inci-baligi',
  path: 'deniz',
  title: 'Melek Balığı',
  emoji: '🐟',
  order: 19,
  level: 2,
  skill: 'Elmas biçimli bir gövdeye yüksek sivri yüzgeçler ve dikey şeritler ekleyerek zarif bir balık çizmeyi öğrendin!',
  palette: ['#ffd166', '#ffb703', '#118ab2', '#06d6a0', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce balığımızın elmas biçimli zarif gövdesini ve ucundaki minik dudaklarını çizelim.',
      shapes: [
        {
          d: 'M95,200 C110,185 140,140 175,140 C215,140 240,175 255,195 L255,205 C240,225 215,260 175,260 C140,260 110,215 95,200 Z',
          part: 'balık gövdesi',
          fill: '#ffd166',
        },
        { d: 'M95,196 Q84,198 92,201 Q84,204 95,206', part: 'dudaklar' },
      ],
    },
    {
      say: 'Sırtından gökyüzüne doğru dimdik yükselen sivri ve uzun sırt yüzgecini çiz.',
      shapes: [
        {
          d: 'M165,140 C175,90 200,45 240,35 C230,85 240,145 255,192 Z',
          part: 'sırt yüzgeci',
          fill: '#ffb703',
        },
        { d: 'M180,135 C190,95 210,60 236,40', part: 'sırt yüzgeci çizgisi' },
      ],
    },
    {
      say: 'Şimdi karnından aşağıya doğru dimdik inen uzun ve sivri alt yüzgecini çiz.',
      shapes: [
        {
          d: 'M165,260 C175,310 195,355 235,365 C228,315 240,255 255,208 Z',
          part: 'alt yüzgeç',
          fill: '#ffb703',
        },
        { d: 'M180,265 C190,305 208,340 232,360', part: 'alt yüzgeç çizgisi' },
      ],
    },
    {
      say: 'Balığın arkasına hilal gibi kıvrılan zarif kuyruk yüzgecini ekle.',
      shapes: [
        {
          d: 'M255,195 Q290,175 330,150 C300,180 300,220 330,250 Q290,225 255,205 Z',
          part: 'kuyruk yüzgeci',
          fill: '#ffb703',
        },
        { d: 'M255,200 L305,200 M255,197 L318,175 M255,203 L318,225', part: 'kuyruk çizgileri' },
      ],
    },
    {
      say: 'Karnından aşağı sarkan iki ince uzun iplik yüzgeci ve gövdesine yan yüzgeci çiz.',
      shapes: [
        { d: 'M145,250 C140,285 155,330 170,370', part: '1. iplik yüzgeç' },
        { d: 'M148,250 C145,285 162,325 180,360', part: '2. iplik yüzgeç' },
        {
          d: 'M155,205 C175,208 185,220 175,230 C165,235 155,225 155,205 Z',
          part: 'yan yüzgeç',
          fill: '#ffe49e',
        },
      ],
    },
    {
      say: 'Ön tarafa sevimli yuvarlak bir göz ve solungaç kıvrımını çiz.',
      shapes: [
        { d: circle(128, 185, 12), part: 'göz akı', fill: '#ffffff' },
        { d: circle(127, 185, 7), part: 'göz bebeği', fill: '#2d2d2d' },
        { d: circle(125, 182, 2.5), part: 'göz ışıltısı', fill: '#ffffff' },
        { d: 'M148,170 C155,185 155,215 145,230', part: 'solungaç' },
      ],
    },
    {
      say: 'Gövdeye asil koyu renk dikey şeritler çek ve suda yükselen baloncukları çiz.',
      shapes: [
        {
          d: 'M190,105 C195,160 195,240 190,295 L202,295 C207,240 207,160 202,105 Z',
          part: 'ana şerit',
          fill: '#2d2d2d',
        },
        {
          d: 'M232,175 C235,190 235,210 232,225 L238,225 C241,210 241,190 238,175 Z',
          part: 'kuyruk şeridi',
          fill: '#2d2d2d',
        },
        { d: circle(75, 170, 6), part: 'küçük baloncuk', fill: '#a2d2ff' },
        { d: circle(58, 125, 9), part: 'orta baloncuk', fill: '#a2d2ff' },
        { d: circle(70, 75, 5), part: 'üst baloncuk', fill: '#a2d2ff' },
      ],
    },
  ],
};

export default inciBaligi;
