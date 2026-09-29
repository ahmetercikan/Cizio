"""
Ses dosyalarını yazıya döker ve beklenen cümleyle karşılaştırır (toplu üretimde kaymış dosyaları bulur).

Kullanım: python scripts/voice-verify.py [--model small] [--only anahtar,anahtar] [--min 0.6]
Gerekli: pip install faster-whisper   (ilk çalıştırmada model indirilir)
Çıktı: .render/voice-stt.json ve ekrana benzerliği eşiğin altındaki satırlar.
"""
import json
import re
import sys
import time
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = ROOT / "public" / "voice"
OUT = ROOT / ".render" / "voice-stt.json"


def opt(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        return sys.argv[i + 1] if i + 1 < len(sys.argv) else default
    return default


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s).lower().replace("â", "a").replace("î", "i").replace("û", "u")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main():
    from faster_whisper import WhisperModel

    sys.stdout.reconfigure(encoding="utf-8")  # Windows konsolunda Türkçe karakterler için

    model_name = opt("--model", "small")
    threshold = float(opt("--min", "0.6"))
    only = opt("--only")
    manifest = json.loads((VOICE / "manifest.json").read_text(encoding="utf-8"))
    lines = manifest["lines"]
    keys = only.split(",") if only else list(lines.keys())
    prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}  # önceki sonuçlarla birleştirilir

    print(f"{len(keys)} dosya, model: {model_name}")
    device = opt("--device", "cpu")
    model = WhisperModel(model_name, device=device, compute_type="int8" if device == "cpu" else "int8_float16", cpu_threads=8)
    results = dict(prev)
    t0 = time.time()
    for n, k in enumerate(keys, 1):
        f = VOICE / f"{k}.mp3"
        if not f.exists():
            results[k] = {"text": lines[k], "heard": "", "sim": 0.0, "missing": True}
            continue
        try:
            segments, _ = model.transcribe(str(f), language="tr", beam_size=2, vad_filter=False, condition_on_previous_text=False)
            heard = " ".join(s.text.strip() for s in segments)
        except Exception as e:  # noqa: BLE001
            heard = f"<hata: {e}>"
        sim = SequenceMatcher(None, norm(lines[k]), norm(heard)).ratio()
        results[k] = {"text": lines[k], "heard": heard, "sim": round(sim, 3)}
        if n % 25 == 0 or n == len(keys):
            print(f"  {n}/{len(keys)} ({time.time() - t0:.0f} sn)")
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")

    bad = sorted(((k, r) for k, r in results.items() if k in keys and r["sim"] < threshold), key=lambda kv: kv[1]["sim"])
    print(f"\nBenzerlik < {threshold}: {len(bad)} dosya")
    for k, r in bad:
        print(f"{k} {r['sim']:.2f} | beklenen: {r['text'][:60]} | duyulan: {r['heard'][:70]}")


if __name__ == "__main__":
    main()
