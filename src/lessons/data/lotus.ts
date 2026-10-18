import type { Lesson } from '../types';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;

const lotus: Lesson = {
  id: 'lotus',
  path: 'doga',
  title: 'Nilüfer Çiçeği',
  emoji: '🪷',
  order: 19,
  level: 2,
  skill: 'Kat kat açılan taç yapraklar ve su yaprağıyla dingin bir nilüfer çizdin!',
  palette: ['#ff758f', '#ff8fa3', '#ffccd5', '#2a9d8f', '#ffd166', '#e0f2fe'],
  steps: [
    {
      say: 'Suyun üzerine büyük, yuvarlak ve kenarında minik bir çentik olan bir yaprak çiz.',
      shapes: [
        {
          d: 'M200,265 L225,295 A140,45 0 1,0 175,295 Z',
          part: 'nilüfer yaprağı',
          fill: '#2a9d8f',
        },
      ],
    },
    {
      say: 'Yaprağın etrafına suda usulca yayılan yumuşak dalga çizgileri ekle.',
      shapes: [
        { d: 'M35,275 C70,265 110,270 140,285', part: 'su dalgası' },
        { d: 'M260,285 C290,270 330,265 365,275', part: 'su dalgası' },
        { d: 'M120,325 Q200,345 280,325', part: 'su dalgası' },
        { d: 'M90,225 Q200,212 310,225', part: 'su dalgası' },
      ],
    },
    {
      say: 'Yaprağın tam ortasına yukarı doğru sivrilen dik bir taç yaprak çiz.',
      shapes: [
        {
          d: 'M200,110 C180,150 175,215 200,245 C225,215 220,150 200,110 Z',
          part: 'orta taç yaprak',
          fill: '#ff758f',
        },
      ],
    },
    {
      say: 'Orta yaprağın iki yanına hafifçe dışa doğru kıvrılan iki yaprak daha ekle.',
      shapes: [
        {
          d: 'M170,128 C145,165 155,220 195,245 C175,215 170,165 170,128 Z',
          part: 'sol iç yaprak',
          fill: '#ff8fa3',
        },
        {
          d: 'M230,128 C255,165 245,220 205,245 C225,215 230,165 230,128 Z',
          part: 'sağ iç yaprak',
          fill: '#ff8fa3',
        },
      ],
    },
    {
      say: 'Çiçeğimizi iyice açtıralım! İki yana doğru genişçe uzanan iki yaprak çiz.',
      shapes: [
        {
          d: 'M130,160 C105,190 125,235 180,248 C145,230 135,195 130,160 Z',
          part: 'sol dış yaprak',
          fill: '#ffb3c1',
        },
        {
          d: 'M270,160 C295,190 275,235 220,248 C255,230 265,195 270,160 Z',
          part: 'sağ dış yaprak',
          fill: '#ffb3c1',
        },
      ],
    },
    {
      say: 'Yaprakların altına, suyun üzerine doğru yatay uzanan iki alt yaprak ekle.',
      shapes: [
        {
          d: 'M100,215 C85,235 110,255 170,250 C130,248 110,235 100,215 Z',
          part: 'sol taban yaprağı',
          fill: '#ffccd5',
        },
        {
          d: 'M300,215 C315,235 290,255 230,250 C270,248 290,235 300,215 Z',
          part: 'sağ taban yaprağı',
          fill: '#ffccd5',
        },
      ],
    },
    {
      say: 'Çiçeğin ortasına sarı bir ışıltı ve yaprağın üstüne minik su damlaları koy.',
      shapes: [
        {
          d: 'M192,202 Q200,186 208,202 Q200,212 192,202 Z',
          part: 'çiçek göbeği',
          fill: '#ffd166',
        },
        { d: circle(196, 196, 2.5), part: 'tohum', fill: '#ffb703' },
        { d: circle(204, 196, 2.5), part: 'tohum', fill: '#ffb703' },
        { d: circle(145, 275, 4.5), part: 'su damlası', fill: '#e0f2fe' },
        { d: circle(143, 273, 1.5), part: 'damla ışıltısı', fill: '#ffffff' },
        { d: circle(255, 280, 3.5), part: 'su damlası', fill: '#e0f2fe' },
      ],
    },
  ],
};

export default lotus;
