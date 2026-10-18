/**
 * Ebeveyn kapısı: küçük bir çarpma sorusu. Ekran süresi uyarısı da bunu kullandığı için ayrı bir
 * dosyada durur; yoksa koca Ebeveyn sayfası (ve PDF, boyama, çevrimiçi kodu) ilk pakete giriyordu.
 */
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Modal } from './ui';

export function Gate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [q] = useState(() => [3 + Math.floor(Math.random() * 7), 3 + Math.floor(Math.random() * 7)] as const);
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const press = (k: string) => {
    setErr(false);
    if (k === '⌫') return setV((x) => x.slice(0, -1));
    const nv = (v + k).slice(0, 3);
    setV(nv);
    if (Number(nv) === q[0] * q[1]) onPass();
    else if (nv.length >= String(q[0] * q[1]).length) {
      setErr(true);
      setTimeout(() => setV(''), 500);
    }
  };
  return (
    <Modal onClose={onCancel}>
      <div style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
        <Lock size={36} style={{ justifySelf: 'center' }} color="var(--primary)" />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Ebeveyn bölümü</h2>
        <p className="muted" style={{ fontWeight: 600 }}>Devam etmek için soruyu yanıtlayın:</p>
        <p style={{ fontSize: 36, fontWeight: 800 }}>{q[0]} × {q[1]} = <span style={{ color: err ? 'var(--danger)' : 'var(--primary)' }}>{v || '?'}</span></p>
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
            k ? <button key={i} className="btn-outline" onClick={() => press(k)}>{k}</button> : <span key={i} />,
          )}
        </div>
        <button className="btn-outline btn-outline--sm" onClick={onCancel}>Vazgeç</button>
      </div>
    </Modal>
  );
}
