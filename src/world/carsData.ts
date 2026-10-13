/** Arabaların bilgileri (three.js yok: kayıt ve pazar da kullanır). Modeller: cars.ts */
export interface CarDef {
  id: string;
  name: string;
  icon: string;
  /** Altın fiyatı (özel paketteyse 0). */
  price: number;
  level: number;
  /** Özel paket kimliği (premium.ts). */
  premium?: string;
  speed: number;
  /** Suyun üstünden uçar. */
  fly?: boolean;
  seatY: number;
}

export const CARS: CarDef[] = [
  { id: 'bisiklet', name: 'Bisiklet', icon: 'bisiklet', price: 60, level: 1, speed: 15, seatY: 1.1 },
  { id: 'mini', name: 'Minik araba', icon: 'mini', price: 180, level: 2, speed: 20, seatY: 0.75 },
  { id: 'jip', name: 'Jip', icon: 'jip', price: 320, level: 3, speed: 22, seatY: 1.0 },
  { id: 'karavan', name: 'Karavan', icon: 'karavan', price: 480, level: 4, speed: 18, seatY: 1.0 },
  { id: 'spor', name: 'Spor araba', icon: 'spor', price: 650, level: 5, speed: 28, seatY: 0.6 },
  { id: 'unicorn', name: 'Unicorn arabası', icon: 'unicorn', price: 0, level: 1, premium: 'araba', speed: 24, seatY: 0.8 },
  { id: 'ucan', name: 'Uçan araba', icon: 'ucan', price: 0, level: 1, premium: 'araba', speed: 26, fly: true, seatY: 0.8 },
  { id: 'limuzin', name: 'Gökkuşağı limuzin', icon: 'limuzin', price: 0, level: 1, premium: 'araba', speed: 22, seatY: 0.75 },
];
export const car = (id: string) => CARS.find((c) => c.id === id);
