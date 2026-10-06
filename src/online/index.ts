/**
 * Çevrimiçi özelliklerin hafif giriş noktası. Firebase (~300 KB) yalnızca çevrimiçi özellik açıkken, ilk
 * kullanımda ayrı bir parça olarak yüklenir — açık olmayan cihazlarda uygulamanın açılışı hiç etkilenmez.
 */
export { ONLINE_AVAILABLE } from './config';

let mod: Promise<typeof import('./client')> | null = null;
export const online = () => (mod ??= import('./client'));
