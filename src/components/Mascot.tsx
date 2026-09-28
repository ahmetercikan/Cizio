/** Kalemo — uygulamanın maskotu, sevimli bir kurşun kalem. */
export type Mood = 'happy' | 'cheer' | 'think' | 'wow';

export function Mascot({ size = 120, mood = 'happy', className }: { size?: number; mood?: Mood; className?: string }) {
  const armsUp = mood === 'cheer' || mood === 'wow';
  return (
    <svg className={className} width={size} height={(size * 170) / 140} viewBox="0 0 140 170" role="img" aria-label="Kalemo">
      <ellipse cx="70" cy="164" rx="34" ry="5" fill="#2b2250" opacity="0.08" />
      {/* kollar */}
      <g stroke="#2b2250" strokeWidth="5" strokeLinecap="round" fill="none">
        {armsUp ? (
          <>
            <path d="M44,86 Q28,74 22,56" />
            <path d="M96,86 Q112,74 118,56" />
          </>
        ) : mood === 'think' ? (
          <>
            <path d="M44,90 Q30,100 30,114" />
            <path d="M96,92 Q108,86 100,74" />
          </>
        ) : (
          <>
            <path d="M44,90 Q28,98 24,112" />
            <path d="M96,86 Q114,80 120,64" />
          </>
        )}
      </g>
      {/* silgi ve metal bilezik */}
      <rect x="44" y="8" width="52" height="30" rx="12" fill="#ff8fb1" stroke="#2b2250" strokeWidth="4" />
      <rect x="42" y="34" width="56" height="16" rx="4" fill="#cfcbe0" stroke="#2b2250" strokeWidth="4" />
      {/* gövde */}
      <path d="M44,50 H96 V122 H44 Z" fill="#ffc531" stroke="#2b2250" strokeWidth="4" strokeLinejoin="round" />
      <path d="M61,52 V120 M79,52 V120" stroke="#f5a623" strokeWidth="4" />
      {/* uç */}
      <path d="M44,122 L70,158 L96,122 Z" fill="#f6d7a7" stroke="#2b2250" strokeWidth="4" strokeLinejoin="round" />
      <path d="M62,147 L70,158 L78,147 Q70,151 62,147 Z" fill="#2b2250" />
      {/* yüz */}
      <rect x="50" y="64" width="40" height="42" rx="16" fill="#ffd866" />
      {mood === 'wow' ? (
        <>
          <circle cx="60" cy="80" r="6" fill="#2b2250" />
          <circle cx="80" cy="80" r="6" fill="#2b2250" />
          <ellipse cx="70" cy="97" rx="5" ry="6" fill="#2b2250" />
        </>
      ) : mood === 'cheer' ? (
        <>
          <path d="M54,82 Q60,74 66,82" stroke="#2b2250" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M74,82 Q80,74 86,82" stroke="#2b2250" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60,92 Q70,104 80,92 Z" fill="#2b2250" />
        </>
      ) : (
        <>
          <circle cx="60" cy="80" r="5.5" fill="#2b2250" />
          <circle cx="80" cy="80" r="5.5" fill="#2b2250" />
          <circle cx="62" cy="78" r="2" fill="#fff" />
          <circle cx="82" cy="78" r="2" fill="#fff" />
          {mood === 'think' ? (
            <path d="M63,96 Q70,96 77,92" stroke="#2b2250" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M62,92 Q70,100 78,92" stroke="#2b2250" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
        </>
      )}
      <ellipse cx="54" cy="92" rx="5" ry="3.5" fill="#ff8fb1" opacity="0.8" />
      <ellipse cx="86" cy="92" rx="5" ry="3.5" fill="#ff8fb1" opacity="0.8" />
    </svg>
  );
}

/** Maskot + konuşma balonu. */
export function MascotSays({ children, mood, size = 96 }: { children: React.ReactNode; mood?: Mood; size?: number }) {
  return (
    <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
      <Mascot size={size} mood={mood} className="float" />
      <div className="bubble" style={{ flex: 1, marginTop: 8 }}>
        {children}
      </div>
    </div>
  );
}
