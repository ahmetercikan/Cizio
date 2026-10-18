/**
 * Haftalık karne.
 *
 * Çocuğa: "Bu hafta neler yaptın?" diyen renkli bir sertifika. Ebeveyne: aynı sayılar sade bir liste.
 * İkisi de `weekReport()` ile aynı kayıttan okunur; hiçbir sayı uydurulmaz.
 * Karne bir resim olarak kaydedilip paylaşılabilir (telefon paylaş penceresi).
 */
import { useRef, useState } from 'react';
import { Award, Share2 } from 'lucide-react';
import { Mascot } from './Mascot';
import { StarIcon } from './Rewards';
import { saveFile } from '../lib/files';
import { TR_DAYS } from '../lib/util';
import { weekPraise, weekReport, weekRows, type WeekReport } from '../lib/week';
import { sfx } from '../lib/sfx';
import { useProfile, useProfileData, type ProfileData } from '../store/useApp';

/** Karneyi bir resme çizip paylaşır (ekran görüntüsü almaya gerek kalmasın). */
async function paylas(r: WeekReport, ad: string) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#d7f3ec');
  g.addColorStop(1, '#fff6e6');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.fillStyle = '#ffffff';
  x.beginPath();
  x.roundRect(70, 130, W - 140, H - 260, 48);
  x.fill();
  x.textAlign = 'center';
  x.fillStyle = '#3a2b27';
  x.font = '700 64px Fredoka, Nunito, sans-serif';
  x.fillText('Haftalık Karne', W / 2, 260);
  x.font = '600 40px Nunito, sans-serif';
  x.fillStyle = '#8c766e';
  x.fillText(`${ad} · ${r.range}`, W / 2, 324);
  x.textAlign = 'left';
  let y = 430;
  for (const row of weekRows(r)) {
    x.fillStyle = '#5b463f';
    x.font = '600 38px Nunito, sans-serif';
    x.fillText(row.label, 150, y);
    x.textAlign = 'right';
    x.fillStyle = '#14a89a';
    x.font = '800 40px Nunito, sans-serif';
    x.fillText(row.value, W - 150, y);
    x.textAlign = 'left';
    x.strokeStyle = '#eee7df';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(150, y + 22);
    x.lineTo(W - 150, y + 22);
    x.stroke();
    y += 78;
  }
  x.textAlign = 'center';
  x.fillStyle = '#3a2b27';
  x.font = '600 36px Nunito, sans-serif';
  const metin = weekPraise(r, ad);
  const kelime = metin.split(' ');
  let satir = '';
  let yy = Math.max(y + 50, H - 260);
  for (const k of kelime) {
    const dene = satir ? `${satir} ${k}` : k;
    if (x.measureText(dene).width > W - 280 && satir) {
      x.fillText(satir, W / 2, yy);
      yy += 50;
      satir = k;
    } else satir = dene;
  }
  if (satir) x.fillText(satir, W / 2, yy);
  x.fillStyle = '#b07a00';
  x.font = '700 34px Fredoka, Nunito, sans-serif';
  x.fillText('Çizio', W / 2, H - 110);
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
  if (blob) await saveFile(blob, `cizio-karne-${r.range.replace(/[^\d]/g, '')}.png`, 'Haftalık Karne');
}

/** Çocuğa gösterilen sertifika. */
export function WeekCertificate() {
  const data = useProfileData();
  const profile = useProfile();
  const r = weekReport(data);
  const [busy, setBusy] = useState(false);
  const rows = weekRows(r);
  if (!profile || r.activeDays < 2 || !rows.length) return null;

  return (
    <section className="weekcard rise">
      <div className="weekcard__head">
        <Mascot size={74} mood="cheer" className="float" />
        <div>
          <p className="weekcard__label"><Award size={17} /> Bu hafta · {r.range}</p>
          <h2 className="title-md">{weekPraise(r, profile.name)}</h2>
        </div>
      </div>
      <div className="weekcard__days" aria-label="Bu haftanın günleri">
        {r.days.map((d, i) => (
          <span key={d.key} className={`weekcard__day ${d.active ? 'on' : ''}`}>
            <i />
            <small>{TR_DAYS[(i + 1) % 7]}</small>
          </span>
        ))}
      </div>
      <ul className="weekcard__rows">
        {rows.map((row) => (
          <li key={row.label}><span>{row.label}</span><b>{row.value}</b></li>
        ))}
      </ul>
      {r.stars > 0 && <p className="weekcard__stars"><StarIcon size={22} /> Bu hafta <b>{r.stars}</b> yıldız kazandın!</p>}
      <button className="btn-outline btn-outline--sm" disabled={busy}
        onClick={async () => { sfx.pop(); setBusy(true); await paylas(r, profile.name).catch(() => undefined); setBusy(false); }}>
        <Share2 size={17} /> {busy ? 'Hazırlanıyor…' : 'Karneyi kaydet / paylaş'}
      </button>
    </section>
  );
}

/** Ebeveyn bölümündeki sade özet. */
export function WeekSummary({ data, name }: { data: ProfileData; name: string }) {
  const r = weekReport(data);
  const rows = weekRows(r);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="paper-card settings-card" style={{ marginTop: 16 }} ref={ref}>
      <h2 className="card-title">Bu hafta — {name}</h2>
      <p className="muted" style={{ fontWeight: 600 }}>{r.range} · {r.activeDays}/7 gün</p>
      {rows.length ? (
        <ul className="weekcard__rows">
          {rows.map((row) => <li key={row.label}><span>{row.label}</span><b>{row.value}</b></li>)}
        </ul>
      ) : (
        <p className="muted" style={{ fontWeight: 600 }}>Bu hafta henüz bir etkinlik yok.</p>
      )}
      <button className="btn-outline btn-outline--sm" disabled={busy || !rows.length}
        onClick={async () => { setBusy(true); await paylas(r, name).catch(() => undefined); setBusy(false); }}>
        <Share2 size={17} /> {busy ? 'Hazırlanıyor…' : 'Karneyi kaydet / paylaş'}
      </button>
    </section>
  );
}
