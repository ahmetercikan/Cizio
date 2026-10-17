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
  /** Uçarken yerden yükseklik (yoksa 2,2). */
  alt?: number;
  /** İnince tekerleklerin yere değmesi için yükseklik. */
  park?: number;
  /** Dönerken yana yatar (uçak). */
  bank?: boolean;
  /** Sürerken kamera: [uzaklık, yükseklik]. */
  cam?: [number, number];
}

export const CARS: CarDef[] = [
  { id: 'bisiklet', name: 'Bisiklet', icon: 'bisiklet', price: 60, level: 1, speed: 15, seatY: 1.1 },
  { id: 'skuter', name: 'Skuter', icon: 'skuter', price: 150, level: 2, speed: 19, seatY: 1.05 },
  { id: 'mini', name: 'Minik araba', icon: 'mini', price: 260, level: 2, speed: 20, seatY: 0.75 },
  { id: 'jip', name: 'Jip', icon: 'jip', price: 420, level: 3, speed: 22, seatY: 1.0 },
  { id: 'traktor', name: 'Traktör', icon: 'traktor', price: 560, level: 3, speed: 14, seatY: 1.95 },
  { id: 'karavan', name: 'Karavan', icon: 'karavan', price: 700, level: 4, speed: 18, seatY: 1.0 },
  { id: 'kamyonet', name: 'Kamyonet', icon: 'kamyonet', price: 880, level: 4, speed: 24, seatY: 1.6 },
  { id: 'spor', name: 'Spor araba', icon: 'spor', price: 1100, level: 5, speed: 28, seatY: 0.6 },
  { id: 'otobus', name: 'Okul otobüsü', icon: 'otobus', price: 1500, level: 6, speed: 20, seatY: 2.05 },
  { id: 'yaris', name: 'Yarış arabası', icon: 'yaris', price: 2200, level: 7, speed: 34, seatY: 0.72 },
  { id: 'ucak', name: 'Kendi uçağım', icon: 'ucak', price: 3200, level: 8, speed: 30, fly: true, seatY: 0.75, alt: 20, park: 1.85, bank: true, cam: [24, 10] },
  { id: 'unicorn', name: 'Unicorn arabası', icon: 'unicorn', price: 0, level: 1, premium: 'araba', speed: 24, seatY: 0.8 },
  { id: 'ucan', name: 'Uçan araba', icon: 'ucan', price: 0, level: 1, premium: 'araba', speed: 26, fly: true, seatY: 0.8 },
  { id: 'limuzin', name: 'Gökkuşağı limuzin', icon: 'limuzin', price: 0, level: 1, premium: 'araba', speed: 22, seatY: 0.75 },
];
export const car = (id: string) => CARS.find((c) => c.id === id);
