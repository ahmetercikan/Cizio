"""
Ses dosyalarını yazıya döker ve beklenen cümleyle karşılaştırır (toplu üretimde kaymış / bozuk dosyaları bulur).

Kullanım: python scripts/voice-verify.py [--model small] [--only anahtar,anahtar] [--min 0.85] [--device cpu]
          python scripts/voice-verify.py --report [--min 0.85]   # yeniden dinlemeden, kayıtlı sonuçları değerlendirir
Gerekli: pip install faster-whisper   (ilk çalıştırmada model indirilir; OPENBLAS_NUM_THREADS=1 gerekebilir)
Çıktı: .render/voice-stt.json (birikimli), .render/voice-bad.txt (eşiğin altındaki anahtarlar, generate-voice --redo için)
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
BAD = ROOT / ".render" / "voice-bad.txt"

# Kalıp cümleler: yalnızca değişken kısım (parça / ders adı) farklıysa genel benzerlik yüksek kalır;
# o yüzden değişken kısım ayrıca karşılaştırılır.
TEMPLATES = [  # (beklenen kalıp, duyulanda baştan atılacak sözcük sayısı, sondan atılacak sözcük sayısı)
    (r"^güzel deneme (.+?) kısmına bir daha bak$", 2, 4),
    (r"^çok iyi (.+?) biraz eksik kaldı$", 2, 3),
    (r"^muhteşem (.+?) çok güzel oldu$", 1, 3),
    (r"^tebrikler (.+?) dersini bitirdin$", 1, 2),
]


def opt(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        return sys.argv[i + 1] if i + 1 < len(sys.argv) else default
    return default


ORDINALS = {"1": "birinci", "2": "ikinci", "3": "üçüncü", "4": "dördüncü", "5": "beşinci", "6": "altıncı", "7": "yedinci", "8": "sekizinci", "9": "dokuzuncu", "10": "onuncu"}
NUMBERS = {"1": "bir", "2": "iki", "3": "üç", "4": "dört", "5": "beş", "6": "altı", "7": "yedi", "8": "sekiz", "9": "dokuz", "10": "on"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s).lower().replace("â", "a").replace("î", "i").replace("û", "u")
    # Whisper sayıları rakamla yazar ("4. tahta", "2 minik diş"); beklenen metin sözcükle yazar.
    s = re.sub(r"\b(\d+)\.(?=\s)", lambda m: ORDINALS.get(m.group(1), m.group(0)), s)
    s = re.sub(r"\b(\d+)\b", lambda m: NUMBERS.get(m.group(1), m.group(0)), s)
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def score(text: str, heard: str) -> float:
    a, b = norm(text), norm(heard)
    sim = SequenceMatcher(None, a, b).ratio()
    for exp_re, head, tail in TEMPLATES:
        m = re.match(exp_re, a)
        if not m:
            continue
        # Whisper kalıp sözcüklerini yanlış yazabilir ("kısımına"); o yüzden değişken kısım sözcük sayısıyla kesilir.
        words = b.split()
        heard_part = " ".join(words[head : len(words) - tail]) if len(words) > head + tail else ""
        part = SequenceMatcher(None, m.group(1), heard_part).ratio()
        # Değişken kısım tutmuyorsa (ör. "sol yanak" yerine "ağız") dosya yanlış sayılır.
        return min(sim, 0.5 + part / 2)
    return sim


def report(results, keys, threshold):
    bad = sorted(((k, r) for k, r in results.items() if k in keys and r["sim"] < threshold), key=lambda kv: kv[1]["sim"])
    print(f"\nBenzerlik < {threshold}: {len(bad)} / {len(keys)} dosya")
    for k, r in bad:
        print(f"{k} {r['sim']:.2f} | beklenen: {r['text'][:60]} | duyulan: {r['heard'][:70]}")
    BAD.write_text("\n".join(k for k, _ in bad) + "\n", encoding="utf-8")
    print(f"anahtarlar: {BAD}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # Windows konsolunda Türkçe karakterler için
    threshold = float(opt("--min", "0.85"))
    manifest = json.loads((VOICE / "manifest.json").read_text(encoding="utf-8"))
    lines = manifest["lines"]
    only = opt("--only")
    keys = only.split(",") if only else list(lines.keys())
    prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}  # önceki sonuçlarla birleştirilir

    if "--report" in sys.argv:
        for k, r in prev.items():
            r["sim"] = round(score(r["text"], r.get("heard", "")), 3)
        OUT.write_text(json.dumps(prev, ensure_ascii=False, indent=1), encoding="utf-8")
        report(prev, [k for k in keys if k in prev], threshold)
        return

    from faster_whisper import WhisperModel

    model_name = opt("--model", "small")
    device = opt("--device", "cpu")
    print(f"{len(keys)} dosya, model: {model_name}")
    model = WhisperModel(model_name, device=device, compute_type="int8" if device == "cpu" else "int8_float16", cpu_threads=8)
    results = dict(prev)
    t0 = time.time()
    for n, k in enumerate(keys, 1):
        f = VOICE / f"{k}.mp3"
        text = lines.get(k, results.get(k, {}).get("text", ""))
        if not f.exists():
            results[k] = {"text": text, "heard": "", "sim": 0.0, "missing": True}
            continue
        try:
            segments, _ = model.transcribe(str(f), language="tr", beam_size=2, vad_filter=False, condition_on_previous_text=False)
            heard = " ".join(s.text.strip() for s in segments)
        except Exception as e:  # noqa: BLE001
            heard = f"<hata: {e}>"
        results[k] = {"text": text, "heard": heard, "sim": round(score(text, heard), 3)}
        if n % 25 == 0 or n == len(keys):
            print(f"  {n}/{len(keys)} ({time.time() - t0:.0f} sn)", flush=True)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    report(results, keys, threshold)


if __name__ == "__main__":
    main()
