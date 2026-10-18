import type { Lesson } from '../types';

/** Sevimli Nesneler 15: Açık kitap. Renkli kapak, kavisli açık sayfalar, ayraç ve satırlar. */
const kitap: Lesson = {
  id: 'kitap',
  path: 'nesneler',
  title: 'Açık Kitap',
  emoji: '📖',
  order: 15,
  level: 1,
  skill: 'Kavisli sayfalarla açık bir kitap oluşturup ayraç ve satırlar çizmeyi öğrendin!',
  palette: ['#3498db', '#bdc3c7', '#ecf0f1', '#ffffff', '#e74c3c', '#f1c40f', '#2c3e50'],
  steps: [
    {
      say: 'Önce açık duran kitabın renkli dış kapağını iki yana açık şekilde çiz.',
      shapes: [{ d: 'M200,170 L50,145 L50,290 L200,315 L350,290 L350,145 Z', part: 'dış kapak', fill: '#3498db' }],
    },
    {
      say: 'Kapağın üzerine sayfaların kalınlığını gösteren yan blokları ekle.',
      shapes: [
        { d: 'M50,145 L50,290 L200,315 L200,302 L65,278 L65,138 Z', part: 'sol sayfa kalınlığı', fill: '#bdc3c7' },
        { d: 'M350,145 L350,290 L200,315 L200,302 L335,278 L335,138 Z', part: 'sağ sayfa kalınlığı', fill: '#bdc3c7' },
      ],
    },
    {
      say: 'Şimdi kitabın bembeyaz kıvrılan iki açık sayfasını çiz.',
      shapes: [
        { d: 'M200,165 Q130,130 65,138 L65,278 Q130,268 200,300 Z', part: 'sol sayfa', fill: '#ecf0f1' },
        { d: 'M200,165 Q270,130 335,138 L335,278 Q270,268 200,300 Z', part: 'sağ sayfa', fill: '#ffffff' },
      ],
    },
    {
      say: 'Sayfaların tam arasından aşağı sarkan süslü kırmızı ayracı çiz.',
      shapes: [
        { d: 'M194,166 L194,335 L204,324 L214,335 L214,166 Z', part: 'kitap ayracı', fill: '#e74c3c' },
      ],
    },
    {
      say: 'Sayfaların üstüne masalları anlatan düzgün satır çizgileri çek.',
      shapes: [
        { d: 'M85,170 Q130,163 180,172', part: 'sol satır 1' },
        { d: 'M85,195 Q130,188 180,197', part: 'sol satır 2' },
        { d: 'M85,220 Q130,213 180,222', part: 'sol satır 3' },
        { d: 'M85,245 Q130,238 160,247', part: 'sol satır 4' },
        { d: 'M220,172 Q270,163 315,170', part: 'sağ satır 1' },
        { d: 'M220,197 Q270,188 315,195', part: 'sağ satır 2' },
        { d: 'M220,222 Q270,213 315,220', part: 'sağ satır 3' },
        { d: 'M240,247 Q280,238 315,245', part: 'sağ satır 4' },
      ],
    },
    {
      say: 'Sayfanın köşesine sihirli bir masal yıldızı ve parıltılar çizerek kitabını tamamla!',
      shapes: [
        {
          d: 'M290,150 Q290,165 305,165 Q290,165 290,180 Q290,165 275,165 Q290,165 290,150 Z',
          part: 'sihirli yıldız',
          fill: '#f1c40f',
        },
        { d: 'M315,145 L315,155', part: 'parıltı dikey' },
        { d: 'M310,150 L320,150', part: 'parıltı yatay' },
      ],
    },
  ],
};

export default kitap;
