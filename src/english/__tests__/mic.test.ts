import { describe, expect, it } from 'vitest';
import { micSupported, record } from '../mic';

describe('mikrofon', () => {
  it('desteklenmiyorsa oyun yine oynanabilir (hata fırlatmaz)', async () => {
    // test ortamında MediaRecorder yok: destek kapalı sayılır
    expect(micSupported()).toBe(false);
    await expect(record()).resolves.toBe('yok');
  });
});
