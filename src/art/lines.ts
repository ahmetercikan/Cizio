/** Canlanan çizim ve "Çizdiğinle oyna" cümleleri (önceden seslendirilir: src/voice/lines.ts). */
import type { GameKind } from './motion';

export const ALIVE_LINE = 'Bak! Resmin canlandı!';
export const GAME_LINES: Record<GameKind, string> = {
  run: 'Zıplamak için ekrana dokun! Yıldızları topla, engellerin üstünden atla.',
  drive: 'Zıplamak için ekrana dokun! Yıldızları topla, engellerin üstünden atla.',
  fly: 'Yükselmek için ekrana dokun! Yıldızları topla, bulutlara çarpma.',
  swim: 'Yukarı yüzmek için ekrana dokun! Yıldızları topla, denizanalarına dikkat et.',
};
export const GAME_END_LINES = ['Süper oyundu!', 'Harika! Bir daha oynayalım mı?'];
