import { ArrowLeft, Star } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function Stars({ value, max = 3, size = 22, animate = false, dim = 'rgba(255,255,255,0.25)' }: {
  value: number; max?: number; size?: number; animate?: boolean; dim?: string;
}) {
  return (
    <span className="stars" aria-label={`${value} yıldız`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={animate && i < value ? 'star-pop' : undefined} style={{ animationDelay: `${0.2 + i * 0.2}s` }}>
          <Star size={size} fill={i < value ? '#ffd43b' : dim} stroke={i < value ? '#f0a500' : 'transparent'} strokeWidth={2} />
        </span>
      ))}
    </span>
  );
}

export function BackButton({ onBack, light = false }: { onBack?: () => void; light?: boolean }) {
  const nav = useNavigate();
  return (
    <button className={`round-btn ${light ? 'round-btn--light' : ''}`} aria-label="Geri" onClick={() => (onBack ? onBack() : nav(-1))}>
      <ArrowLeft size={26} strokeWidth={2.6} />
    </button>
  );
}

export function TopBar({ title, onBack, right, back = true }: { title?: ReactNode; onBack?: () => void; right?: ReactNode; back?: boolean }) {
  return (
    <div className="topbar">
      {back && <BackButton onBack={onBack} />}
      <h1 className="title-lg topbar__title">{title}</h1>
      {right}
    </div>
  );
}

export function Modal({ children, onClose, className }: { children: ReactNode; onClose?: () => void; className?: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${className ?? ''}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

/** Onay penceresi (tarayıcının confirm()'ü yerine). */
export function Confirm({ title, text, yes = 'Evet', no = 'Vazgeç', danger, onYes, onNo }: {
  title: string; text?: string; yes?: string; no?: string; danger?: boolean; onYes: () => void; onNo: () => void;
}) {
  return (
    <Modal onClose={onNo}>
      <h2 className="title-lg">{title}</h2>
      {text && <p className="muted" style={{ fontSize: 17, marginTop: 10, fontWeight: 500 }}>{text}</p>}
      <div className="modal-actions">
        <button className="btn-outline" onClick={onNo}>{no}</button>
        <button className={`btn-dark ${danger ? 'btn-dark--danger' : ''}`} onClick={onYes}>{yes}</button>
      </div>
    </Modal>
  );
}

let toastTimer: number | undefined;
export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => setMsg(null), 2600);
  };
  return [msg ? <div className="toast" role="status">{msg}</div> : null, show];
}

/** Bir öğenin boyutunu izler. */
export function useSize<T extends HTMLElement>(): [React.RefObject<T>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}
