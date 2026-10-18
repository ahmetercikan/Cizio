/**
 * Ekran süresi: ebeveynin koyduğu günlük sınır dolunca nazik bir mola ekranı.
 *
 * Süre yalnızca uygulama ekranda açıkken işler (sekme arkaya atılınca durur). Sınır dolunca çocuğa
 * kızmayan, "yarın görüşürüz" diyen bir ekran çıkar; devam etmek ebeveyn kilidinin arkasındadır.
 * Sınır konmamışsa (varsayılan) hiçbir şey olmaz ve hiçbir şey sayılmaz.
 */
import { useEffect, useState } from 'react';
import { Clock, Lock } from 'lucide-react';
import { Mascot } from './Mascot';
import { dayKey } from '../lib/util';
import { useApp, useProfileData } from '../store/useApp';
import { Gate } from './Gate';

/** Bugün kullanılan ve izin verilen dakika. */
export function useScreenTime() {
  const d = useProfileData();
  const k = dayKey();
  const limit = d.limitMin ?? 0;
  const used = d.used?.[k] ?? 0;
  const bonus = d.bonusMin?.[k] ?? 0;
  return { limit, used, bonus, allowed: limit ? limit + bonus : 0, over: !!limit && used >= limit + bonus };
}

export function ScreenTimeGuard({ children }: { children: React.ReactNode }) {
  const add = useApp((s) => s.addUsage);
  const bonusVer = useApp((s) => s.addBonus);
  const { limit, used, allowed, over } = useScreenTime();
  const [gate, setGate] = useState(false);

  // sınır varsa dakikada bir say (ekran kapalıyken sayma)
  useEffect(() => {
    if (!limit) return;
    const t = window.setInterval(() => {
      if (!document.hidden) add(1);
    }, 60_000);
    return () => window.clearInterval(t);
  }, [limit, add]);

  if (!over) return <>{children}</>;

  return (
    <div className="bg app breaktime">
      <div className="breaktime__card rise">
        <Mascot size={150} mood="happy" className="float" />
        <h1 className="title-xl">Mola zamanı!</h1>
        <p className="sub">
          Bugün {used} dakika oynadın. Şimdi biraz dinlen: kâğıda çiz, dışarı çık, bir kitap oku.
          Yarın yeni dersler ve yeni görevler seni bekliyor!
        </p>
        <p className="breaktime__clock"><Clock size={20} /> Bugünkü süre: {used} / {allowed} dakika</p>
        <button className="btn-outline btn-outline--sm" onClick={() => setGate(true)}><Lock size={16} /> Ebeveyn: biraz daha izin ver</button>
      </div>
      {gate && (
        <Gate
          onPass={() => {
            setGate(false);
            bonusVer(15);
          }}
          onCancel={() => setGate(false)}
        />
      )}
    </div>
  );
}
