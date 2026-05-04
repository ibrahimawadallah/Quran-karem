# Task 5-b, 6, 7 - Audio Player, Surah Modal, Reciter Panel

## Agent: ui-components

## Summary
Created the audio player component, surah reading modal, and reciter panel for the Quran Kareem web application. Also updated the audio store to support both the new components and existing components from Task 5-a.

## Files Modified/Created

1. **`src/lib/audio-store.ts`** - Complete rewrite of the Zustand store with dual API compatibility
   - Supports both `play(surahNumber)` and `playSurah(surah)` APIs
   - Added ayah-level tracking (`currentAyahInSurah`, `totalAyahsInSurah`)
   - Keeps `currentReciter` (string ID) and `reciter` (Reciter object) in sync
   - Keeps `showReciterPanel` / `isReciterPanelOpen` in sync
   - Keeps `showSurahModal` / `readingModalSurah` in sync
   - Added helper functions: `getStartingAyahNumber()`, `getSurahInfo()`
   - Includes all UI state from Task 5-a: `searchQuery`, `revelationFilter`, `viewMode`, etc.

2. **`src/components/audio-player.tsx`** - Full-featured audio player bar
   - Dark glass background with blur, fixed to bottom
   - Play/Pause (amber when playing), Previous/Next surah
   - Surah info display with Arabic/English names
   - Ayah progress (Ayah X / Total)
   - Time display, volume slider with mute
   - Audio wave animation (5 bars)
   - HTML5 Audio with auto-advance ayah→surah
   - Seek by clicking progress bar
   - Keyboard shortcuts (Space, Left/Right, Escape)
   - Loading indicator during buffering

3. **`src/components/surah-reading-modal.tsx`** - Surah reading modal
   - Dialog-based with dark glassmorphism
   - Surah header with play button
   - Basmala display (except Surah 9)
   - Scrollable ayah list with Arabic/English text
   - Basmala ayah (Surah 1:1) amber highlight
   - Caches API responses in Map ref
   - Loading skeletons and error retry

4. **`src/components/reciter-panel.tsx`** - Reciter selection panel
   - Sheet-based, slides from right
   - Search input for filtering
   - Categorized grid (Popular/Egyptian/Saudi/Other) with flag emojis
   - Reciter cards with name, Arabic name, country, style badge
   - Amber highlight for selected reciter
   - Audio quality radio buttons (64/128/192 kbps)
   - Immediately switches audio when reciter/quality changes

## Verification
- ESLint: 0 errors (1 pre-existing warning)
- Dev server compiles and runs
- Store API compatible with all existing components
