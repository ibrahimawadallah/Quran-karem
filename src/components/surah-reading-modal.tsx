"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, X, RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioStore, getSurahInfo } from "@/lib/audio-store";
import type { SurahText, AyahText } from "@/lib/quran-types";

export default function SurahReadingModal() {
  const {
    showSurahModal,
    readingModalSurah,
    closeReadingModal,
    surahModalNumber,
    play,
    playSurah,
    isPlaying,
    currentSurah,
    currentAyahInSurah,
    pauseAudio,
    resumeAudio,
    togglePlay,
  } = useAudioStore();

  const [surahText, setSurahText] = useState<SurahText | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<number, SurahText>>(new Map());
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const surahInfo = readingModalSurah ?? getSurahInfo(surahModalNumber);
  const surahNumber = readingModalSurah?.number ?? surahModalNumber;

  // Is this modal viewing the same surah that's currently playing?
  const isViewingPlayingSurah = currentSurah?.number === surahNumber;

  const fetchSurahText = useCallback(async () => {
    if (!surahNumber) return;

    // Check cache first
    if (cacheRef.current.has(surahNumber)) {
      setSurahText(cacheRef.current.get(surahNumber)!);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/surah/${surahNumber}`);
      if (!res.ok) {
        throw new Error("Failed to fetch surah text");
      }
      const data: SurahText = await res.json();
      cacheRef.current.set(surahNumber, data);
      setSurahText(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    if (showSurahModal && surahNumber) {
      fetchSurahText();
    }
  }, [showSurahModal, surahNumber, fetchSurahText]);

  // Auto-scroll to the current playing ayah when it changes
  useEffect(() => {
    if (!isViewingPlayingSurah || !isPlaying || !surahText) return;

    const ayahEl = ayahRefs.current.get(currentAyahInSurah);
    if (ayahEl && scrollContainerRef.current) {
      ayahEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentAyahInSurah, isViewingPlayingSurah, isPlaying, surahText]);

  const handlePlayToggle = () => {
    if (!surahInfo) return;

    if (currentSurah?.number === surahInfo.number) {
      togglePlay();
    } else {
      play(surahInfo.number);
    }
  };

  const isCurrentlyPlaying =
    isPlaying && currentSurah?.number === surahNumber;

  // Basmala text
  const basmala = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

  return (
    <Dialog open={showSurahModal} onOpenChange={(open) => !open && closeReadingModal()}>
      <DialogContent
        className="flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh] sm:max-h-[85vh] border-purple-900/30 sm:max-w-lg"
        style={{
          background: "rgba(15, 10, 30, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 text-sm font-bold">
                {surahInfo?.number}
              </div>
              <div>
                <DialogTitle className="text-white text-base sm:text-lg font-semibold">
                  {surahInfo?.arabicName} — {surahInfo?.englishName}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-xs">
                  {surahInfo?.englishMeaning} • {surahInfo?.ayahCount} Ayahs •{" "}
                  {surahInfo?.revelationType}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Now playing indicator */}
              {isViewingPlayingSurah && isPlaying && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                  </span>
                  Ayah {currentAyahInSurah}
                </span>
              )}

              {/* Play/Pause button */}
              <button
                onClick={handlePlayToggle}
                className={`p-2.5 rounded-full transition-all ${
                  isCurrentlyPlaying
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                aria-label={isCurrentlyPlaying ? "Pause" : "Play surah"}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              {/* Close button */}
              <button
                onClick={closeReadingModal}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Basmala (except for At-Tawbah / Surah 9, and Al-Fatiha / Surah 1) */}
          {surahNumber !== 9 && surahNumber !== 1 && (
            <div className="mt-3 text-center">
              <p
                className="text-amber-400/90 text-lg"
                style={{ fontFamily: "'Scheherazade New', 'Traditional Arabic', serif" }}
                dir="rtl"
              >
                {basmala}
              </p>
            </div>
          )}
        </div>

        {/* Content area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-h-[60vh]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(139, 92, 246, 0.3) transparent",
          }}
        >
          {/* Loading state */}
          {loading && (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-purple-900/30" />
                    <Skeleton className="h-6 w-3/4 bg-purple-900/20" />
                  </div>
                  <Skeleton className="h-4 w-1/2 bg-purple-900/10 ml-11" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchSurahText}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Ayah list */}
          {surahText && !loading && !error && (
            <div className="space-y-3">
              {surahText.arabicAyahs.map((ayah: AyahText, index: number) => {
                const englishAyah = surahText.englishAyahs[index];
                const isBasmalaAyah =
                  surahNumber === 1 && ayah.numberInSurah === 1;

                // Is this the currently playing ayah?
                const isCurrentPlayingAyah =
                  isViewingPlayingSurah &&
                  isPlaying &&
                  currentAyahInSurah === ayah.numberInSurah;

                return (
                  <div
                    key={ayah.number}
                    ref={(el) => {
                      if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                    }}
                    className={`group rounded-lg p-3 transition-all duration-300 ${
                      isCurrentPlayingAyah
                        ? "bg-amber-500/15 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                        : isBasmalaAyah
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {/* Ayah number badge + Arabic text */}
                    <div className="flex items-start gap-3">
                      {/* Circular number badge */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border transition-all duration-300 ${
                          isCurrentPlayingAyah
                            ? "bg-amber-500/30 text-amber-300 border-amber-400/50 shadow-md shadow-amber-500/20"
                            : isBasmalaAyah
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-purple-600/20 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {isCurrentPlayingAyah ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                          </span>
                        ) : (
                          ayah.numberInSurah
                        )}
                      </div>

                      {/* Arabic text */}
                      <p
                        className={`leading-[2.2] flex-1 transition-colors duration-300 ${
                          isCurrentPlayingAyah ? "text-amber-100" : "text-white/90"
                        }`}
                        style={{
                          fontFamily:
                            "'Scheherazade New', 'Traditional Arabic', serif",
                          fontSize: "clamp(22px, 4vw, 26px)",
                          direction: "rtl",
                          textAlign: "right",
                        }}
                      >
                        {ayah.text}
                        <span className={`inline-block mx-1 text-base ${
                          isCurrentPlayingAyah ? "text-amber-400/80" : "text-amber-500/60"
                        }`}>
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </p>
                    </div>

                    {/* English translation */}
                    {englishAyah && (
                      <p className={`text-sm leading-relaxed mt-2 ml-11 transition-colors duration-300 ${
                        isCurrentPlayingAyah ? "text-amber-200/70" : "text-gray-400"
                      }`}>
                        {englishAyah.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
