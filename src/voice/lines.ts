/**
 * Ders adımları dışındaki sabit anlatım cümleleri.
 *
 * Buradaki her cümle için `npm run voice` doğal sesli bir MP3 üretir (public/voice/<anahtar>.mp3).
 * Yeni bir cümle eklediğinizde komutu tekrar çalıştırın; listede olmayan cümleler çalışma anında
 * tarayıcının konuşma sentezine (Web Speech) düşer.
 *
 * Not: Kişiye özel (ör. çocuğun adını içeren) cümleler önceden üretilemez; onlar her zaman Web Speech ile okunur.
 */
import type { Lesson } from '../lessons/types';
import { CHALLENGE_LINES, CHALLENGES } from '../lib/daily';
import { ALIVE_LINE, GAME_END_LINES, GAME_LINES } from '../art/lines';
import { STORY_VOICE_LINES } from '../story/data';

export const STATIC_LINES: string[] = [
  // Karşılama / ebeveyn ekranı ses testi
  'Merhaba! Ben Çizio. Birlikte çizim yapalım mı?',
  'Merhaba! Ben Çizio. Seninle adım adım harika resimler çizeceğiz!',

  // Tanışma (onboarding)
  'Merhaba! Ben Çizio. Önce seni tanıyayım. Adın ne?',
  'Ekranda parmağınla ya da kalemle çizebilirsin. İstersen kâğıda çizip fotoğrafını da çekebilirsin.',
  'Hadi bir büyüğünü çağır! Çizio’yu birlikte kuralım.',
  'Avatarını seç!',
  'Adın ne?',
  'Çizio ile en sevdiğin şeyleri çizebileceksin!',
  'Hadi başlayalım!',

  // Ders akışı
  'Hadi bugünün dersine başlayalım!',
  'Bu adımı tekrar izleyelim.',
  'Önce çizmeyi dene!',
  'Şimdi sıra sende! Kâğıdına çiz, bitince devam et.',
  'Şimdi sıra sende! Turuncu çizginin üstünden geç.',
  'Şimdi en eğlenceli kısım: boyama! Boya kovasıyla şekillerin içine dokun.',
  'Harika! Şimdi çizimini fotoğrafla ve örnekle karşılaştır.',
  'Çiziminin fotoğrafını çek!',
  'Kâğıdı çerçevenin içine yerleştir.',
  'Harika bir çizim oldu!',
  'Tebrikler! Dersi bitirdin!',
  'Yeni bir çıkartma kazandın!',
  // Kâğıt modunda otomatik eklenen gölgelendirme adımları (src/art/shading.ts ile aynı olmalı)
  'Şimdi gölgelendirme zamanı! Kalemi hafifçe tutarak büyük parçaları tara. Kenarlarda biraz daha bastır.',
  'Şimdi koyu yerleri kalemle sık sık tara. Parlak beyaz noktaları boş bırak!',
  'Şimdi parmağınla ya da bir kâğıt mendille gölgeleri hafifçe dağıt. Yumuşacık olsun!',
  // Mini meydan okumalar ve günün görevi (src/lib/daily.ts)
  ...CHALLENGES.map((c) => c.intro),
  ...Object.values(CHALLENGE_LINES),
  // Canlanan çizim, Çizdiğinle oyna, Hikaye kitabım
  ALIVE_LINE,
  ...new Set(Object.values(GAME_LINES)),
  ...GAME_END_LINES,
  ...STORY_VOICE_LINES,
];

/** Her ders için üretilecek kalıp cümleler. */
export const LESSON_LINES: ((l: Lesson) => string)[] = [
  (l) => `Muhteşem! ${l.title} çok güzel oldu!`,
  (l) => `Tebrikler! ${l.title} dersini bitirdin!`,
  // Ders sonunda gösterilen beceri cümlesi (sesli okunursa diye)
  (l) => l.skill,
];

/**
 * Karşılamadaki "hangisini daha çok seviyorsun?" turları: her tur farklı cümle, ekranda farklı başlık
 * ve farklı okuma tonu (Çizio aynı soruyu aynı sesle tekrar etmesin diye).
 */
export const PREF_ROUNDS: { text: string; title: string; tone: string }[] = [
  {
    text: 'Bunlardan hangisini daha çok seviyorsun?',
    title: 'Bunlardan hangisini daha çok seviyorsun?',
    tone: 'Ask with bright, curious enthusiasm, like starting a fun little game.',
  },
  {
    text: 'Hımm... Güzel seçim! Peki bunlardan hangisini daha çok seviyorsun?',
    title: 'Hımm… peki bunlardan hangisi?',
    tone:
      "Begin with a long, thoughtful, playful 'Hımm...' as if really pondering, then a warm smiling 'Güzel seçim!', " +
      'then ask the question softly and a little slower, full of curiosity.',
  },
  {
    text: 'Ooo, harika! Son soru geliyor... Sence hangisi daha tatlı?',
    title: 'Son soru! Sence hangisi daha tatlı?',
    tone:
      "Sound genuinely delighted on 'Ooo, harika!', build playful suspense on 'Son soru geliyor...' with a short pause, " +
      'then ask excitedly with a big grin.',
  },
];

/** Kendine özel tonla (tek tek) üretilen cümleler. */
export const TONED_LINES: { text: string; tone: string }[] = PREF_ROUNDS.map(({ text, tone }) => ({ text, tone }));
