import { create } from "zustand";
import { RECITERS, SURAH_DATA } from "./quran-data";
import type { Surah, Reciter } from "./quran-types";

type RevelationFilter = "All" | "Meccan" | "Medinan";
type ViewMode = "list" | "grid";

interface AudioState {
  // Audio playback state
  currentSurah: Surah | null;
  isPlaying: boolean;
  currentReciter: string;
  isBuffering: boolean;

  // UI state - main page
  searchQuery: string;
  revelationFilter: RevelationFilter;
  viewMode: ViewMode;

  // UI state - panels
  isPlayerVisible: boolean;
  showSurahModal: boolean;
  surahModalNumber: number;
  showReciterPanel: boolean;
  isReciterPanelOpen: boolean;

  // Computed helpers
  filteredSurahs: () => Surah[];
  meccanCount: number;
  medinanCount: number;
  reciter: Reciter;

  // Audio actions
  play: (surahNumber: number) => void;
  playSurah: (surah: Surah) => void;
  setIsPlaying: (playing: boolean) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  setCurrentReciter: (reciterId: string) => void;
  setReciter: (reciter: Reciter) => void;
  setIsBuffering: (buffering: boolean) => void;
  nextSurah: () => void;
  prevSurah: () => void;
  togglePlay: () => void;

  // UI setters
  setSearchQuery: (query: string) => void;
  setRevelationFilter: (filter: RevelationFilter) => void;
  setViewMode: (mode: ViewMode) => void;

  // Player visibility
  showPlayer: () => void;
  hidePlayer: () => void;

  // Surah modal
  setShowSurahModal: (show: boolean) => void;
  setSurahModalNumber: (number: number) => void;
  openReadingModal: (surah: Surah) => void;
  closeReadingModal: () => void;
  readingModalSurah: Surah | null;

  // Reciter panel
  setShowReciterPanel: (show: boolean) => void;
  toggleReciterPanel: () => void;
}

/** Get surah info by surah number */
export function getSurahInfo(surahNumber: number) {
  return SURAH_DATA.find((s) => s.number === surahNumber);
}

export const useAudioStore = create<AudioState>((set, get) => {
  const meccanCount = SURAH_DATA.filter((s) => s.revelationType === "Meccan").length;
  const medinanCount = SURAH_DATA.filter((s) => s.revelationType === "Medinan").length;

  return {
    // Audio playback state
    currentSurah: null,
    isPlaying: false,
    currentReciter: RECITERS[0].id, // Mishary Alafasy default
    isBuffering: false,

    // UI state - main page
    searchQuery: "",
    revelationFilter: "All" as RevelationFilter,
    viewMode: "list" as ViewMode,

    // UI state - panels
    isPlayerVisible: false,
    showSurahModal: false,
    surahModalNumber: 1,
    showReciterPanel: false,
    isReciterPanelOpen: false,

    // Computed helpers
    filteredSurahs: () => {
      const { searchQuery, revelationFilter } = get();
      return SURAH_DATA.filter((surah) => {
        const matchesSearch =
          searchQuery === "" ||
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.arabicName.includes(searchQuery) ||
          surah.englishMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.number.toString() === searchQuery;

        const matchesFilter =
          revelationFilter === "All" || surah.revelationType === revelationFilter;

        return matchesSearch && matchesFilter;
      });
    },
    meccanCount,
    medinanCount,
    reciter: RECITERS[0],

    // Audio actions
    play: (surahNumber) => {
      const surahInfo = getSurahInfo(surahNumber);
      if (!surahInfo) return;
      set({
        currentSurah: surahInfo,
        isPlaying: true,
        isPlayerVisible: true,
        isBuffering: true,
      });
    },

    playSurah: (surah) => {
      set({
        currentSurah: surah,
        isPlaying: true,
        isPlayerVisible: true,
        isBuffering: true,
      });
    },

    setIsPlaying: (playing) => set({ isPlaying: playing }),

    pauseAudio: () => set({ isPlaying: false }),
    resumeAudio: () => set({ isPlaying: true }),

    setCurrentReciter: (reciterId) => {
      const reciterObj = RECITERS.find((r) => r.id === reciterId);
      set({ currentReciter: reciterId, reciter: reciterObj ?? RECITERS[0] });
    },

    setReciter: (reciter) => set({ currentReciter: reciter.id, reciter }),

    setIsBuffering: (buffering) => set({ isBuffering: buffering }),

    nextSurah: () => {
      const { currentSurah } = get();
      const currentNum = currentSurah?.number ?? 0;
      const nextNum = currentNum >= 114 ? 1 : currentNum + 1;
      const surahInfo = getSurahInfo(nextNum);
      if (!surahInfo) return;
      set({
        currentSurah: surahInfo,
        isPlaying: true,
        isBuffering: true,
      });
    },

    prevSurah: () => {
      const { currentSurah } = get();
      const currentNum = currentSurah?.number ?? 2;
      const prevNum = currentNum <= 1 ? 114 : currentNum - 1;
      const surahInfo = getSurahInfo(prevNum);
      if (!surahInfo) return;
      set({
        currentSurah: surahInfo,
        isPlaying: true,
        isBuffering: true,
      });
    },

    togglePlay: () => {
      const { isPlaying } = get();
      set({ isPlaying: !isPlaying });
    },

    // UI setters
    setSearchQuery: (query) => set({ searchQuery: query }),
    setRevelationFilter: (filter) => set({ revelationFilter: filter }),
    setViewMode: (mode) => set({ viewMode: mode }),

    // Player visibility
    showPlayer: () => set({ isPlayerVisible: true }),
    hidePlayer: () => set({ isPlayerVisible: false, isPlaying: false }),

    // Surah modal
    setShowSurahModal: (show) => set({ showSurahModal: show }),
    setSurahModalNumber: (number) => set({ surahModalNumber: number }),
    openReadingModal: (surah) =>
      set({
        showSurahModal: true,
        surahModalNumber: surah.number,
        readingModalSurah: surah,
      }),
    closeReadingModal: () =>
      set({ showSurahModal: false, readingModalSurah: null }),
    readingModalSurah: null,

    // Reciter panel
    setShowReciterPanel: (show) => set({ showReciterPanel: show }),
    toggleReciterPanel: () =>
      set((state) => ({
        showReciterPanel: !state.showReciterPanel,
        isReciterPanelOpen: !state.isReciterPanelOpen,
      })),
  };
});
