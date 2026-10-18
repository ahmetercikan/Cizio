/**
 * Mikrofon: çocuk kendi sesini kaydeder ve dinler.
 *
 * Konuşma tanıma yok — bilerek. Tanıma çocuk aksanında sık yanılır, "yanlış söyledin" demek de
 * konuşma hevesini kırar. Bunun yerine çocuk Çizio'yu dinler, kendi söyler, sonra kendi sesini
 * geri dinler; sesinin yüksekliği ekranda dalga olarak görünür. Kayıt telefondan çıkmaz, saklanmaz.
 */

export interface Recorder {
  /** Kayıt sırasında sesin yüksekliği (0-1). */
  level(): number;
  /** Kaydı bitirir ve çalınabilir sesi döndürür (ses alınamadıysa null). */
  stop(): Promise<string | null>;
  /** Kaydı iptal eder. */
  cancel(): void;
}

export type MicError = 'izin' | 'yok' | 'hata';

/** Tarayıcı / uygulama mikrofonu destekliyor mu? */
export const micSupported = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

/**
 * Kaydı başlatır. Mikrofon izni ilk kullanımda sorulur; reddedilirse 'izin' hatası döner.
 */
export async function record(): Promise<Recorder | MicError> {
  if (!micSupported()) return 'yok';
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch (e) {
    const name = (e as DOMException)?.name;
    return name === 'NotAllowedError' || name === 'SecurityError' ? 'izin' : 'yok';
  }
  let rec: MediaRecorder;
  try {
    rec = new MediaRecorder(stream);
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    return 'hata';
  }
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();

  // ses yüksekliği ölçümü (ekrandaki dalga için)
  let seviye = 0;
  let ac: AudioContext | null = null;
  let raf = 0;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ac = new Ctor();
    const src = ac.createMediaStreamSource(stream);
    const an = ac.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    const buf = new Uint8Array(an.frequencyBinCount);
    const tick = () => {
      an.getByteTimeDomainData(buf);
      let max = 0;
      for (const v of buf) max = Math.max(max, Math.abs(v - 128));
      seviye = Math.min(1, (max / 128) * 2.4);
      raf = requestAnimationFrame(tick);
    };
    tick();
  } catch {
    /* ölçüm olmasa da kayıt sürer */
  }

  const kapat = () => {
    if (raf) cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    void ac?.close().catch(() => undefined);
  };

  return {
    level: () => seviye,
    stop: () =>
      new Promise<string | null>((res) => {
        if (rec.state === 'inactive') {
          kapat();
          return res(null);
        }
        rec.onstop = () => {
          kapat();
          res(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })) : null);
        };
        rec.stop();
      }),
    cancel() {
      if (rec.state !== 'inactive') {
        rec.onstop = null;
        rec.stop();
      }
      kapat();
      for (const c of chunks) void c;
    },
  };
}

/** Kaydı çalar; bitince söz verir. */
export function playBack(url: string): Promise<void> {
  return new Promise((res) => {
    const a = new Audio(url);
    a.onended = a.onerror = () => res();
    void a.play().catch(() => res());
  });
}

/** Kayıt bellekten silinir (çocuğun sesi saklanmaz). */
export const forget = (url: string) => URL.revokeObjectURL(url);
