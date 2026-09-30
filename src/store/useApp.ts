/**
 * Uygulama durumu (profiller, ilerleme, ayarlar) — localStorage'da kalıcı.
 * Resimler burada değil, IndexedDB'de (lib/gallery.ts).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PathId } from '../lessons/types';
import { dayKey, streakOf, uid } from '../lib/util';
import { milestoneStickers } from '../stickers';
import { lessons as allLessons } from '../lessons';
import { questDone, todayQuest, type ChallengeKind } from '../lib/daily';
import { STATE_KEY } from '../lib/legacy';

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
  /** O gün kazanılan yıldızlar (haftalık lig için). */
  stars?: number;
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
  /** Güne göre tamamlanan meydan okumalar: "tür:dersId". */
  challenges?: Record<string, string[]>;
  /** Günün görevinin tamamlandığı günler. */
  quests?: string[];
  /** Meydan okuma rekorları: tür → en yüksek benzerlik yüzdesi. */
  records?: Record<string, number>;
  /** Çizio'nun giydiği kıyafet (maceralarda açılır). */
  outfit?: string;
  /** Oynanan / kazanılan düellolar. */
  duels?: number;
  duelWins?: number;
  /** Biten haftalık liglerin sıralaması: hafta anahtarı → sıra. */
  leagues?: Record<string, number>;
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
  recordChallenge(kind: ChallengeKind, lessonId: string, stars: number, percent: number): string[];
  /** Düello sonucu (oyuncu cihazdaki bir profilse). */
  recordDuel(profileId: string, stars: number, won: boolean): string[];
  setOutfit(outfit?: string): void;
  /** Biten haftanın lig sırasını kaydeder (kürsü çıkartmaları). */
  settleLeague(week: string, rank: number): string[];
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

/** Günün görevi bu güncellemeyle tamamlandıysa kaydeder. */
function withQuest(profile: Profile | undefined, d: ProfileData): ProfileData {
  if (!profile) return d;
  const k = dayKey();
  if (d.quests?.includes(k)) return d;
  return questDone(todayQuest(profile, d, allLessons), d) ? { ...d, quests: [...(d.quests ?? []), k] } : d;
}

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
          days: { ...d.days, [dayKey()]: { ...t, lessons: t.lessons + 1, minutes: t.minutes + minutes, drawings: t.drawings + 1, stars: (t.stars ?? 0) + stars } },
        };
        const profile = get().profiles.find((p) => p.id === activeId);
        const { data: withS, earned } = withStickers(withQuest(profile, next), [`lesson:${lessonId}`]);
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

      recordChallenge(kind, lessonId, stars, percent) {
        const { activeId, data } = get();
        if (!activeId) return [];
        const d = { ...emptyData(), ...data[activeId] };
        const k = dayKey();
        const t = today(d);
        const next: ProfileData = {
          ...d,
          challenges: { ...(d.challenges ?? {}), [k]: [...(d.challenges?.[k] ?? []), `${kind}:${lessonId}`] },
          records: { ...d.records, [kind]: Math.max(d.records?.[kind] ?? 0, percent) },
          days: { ...d.days, [k]: { ...t, drawings: t.drawings + 1, stars: (t.stars ?? 0) + stars } },
        };
        const profile = get().profiles.find((p) => p.id === activeId);
        const { data: withS, earned } = withStickers(withQuest(profile, next), []);
        set({ data: { ...data, [activeId]: withS } });
        return earned;
      },

      recordDuel(profileId, stars, won) {
        const { data } = get();
        if (!data[profileId]) return [];
        const d = { ...emptyData(), ...data[profileId] };
        const k = dayKey();
        const t = today(d);
        const next: ProfileData = {
          ...d,
          duels: (d.duels ?? 0) + 1,
          duelWins: (d.duelWins ?? 0) + (won ? 1 : 0),
          days: { ...d.days, [k]: { ...t, drawings: t.drawings + 1, stars: (t.stars ?? 0) + stars } },
        };
        const { data: withS, earned } = withStickers(next, []);
        set({ data: { ...get().data, [profileId]: withS } });
        return earned;
      },

      setOutfit(outfit) {
        const { activeId, data } = get();
        if (!activeId) return;
        set({ data: { ...data, [activeId]: { ...emptyData(), ...data[activeId], outfit } } });
      },

      settleLeague(week, rank) {
        const { activeId, data } = get();
        if (!activeId) return [];
        const d = { ...emptyData(), ...data[activeId] };
        if (d.leagues?.[week]) return [];
        const { data: withS, earned } = withStickers({ ...d, leagues: { ...d.leagues, [week]: rank } }, []);
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
      name: STATE_KEY,
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
