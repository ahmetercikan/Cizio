/** Canlanan çizim ve "Çizdiğinle oyna" cümleleri (önceden seslendirilir: src/voice/lines.ts). */
import type { GameKind } from './motion';

export const ALIVE_LINE = 'Bak! Resmin canlandı!';
export const GAME_LINES: Record<GameKind, string> = {
  run: 'Sağa sola kaydırarak engellerden kaç, zıplamak için ekrana dokun! Yıldızları topla.',
  drive: 'Sağa sola kaydırarak engellerden kaç, zıplamak için ekrana dokun! Yıldızları topla.',
  fly: 'Yukarı aşağı kaydırarak bulutlardan kaç! Yıldızları topla.',
  swim: 'Yukarı aşağı kaydırarak denizanalarından kaç! Yıldızları topla.',
};
export const GAME_END_LINES = ['Süper oyundu!', 'Harika! Bir daha oynayalım mı?'];
export const GAME_LIVES_LINE = 'Canların bitti! Bir daha deneyelim mi?';
