import { create } from "zustand";
import { RECITERS, AUDIO_QUALITIES, SURAH_DATA } from "./quran-data";
import type { Surah, Reciter } from "./quran-types";

type RevelationFilter = "All" | "Meccan" | "Medinan";
type ViewMode = "list" | "grid";

interface AudioState {
  // Audio playback state
  currentSurah: Surah | null;
  isPlaying: boolean;
  currentAyahInSurah: number;
  totalAyahsInSurah: number;
  volume: number;
  audioQuality: string;
  currentReciter: string;
  isBuffering: boolean;

  // Surah-level timing (stored in Zustand to avoid setState in effects)
  accumulatedTime: number;
  currentAyahTime: number;
  currentAyahDuration: number;
  ayahDurations: number[];

  // UI state - main page
  searchQuery: string;
  revelationFilter: RevelationFilter;
  viewMode: ViewMode;

  // UI state - panels
  isPlayerVisible: boolean;
  showSurahModal: boolean;
  surahModalNumber: number;
  showReciterPanel: boolean;

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
  setCurrentAyahInSurah: (ayah: number) => void;
  setVolume: (volume: number) => void;
  setAudioQuality: (quality: string) => void;
  setCurrentReciter: (reciterId: string) => void;
  setReciter: (reciter: Reciter) => void;
  setIsBuffering: (buffering: boolean) => void;
  nextSurah: () => void;
  prevSurah: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;

  // Timing actions
  setCurrentAyahTime: (time: number) => void;
  setCurrentAyahDuration: (duration: number) => void;
  addAyahDuration: (ayahIndex: number, duration: number) => void;
  advanceToNextAyah: () => void;
  seekToAyah: (ayahNumber: number) => void;
  resetTiming: () => void;

  // Player visibility
  showPlayer: () => void;
  hidePlayer: () => void;

  // Surah modal
  setShowSurahModal: (show: boolean) => void;
  setSurahModalNumber: (number: number) => void;
  openReadingModal: (surah: Surah) => void;
  closeReadingModal: () => void;
  readingModalSurah: Surah | null;

  // UI filter actions
  setSearchQuery: (query: string) => void;
  setRevelationFilter: (filter: RevelationFilter) => void;
  setViewMode: (mode: ViewMode) => void;

  // Reciter panel
  setShowReciterPanel: (show: boolean) => void;
  toggleReciterPanel: () => void;
  isReciterPanelOpen: boolean;
}

/** Get the absolute ayah number for the first ayah of a given surah */
export function getStartingAyahNumber(surahNumber: number): number {
  let total = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    total += SURAH_DATA[i].ayahCount;
  }
  return total + 1;
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
    currentAyahInSurah: 1,
    totalAyahsInSurah: 7,
    volume: 0.8,
    audioQuality: AUDIO_QUALITIES[1].value, // 128 kbps default
    currentReciter: RECITERS[0].id, // Mishary Alafasy default
    isBuffering: false,

    // Surah-level timing
    accumulatedTime: 0,
    currentAyahTime: 0,
    currentAyahDuration: 0,
    ayahDurations: [],

    // UI state - main page
    searchQuery: "",
    revelationFilter: "All" as RevelationFilter,
    viewMode: "list" as ViewMode,

    // UI state - panels
    isPlayerVisible: false,
    showSurahModal: false,
    surahModalNumber: 1,
    showReciterPanel: false,

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
        currentAyahInSurah: 1,
        totalAyahsInSurah: surahInfo.ayahCount,
        isPlaying: true,
        isPlayerVisible: true,
        isBuffering: false,
        accumulatedTime: 0,
        currentAyahTime: 0,
        currentAyahDuration: 0,
        ayahDurations: [],
      });
    },

    playSurah: (surah) => {
      set({
        currentSurah: surah,
        currentAyahInSurah: 1,
        totalAyahsInSurah: surah.ayahCount,
        isPlaying: true,
        isPlayerVisible: true,
        isBuffering: false,
        accumulatedTime: 0,
        currentAyahTime: 0,
        currentAyahDuration: 0,
        ayahDurations: [],
      });
    },

    setIsPlaying: (playing) => set({ isPlaying: playing }),

    pauseAudio: () => set({ isPlaying: false }),
    resumeAudio: () => set({ isPlaying: true }),

    setCurrentAyahInSurah: (ayah) => set({ currentAyahInSurah: ayah, currentAyahTime: 0, currentAyahDuration: 0 }),

    setVolume: (vol) => set({ volume: vol }),
    setAudioQuality: (quality) => set({ audioQuality: quality }),

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
        currentAyahInSurah: 1,
        totalAyahsInSurah: surahInfo.ayahCount,
        isPlaying: true,
        accumulatedTime: 0,
        currentAyahTime: 0,
        currentAyahDuration: 0,
        ayahDurations: [],
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
        currentAyahInSurah: 1,
        totalAyahsInSurah: surahInfo.ayahCount,
        isPlaying: true,
        accumulatedTime: 0,
        currentAyahTime: 0,
        currentAyahDuration: 0,
        ayahDurations: [],
      });
    },

    playNext: () => {
      const { currentSurah } = get();
      if (!currentSurah) return;
      const nextNumber = currentSurah.number + 1;
      if (nextNumber <= 114) {
        const nextSurah = SURAH_DATA.find((s) => s.number === nextNumber);
        if (nextSurah) {
          set({
            currentSurah: nextSurah,
            isPlaying: true,
            currentAyahInSurah: 1,
            totalAyahsInSurah: nextSurah.ayahCount,
            isBuffering: false,
            accumulatedTime: 0,
            currentAyahTime: 0,
            currentAyahDuration: 0,
            ayahDurations: [],
          });
        }
      }
    },

    playPrevious: () => {
      const { currentSurah } = get();
      if (!currentSurah) return;
      const prevNumber = currentSurah.number - 1;
      if (prevNumber >= 1) {
        const prevSurah = SURAH_DATA.find((s) => s.number === prevNumber);
        if (prevSurah) {
          set({
            currentSurah: prevSurah,
            isPlaying: true,
            currentAyahInSurah: 1,
            totalAyahsInSurah: prevSurah.ayahCount,
            isBuffering: false,
            accumulatedTime: 0,
            currentAyahTime: 0,
            currentAyahDuration: 0,
            ayahDurations: [],
          });
        }
      }
    },

    togglePlay: () => {
      const { isPlaying } = get();
      set({ isPlaying: !isPlaying });
    },

    // Timing actions
    setCurrentAyahTime: (time) => set({ currentAyahTime: time }),

    setCurrentAyahDuration: (duration) => set({ currentAyahDuration: duration }),

    addAyahDuration: (ayahIndex, duration) => {
      const { ayahDurations } = get();
      const newDurations = [...ayahDurations];
      newDurations[ayahIndex] = duration;
      set({ ayahDurations: newDurations });
    },

    advanceToNextAyah: () => {
      const { currentAyahInSurah, totalAyahsInSurah, ayahDurations, accumulatedTime } = get();
      // Add the finished ayah's duration to accumulated time
      const finishedDuration = ayahDurations[currentAyahInSurah - 1] || 0;
      const newAccumulated = accumulatedTime + finishedDuration;

      if (currentAyahInSurah < totalAyahsInSurah) {
        set({
          currentAyahInSurah: currentAyahInSurah + 1,
          accumulatedTime: newAccumulated,
          currentAyahTime: 0,
          currentAyahDuration: 0,
        });
      } else {
        // All ayahs done - go to next surah
        const { currentSurah } = get();
        const currentNum = currentSurah?.number ?? 0;
        const nextNum = currentNum >= 114 ? 1 : currentNum + 1;
        const surahInfo = getSurahInfo(nextNum);
        if (surahInfo) {
          set({
            currentSurah: surahInfo,
            currentAyahInSurah: 1,
            totalAyahsInSurah: surahInfo.ayahCount,
            isPlaying: true,
            accumulatedTime: 0,
            currentAyahTime: 0,
            currentAyahDuration: 0,
            ayahDurations: [],
          });
        }
      }
    },

    seekToAyah: (ayahNumber) => {
      const { ayahDurations } = get();
      // Recalculate accumulated time up to the target ayah
      let newAccumulated = 0;
      for (let i = 0; i < ayahNumber - 1; i++) {
        newAccumulated += ayahDurations[i] || 0;
      }
      set({
        currentAyahInSurah: ayahNumber,
        accumulatedTime: newAccumulated,
        currentAyahTime: 0,
        currentAyahDuration: 0,
      });
    },

    resetTiming: () => set({
      accumulatedTime: 0,
      currentAyahTime: 0,
      currentAyahDuration: 0,
      ayahDurations: [],
    }),

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

    // UI filter actions
    setSearchQuery: (query) => set({ searchQuery: query }),
    setRevelationFilter: (filter) => set({ revelationFilter: filter }),
    setViewMode: (mode) => set({ viewMode: mode }),

    // Reciter panel
    setShowReciterPanel: (show) => set({ showReciterPanel: show }),
    toggleReciterPanel: () =>
      set((state) => ({
        showReciterPanel: !state.showReciterPanel,
        isReciterPanelOpen: !state.isReciterPanelOpen,
      })),
    isReciterPanelOpen: false,
  };
});
