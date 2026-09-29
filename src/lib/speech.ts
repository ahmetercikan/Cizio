/**
 * Çizio'nun sesi.
 *
 * 1) Doğal ses (varsayılan): sabit cümleler geliştirme sırasında `npm run voice` ile Microsoft Edge nöral
 *    sesiyle MP3'e çevrilir (public/voice/<anahtar>.mp3 + manifest.json). Çalışma anında cümlenin anahtarı
 *    manifest'te varsa bu dosya tek, yeniden kullanılan bir <audio> öğesiyle çalınır.
 * 2) Yedek: dosyası olmayan (ör. çocuğun adını içeren) cümleler ya da bir hata olursa tarayıcının
 *    Türkçe konuşma sentezi (Web Speech API) kullanılır.
 *
 * Mobil uygulamaya geçişte bu modül yerel ses/TTS eklentisiyle değiştirilebilir; arayüz aynı kalır.
 */
import { lineKey } from '../voice/hash';

// ------------------------------------------------------------------------------------------------
// Web Speech (yedek yol)
// ------------------------------------------------------------------------------------------------
let voices: SpeechSynthesisVoice[] = [];
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
const audioOk = typeof window !== 'undefined' && typeof Audio !== 'undefined' && typeof fetch !== 'undefined';

// Doğal sesler önce: Edge "Online (Natural)", Google, Apple (Yelda) ...
const PREFERRED = [/natural/i, /google/i, /yelda/i, /emel/i, /filiz/i, /seda/i, /tolga/i];

function loadVoices() {
  if (!supported) return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('tr'));
}
if (supported) {
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export function turkishVoices(): SpeechSynthesisVoice[] {
  if (!voices.length) loadVoices();
  return voices;
}

function pickVoice(uri?: string): SpeechSynthesisVoice | undefined {
  const list = turkishVoices();
  if (uri) {
    const v = list.find((x) => x.voiceURI === uri);
    if (v) return v;
  }
  for (const re of PREFERRED) {
    const v = list.find((x) => re.test(x.name));
    if (v) return v;
  }
  return list[0];
}

export interface SpeakOptions {
  rate?: number;
  voiceURI?: string;
  onEnd?: () => void;
}

function speakSynth(text: string, opts: SpeakOptions) {
  if (!supported) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  const v = pickVoice(opts.voiceURI);
  if (v) u.voice = v;
  u.rate = opts.rate ?? 0.95;
  u.pitch = 1.1;
  if (opts.onEnd) u.onend = opts.onEnd;
  speechSynthesis.speak(u);
}

// ------------------------------------------------------------------------------------------------
// Doğal ses (önceden üretilmiş MP3'ler)
// ------------------------------------------------------------------------------------------------
interface VoiceManifest {
  voice: string;
  version?: string;
  lines: Record<string, string>;
}

let natural = true;
let manifest: VoiceManifest | null = null;
let manifestPromise: Promise<VoiceManifest | null> | null = null;
let audio: HTMLAudioElement | null = null;
let unlocked = false;
let audioActive = false;
let currentObjectUrl: string | null = null;
/** Her speak/stop çağrısında artar; eski, yarım kalmış işlemler kendini iptal eder. */
let token = 0;

const MANIFEST_WAIT_MS = 800;
const FILE_TIMEOUT_MS = 5000;
const BLOB_CACHE_MAX = 40;
const blobCache = new Map<string, Promise<Blob>>();
// 20 ms'lik sessiz WAV: ilk dokunuşta <audio> öğesinin kilidini açmak için.
const SILENCE =
  'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

const voiceUrl = (path: string) => new URL(`voice/${path}`, document.baseURI).href;

/** Doğal (önceden kaydedilmiş) sesi aç/kapat. Kapalıyken her şey Web Speech ile okunur. */
export function setNaturalVoice(on: boolean) {
  natural = on;
  if (on) void loadManifest();
}

function loadManifest(): Promise<VoiceManifest | null> {
  if (!audioOk) return Promise.resolve(null);
  if (!manifestPromise) {
    manifestPromise = fetch(voiceUrl('manifest.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((m: VoiceManifest | null) => (manifest = m && typeof m.lines === 'object' ? m : null))
      .catch(() => null)
      .then((m) => {
        // Başarısızsa (ör. çevrimdışı ve önbellekte yok) sonraki çağrıda yeniden denensin.
        if (!m) manifestPromise = null;
        return m;
      });
  }
  return manifestPromise;
}

function getAudio(): HTMLAudioElement | null {
  if (!audioOk) return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = 'auto';
  }
  return audio;
}

function fileUrl(m: VoiceManifest, key: string) {
  return voiceUrl(`${key}.mp3${m.version ? `?v=${m.version}` : ''}`);
}

/**
 * Dosyayı fetch ile alır (service worker'ın CacheFirst önbelleğinden geçer) ve Blob olarak döner.
 * Blob URL ile çalmak, Safari'nin service worker üzerinden gelen medya (Range isteği) sorunlarını önler.
 */
function fetchBlob(m: VoiceManifest, key: string, low = false): Promise<Blob> {
  const hit = blobCache.get(key);
  if (hit) {
    blobCache.delete(key);
    blobCache.set(key, hit); // LRU: sona taşı
    return hit;
  }
  const init: RequestInit & { priority?: 'high' | 'low' | 'auto' } = low ? { priority: 'low' } : {};
  const p = fetch(fileUrl(m, key), init).then((r) => {
    if (!r.ok) throw new Error(`voice ${r.status}`);
    return r.blob();
  });
  p.catch(() => blobCache.delete(key));
  blobCache.set(key, p);
  while (blobCache.size > BLOB_CACHE_MAX) blobCache.delete(blobCache.keys().next().value as string);
  return p;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function playNatural(m: VoiceManifest, key: string, text: string, opts: SpeakOptions, my: number) {
  const a = getAudio();
  if (!a) return speakSynth(text, opts);
  let fellBack = false;
  const fallback = () => {
    if (my !== token || fellBack) return;
    fellBack = true;
    audioActive = false;
    speakSynth(text, opts);
  };
  audioActive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, rej) => {
    timer = setTimeout(() => rej(new Error('voice timeout')), FILE_TIMEOUT_MS);
  });
  Promise.race([fetchBlob(m, key), timeout])
    .then((blob) => {
      clearTimeout(timer);
      if (my !== token) return;
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = URL.createObjectURL(blob);
      const rate = clamp((opts.rate ?? 0.95) / 0.95, 0.8, 1.25);
      a.onended = () => {
        if (my !== token) return;
        a.onended = a.onerror = null;
        audioActive = false;
        opts.onEnd?.();
      };
      a.onerror = fallback;
      a.src = currentObjectUrl;
      const pa = a as HTMLAudioElement & { webkitPreservesPitch?: boolean; mozPreservesPitch?: boolean };
      pa.preservesPitch = true;
      pa.webkitPreservesPitch = true;
      pa.mozPreservesPitch = true;
      a.defaultPlaybackRate = rate;
      a.playbackRate = rate;
      return a.play();
    })
    .catch(() => {
      clearTimeout(timer);
      fallback();
    });
}

/**
 * Metni seslendirir. Doğal ses açıksa ve cümlenin MP3'ü varsa onu çalar; yoksa Web Speech'e düşer.
 * Önceki konuşmayı her zaman keser.
 */
export function speak(text: string, opts: SpeakOptions = {}) {
  if (!text) return;
  stopSpeaking();
  const my = token;
  if (!natural || !audioOk) return speakSynth(text, opts);
  const key = lineKey(text);
  if (manifest) {
    if (key in manifest.lines) playNatural(manifest, key, text, opts, my);
    else speakSynth(text, opts);
    return;
  }
  // Manifest henüz yüklenmediyse kısa bir süre bekle; gelmezse Web Speech ile devam et.
  const wait = new Promise<null>((r) => setTimeout(() => r(null), MANIFEST_WAIT_MS));
  void Promise.race([loadManifest(), wait]).then((m) => {
    if (my !== token) return;
    if (m && key in m.lines) playNatural(m, key, text, opts, my);
    else speakSynth(text, opts);
  });
}

export function stopSpeaking() {
  token++;
  audioActive = false;
  if (audio && !audio.paused) audio.pause();
  if (supported) speechSynthesis.cancel();
}

/** Şu an Çizio konuşuyor mu (doğal ses ya da Web Speech)? */
export function isSpeaking(): boolean {
  if (audioActive) return true;
  return supported && speechSynthesis.speaking;
}

/**
 * İlk kullanıcı dokunuşunda çağırın: tek <audio> öğesini sessiz bir sesle "ısıtır", böylece iOS Safari
 * sonraki (dokunuş dışındaki) çalmalara izin verir. Manifest'i de önceden yükler. Birden çok çağrı zararsızdır.
 */
export function unlockAudio() {
  if (natural) void loadManifest();
  if (unlocked) return;
  const a = getAudio();
  if (!a) return;
  unlocked = true;
  if (audioActive) return; // zaten çalıyor → öğe kullanımda, kilit açık sayılır
  a.onended = a.onerror = null;
  a.src = SILENCE;
  a.play()
    .then(() => {
      if (a.src === SILENCE) a.pause();
    })
    .catch(() => {
      unlocked = false; // dokunuş dışında çağrıldıysa sonra yeniden denensin
    });
}

/** Yaklaşan cümlelerin (ör. sonraki ders adımları) ses dosyalarını düşük öncelikle önceden indirir. */
export function preloadLines(texts: string[]) {
  if (!natural || !audioOk || !texts.length) return;
  void loadManifest().then((m) => {
    if (!m) return;
    for (const t of texts) {
      if (!t) continue;
      const key = lineKey(t);
      if (key in m.lines) fetchBlob(m, key, true).catch(() => {});
    }
  });
}

/** Tarayıcının konuşma sentezi (Web Speech) var mı? (Ses seçici bunu kullanır.) */
export const speechSupported = supported;
/** Önceden kaydedilmiş doğal ses çalınabilir mi? */
export const naturalVoiceSupported = audioOk;
