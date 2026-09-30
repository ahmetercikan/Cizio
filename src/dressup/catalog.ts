/**
 * Karakter giydirme kataloğu: karakter durumu, hazır karakterler, giysiler, renkler ve stil görevleri.
 * Çizimler src/dressup/Doll.tsx'te; burada yalnızca veri var.
 */
import { dayKey, hashStr } from '../lib/util';

export type Gender = 'kiz' | 'erkek';

export interface DollState {
  gender: Gender;
  name: string;
  skin: string;
  hair: string;
  hairColor: string;
  face: string;
  freckles: boolean;
  glasses: string;
  top: string;
  topColor: string;
  bottom: string;
  bottomColor: string;
  /** Tek parça (elbise/tulum/kostüm); seçiliyse üst ve alt gizlenir. '' = yok. */
  dress: string;
  dressColor: string;
  shoes: string;
  shoesColor: string;
  hat: string;
  hatColor: string;
  hand: string;
  bg: string;
}

export const SKINS = ['#ffe3cc', '#f6c9a0', '#e5a878', '#c68653', '#8d5a36', '#5e3b24'];
export const HAIR_COLORS = ['#2b2220', '#5a3420', '#9a6234', '#e8b64c', '#c8452c', '#ff8fb1', '#5b8def', '#b9b3c9'];
export const CLOTH_COLORS = ['#ff6b4a', '#ffc83d', '#2bb673', '#14a89a', '#5b8def', '#9b6bff', '#ff8fb1', '#e9487d', '#ffffff', '#3a2b27', '#8c5a2b', '#9be7de'];

export interface Item {
  id: string;
  title: string;
  /** Stil görevleri için etiketler. */
  tags?: string[];
}

export const HAIRS: Item[] = [
  { id: 'kisa', title: 'Kısa' },
  { id: 'yan', title: 'Yana taralı' },
  { id: 'dikenli', title: 'Dikenli' },
  { id: 'kivircik', title: 'Kıvırcık' },
  { id: 'afro', title: 'Afro' },
  { id: 'kut', title: 'Küt' },
  { id: 'uzun', title: 'Uzun' },
  { id: 'atkuyrugu', title: 'At kuyruğu' },
  { id: 'topuz', title: 'İki topuz' },
  { id: 'orgu', title: 'Örgülü' },
];

export const FACES: Item[] = [
  { id: 'mutlu', title: 'Mutlu' },
  { id: 'gulus', title: 'Kahkaha' },
  { id: 'kirp', title: 'Göz kırpan' },
  { id: 'saskin', title: 'Şaşkın' },
  { id: 'havali', title: 'Havalı' },
];

export const GLASSES: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'yuvarlak', title: 'Yuvarlak', tags: ['okul'] },
  { id: 'yildiz', title: 'Yıldız', tags: ['parti'] },
  { id: 'gunes', title: 'Güneş gözlüğü', tags: ['yaz'] },
];

export const TOPS: Item[] = [
  { id: 'tisort', title: 'Tişört', tags: ['yaz'] },
  { id: 'yildizli', title: 'Yıldızlı tişört', tags: ['parti', 'yaz'] },
  { id: 'kazak', title: 'Çizgili kazak', tags: ['kis', 'okul'] },
  { id: 'kapsonlu', title: 'Kapüşonlu', tags: ['kis', 'spor'] },
  { id: 'gomlek', title: 'Gömlek', tags: ['okul'] },
  { id: 'forma', title: 'Forma', tags: ['spor'] },
];

export const BOTTOMS: Item[] = [
  { id: 'pantolon', title: 'Pantolon', tags: ['kis', 'okul'] },
  { id: 'sort', title: 'Şort', tags: ['yaz', 'spor'] },
  { id: 'etek', title: 'Etek', tags: ['okul', 'parti'] },
  { id: 'tayt', title: 'Tayt', tags: ['spor', 'kis'] },
];

export const DRESSES: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'yazlik', title: 'Yazlık elbise', tags: ['yaz'] },
  { id: 'prenses', title: 'Balo elbisesi', tags: ['parti'] },
  { id: 'tulum', title: 'Tulum', tags: ['okul'] },
  { id: 'kahraman', title: 'Süper kahraman', tags: ['parti', 'spor'] },
];

export const SHOES: Item[] = [
  { id: 'spor', title: 'Spor ayakkabı', tags: ['spor', 'okul'] },
  { id: 'bot', title: 'Bot', tags: ['kis'] },
  { id: 'sandalet', title: 'Sandalet', tags: ['yaz'] },
  { id: 'cizme', title: 'Yağmur çizmesi', tags: ['kis'] },
  { id: 'babet', title: 'Parlak ayakkabı', tags: ['parti', 'okul'] },
];

export const HATS: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'kep', title: 'Kep', tags: ['spor', 'yaz'] },
  { id: 'yunbere', title: 'Yün bere', tags: ['kis'] },
  { id: 'tac', title: 'Taç', tags: ['parti'] },
  { id: 'fiyonk', title: 'Fiyonk', tags: ['parti', 'okul'] },
  { id: 'kulaklik', title: 'Kulaklık', tags: ['spor'] },
  { id: 'parti', title: 'Parti şapkası', tags: ['parti'] },
  { id: 'cicek', title: 'Çiçek tokası', tags: ['yaz'] },
];

export const HANDS: Item[] = [
  { id: '', title: 'Boş' },
  { id: 'balon', title: 'Balon', tags: ['parti'] },
  { id: 'dondurma', title: 'Dondurma', tags: ['yaz'] },
  { id: 'kitap', title: 'Kitap', tags: ['okul'] },
  { id: 'firca', title: 'Fırça', tags: ['okul'] },
  { id: 'top', title: 'Top', tags: ['spor', 'yaz'] },
  { id: 'kupa', title: 'Sıcak kakao', tags: ['kis'] },
];

export const BGS: Item[] = [
  { id: 'oda', title: 'Oda', tags: ['okul', 'kis'] },
  { id: 'park', title: 'Park', tags: ['spor'] },
  { id: 'plaj', title: 'Plaj', tags: ['yaz'] },
  { id: 'kar', title: 'Karlı gün', tags: ['kis'] },
  { id: 'sahne', title: 'Sahne', tags: ['parti'] },
  { id: 'uzay', title: 'Uzay', tags: ['parti'] },
];

const base = { face: 'mutlu', freckles: false, glasses: '', dress: '', dressColor: '#ff8fb1', hat: '', hatColor: '#ff6b4a', hand: '', bg: 'oda' };

/** Hazır karakterler: farklı ten, saç tipi ve rengi (hepsi sonradan değiştirilebilir). */
export const PRESETS: DollState[] = [
  { ...base, gender: 'kiz', name: 'Ela', skin: SKINS[0], hair: 'uzun', hairColor: HAIR_COLORS[3], top: 'yildizli', topColor: '#ff8fb1', bottom: 'etek', bottomColor: '#5b8def', shoes: 'babet', shoesColor: '#e9487d', hat: 'fiyonk', hatColor: '#ff6b4a' },
  { ...base, gender: 'kiz', name: 'Zeynep', skin: SKINS[2], hair: 'atkuyrugu', hairColor: HAIR_COLORS[1], top: 'kazak', topColor: '#14a89a', bottom: 'pantolon', bottomColor: '#5b8def', shoes: 'spor', shoesColor: '#ffffff' },
  { ...base, gender: 'kiz', name: 'Maya', skin: SKINS[4], hair: 'topuz', hairColor: HAIR_COLORS[0], top: 'tisort', topColor: '#ffc83d', bottom: 'sort', bottomColor: '#9b6bff', shoes: 'sandalet', shoesColor: '#ff6b4a', face: 'gulus' },
  { ...base, gender: 'kiz', name: 'Defne', skin: SKINS[1], hair: 'kut', hairColor: HAIR_COLORS[4], freckles: true, glasses: 'yuvarlak', top: 'gomlek', topColor: '#ffffff', bottom: 'etek', bottomColor: '#2bb673', shoes: 'bot', shoesColor: '#8c5a2b' },
  { ...base, gender: 'erkek', name: 'Emir', skin: SKINS[1], hair: 'yan', hairColor: HAIR_COLORS[1], top: 'tisort', topColor: '#5b8def', bottom: 'pantolon', bottomColor: '#3a2b27', shoes: 'spor', shoesColor: '#ff6b4a' },
  { ...base, gender: 'erkek', name: 'Kerem', skin: SKINS[3], hair: 'dikenli', hairColor: HAIR_COLORS[0], top: 'forma', topColor: '#ff6b4a', bottom: 'sort', bottomColor: '#ffffff', shoes: 'spor', shoesColor: '#ffc83d', hat: 'kep', hatColor: '#14a89a' },
  { ...base, gender: 'erkek', name: 'Aras', skin: SKINS[0], hair: 'kivircik', hairColor: HAIR_COLORS[4], freckles: true, top: 'kapsonlu', topColor: '#2bb673', bottom: 'pantolon', bottomColor: '#8c5a2b', shoes: 'bot', shoesColor: '#3a2b27', face: 'kirp' },
  { ...base, gender: 'erkek', name: 'Deniz', skin: SKINS[5], hair: 'afro', hairColor: HAIR_COLORS[0], glasses: 'yuvarlak', bg: 'park', top: 'gomlek', topColor: '#9be7de', bottom: 'pantolon', bottomColor: '#5b8def', shoes: 'babet', shoesColor: '#3a2b27' },
];

// ------------------------------------------------------------------------------------------------
// Stil görevleri
// ------------------------------------------------------------------------------------------------
export interface Theme {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  tag: string;
  bg: string;
}

export const THEMES: Theme[] = [
  { id: 'plaj', title: 'Plaj günü', emoji: '🏖️', desc: 'Yazlık giysiler, güneş gözlüğü ve plaj!', tag: 'yaz', bg: 'plaj' },
  { id: 'kis', title: 'Kar tatili', emoji: '⛄', desc: 'Sıcacık giysiler ve karlı bir gün.', tag: 'kis', bg: 'kar' },
  { id: 'parti', title: 'Doğum günü partisi', emoji: '🎉', desc: 'Parlak giysiler, balon ve sahne!', tag: 'parti', bg: 'sahne' },
  { id: 'spor', title: 'Spor günü', emoji: '⚽', desc: 'Rahat giysiler ve bir top.', tag: 'spor', bg: 'park' },
  { id: 'okul', title: 'Okulun ilk günü', emoji: '🎒', desc: 'Şık ve düzenli bir okul kombini.', tag: 'okul', bg: 'oda' },
];

/** Görevi tamamlamak için gereken uyumlu parça sayısı (arka plan da sayılır). */
export const THEME_GOAL = 5;

export const todayTheme = (profileId: string, now = new Date()) => THEMES[hashStr(`${dayKey(now)}|${profileId}|stil`) % THEMES.length];

const CATALOG: [keyof DollState, Item[]][] = [
  ['glasses', GLASSES],
  ['hat', HATS],
  ['hand', HANDS],
  ['shoes', SHOES],
  ['bg', BGS],
];

/** Kombinin temaya uyan parçaları (başlıklarıyla). */
export function themeMatches(d: DollState, t: Theme): string[] {
  const worn: [keyof DollState, Item[]][] = d.dress ? [['dress', DRESSES], ...CATALOG] : [['top', TOPS], ['bottom', BOTTOMS], ...CATALOG];
  const out: string[] = [];
  for (const [key, list] of worn) {
    const item = list.find((i) => i.id === d[key]);
    if (item && item.id && (key === 'bg' ? item.id === t.bg : item.tags?.includes(t.tag))) out.push(item.title);
  }
  return out;
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** "Şaşırt beni": görünüm (ten, saç tipi) aynı kalır, kıyafet ve eşyalar rastgele. */
export function randomOutfit(d: DollState): DollState {
  const dress = Math.random() < 0.3 ? pick(DRESSES.filter((x) => x.id)).id : '';
  return {
    ...d,
    face: pick(FACES).id,
    glasses: Math.random() < 0.35 ? pick(GLASSES.filter((x) => x.id)).id : '',
    top: pick(TOPS).id,
    topColor: pick(CLOTH_COLORS),
    bottom: pick(BOTTOMS).id,
    bottomColor: pick(CLOTH_COLORS),
    dress,
    dressColor: pick(CLOTH_COLORS),
    shoes: pick(SHOES).id,
    shoesColor: pick(CLOTH_COLORS),
    hat: Math.random() < 0.6 ? pick(HATS.filter((x) => x.id)).id : '',
    hatColor: pick(CLOTH_COLORS),
    hand: Math.random() < 0.6 ? pick(HANDS.filter((x) => x.id)).id : '',
    bg: pick(BGS).id,
  };
}
