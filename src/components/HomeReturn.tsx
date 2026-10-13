/**
 * "Evime dön" düğmesi: Çizio Adası'ndaki evden bir eşyayla (gardırop, şövale, kitaplık, çalışma masası) başka bir sayfaya
 * gidilince o sayfanın üstünde görünür; dokununca adaya ve eve geri dönülür. 30 dakika sonra kendiliğinden kalkar.
 */
import { Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const HOME_RETURN_KEY = 'cizio-home-return';
const MAX_AGE = 30 * 60 * 1000;

/** Eve dönülecek mi (işaret taze mi)? */
export function homeReturnPending() {
  try {
    const t = Number(sessionStorage.getItem(HOME_RETURN_KEY));
    return t > 0 && Date.now() - t < MAX_AGE;
  } catch {
    return false;
  }
}
export function setHomeReturn(on: boolean) {
  try {
    if (on) sessionStorage.setItem(HOME_RETURN_KEY, String(Date.now()));
    else sessionStorage.removeItem(HOME_RETURN_KEY);
  } catch {
    /* yok say */
  }
}

export function HomeReturn() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  if (pathname === '/ada' || !homeReturnPending()) return null;
  return (
    <button className="home-return pop-in" onClick={() => nav('/ada')}>
      <Home size={20} /> Evime dön
    </button>
  );
}
