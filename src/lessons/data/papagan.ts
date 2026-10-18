import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

/** Hayvanlar 20: Renkli Papağan — Kıvrık gaga, renk renk kanat tüyleri ve uzun kuyruk. */
const papagan: Lesson = {
  id: 'papagan',
  path: 'hayvanlar',
  title: 'Renkli Papağan',
  emoji: '🦜',
  order: 20,
  level: 2,
  skill: 'Kıvrık gaga, renk renk kanat tüyleri ve uzun kuyrukla tropik bir papağan çizmeyi öğrendin!',
  palette: ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#8b5a2b', '#2d2d2d'],
  steps: [
    {
      say: 'Papağanımızın başı ve gövdesi için yukarıdan aşağı uzanan zarif bir siluet çizelim.',
      shapes: [
        {
          d: 'M190,70 C225,70 245,95 240,140 C235,185 245,220 220,265 C195,290 170,265 160,220 C150,170 155,70 190,70 Z',
          part: 'kafa ve gövde',
          fill: '#e63946',
        },
      ],
    },
    {
      say: 'Yüzün soluna beyaz bir yanak maskesi ve öne doğru kıvrılan kanca şeklinde büyük bir gaga çizelim.',
      shapes: [
        { d: 'M180,90 C160,90 155,115 165,130 C180,135 190,120 185,100 Z', part: 'yüz maskesi', fill: '#ffffff' },
        { d: 'M165,95 C145,95 125,110 130,135 C135,150 145,145 155,128 L165,122 Z', part: 'üst gaga', fill: '#2d2d2d' },
        { d: 'M155,125 L145,135 L160,135 Z', part: 'alt gaga', fill: '#4a4e69' },
      ],
    },
    {
      say: 'Beyaz maskenin içine parlak bir göz ve kafanın tepesine sarı tüyler ekleyelim.',
      shapes: [
        { d: circle(175, 110, 6), part: 'göz', fill: '#2d2d2d' },
        { d: circle(177, 108, 2), part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M185,72 C180,45 195,40 195,65 C195,35 215,35 210,68 C215,48 230,52 220,74', part: 'kafa sorgucu', fill: '#ffd166' },
      ],
    },
    {
      say: 'Gövdenin üstüne renkli kanadımızın ilk katı olan sarı ve yeşil tüyleri çizelim.',
      shapes: [
        { d: 'M195,145 C230,145 250,175 240,210 C220,210 200,185 195,145 Z', part: 'kanat sarı katmanı', fill: '#ffd166' },
        { d: 'M200,185 C225,190 240,210 235,235 C215,235 205,210 200,185 Z', part: 'kanat yeşil katmanı', fill: '#06d6a0' },
      ],
    },
    {
      say: 'Kanadın ucuna aşağı sarkan parlak mavi tüyler ekleyerek kanadı tamamlayalım.',
      shapes: [
        { d: 'M210,225 C230,230 240,250 230,285 C215,280 215,250 210,225 Z', part: 'kanat mavi tüyü 1', fill: '#118ab2' },
        { d: 'M220,230 C240,240 250,265 240,300 C228,295 225,265 220,230 Z', part: 'kanat mavi tüyü 2', fill: '#118ab2' },
      ],
    },
    {
      say: 'Gövdenin altından aşağı doğru uzanan rengârenk uzun kuyruk tüyleri çizelim.',
      shapes: [
        { d: 'M195,275 C195,330 205,370 200,390 C190,370 185,330 188,275 Z', part: 'orta kuyruk tüyü', fill: '#e63946' },
        { d: 'M188,275 C180,320 175,360 180,380 C175,360 175,320 182,275 Z', part: 'sol kuyruk tüyü', fill: '#118ab2' },
        { d: 'M200,275 C205,320 215,355 218,375 C210,355 205,320 202,275 Z', part: 'sağ kuyruk tüyü', fill: '#ffd166' },
      ],
    },
    {
      say: 'Papağanımızın tünediği ahşap bir ağaç dalı ve yeşil yaprak çizelim.',
      shapes: [
        { d: 'M60,280 C140,270 260,270 340,285 L340,305 C260,290 140,290 60,300 Z', part: 'ağaç dalı', fill: '#8b5a2b' },
        { d: 'M100,282 C90,260 115,250 120,275 Z', part: 'dal yaprağı', fill: '#06d6a0' },
      ],
    },
    {
      say: 'Dalı sımsıkı kavrayan pençeler ve göğse minik tüy çizgileri konduralım.',
      shapes: [
        { d: 'M175,275 C170,285 170,295 178,295 C185,295 185,285 180,275', part: 'sol pençe', fill: '#6c757d' },
        { d: 'M195,275 C190,285 190,295 198,295 C205,295 205,285 200,275', part: 'sağ pençe', fill: '#6c757d' },
        { d: 'M170,180 Q175,190 180,180 M165,205 Q172,215 180,205', part: 'göğüs tüyleri' },
      ],
    },
  ],
};

export default papagan;
