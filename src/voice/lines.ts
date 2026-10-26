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
import { ALIVE_LINE, GAME_END_LINES, GAME_LINES, GAME_LIVES_LINE } from '../art/lines';
import { STORY_VOICE_LINES } from '../story/data';
import { ISLAND_VOICE_LINES } from '../world/quests';
import { RACE_VOICE_LINES } from '../world/raceLines';
import { TRACE_VOICE_LINES } from '../trace/lines';
import { MUZIK_MATEMATIK_ACIK } from '../lib/flags';
import { PREF_ROUNDS } from './prefRounds';
import { MUSIC_LINES } from '../lib/instruments';
import { MATH_LINES } from '../lib/mathpark';

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
  GAME_LIVES_LINE,
  ...STORY_VOICE_LINES,
  ...ISLAND_VOICE_LINES,
  ...RACE_VOICE_LINES,
  // Harf ve rakam yazma (src/trace)
  ...TRACE_VOICE_LINES,
  // Müzik Odası ve Matematik Parkı (şimdilik kapalı: src/lib/flags.ts)
  ...(MUZIK_MATEMATIK_ACIK ? [...MUSIC_LINES, ...MATH_LINES] : []),
];

/** Her ders için üretilecek kalıp cümleler. */
export const LESSON_LINES: ((l: Lesson) => string)[] = [
  (l) => `Muhteşem! ${l.title} çok güzel oldu!`,
  (l) => `Tebrikler! ${l.title} dersini bitirdin!`,
  // Ders sonunda gösterilen beceri cümlesi (sesli okunursa diye)
  (l) => l.skill,
];

export { PREF_ROUNDS };

/** Kendine özel tonla (tek tek) üretilen cümleler. */
export const TONED_LINES: { text: string; tone: string }[] = PREF_ROUNDS.map(({ text, tone }) => ({ text, tone }));
