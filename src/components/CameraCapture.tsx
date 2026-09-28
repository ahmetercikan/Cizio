/**
 * Canlı kamera ile çizim fotoğrafı: arka kamera, kâğıt çerçevesi ve deklanşör.
 * Kamera açılamazsa (izin yok, desteklenmiyor, http) dosya seçmeye düşer.
 * Görüntü cihazdan çıkmaz.
 */
import { Camera, ImagePlus, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function CameraCapture({ onCapture, onSkip }: { onCapture: (b: Blob) => void; onSkip: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'starting' | 'live' | 'failed'>('starting');
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setState('starting');
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        setState('live');
      } catch {
        if (!cancelled) setState('failed');
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const shoot = () => {
    const v = video.current, f = frame.current;
    if (!v || !f || !v.videoWidth) return;
    // Çerçevenin ekrandaki konumunu videonun piksel koordinatlarına çevir (object-fit: cover).
    const vr = v.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const scale = Math.max(vr.width / v.videoWidth, vr.height / v.videoHeight);
    const ox = (vr.width - v.videoWidth * scale) / 2, oy = (vr.height - v.videoHeight * scale) / 2;
    const sx = (fr.left - vr.left - ox) / scale, sy = (fr.top - vr.top - oy) / scale;
    const sw = fr.width / scale, sh = fr.height / scale;
    const c = document.createElement('canvas');
    c.width = 1400;
    c.height = Math.round((1400 * sh) / sw);
    const ctx = c.getContext('2d')!;
    if (facing === 'user') {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
    c.toBlob((b) => b && onCapture(b), 'image/jpeg', 0.9);
  };

  return (
    <div className="camera">
      <video ref={video} className={`camera__video ${facing === 'user' ? 'mirror' : ''}`} playsInline muted autoPlay />
      <div className="camera__shade" />
      <p className="camera__title">Çiziminin fotoğrafını çek</p>
      <div ref={frame} className="camera__frame">
        <span className="camera__corner tl" />
        <span className="camera__corner tr" />
        <span className="camera__corner bl" />
        <span className="camera__corner br" />
        {state !== 'live' && (
          <div className="camera__fallback">
            {state === 'starting' ? (
              <Camera size={48} />
            ) : (
              <>
                <p>Kamera açılamadı. Fotoğrafı galeriden seçebilirsin.</p>
                <button className="pill pill--light pill--sm" onClick={() => file.current?.click()}>
                  <ImagePlus size={20} /> Fotoğraf seç
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <p className="camera__hint">Kâğıdı çerçevenin içine yerleştir</p>
      <div className="camera__controls">
        <button className="round-btn" aria-label="Galeriden seç" onClick={() => file.current?.click()}>
          <ImagePlus size={24} />
        </button>
        <button className="shutter" aria-label="Fotoğraf çek" disabled={state !== 'live'} onClick={shoot} />
        <button className="round-btn" aria-label="Kamerayı çevir" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}>
          <RefreshCcw size={22} />
        </button>
      </div>
      <button className="camera__skip link-btn" onClick={onSkip}>Fotoğrafsız devam et</button>
      <input
        ref={file}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onCapture(f);
          e.target.value = '';
        }}
      />
      {flash && <div className="camera__flash" />}
    </div>
  );
}
