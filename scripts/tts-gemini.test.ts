import { describe, expect, it } from 'vitest';
import { cutTailArtifact, splitBySilence } from './tts-gemini';

const RATE = 24000;

/** Yapay ses: her "konuşma" parçası için belirli sürede ton, aralarında sessizlik. */
function synth(parts: { speech: number; gapAfter: number; innerPauseAt?: number; innerPause?: number }[]): Buffer {
  const chunks: number[] = [];
  const tone = (sec: number) => {
    for (let i = 0; i < sec * RATE; i++) chunks.push(Math.round(8000 * Math.sin(i / 7)));
  };
  const silence = (sec: number) => {
    for (let i = 0; i < sec * RATE; i++) chunks.push(0);
  };
  silence(0.3);
  for (const p of parts) {
    if (p.innerPauseAt !== undefined && p.innerPause) {
      tone(p.innerPauseAt);
      silence(p.innerPause);
      tone(p.speech - p.innerPauseAt);
    } else tone(p.speech);
    silence(p.gapAfter);
  }
  const out = Buffer.alloc(chunks.length * 2);
  chunks.forEach((v, i) => out.writeInt16LE(v, i * 2));
  return out;
}

const dur = (b: Buffer) => b.length / 2 / RATE;
const text = (chars: number) => 'a'.repeat(chars);

describe('splitBySilence', () => {
  it('cümleleri aralarındaki sessizlikten böler', () => {
    const pcm = synth([
      { speech: 2.0, gapAfter: 1.5 },
      { speech: 1.0, gapAfter: 1.5 },
      { speech: 3.0, gapAfter: 0.2 },
    ]);
    const pieces = splitBySilence(pcm, RATE, [text(40), text(20), text(60)]);
    expect(pieces).not.toBeNull();
    expect(pieces!.length).toBe(3);
    expect(dur(pieces![0])).toBeGreaterThan(2.0);
    expect(dur(pieces![0])).toBeLessThan(3.2);
    expect(dur(pieces![1])).toBeGreaterThan(1.0);
    expect(dur(pieces![1])).toBeLessThan(2.6);
    expect(dur(pieces![2])).toBeGreaterThan(3.0);
  });

  it('ünlemden sonraki uzun duraklamaya kanmaz (Muhteşem! ... örneği)', () => {
    // 1. cümlenin içinde 1.0 sn'lik duraklama var, cümleler arası boşluk 1.2 sn.
    const pcm = synth([
      { speech: 2.4, gapAfter: 1.2, innerPauseAt: 0.7, innerPause: 1.0 },
      { speech: 2.4, gapAfter: 1.2, innerPauseAt: 0.7, innerPause: 1.0 },
      { speech: 2.4, gapAfter: 0.2, innerPauseAt: 0.7, innerPause: 1.0 },
    ]);
    // Cümle içi 1.0 sn'lik boşluk kesim adayı olarak kalır → güvenli tarafta kalıp reddeder
    // (çağıran grubu bölüp tek tek üretir); asla kaymış parçalar döndürmez.
    const pieces = splitBySilence(pcm, RATE, [text(40), text(40), text(40)]);
    if (pieces) {
      expect(pieces.length).toBe(3);
      for (const p of pieces) expect(dur(p)).toBeGreaterThan(3.0);
    } else expect(pieces).toBeNull();
  });

  it('kısa cümle içi duraklamalarda doğru kesimi seçer', () => {
    // İç duraklama 0.45 sn (aday), cümle arası 1.4 sn: DP uzunluklara göre doğru boşlukları seçmeli.
    const pcm = synth([
      { speech: 2.4, gapAfter: 1.4, innerPauseAt: 0.7, innerPause: 0.45 },
      { speech: 2.4, gapAfter: 1.4, innerPauseAt: 0.7, innerPause: 0.45 },
      { speech: 4.0, gapAfter: 0.2 },
    ]);
    const pieces = splitBySilence(pcm, RATE, [text(40), text(40), text(70)]);
    expect(pieces).not.toBeNull();
    expect(pieces!.length).toBe(3);
    expect(dur(pieces![0])).toBeGreaterThan(2.8);
    expect(dur(pieces![1])).toBeGreaterThan(2.8);
    expect(dur(pieces![2])).toBeGreaterThan(4.0);
  });

  it('bir cümle atlanmışsa null döner', () => {
    const pcm = synth([
      { speech: 2.0, gapAfter: 1.5 },
      { speech: 2.0, gapAfter: 0.2 },
    ]);
    expect(splitBySilence(pcm, RATE, [text(40), text(40), text(40)])).toBeNull();
  });

  it('fazladan cümle okunmuşsa null döner', () => {
    const pcm = synth([
      { speech: 2.0, gapAfter: 1.5 },
      { speech: 2.0, gapAfter: 1.5 },
      { speech: 2.0, gapAfter: 1.5 },
      { speech: 2.0, gapAfter: 0.2 },
    ]);
    expect(splitBySilence(pcm, RATE, [text(40), text(40), text(40)])).toBeNull();
  });

  it('tek cümlede yalnızca baş ve son sessizliği kırpar', () => {
    const pcm = synth([{ speech: 1.5, gapAfter: 0.8 }]);
    const pieces = splitBySilence(pcm, RATE, [text(30)]);
    expect(pieces!.length).toBe(1);
    expect(dur(pieces![0])).toBeGreaterThan(1.4);
    expect(dur(pieces![0])).toBeLessThan(1.7);
  });
});

/** Konuşma benzeri (düşük frekanslı), sessizlik ve gürültü (rastgele, yüksek sesli) parçalarından PCM. */
function pcmOf(parts: { kind: 'speech' | 'silence' | 'noise'; sec: number; amp?: number }[]): Buffer {
  const out: number[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (const p of parts) {
    for (let i = 0; i < p.sec * RATE; i++) {
      const amp = (p.amp ?? 0.3) * 32767;
      out.push(p.kind === 'silence' ? 0 : Math.round(p.kind === 'noise' ? amp * rnd() : amp * Math.sin(i / 9) * (0.6 + 0.4 * Math.sin(i / 900))));
    }
  }
  const b = Buffer.alloc(out.length * 2);
  out.forEach((v, i) => b.writeInt16LE(v, i * 2));
  return b;
}

describe('cutTailArtifact', () => {
  it('sondaki sessizlikten sonra gelen yüksek sesli gürültüyü keser', () => {
    const pcm = pcmOf([{ kind: 'speech', sec: 2 }, { kind: 'silence', sec: 0.25 }, { kind: 'noise', sec: 0.2, amp: 0.8 }]);
    const r = cutTailArtifact(pcm, RATE);
    expect(r.cutMs).toBeGreaterThan(400);
    expect(dur(r.pcm)).toBeGreaterThan(1.98);
    expect(dur(r.pcm)).toBeLessThan(2.05);
  });

  it('duraklamadan sonra gelen son sözcüğe dokunmaz', () => {
    const pcm = pcmOf([{ kind: 'speech', sec: 2 }, { kind: 'silence', sec: 0.2 }, { kind: 'speech', sec: 0.3, amp: 0.25 }]);
    expect(cutTailArtifact(pcm, RATE).cutMs).toBe(0);
  });

  it('konuşma kadar yüksek sesli sürtünmeli son sesi ("çiz") gürültü sanmaz', () => {
    const pcm = pcmOf([{ kind: 'speech', sec: 2, amp: 0.5 }, { kind: 'silence', sec: 0.15 }, { kind: 'noise', sec: 0.25, amp: 0.3 }]);
    expect(cutTailArtifact(pcm, RATE).cutMs).toBe(0);
  });

  it('temiz kayda dokunmaz', () => {
    const pcm = pcmOf([{ kind: 'speech', sec: 2 }, { kind: 'silence', sec: 0.3 }]);
    expect(cutTailArtifact(pcm, RATE).cutMs).toBe(0);
  });
});
