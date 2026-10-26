/**
 * Yarış Kıyısı'nın ve yarış dünyalarının sesli okunan cümleleri. Sabit oldukları için seslendirme listesine girer
 * (src/voice/lines.ts); ada ekranı bu cümleleri gösterirken Çizio'nun sesiyle de okur (World.tsx).
 * Süre gibi değişen yazılar (ör. "8,6 saniye") listede yoktur, yalnızca ekranda görünür.
 */
export const RACE_LINES = {
  ready: 'Hazır ol!',
  /** Geri sayım: 1, 2, 3. */
  count: ['Bir!', 'İki!', 'Üç!'],
  go: 'Başla!',
  run: 'Koş!',
  lastLap: 'Son tur!',
  check: 'Kontrol noktası!',
  back: 'Hoppala! Son bastığın yere döndün.',
  goalVolkan: 'Lavın üstündeki taşlardan zıpla, bayrağa rakibinden önce ulaş!',
  goalBuz: 'Buz kütlelerinden zıpla, bayrağa rakibinden önce ulaş!',
  goalKosu: 'Engellerin üstünden zıpla, çukurları geç, bitiş çizgisine ilk sen ulaş!',
  goalKart: 'Karta bin, iki turu rakiplerinden önce bitir!',
  rivalVolkan: 'Pıtırcık seninle yarışıyor! Hazır ol, başla!',
  rivalBuz: 'Zıpzıp seninle yarışıyor! Hazır ol, başla!',
  rivalDoneVolkan: 'Pıtırcık bayrağa ulaştı! Sen de bitir, yıldızlar seni bekliyor.',
  rivalDoneBuz: 'Zıpzıp bayrağa ulaştı! Sen de bitir, yıldızlar seni bekliyor.',
  firstVolkan: "Pıtırcık'tan önce bitirdin, birincisin!",
  firstBuz: "Zıpzıp'tan önce bitirdin, birincisin!",
  parkourDone: 'Parkuru bitirdin, harikasın!',
  /** Yarış sonu: 1., 2., 3., 4. */
  rank: ['Birinci oldun, şampiyonsun!', 'İkinci oldun, çok iyi!', 'Üçüncü oldun, bir dahakine daha hızlı!', 'Dördüncü oldun, bir dahakine daha hızlı!'],
  courseStart: 'Süre başladı! Direklerden zıpla, bayrağa ulaş!',
  mud: 'Hoppala, çamura düştün! Son direğe döndün.',
  rings: 'Bütün halkalardan geçtin, uçan bir şampiyonsun!',
  balloons: 'Bütün balonları patlattın! Yenileri geliyor.',
};

export const RACE_VOICE_LINES: string[] = Object.values(RACE_LINES).flat();
