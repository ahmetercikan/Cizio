/**
 * Uygulama durumu (profiller, ilerleme, ayarlar) — localStorage'da kalıcı.
 * Resimler burada değil, IndexedDB'de (lib/gallery.ts).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PathId } from '../lessons/types';
import { dayKey, streakOf, uid } from '../lib/util';
import { milestoneStickers } from '../stickers';

export type DrawMode = 'screen' | 'paper';
/** Ekranda çizimde yardım seviyesi: iz sür → noktalar → kendin çiz (azalan iskele). */
export type Scaffold = 'trace' | 'dots' | 'free';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  favoritePath: PathId;
  createdAt: number;
}

export interface LessonProgress {
  bestStars: number;
  completions: number;
  lastAt: number;
  /** En iyi yıldız hangi yardım seviyesinde alındı. */
  bestScaffold?: Scaffold | 'paper';
}

export interface DayActivity {
  lessons: number;
  minutes: number;
  drawings: number;
}

export interface ProfileData {
  lessons: Record<string, LessonProgress>;
  /** Kalp ile işaretlenen dersler ("Favorilerim"). */
  favorites: string[];
  stickers: string[];
  /** Yeni kazanılan ama henüz gösterilmemiş çıkartmalar. */
  newStickers: string[];
  days: Record<string, DayActivity>;
  paperCount: number;
  freeCount: number;
}

export interface Settings {
  narration: boolean;
  rate: number;
  voiceURI?: string;
  sfx: boolean;
  /** Kalem algılanınca parmak dokunuşlarını yok say (avuç içi reddi). */
  palmRejection: boolean;
  leftHanded: boolean;
  /** Önceden kaydedilmiş doğal (insan benzeri) ses; kapalıysa cihazın konuşma sentezi. */
  naturalVoice: boolean;
  /** Ders animasyon hızı. */
  speed: number;
  /** Yeni ders varsayılanı: kâğıtta mı ekranda mı? */
  defaultMode: 'paper' | 'screen';
}

export interface CompleteInput {
  lessonId: string;
  stars: number;
  scaffold: Scaffold | 'paper';
  minutes: number;
}

interface AppState {
  profiles: Profile[];
  activeId?: string;
  data: Record<string, ProfileData>;
  settings: Settings;

  addProfile(p: Omit<Profile, 'id' | 'createdAt'>): string;
  updateProfile(id: string, patch: Partial<Profile>): void;
  removeProfile(id: string): void;
  setActive(id?: string): void;
  completeLesson(c: CompleteInput): string[];
  recordDrawing(kind: 'paper' | 'free'): string[];
  consumeNewStickers(): void;
  toggleFavorite(lessonId: string): void;
  updateSettings(patch: Partial<Settings>): void;
  replaceAll(s: Pick<AppState, 'profiles' | 'data' | 'settings' | 'activeId'>): void;
}

const emptyData = (): ProfileData => ({ lessons: {}, favorites: [], stickers: [], newStickers: [], days: {}, paperCount: 0, freeCount: 0 });

export const DEFAULT_SETTINGS: Settings = {
  narration: true,
  rate: 0.95,
  sfx: true,
  palmRejection: true,
  leftHanded: false,
  naturalVoice: true,
  speed: 1,
  defaultMode: 'paper',
};

const today = (d: ProfileData): DayActivity => d.days[dayKey()] ?? { lessons: 0, minutes: 0, drawings: 0 };

function withStickers(d: ProfileData, extra: string[]): { data: ProfileData; earned: string[] } {
  const candidates = [...extra, ...milestoneStickers(d, streakOf(d.days))];
  const earned = candidates.filter((s, i) => !d.stickers.includes(s) && candidates.indexOf(s) === i);
  return {
    data: { ...d, stickers: [...d.stickers, ...earned], newStickers: [...d.newStickers, ...earned] },
    earned,
  };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      data: {},
      settings: DEFAULT_SETTINGS,

      addProfile(p) {
        const id = uid();
        set((s) => ({
          profiles: [...s.profiles, { ...p, id, createdAt: Date.now() }],
          data: { ...s.data, [id]: emptyData() },
          activeId: id,
        }));
        return id;
      },
      updateProfile(id, patch) {
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
      },
      removeProfile(id) {
        set((s) => {
          const data = { ...s.data };
          delete data[id];
          const profiles = s.profiles.filter((p) => p.id !== id);
          return { profiles, data, activeId: s.activeId === id ? profiles[0]?.id : s.activeId };
        });
      },
      setActive(id) {
        set({ activeId: id });
      },

      completeLesson({ lessonId, stars, scaffold, minutes }) {
        const { activeId, data } = get();
        if (!activeId) return [];
        const d = data[activeId] ?? emptyData();
        const prev = d.lessons[lessonId];
        const better = !prev || stars >= prev.bestStars;
        const t = today(d);
        const next: ProfileData = {
          ...d,
          lessons: {
            ...d.lessons,
            [lessonId]: {
              bestStars: Math.max(prev?.bestStars ?? 0, stars),
              completions: (prev?.completions ?? 0) + 1,
              lastAt: Date.now(),
              bestScaffold: better ? scaffold : prev?.bestScaffold,
            },
          },
          paperCount: d.paperCount + (scaffold === 'paper' ? 1 : 0),
          days: { ...d.days, [dayKey()]: { ...t, lessons: t.lessons + 1, minutes: t.minutes + minutes, drawings: t.drawings + 1 } },
        };
        const { data: withS, earned } = withStickers(next, [`lesson:${lessonId}`]);
        set({ data: { ...data, [activeId]: withS } });
        return earned;
      },

      recordDrawing(kind) {
        const { activeId, data } = get();
        if (!activeId) return [];
        const d = data[activeId] ?? emptyData();
        const t = today(d);
        const next: ProfileData = {
          ...d,
          paperCount: d.paperCount + (kind === 'paper' ? 1 : 0),
          freeCount: d.freeCount + (kind === 'free' ? 1 : 0),
          days: { ...d.days, [dayKey()]: { ...t, drawings: t.drawings + 1 } },
        };
        const { data: withS, earned } = withStickers(next, []);
        set({ data: { ...data, [activeId]: withS } });
        return earned;
      },

      consumeNewStickers() {
        const { activeId, data } = get();
        if (!activeId || !data[activeId]) return;
        set({ data: { ...data, [activeId]: { ...data[activeId], newStickers: [] } } });
      },

      toggleFavorite(lessonId) {
        const { activeId, data } = get();
        if (!activeId) return;
        const d = { ...emptyData(), ...data[activeId] };
        const favorites = d.favorites.includes(lessonId) ? d.favorites.filter((x) => x !== lessonId) : [lessonId, ...d.favorites];
        set({ data: { ...data, [activeId]: { ...d, favorites } } });
      },

      updateSettings(patch) {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      replaceAll(s) {
        set(s);
      },
    }),
    {
      name: 'ciziktir-v1',
      version: 2,
      // v1 → v2: favoriler ve yeni ayarlar eklendi.
      migrate: (persisted, version) => {
        const st = persisted as AppState;
        if (version < 2) {
          st.settings = { ...DEFAULT_SETTINGS, ...st.settings };
          for (const k of Object.keys(st.data ?? {})) st.data[k] = { ...emptyData(), ...st.data[k] };
        }
        return st;
      },
    },
  ),
);

export const useProfile = () => useApp((s) => s.profiles.find((p) => p.id === s.activeId));
const EMPTY = emptyData();
export const useProfileData = (): ProfileData => {
  const d = useApp((s) => (s.activeId ? s.data[s.activeId] : undefined));
  return d ? (d.favorites ? d : { ...EMPTY, ...d }) : EMPTY;
};
export { emptyData };
