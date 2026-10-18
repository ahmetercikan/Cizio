/**
 * Karşılamadaki "hangisini daha çok seviyorsun?" turları.
 *
 * Ayrı bir dosyada: karşılama ekranı uygulamayla birlikte açıldığı için, bu üç cümle uğruna bütün
 * seslendirme listesi (masallar, ada, İngilizce...) ilk pakete girmesin.
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

