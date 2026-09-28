/**
 * Gemini seslerinden karşılaştırma örnekleri üretir: ses-ornekleri/gemini-<Ses>.mp3
 * Kullanım: npx tsx scripts/voice-samples.ts [Ses1,Ses2,...]
 */
import { mkdirSync } from 'node:fs';
import { apiKey, GEMINI_VOICES, geminiTts, RateLimitError, ttsModels } from './tts-gemini';

const TEXT = 'Merhaba! Ben Kalemo. Bugün seninle sevimli bir kedi çizeceğiz. Önce büyük, yayvan bir oval çiz. Bu kedimizin kafası olacak. Harika, süpersin!';
const voices = process.argv[2]?.split(',') ?? GEMINI_VOICES;
const key = apiKey();
const models = await ttsModels(key);
console.log('TTS modelleri:', models.join(', '));
const model = process.env.GEMINI_TTS_MODEL ?? models[0];
mkdirSync('ses-ornekleri', { recursive: true });
for (const voice of voices) {
  for (let i = 0; i < 10; i++) {
    try {
      await geminiTts(TEXT, `ses-ornekleri/gemini-${voice}.mp3`, { key, model, voice });
      console.log(`ok ${voice} (${model})`);
      break;
    } catch (e) {
      if (e instanceof RateLimitError) {
        console.log(`  kota, ${Math.round(e.retryAfterMs / 1000)} sn bekleniyor...`);
        await new Promise((r) => setTimeout(r, e.retryAfterMs));
      } else {
        console.log(`HATA ${voice}: ${(e as Error).message}`);
        break;
      }
    }
  }
}
