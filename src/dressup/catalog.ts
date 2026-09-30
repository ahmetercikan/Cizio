/**
 * Karakter giydirme kataloğu: karakter durumu, hazır karakterler, giysiler, renkler, desenler ve stil görevleri.
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
  /** Sonradan eklenen alanlar (eski kayıtlarda olmayabilir). */
  pet?: string;
  topPattern?: string;
  bottomPattern?: string;
  dressPattern?: string;
}

export const SKINS = ['#ffe3cc', '#f6c9a0', '#e5a878', '#d99a6c', '#c68653', '#a86b43', '#8d5a36', '#5e3b24'];
export const HAIR_COLORS = ['#2b2220', '#5a3420', '#9a6234', '#e8b64c', '#f4e3b5', '#c8452c', '#ff8fb1', '#9b6bff', '#5b8def', '#2bb673', '#b9b3c9'];
export const CLOTH_COLORS = ['#ff6b4a', '#ffc83d', '#2bb673', '#14a89a', '#5b8def', '#1d3557', '#9b6bff', '#ff8fb1', '#e9487d', '#ffffff', '#b9c6cc', '#3a2b27', '#8c5a2b', '#9be7de', '#fff1c7'];

export interface Item {
  id: string;
  title: string;
  /** Stil görevleri için etiketler. */
  tags?: string[];
}

export const HAIRS: Item[] = [
  { id: 'kazima', title: 'Kısacık' },
  { id: 'kisa', title: 'Kısa' },
  { id: 'yan', title: 'Yana taralı' },
  { id: 'kakul', title: 'Kaküllü' },
  { id: 'dikenli', title: 'Dikenli' },
  { id: 'kivircik', title: 'Kıvırcık' },
  { id: 'afro', title: 'Afro' },
  { id: 'kut', title: 'Küt' },
  { id: 'uzun', title: 'Uzun' },
  { id: 'dalgali', title: 'Dalgalı' },
  { id: 'uzunkivircik', title: 'Uzun kıvırcık' },
  { id: 'atkuyrugu', title: 'At kuyruğu' },
  { id: 'ikikuyruk', title: 'İki kuyruk' },
  { id: 'topuz', title: 'İki topuz' },
  { id: 'tepetopuz', title: 'Tepe topuzu' },
  { id: 'orgu', title: 'Örgülü' },
  { id: 'yanorgu', title: 'Yan örgü' },
];

export const FACES: Item[] = [
  { id: 'mutlu', title: 'Mutlu' },
  { id: 'gulus', title: 'Kahkaha' },
  { id: 'kirp', title: 'Göz kırpan' },
  { id: 'saskin', title: 'Şaşkın' },
  { id: 'havali', title: 'Havalı' },
  { id: 'utangac', title: 'Utangaç' },
  { id: 'dil', title: 'Dil çıkaran' },
  { id: 'asik', title: 'Kalp gözlü' },
  { id: 'kararli', title: 'Kararlı' },
  { id: 'uykulu', title: 'Uykulu' },
];

export const GLASSES: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'yuvarlak', title: 'Yuvarlak', tags: ['okul'] },
  { id: 'kare', title: 'Kare', tags: ['okul'] },
  { id: 'yildiz', title: 'Yıldız', tags: ['parti'] },
  { id: 'kalp', title: 'Kalp', tags: ['parti'] },
  { id: 'gunes', title: 'Güneş gözlüğü', tags: ['yaz'] },
  { id: 'kayak', title: 'Kayak gözlüğü', tags: ['kis', 'uzay'] },
];

export const TOPS: Item[] = [
  { id: 'tisort', title: 'Tişört', tags: ['yaz'] },
  { id: 'yildizli', title: 'Yıldızlı tişört', tags: ['parti', 'uzay'] },
  { id: 'kalpli', title: 'Kalpli tişört', tags: ['parti'] },
  { id: 'atlet', title: 'Atlet', tags: ['yaz', 'spor'] },
  { id: 'hawaii', title: 'Çiçekli gömlek', tags: ['yaz'] },
  { id: 'forma', title: 'Forma', tags: ['spor'] },
  { id: 'gomlek', title: 'Gömlek', tags: ['okul'] },
  { id: 'yelek', title: 'Örgü yelek', tags: ['okul', 'kis'] },
  { id: 'kazak', title: 'Çizgili kazak', tags: ['kis', 'okul'] },
  { id: 'balikci', title: 'Balıkçı yaka', tags: ['kis'] },
  { id: 'kapsonlu', title: 'Kapüşonlu', tags: ['kis', 'spor'] },
  { id: 'ceket', title: 'Kot ceket', tags: ['okul', 'doga'] },
];

export const BOTTOMS: Item[] = [
  { id: 'pantolon', title: 'Pantolon', tags: ['kis', 'okul'] },
  { id: 'kot', title: 'Kot pantolon', tags: ['okul', 'doga'] },
  { id: 'esofman', title: 'Eşofman', tags: ['spor', 'kis'] },
  { id: 'tayt', title: 'Tayt', tags: ['spor'] },
  { id: 'sort', title: 'Şort', tags: ['yaz', 'spor'] },
  { id: 'kargo', title: 'Kargo şort', tags: ['doga', 'yaz'] },
  { id: 'etek', title: 'Etek', tags: ['okul', 'parti'] },
  { id: 'uzunetek', title: 'Uzun etek', tags: ['masal', 'okul'] },
  { id: 'tutu', title: 'Tütü', tags: ['parti', 'masal'] },
];

export const DRESSES: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'yazlik', title: 'Yazlık elbise', tags: ['yaz'] },
  { id: 'prenses', title: 'Balo elbisesi', tags: ['parti', 'masal'] },
  { id: 'balerin', title: 'Balerin', tags: ['masal', 'parti'] },
  { id: 'tulum', title: 'Tulum', tags: ['okul', 'doga'] },
  { id: 'pijama', title: 'Pijama', tags: ['kis'] },
  { id: 'yagmurluk', title: 'Yağmurluk', tags: ['doga', 'kis'] },
  { id: 'ressam', title: 'Ressam önlüğü', tags: ['okul'] },
  { id: 'doktor', title: 'Doktor', tags: ['okul'] },
  { id: 'astronot', title: 'Astronot', tags: ['uzay'] },
  { id: 'sovalye', title: 'Şövalye', tags: ['masal'] },
  { id: 'kahraman', title: 'Süper kahraman', tags: ['parti', 'spor', 'uzay'] },
];

export const SHOES: Item[] = [
  { id: 'spor', title: 'Spor ayakkabı', tags: ['spor', 'okul'] },
  { id: 'bilekli', title: 'Bilekli spor', tags: ['spor', 'uzay'] },
  { id: 'babet', title: 'Parlak ayakkabı', tags: ['parti', 'okul', 'masal'] },
  { id: 'sandalet', title: 'Sandalet', tags: ['yaz'] },
  { id: 'bot', title: 'Bot', tags: ['kis', 'doga'] },
  { id: 'cizme', title: 'Yağmur çizmesi', tags: ['kis', 'doga'] },
  { id: 'kovboy', title: 'Kovboy çizmesi', tags: ['doga'] },
  { id: 'paten', title: 'Paten', tags: ['spor', 'parti'] },
  { id: 'terlik', title: 'Tavşan terlik', tags: ['kis'] },
];

export const HATS: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'kep', title: 'Kep', tags: ['spor', 'yaz'] },
  { id: 'hasir', title: 'Hasır şapka', tags: ['yaz', 'doga'] },
  { id: 'yunbere', title: 'Yün bere', tags: ['kis'] },
  { id: 'kovboy', title: 'Kovboy şapkası', tags: ['doga'] },
  { id: 'fiyonk', title: 'Fiyonk', tags: ['parti', 'okul'] },
  { id: 'tokalar', title: 'Tokalar', tags: ['okul'] },
  { id: 'cicek', title: 'Çiçek tokası', tags: ['yaz', 'doga'] },
  { id: 'kulaklik', title: 'Kulaklık', tags: ['spor'] },
  { id: 'kedikulak', title: 'Kedi kulakları', tags: ['parti'] },
  { id: 'anten', title: 'Uzaylı anteni', tags: ['uzay'] },
  { id: 'parti', title: 'Parti şapkası', tags: ['parti'] },
  { id: 'tac', title: 'Taç', tags: ['parti', 'masal'] },
  { id: 'unicorn', title: 'Unicorn boynuzu', tags: ['masal', 'parti'] },
  { id: 'sihirbaz', title: 'Sihirbaz şapkası', tags: ['masal'] },
  { id: 'korsan', title: 'Korsan şapkası', tags: ['masal'] },
  { id: 'sef', title: 'Aşçı şapkası', tags: ['okul'] },
];

export const HANDS: Item[] = [
  { id: '', title: 'Boş' },
  { id: 'balon', title: 'Balon', tags: ['parti'] },
  { id: 'dondurma', title: 'Dondurma', tags: ['yaz'] },
  { id: 'pamuk', title: 'Pamuk şeker', tags: ['parti', 'yaz'] },
  { id: 'kitap', title: 'Kitap', tags: ['okul'] },
  { id: 'firca', title: 'Fırça', tags: ['okul'] },
  { id: 'top', title: 'Top', tags: ['spor', 'yaz'] },
  { id: 'kupa', title: 'Sıcak kakao', tags: ['kis'] },
  { id: 'semsiye', title: 'Şemsiye', tags: ['doga', 'kis'] },
  { id: 'ucurtma', title: 'Uçurtma', tags: ['yaz', 'doga'] },
  { id: 'buket', title: 'Çiçek buketi', tags: ['masal', 'parti'] },
  { id: 'asa', title: 'Sihirli değnek', tags: ['masal'] },
  { id: 'mikrofon', title: 'Mikrofon', tags: ['parti'] },
  { id: 'roket', title: 'Oyuncak roket', tags: ['uzay'] },
];

export const PETS: Item[] = [
  { id: '', title: 'Yok' },
  { id: 'kedi', title: 'Kedi', tags: ['okul'] },
  { id: 'kopek', title: 'Köpek', tags: ['spor', 'doga'] },
  { id: 'tavsan', title: 'Tavşan', tags: ['masal'] },
  { id: 'kus', title: 'Kuş', tags: ['doga'] },
  { id: 'kaplumbaga', title: 'Kaplumbağa', tags: ['yaz'] },
  { id: 'dino', title: 'Oyuncak dino', tags: ['uzay'] },
];

export const BGS: Item[] = [
  { id: 'oda', title: 'Oda', tags: ['kis'] },
  { id: 'sinif', title: 'Sınıf', tags: ['okul'] },
  { id: 'park', title: 'Park', tags: ['spor'] },
  { id: 'orman', title: 'Orman', tags: ['doga'] },
  { id: 'sehir', title: 'Şehir' },
  { id: 'plaj', title: 'Plaj', tags: ['yaz'] },
  { id: 'denizalti', title: 'Deniz altı', tags: ['yaz'] },
  { id: 'kar', title: 'Karlı gün', tags: ['kis'] },
  { id: 'sahne', title: 'Sahne', tags: ['parti'] },
  { id: 'sato', title: 'Şato', tags: ['masal'] },
  { id: 'gece', title: 'Yıldızlı gece', tags: ['uzay'] },
  { id: 'uzay', title: 'Uzay', tags: ['uzay'] },
];

export const PATTERNS: Item[] = [
  { id: 'duz', title: 'Düz' },
  { id: 'cizgili', title: 'Çizgili' },
  { id: 'puantiye', title: 'Puantiyeli' },
  { id: 'kareli', title: 'Kareli' },
  { id: 'yildiz', title: 'Yıldızlı' },
  { id: 'kalp', title: 'Kalpli' },
  { id: 'cicek', title: 'Çiçekli' },
];

const base = { face: 'mutlu', freckles: false, glasses: '', dress: '', dressColor: '#ff8fb1', hat: '', hatColor: '#ff6b4a', hand: '', bg: 'oda', pet: '' };

/** Hazır karakterler: farklı ten, saç tipi ve rengi (hepsi sonradan değiştirilebilir). */
export const PRESETS: DollState[] = [
  { ...base, gender: 'kiz', name: 'Alya', skin: SKINS[0], hair: 'uzun', hairColor: HAIR_COLORS[3], top: 'yildizli', topColor: '#ff8fb1', bottom: 'etek', bottomColor: '#5b8def', shoes: 'babet', shoesColor: '#e9487d', hat: 'fiyonk', hatColor: '#ff6b4a' },
  { ...base, gender: 'kiz', name: 'Zeynep', skin: SKINS[2], hair: 'atkuyrugu', hairColor: HAIR_COLORS[1], top: 'kazak', topColor: '#14a89a', bottom: 'pantolon', bottomColor: '#5b8def', shoes: 'spor', shoesColor: '#ffffff' },
  { ...base, gender: 'kiz', name: 'Azra', skin: SKINS[6], hair: 'topuz', hairColor: HAIR_COLORS[0], top: 'tisort', topColor: '#ffc83d', bottom: 'sort', bottomColor: '#9b6bff', shoes: 'sandalet', shoesColor: '#ff6b4a', face: 'gulus' },
  { ...base, gender: 'kiz', name: 'Güneş', skin: SKINS[1], hair: 'kut', hairColor: HAIR_COLORS[5], freckles: true, glasses: 'yuvarlak', top: 'gomlek', topColor: '#ffffff', bottom: 'etek', bottomColor: '#2bb673', bottomPattern: 'kareli', shoes: 'bot', shoesColor: '#8c5a2b' },
  { ...base, gender: 'kiz', name: 'Ada', skin: SKINS[3], hair: 'dalgali', hairColor: HAIR_COLORS[0], top: 'hawaii', topColor: '#14a89a', bottom: 'kot', bottomColor: '#5b8def', shoes: 'bilekli', shoesColor: '#ff8fb1', hat: 'cicek', hatColor: '#ffc83d', face: 'utangac', bg: 'park' },
  { ...base, gender: 'kiz', name: 'Nehir', skin: SKINS[7], hair: 'uzunkivircik', hairColor: HAIR_COLORS[1], top: 'kalpli', topColor: '#9b6bff', bottom: 'tutu', bottomColor: '#ff8fb1', shoes: 'babet', shoesColor: '#ffc83d', face: 'dil', bg: 'sahne' },
  { ...base, gender: 'erkek', name: 'Yusuf', skin: SKINS[1], hair: 'yan', hairColor: HAIR_COLORS[1], top: 'tisort', topColor: '#5b8def', bottom: 'pantolon', bottomColor: '#3a2b27', shoes: 'spor', shoesColor: '#ff6b4a' },
  { ...base, gender: 'erkek', name: 'Ali', skin: SKINS[4], hair: 'dikenli', hairColor: HAIR_COLORS[0], top: 'forma', topColor: '#ff6b4a', bottom: 'sort', bottomColor: '#ffffff', shoes: 'spor', shoesColor: '#ffc83d', hat: 'kep', hatColor: '#14a89a' },
  { ...base, gender: 'erkek', name: 'Ahmet', skin: SKINS[0], hair: 'kivircik', hairColor: HAIR_COLORS[5], freckles: true, top: 'kapsonlu', topColor: '#2bb673', bottom: 'pantolon', bottomColor: '#8c5a2b', shoes: 'bot', shoesColor: '#3a2b27', face: 'kirp' },
  { ...base, gender: 'erkek', name: 'Batuhan', skin: SKINS[7], hair: 'afro', hairColor: HAIR_COLORS[0], glasses: 'yuvarlak', bg: 'park', top: 'gomlek', topColor: '#9be7de', bottom: 'pantolon', bottomColor: '#5b8def', shoes: 'babet', shoesColor: '#3a2b27' },
  { ...base, gender: 'erkek', name: 'Emir', skin: SKINS[5], hair: 'kazima', hairColor: HAIR_COLORS[0], top: 'balikci', topColor: '#ffc83d', bottom: 'kot', bottomColor: '#1d3557', shoes: 'bilekli', shoesColor: '#ff6b4a', face: 'kararli', bg: 'sehir' },
  { ...base, gender: 'erkek', name: 'Can', skin: SKINS[2], hair: 'kakul', hairColor: HAIR_COLORS[3], glasses: 'kare', top: 'yelek', topColor: '#ff6b4a', bottom: 'kargo', bottomColor: '#8c5a2b', shoes: 'spor', shoesColor: '#5b8def', pet: 'kopek', bg: 'park' },
];

// ------------------------------------------------------------------------------------------------
// Stil görevleri
// ------------------------------------------------------------------------------------------------
export interface Theme {
  id: string;
  title: string;
  desc: string;
  tag: string;
  bg: string;
}

export const THEMES: Theme[] = [
  { id: 'plaj', title: 'Plaj günü', desc: 'Yazlık giysiler, güneş gözlüğü ve plaj!', tag: 'yaz', bg: 'plaj' },
  { id: 'kis', title: 'Kar tatili', desc: 'Sıcacık giysiler ve karlı bir gün.', tag: 'kis', bg: 'kar' },
  { id: 'parti', title: 'Doğum günü partisi', desc: 'Parlak giysiler, balon ve sahne!', tag: 'parti', bg: 'sahne' },
  { id: 'spor', title: 'Spor günü', desc: 'Rahat giysiler ve bir top.', tag: 'spor', bg: 'park' },
  { id: 'okul', title: 'Okulun ilk günü', desc: 'Şık ve düzenli bir okul kombini.', tag: 'okul', bg: 'sinif' },
  { id: 'uzay', title: 'Uzay yolculuğu', desc: 'Astronot giysisi, anten ve yıldızlar!', tag: 'uzay', bg: 'uzay' },
  { id: 'masal', title: 'Masal diyarı', desc: 'Taçlar, değnekler ve bir şato.', tag: 'masal', bg: 'sato' },
  { id: 'kamp', title: 'Orman kampı', desc: 'Doğa yürüyüşüne uygun giysiler.', tag: 'doga', bg: 'orman' },
];

/** Görevi tamamlamak için gereken uyumlu parça sayısı (arka plan da sayılır). */
export const THEME_GOAL = 5;

export const todayTheme = (profileId: string, now = new Date()) => THEMES[hashStr(`${dayKey(now)}|${profileId}|stil`) % THEMES.length];

const EXTRAS: [keyof DollState, Item[]][] = [
  ['glasses', GLASSES],
  ['hat', HATS],
  ['hand', HANDS],
  ['shoes', SHOES],
  ['pet', PETS],
  ['bg', BGS],
];

/** Kombinin temaya uyan parçaları (başlıklarıyla). */
export function themeMatches(d: DollState, t: Theme): string[] {
  const worn: [keyof DollState, Item[]][] = d.dress ? [['dress', DRESSES], ...EXTRAS] : [['top', TOPS], ['bottom', BOTTOMS], ...EXTRAS];
  const out: string[] = [];
  for (const [key, list] of worn) {
    const item = list.find((i) => i.id === (d[key] ?? ''));
    if (item && item.id && (key === 'bg' ? item.id === t.bg : item.tags?.includes(t.tag))) out.push(item.title);
  }
  return out;
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const pickPattern = () => (Math.random() < 0.55 ? 'duz' : pick(PATTERNS).id);

/** "Şaşırt beni": görünüm (ten, saç tipi) aynı kalır, kıyafet ve eşyalar rastgele. */
export function randomOutfit(d: DollState): DollState {
  const dress = Math.random() < 0.3 ? pick(DRESSES.filter((x) => x.id)).id : '';
  return {
    ...d,
    face: pick(FACES).id,
    glasses: Math.random() < 0.35 ? pick(GLASSES.filter((x) => x.id)).id : '',
    top: pick(TOPS).id,
    topColor: pick(CLOTH_COLORS),
    topPattern: pickPattern(),
    bottom: pick(BOTTOMS).id,
    bottomColor: pick(CLOTH_COLORS),
    bottomPattern: pickPattern(),
    dress,
    dressColor: pick(CLOTH_COLORS),
    dressPattern: pickPattern(),
    shoes: pick(SHOES).id,
    shoesColor: pick(CLOTH_COLORS),
    hat: Math.random() < 0.6 ? pick(HATS.filter((x) => x.id)).id : '',
    hatColor: pick(CLOTH_COLORS),
    hand: Math.random() < 0.6 ? pick(HANDS.filter((x) => x.id)).id : '',
    pet: Math.random() < 0.4 ? pick(PETS.filter((x) => x.id)).id : '',
    bg: pick(BGS).id,
  };
}
