/**
 * Ders içerik formatı.
 *
 * Tüm çizimler 400x400'lük bir koordinat alanında (viewBox="0 0 400 400") SVG path verisi olarak tanımlanır.
 * Her adım, çizime eklenen yeni şekilleri ve Kalemo'nun sesli söyleyeceği yönergeyi içerir.
 */
export type PathId = 'temeller' | 'hayvanlar' | 'nesneler' | 'doga' | 'karakterler' | 'deniz' | 'dinozor' | 'tasitlar' | 'ozel';

export interface Shape {
  /** SVG path verisi, 400x400 alanda. */
  d: string;
  /** Parçanın adı (geri bildirimde kullanılır): "kulaklar", "kuyruk"... */
  part?: string;
  /** Boyalı örnekte bu şeklin dolgu rengi (kapalı şekiller için). */
  fill?: string;
  /** Yardımcı çizgi: kesikli gösterilir, puanlanmaz. */
  guide?: boolean;
}

export interface Step {
  /** Sesli anlatım ve ekrandaki yönerge (Türkçe, kısa, 7-9 yaşa uygun). */
  say: string;
  /** Bu adımda eklenen şekiller. */
  shapes: Shape[];
  /** Gölgelendirme adımlarında kalemin yapacağı taramalar (otomatik üretilir, ders dosyasına yazılmaz). */
  hatch?: HatchPass[];
  /** Dağıtma (yumuşatma) adımı: taramalar kâğıt kalemle yumuşak tona dönüştürülür. */
  blend?: BlendPass[];
}

/** Işık yönü: ışıklı taraftan (x1,y1) gölgeli tarafa (x2,y2) doğru; 400'lük alanda. */
export type LightAxis = [number, number, number, number];

export interface BlendPass {
  target: Shape;
  opacity: number;
  axis: LightAxis;
}

/** Bir tarama geçişi: hedef şeklin içinde zikzak kalem hareketi. */
export interface HatchPass {
  target: Shape;
  /** Zikzak tarama path'i. */
  d: string;
  width: number;
  opacity: number;
  /** Ton geçişi: ışıklı uçta görünürlük `from`, gölgeli uçta `to` (0..1). */
  axis?: LightAxis;
  from?: number;
  to?: number;
}

export interface Lesson {
  id: string;
  path: PathId;
  title: string;
  emoji: string;
  /** Yol içindeki sıra (küçük olan önce). */
  order?: number;
  /** 1 kolay, 2 orta, 3 zor */
  level: 1 | 2 | 3;
  /** Ders sonunda gösterilen kısa ipucu / öğrenilen beceri. */
  skill: string;
  steps: Step[];
  /** Boyama adımı için önerilen renkler. */
  palette?: string[];
}

export interface LearningPath {
  id: PathId;
  title: string;
  emoji: string;
  color: string;
  description: string;
}
