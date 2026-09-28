import type { Lesson } from '../types';

const kaplumbaga: Lesson = {
  id: 'kaplumbaga',
  path: 'hayvanlar',
  title: 'Kaplumbağa',
  emoji: '🐢',
  order: 5,
  level: 2,
  skill: 'Aynı küçük şekli tekrar tekrar çizerek kabuğa desen yaptın. Tekrar eden şekiller doku oluşturur!',
  palette: ['#5dbb63', '#3a9a47', '#c8f08f', '#b8e27a', '#2d2d2d', '#ffb3c1'],
  steps: [
    {
      say: 'Soldan başla, yukarı doğru kocaman bir kubbe çiz ve altını düz bir çizgiyle kapat.',
      shapes: [{ d: 'M60,245 A120,115 0 0,1 300,245 Z', part: 'kabuk', fill: '#5dbb63' }],
    },
    {
      say: 'Kubbenin altına, uçları yuvarlak uzun bir şerit çiz. Bu kabuğun kenarı.',
      shapes: [{ d: 'M52,243 L308,243 Q322,257 308,271 L52,271 Q38,257 52,243 Z', part: 'kabuk kenarı', fill: '#3a9a47' }],
    },
    {
      say: 'Sağ tarafa büyük, yuvarlak bir kafa çiz. Kabuktan başla, kenarda bitir.',
      shapes: [{ d: 'M285,189 C288,138 368,132 368,192 C368,232 332,245 300,243', part: 'kafa', fill: '#b8e27a' }],
    },
    {
      say: 'Altına iki kısa, tombul bacak ve solda minicik bir kuyruk ekle.',
      shapes: [
        { d: 'M88,271 L88,294 Q88,310 110,310 Q132,310 132,294 L132,271', part: 'arka bacak', fill: '#b8e27a' },
        { d: 'M218,271 L218,294 Q218,310 240,310 Q262,310 262,294 L262,271', part: 'ön bacak', fill: '#b8e27a' },
        { d: 'M42,249 Q30,256 30,272 Q38,266 48,266', part: 'kuyruk', fill: '#b8e27a' },
      ],
    },
    {
      say: 'Kabuğun ortasına büyük bir altıgen, iki yanına da daha küçük altıgenler çiz.',
      shapes: [
        { d: 'M148,198 L164,170.3 L196,170.3 L212,198 L196,225.7 L164,225.7 Z', part: 'orta desen', fill: '#c8f08f' },
        { d: 'M88,222 L99,202.9 L121,202.9 L132,222 L121,241.1 L99,241.1 Z', part: 'sol desen', fill: '#c8f08f' },
        { d: 'M228,222 L239,202.9 L261,202.9 L272,222 L261,241.1 L239,241.1 Z', part: 'sağ desen', fill: '#c8f08f' },
      ],
    },
    {
      say: 'Üst tarafa iki minik altıgen daha ekle. Aynı şekli tekrar etmek desen yapar!',
      shapes: [
        { d: 'M115,170 L123.5,155.3 L140.5,155.3 L149,170 L140.5,184.7 L123.5,184.7 Z', part: 'sol üst desen', fill: '#c8f08f' },
        { d: 'M211,170 L219.5,155.3 L236.5,155.3 L245,170 L236.5,184.7 L219.5,184.7 Z', part: 'sağ üst desen', fill: '#c8f08f' },
      ],
    },
    {
      say: 'Kafaya parıltılı bir göz, gülümseyen bir ağız ve pembe bir yanak çiz.',
      shapes: [
        { d: 'M325,180 A12,12 0 1,0 349,180 A12,12 0 1,0 325,180 Z', part: 'göz', fill: '#2d2d2d' },
        { d: 'M329,175 A5.5,5.5 0 1,0 340,175 A5.5,5.5 0 1,0 329,175 Z', part: 'göz parıltısı', fill: '#ffffff' },
        { d: 'M326,210 Q341,222 356,208', part: 'ağız' },
        { d: 'M300,203 A10,7 0 1,0 320,203 A10,7 0 1,0 300,203 Z', part: 'yanak', fill: '#ffb3c1' },
      ],
    },
  ],
};

export default kaplumbaga;
