/** Çizio Adası simgesi (el çizimi, bkz. gameIcons.ts). */
import { iconSvg } from './gameIcons';

export function GameIcon({ name, size = 28, className, label }: { name: string; size?: number; className?: string; label?: string }) {
  return (
    <span
      className={`gicon ${className ?? ''}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }}
    />
  );
}
