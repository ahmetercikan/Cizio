/**
 * Koleksiyon: adada bulunan balıklar, fosiller, kabuklar ve böcekler.
 *
 * Balık tutunca, fosil kazınca, kumda hazine arayınca ya da şnorkelle dalınca rastgele bir parça
 * çıkar. Aynı parça ikinci kez çıkarsa "zaten var" denir, koleksiyona bir şey eklenmez. Bulunanlar
 * kasabadaki Müze'de camekânlarda sergilenir.
 *
 * Nadirlik yalnızca ne sıklıkta çıktığını belirler; kilit ya da para yok — her şey oynayarak bulunur.
 */

export type CollectGroup = 'balik' | 'fosil' | 'kabuk' | 'bocek';

export interface Collectible {
  id: string;
  name: string;
  group: CollectGroup;
  /** 1 sık, 2 orta, 3 nadir. */
  rare: 1 | 2 | 3;
  /** Camekândaki rengi. */
  color: string;
  /** Çocuğa söylenen kısa bilgi. */
  fact: string;
}

export const GROUPS: Record<CollectGroup, { name: string; icon: string; color: string }> = {
  balik: { name: 'Balıklar', icon: 'balik', color: '#3f7fe0' },
  fosil: { name: 'Fosiller', icon: 'sandik', color: '#c4874f' },
  kabuk: { name: 'Deniz Kabukları', icon: 'denizyildizi', color: '#e9a3b8' },
  bocek: { name: 'Böcekler', icon: 'ari', color: '#2bb673' },
};

export const COLLECTION: Collectible[] = [
  // ---- balıklar (iskelede olta, gölde ve denizde)
  { id: 'sazan', name: 'Sazan', group: 'balik', rare: 1, color: '#e8a33d', fact: 'Sazanlar gölün dibindeki çamurda yiyecek arar.' },
  { id: 'alabalik', name: 'Alabalık', group: 'balik', rare: 1, color: '#8fb6d6', fact: 'Alabalık akıntıya karşı yüzmeyi sever.' },
  { id: 'kirmizi', name: 'Kırmızı Balık', group: 'balik', rare: 1, color: '#ef4b4b', fact: 'Kırmızı balıklar üç saniyeden çok daha uzun hatırlar!' },
  { id: 'palyaco', name: 'Palyaço Balığı', group: 'balik', rare: 2, color: '#ff8a2b', fact: 'Palyaço balığı deniz şakayığının içinde saklanır.' },
  { id: 'vatoz', name: 'Vatoz', group: 'balik', rare: 2, color: '#9b8fb5', fact: 'Vatoz kanat çırpar gibi yüzer.' },
  { id: 'yunus', name: 'Yunus', group: 'balik', rare: 3, color: '#5bb8e8', fact: 'Yunuslar birbirine ıslıkla seslenir.' },
  { id: 'kopekbaligi', name: 'Köpek Balığı', group: 'balik', rare: 3, color: '#7d8da0', fact: 'Köpek balıkları dişlerini ömür boyu yeniler.' },
  { id: 'balina', name: 'Balina', group: 'balik', rare: 3, color: '#4a7fa8', fact: 'Mavi balina dünyanın en büyük canlısıdır.' },

  // ---- fosiller (dinozor vadisi, kum)
  { id: 'amonit', name: 'Amonit', group: 'fosil', rare: 1, color: '#b08968', fact: 'Amonit sarmal kabuklu, çok eski bir deniz canlısıdır.' },
  { id: 'trilobit', name: 'Trilobit', group: 'fosil', rare: 1, color: '#8d7355', fact: 'Trilobitler dinozorlardan bile önce yaşadı.' },
  { id: 'dis', name: 'Dinozor Dişi', group: 'fosil', rare: 2, color: '#e8dcc0', fact: 'Bir T-Rex dişi bir muz kadar uzun olabilir!' },
  { id: 'yumurta', name: 'Dinozor Yumurtası', group: 'fosil', rare: 2, color: '#f0e2c8', fact: 'Dinozor yumurtaları kuş yumurtasına benzer ama çok daha büyüktür.' },
  { id: 'pence', name: 'Raptor Pençesi', group: 'fosil', rare: 3, color: '#c9b79a', fact: 'Raptorun ayağındaki kocaman pençe orak gibi kıvrıktır.' },
  { id: 'kafatasi', name: 'Dinozor Kafatası', group: 'fosil', rare: 3, color: '#ded0b4', fact: 'Bir triseratopsun kafatası bir araba kadar olabilir.' },

  // ---- deniz kabukları (plaj, şnorkel)
  { id: 'istiridye', name: 'İstiridye', group: 'kabuk', rare: 1, color: '#e6ddd0', fact: 'İstiridyenin içinde bazen inci olur.' },
  { id: 'denizyildizi', name: 'Deniz Yıldızı', group: 'kabuk', rare: 1, color: '#ff9f6b', fact: 'Deniz yıldızı kopan kolunu yeniden uzatabilir.' },
  { id: 'salyangoz', name: 'Deniz Salyangozu', group: 'kabuk', rare: 1, color: '#f0c9a0', fact: 'Kabuğunu kulağına tutarsan denizi duyarsın derler.' },
  { id: 'mercan', name: 'Mercan Dalı', group: 'kabuk', rare: 2, color: '#ff8fb1', fact: 'Mercanlar taş gibi görünür ama canlıdır.' },
  { id: 'denizati', name: 'Denizatı Kabuğu', group: 'kabuk', rare: 2, color: '#d7a86e', fact: 'Denizatı yüzerken kuyruğuyla yosuna tutunur.' },
  { id: 'inci', name: 'İnci', group: 'kabuk', rare: 3, color: '#f7f3ec', fact: 'İnci bir kum tanesinin etrafında yıllarca büyür.' },

  // ---- böcekler (orman, çayır, bahçe)
  { id: 'ugurbocegi', name: 'Uğur Böceği', group: 'bocek', rare: 1, color: '#ef4b4b', fact: 'Uğur böceğinin benekleri yaşını göstermez!' },
  { id: 'kelebek', name: 'Kelebek', group: 'bocek', rare: 1, color: '#ffb100', fact: 'Kelebekler tatlıyı ayaklarıyla tadar.' },
  { id: 'ari', name: 'Bal Arısı', group: 'bocek', rare: 1, color: '#f6c445', fact: 'Bir arı bir kaşık bal için binlerce çiçeği gezer.' },
  { id: 'yusufcuk', name: 'Yusufçuk', group: 'bocek', rare: 2, color: '#4dc3e8', fact: 'Yusufçuk geri geri bile uçabilir.' },
  { id: 'atesbocegi', name: 'Ateş Böceği', group: 'bocek', rare: 2, color: '#d7f06a', fact: 'Ateş böceği karnındaki ışıkla konuşur.' },
  { id: 'sifonkelebek', name: 'Kırlangıç Kelebeği', group: 'bocek', rare: 3, color: '#8fd16f', fact: 'Kanatlarındaki kuyruklar kuş kuyruğuna benzediği için bu adı almış.' },
];

export const item = (id: string) => COLLECTION.find((c) => c.id === id);
export const byGroup = (g: CollectGroup) => COLLECTION.filter((c) => c.group === g);
export const TOTAL = COLLECTION.length;

/** Nadirliğe göre ağırlık: sık parçalar daha çok çıkar. */
const WEIGHT: Record<1 | 2 | 3, number> = { 1: 6, 2: 3, 3: 1 };

/** Bir gruptan rastgele parça (nadirlik ağırlıklı). */
export function roll(g: CollectGroup, rnd = Math.random()): Collectible {
  const list = byGroup(g);
  const total = list.reduce((s, c) => s + WEIGHT[c.rare], 0);
  let n = rnd * total;
  for (const c of list) {
    n -= WEIGHT[c.rare];
    if (n <= 0) return c;
  }
  return list[list.length - 1];
}

/** Bulunanların grup grup sayısı. */
export function counts(found: string[]): Record<CollectGroup, { have: number; all: number }> {
  const out = {} as Record<CollectGroup, { have: number; all: number }>;
  for (const g of Object.keys(GROUPS) as CollectGroup[]) {
    const list = byGroup(g);
    out[g] = { have: list.filter((c) => found.includes(c.id)).length, all: list.length };
  }
  return out;
}

/** Bulununca söylenecek cümle. */
export const foundLine = (c: Collectible, yeni: boolean) =>
  yeni ? `${c.name} buldun! ${c.fact} Müzeye koyuldu.` : `Yine bir ${c.name}! Bu zaten müzende var.`;

/** Müzedeki camekânda parçaya dokununca okunan cümle. */
export const caseLine = (c: Collectible) => `${c.name}. ${c.fact}`;
/** Boş camekâna dokununca. */
export const emptyCaseLine = (g: CollectGroup) => `Burası boş. ${GROUPS[g].name} bölümünde aradığını bulunca buraya gelecek!`;

/** Seslendirilecek cümleler. */
export const COLLECT_LINES: string[] = [...new Set([
  ...COLLECTION.flatMap((c) => [foundLine(c, true), foundLine(c, false), caseLine(c)]),
  ...(Object.keys(GROUPS) as CollectGroup[]).map(emptyCaseLine),
  'Müzene hoş geldin! Bulduğun her şey burada.',
  'Bütün koleksiyonu tamamladın! Sen gerçek bir kâşifsin!',
  'Bu iskelet milyonlarca yıl önce yaşamış bir dinozora ait. Kemikler taşa dönüşünce fosil olur!',
  'Küratör: Hoş geldin! Camekânlar şimdilik boş. Adada balık tut, fosil kaz, kabuk topla, böcek ara!',
  'Küratör: Bütün koleksiyonu tamamladın! Müzemizin en büyük kâşifi sensin!',
])];
