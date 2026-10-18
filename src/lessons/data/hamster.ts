import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;

/** Hayvanlar 26: Şişko yanaklı, minik kulaklı ve çekirdek tutan sevimli hamster. */
const hamster: Lesson = {
  id: 'hamster',
  path: 'hayvanlar',
  title: 'Sevimli Hamster',
  emoji: '🐹',
  order: 26,
  level: 1,
  skill: 'Tombul yanaklar, çekirdek tutan minik patiler ve sevimli bıyıklar çizmeyi öğrendin!',
  palette: ['#e79c5c', '#fff3e0', '#ff8fa3', '#6f4e37', '#c87a38', '#2d2d2d', '#ffffff'],
  steps: [
    {
      say: 'Önce hamsterımızın kocaman tombul yanakları olan sevimli armut biçimli gövdesini çiz.',
      shapes: [
        {
          d: 'M160,110 C135,140 105,175 105,215 C105,255 120,315 150,325 C175,332 225,332 250,325 C280,315 295,255 295,215 C295,175 265,140 240,110 C215,98 185,98 160,110 Z',
          part: 'gövde',
          fill: '#e79c5c',
        },
      ],
    },
    {
      say: 'Kafanın üstüne iki minik yuvarlak kulak ve içlerine pembe kısımlarını ekle.',
      shapes: [
        { d: circle(145, 115, 18), part: 'sol kulak', fill: '#e79c5c' },
        { d: circle(145, 115, 11), part: 'sol kulak içi', fill: '#ff8fa3' },
        { d: circle(255, 115, 18), part: 'sağ kulak', fill: '#e79c5c' },
        { d: circle(255, 115, 11), part: 'sağ kulak içi', fill: '#ff8fa3' },
      ],
    },
    {
      say: 'Karnına ve tombul yanaklarına açık renkli, yumuşacık kürk yamaları çiz.',
      shapes: [
        { d: ellipse(200, 260, 52, 48), part: 'karın yaması', fill: '#fff3e0' },
        { d: ellipse(140, 220, 26, 22), part: 'sol yanak kürk', fill: '#fff3e0' },
        { d: ellipse(260, 220, 26, 22), part: 'sağ yanak kürk', fill: '#fff3e0' },
        { d: ellipse(200, 135, 10, 22), part: 'alın deseni', fill: '#c87a38' },
      ],
    },
    {
      say: 'Göğsüne bir ay çekirdeği, iki minik ön pati ve alta iki tombul ayak ekle.',
      shapes: [
        {
          d: 'M200,215 C192,228 190,245 200,252 C210,245 208,228 200,215 Z',
          part: 'ay çekirdeği',
          fill: '#6f4e37',
        },
        { d: 'M200,218 L200,248', part: 'çekirdek çizgisi' },
        { d: ellipse(185, 238, 10, 8), part: 'sol ön pati', fill: '#ffffff' },
        { d: ellipse(215, 238, 10, 8), part: 'sağ ön pati', fill: '#ffffff' },
        { d: ellipse(145, 325, 18, 9), part: 'sol ayak', fill: '#fff3e0' },
        { d: ellipse(255, 325, 18, 9), part: 'sağ ayak', fill: '#fff3e0' },
      ],
    },
    {
      say: 'Yüzüne iki kocaman parlak göz, minik pembe bir burun ve gülen dişli bir ağız çiz.',
      shapes: [
        { d: circle(155, 175, 11), part: 'sol göz', fill: '#2d2d2d' },
        { d: circle(158, 171, 3.8), part: 'sol parıltı', fill: '#ffffff' },
        { d: circle(245, 175, 11), part: 'sağ göz', fill: '#2d2d2d' },
        { d: circle(248, 171, 3.8), part: 'sağ parıltı', fill: '#ffffff' },
        {
          d: 'M193,188 Q200,185 207,188 Q200,198 193,188 Z',
          part: 'burun',
          fill: '#ff8fa3',
        },
        { d: 'M200,196 L200,202 M188,203 Q194,210 200,202 Q206,210 212,203', part: 'ağız' },
        { d: 'M196,204 L196,211 L204,211 L204,204 Z', part: 'dişler', fill: '#ffffff' },
      ],
    },
    {
      say: 'Son olarak pembe yanaklar, upuzun bıyıklar ve arkadan pörtleyen minik bir kuyruk ekle.',
      shapes: [
        { d: ellipse(130, 218, 12, 8), part: 'sol yanak', fill: '#ff8fa3' },
        { d: ellipse(270, 218, 12, 8), part: 'sağ yanak', fill: '#ff8fa3' },
        { d: 'M125,202 L95,198 M122,212 L90,214 M124,222 L95,228', part: 'sol bıyıklar' },
        { d: 'M275,202 L305,198 M278,212 L310,214 M276,222 L305,228', part: 'sağ bıyıklar' },
        { d: circle(292, 290, 10), part: 'kuyruk', fill: '#e79c5c' },
      ],
    },
  ],
};

export default hamster;
