import { describe, expect, it } from 'vitest';
import { skipHeadClick } from '../tts-gemini';

const RATE = 24000;
const ms = (n: number) => Math.round((RATE * n) / 1000);

/** sessizlik + (isteğe bağlı) tık + sessizlik + konuşma (sinüs) */
function voice(withClick: boolean) {
  const s = new Int16Array(ms(900));
  if (withClick) for (let i = ms(40); i < ms(43); i++) s[i] = i % 2 ? 26000 : -26000;
  for (let i = ms(300); i < ms(800); i++) s[i] = Math.round(9000 * Math.sin((2 * Math.PI * 220 * i) / RATE));
  return s;
}
const firstLoud = (s: Int16Array) => s.findIndex((v) => Math.abs(v) >= 500);

describe('baştaki tık (Gemini "çıt"ı)', () => {
  it('konuşmadan önceki tek ve kısa sıçrama atlanır, konuşma korunur', () => {
    const s = voice(true);
    const r = skipHeadClick(s, firstLoud(s), RATE, 500);
    expect(r.start).toBeGreaterThanOrEqual(ms(299));
    expect(r.start).toBeLessThanOrEqual(ms(301));
    expect(r.floor).toBeGreaterThan(ms(43)); // kırpma payı tıkı geri getirmez
    expect(r.floor).toBeLessThan(ms(300));
  });

  it('tık yoksa başlangıç değişmez', () => {
    const s = voice(false);
    const a = firstLoud(s);
    expect(skipHeadClick(s, a, RATE, 500)).toEqual({ start: a, floor: 0 });
  });

  it('kısa bir hece (ör. "O") ardından konuşma hemen sürerse tık sayılmaz', () => {
    const s = voice(false);
    for (let i = ms(200); i < ms(215); i++) s[i] = Math.round(9000 * Math.sin((2 * Math.PI * 220 * i) / RATE));
    for (let i = ms(215); i < ms(300); i++) s[i] = Math.round(4000 * Math.sin((2 * Math.PI * 220 * i) / RATE));
    const a = firstLoud(s);
    expect(skipHeadClick(s, a, RATE, 500).start).toBe(a);
  });
});
