/**
 * Öğrenme yolları (Temeller, Hayvanlar, Uzay...).
 *
 * Ders verisinden ayrı duruyor: yalnızca yol listesine ihtiyaç duyan yerler (Macera haritası,
 * çıkartmalar) açılışta yarım megabaytlık çizim verisini indirmek zorunda kalmasın.
 */
import type { LearningPath } from './types';

export const paths: LearningPath[] = [
  { id: 'temeller', title: 'Temeller', emoji: '✏️', color: '#7c5cff', description: 'Çizgiler, şekiller ve kalem kontrolü' },
  { id: 'hayvanlar', title: 'Hayvanlar', emoji: '🐾', color: '#ff8a3d', description: 'Kediler, balıklar ve daha fazlası' },
  { id: 'nesneler', title: 'Sevimli Nesneler', emoji: '🧁', color: '#ff5fa2', description: 'Tatlılar, oyuncaklar ve eşyalar' },
  { id: 'doga', title: 'Doğa', emoji: '🌻', color: '#2fbf71', description: 'Çiçekler, ağaçlar ve gökyüzü' },
  { id: 'karakterler', title: 'Kahramanlar', emoji: '🤖', color: '#2f9bff', description: 'Robotlar, korsanlar, ninjalar ve süper kahramanlar' },
  { id: 'masal', title: 'Masal ve Büyü', emoji: '🧚', color: '#a86bff', description: 'Periler, prensesler, ejderhalar ve sihirbazlar' },
  { id: 'uzay', title: 'Uzay', emoji: '🚀', color: '#4a5bd4', description: 'Roketler, astronotlar ve uzaylılar' },
  { id: 'meslekler', title: 'Meslekler', emoji: '👩‍⚕️', color: '#1fb5a8', description: 'Doktor, pilot, itfaiyeci ve daha fazlası' },
  { id: 'deniz', title: 'Deniz Canlıları', emoji: '🐙', color: '#1fb5d6', description: 'Ahtapotlar, yunuslar ve deniz yıldızları' },
  { id: 'dinozor', title: 'Dinozorlar ve Ejderhalar', emoji: '🦕', color: '#5cc36b', description: 'Sevimli dinozorlar ve dost ejderhalar' },
  { id: 'tasitlar', title: 'Taşıtlar', emoji: '🚀', color: '#ff6b4a', description: 'Roketler, uçaklar ve tekneler' },
  { id: 'ismakineleri', title: 'İş Makineleri', emoji: '🚜', color: '#f2a516', description: 'Kamyonlar, kepçeler, dozerler ve vinçler' },
  { id: 'ozel', title: 'Özel Günler', emoji: '🎉', color: '#e8457c', description: 'Bayramlar, kutlamalar ve mevsimler' },
];

export const getPath = (id: string) => paths.find((p) => p.id === id);
