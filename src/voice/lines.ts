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

export const STATIC_LINES: string[] = [
  // Karşılama / ebeveyn ekranı ses testi
  'Merhaba! Ben Kalemo. Birlikte çizim yapalım mı?',
  'Merhaba! Ben Kalemo. Seninle adım adım harika resimler çizeceğiz!',

  // Tanışma (onboarding)
  'Merhaba! Ben Kalemo. Önce seni tanıyayım. Adın ne?',
  'Ekranda parmağınla ya da kalemle çizebilirsin. İstersen kâğıda çizip fotoğrafını da çekebilirsin.',
  'Yanında bir yetişkin var mı?',
  'Başlamak için yanında bir yetişkin olması daha iyi.',
  'Avatarını seç!',
  'Adın ne?',
  'Bunlardan hangisini daha çok seviyorsun?',
  'Çiziktir ile en sevdiğin şeyleri çizebileceksin!',
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
];

/** Her ders için üretilecek kalıp cümleler. */
export const LESSON_LINES: ((l: Lesson) => string)[] = [
  (l) => `Muhteşem! ${l.title} çok güzel oldu!`,
  (l) => `Tebrikler! ${l.title} dersini bitirdin!`,
  // Ders sonunda gösterilen beceri cümlesi (sesli okunursa diye)
  (l) => l.skill,
];
