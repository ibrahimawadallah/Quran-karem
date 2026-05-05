"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Loader2,
} from "lucide-react";
import { useAudioStore, getStartingAyahNumber } from "@/lib/audio-store";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Audio wave animation bars */
function AudioWave({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-amber-500"
          style={{
            height: isPlaying ? undefined : "4px",
            animation: isPlaying
              ? `audioWave 0.8s ease-in-out ${i * 0.12}s infinite alternate`
              : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes audioWave {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
}

export default function AudioPlayer() {
  // Two audio elements for gapless ping-pong playback
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);

  // Imperative engine state — all in refs to avoid re-render delays
  const engineRef = useRef({
    activeSide: "A" as "A" | "B",
    loadedKey: { A: "", B: "" }, // "surahNum-ayahNum" to track what's loaded where
    currentAyah: 1,
    totalAyahs: 7,
    surahNum: 1,
    advancing: false,
    eventsAttached: false,
    volume: 0.8,
    muted: false,
  });

  const {
    isPlayerVisible,
    hidePlayer,
    isPlaying,
    setIsPlaying,
    currentSurah,
    currentAyahInSurah,
    totalAyahsInSurah,
    nextSurah,
    prevSurah,
    togglePlay,
    currentReciter,
    audioQuality,
    setIsBuffering,
    isBuffering,
    accumulatedTime,
    currentAyahTime,
    currentAyahDuration,
    setCurrentAyahTime,
    setCurrentAyahDuration,
    addAyahDuration,
    advanceToNextAyah,
    seekToAyah,
  } = useAudioStore();

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const surahNum = currentSurah?.number ?? 1;

  /** Get audio URL for an ayah */
  function buildAudioUrl(ayahInSurah: number, sNum: number, quality: string, reciter: string): string {
    const absoluteAyah = getStartingAyahNumber(sNum) + ayahInSurah - 1;
    return `https://cdn.islamic.network/quran/audio/${quality}/${reciter}/${absoluteAyah}.mp3`;
  }

  /** Get the currently active audio element */
  function getActive(): HTMLAudioElement | null {
    return engineRef.current.activeSide === "A" ? audioARef.current : audioBRef.current;
  }

  /** Get the inactive (preloaded) audio element */
  function getInactive(): HTMLAudioElement | null {
    return engineRef.current.activeSide === "A" ? audioBRef.current : audioARef.current;
  }

  /** Load an ayah into a specific side */
  function loadIntoSide(side: "A" | "B", ayahInSurah: number, sNum: number, quality: string, reciter: string) {
    const audio = side === "A" ? audioARef.current : audioBRef.current;
    if (!audio) return;
    const url = buildAudioUrl(ayahInSurah, sNum, quality, reciter);
    audio.src = url;
    audio.preload = "auto";
    audio.load();
    engineRef.current.loadedKey[side] = `${sNum}-${ayahInSurah}`;
  }

  /** Preload the next ayah onto the inactive side */
  function preloadNext() {
    const eng = engineRef.current;
    const nextAyah = eng.currentAyah + 1;
    if (nextAyah > eng.totalAyahs) return;

    const state = useAudioStore.getState();
    const inactiveSide = eng.activeSide === "A" ? "B" : "A";
    loadIntoSide(inactiveSide, nextAyah, eng.surahNum, state.audioQuality, state.currentReciter);
  }

  /** Start playing a specific ayah */
  function playAyah(ayahInSurah: number, sNum: number, quality: string, reciter: string) {
    const eng = engineRef.current;
    const key = `${sNum}-${ayahInSurah}`;

    // Check if already loaded on active side
    if (eng.loadedKey[eng.activeSide] === key) {
      const audio = getActive();
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    }
    // Check if loaded on inactive side — swap
    else {
      const inactiveSide = eng.activeSide === "A" ? "B" : "A";
      if (eng.loadedKey[inactiveSide] === key) {
        // Pause current active
        getActive()?.pause();
        // Swap sides
        eng.activeSide = inactiveSide;
        const newActive = getActive();
        if (newActive) {
          newActive.currentTime = 0;
          newActive.play().catch(() => {});
        }
      } else {
        // Not loaded anywhere — load onto active side
        loadIntoSide(eng.activeSide, ayahInSurah, sNum, quality, reciter);
        const audio = getActive();
        if (audio) {
          audio.play().catch(() => {});
        }
      }
    }

    eng.currentAyah = ayahInSurah;
    eng.surahNum = sNum;
    eng.advancing = false;

    // Preload next ayah after a small delay
    setTimeout(preloadNext, 100);
  }

  /** Handle ayah ended — gapless transition */
  function handleAyahEnd() {
    const eng = engineRef.current;
    if (eng.advancing) return;
    eng.advancing = true;

    const nextAyah = eng.currentAyah + 1;
    const state = useAudioStore.getState();

    if (nextAyah <= eng.totalAyahs) {
      // --- GAPLESS: swap to preloaded inactive side immediately ---
      eng.activeSide = eng.activeSide === "A" ? "B" : "A";
      const newActive = getActive();
      const newInactive = getInactive();

      // Play immediately — no React re-render delay!
      if (newActive) {
        newActive.play().catch(() => {});
      }

      eng.currentAyah = nextAyah;

      // Update store for UI (triggers re-render, but audio already playing)
      advanceToNextAyah();

      // Preload the ayah after next onto the now-inactive side
      if (newInactive && nextAyah + 1 <= eng.totalAyahs) {
        loadIntoSide(
          eng.activeSide === "A" ? "B" : "A",
          nextAyah + 1,
          eng.surahNum,
          state.audioQuality,
          state.currentReciter
        );
      }
    } else {
      // Last ayah done — advance to next surah
      advanceToNextAyah();
    }
  }

  // Set up event handlers on both audio elements (once)
  useEffect(() => {
    const setupEvents = (audio: HTMLAudioElement) => {
      const isActiveAudio = () => {
        const eng = engineRef.current;
        return (eng.activeSide === "A" && audio === audioARef.current) ||
               (eng.activeSide === "B" && audio === audioBRef.current);
      };

      const onTimeUpdate = () => {
        if (isActiveAudio()) setCurrentAyahTime(audio.currentTime);
      };

      const onDurationChange = () => {
        if (isActiveAudio() && isFinite(audio.duration) && audio.duration > 0) {
          setCurrentAyahDuration(audio.duration);
          const state = useAudioStore.getState();
          const idx = state.currentAyahInSurah - 1;
          if (idx >= 0) addAyahDuration(idx, audio.duration);
        }
      };

      const onCanPlay = () => {
        if (isActiveAudio()) setIsBuffering(false);
      };

      const onWaiting = () => {
        if (isActiveAudio()) setIsBuffering(true);
      };

      const onPlaying = () => {
        if (isActiveAudio()) {
          setIsBuffering(false);
          setIsPlaying(true);
        }
      };

      const onEnded = () => {
        if (isActiveAudio()) handleAyahEnd();
      };

      const onError = () => {
        if (isActiveAudio()) handleAyahEnd();
      };

      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("durationchange", onDurationChange);
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("playing", onPlaying);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      return () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("durationchange", onDurationChange);
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("waiting", onWaiting);
        audio.removeEventListener("playing", onPlaying);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
      };
    };

    const cleanups: (() => void)[] = [];
    if (audioARef.current) cleanups.push(setupEvents(audioARef.current));
    if (audioBRef.current) cleanups.push(setupEvents(audioBRef.current));

    return () => cleanups.forEach((c) => c());
  }, []);

  // Start playing when surah/ayah changes from store
  useEffect(() => {
    if (!currentSurah) return;
    const eng = engineRef.current;
    eng.totalAyahs = totalAyahsInSurah;

    if (currentAyahInSurah !== eng.currentAyah || surahNum !== eng.surahNum) {
      playAyah(currentAyahInSurah, surahNum, audioQuality, currentReciter);
    }
  }, [currentAyahInSurah, surahNum, currentSurah, totalAyahsInSurah, audioQuality, currentReciter]);

  // Sync play/pause
  useEffect(() => {
    const audio = getActive();
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Apply volume to both audio elements
  useEffect(() => {
    const vol = isMuted ? 0 : volume;
    engineRef.current.volume = volume;
    engineRef.current.muted = isMuted;
    if (audioARef.current) audioARef.current.volume = vol;
    if (audioBRef.current) audioBRef.current.volume = vol;
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerVisible || !currentSurah) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSurah();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextSurah();
          break;
        case "Escape":
          e.preventDefault();
          hidePlayer();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerVisible, currentSurah, togglePlay, prevSurah, nextSurah, hidePlayer]);

  /** Click on progress bar to seek */
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSurah) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetAyah = Math.max(1, Math.ceil(ratio * totalAyahsInSurah));
    seekToAyah(targetAyah);
  };

  if (!isPlayerVisible || !currentSurah) return null;

  const surahProgressPercent =
    totalAyahsInSurah > 0
      ? ((currentAyahInSurah - 1 +
          (currentAyahDuration > 0 ? currentAyahTime / currentAyahDuration : 0)) /
          totalAyahsInSurah) *
        100
      : 0;

  const totalSurahTime = accumulatedTime + currentAyahDuration;
  const surahPosition = accumulatedTime + currentAyahTime;

  return (
    <>
      <audio ref={audioARef} preload="auto" />
      <audio ref={audioBRef} preload="auto" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20"
        style={{
          background: "rgba(10, 5, 24, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Surah-level progress bar */}
        <div
          className="w-full h-1.5 cursor-pointer group relative"
          onClick={handleProgressClick}
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
            style={{ width: `${Math.min(100, surahProgressPercent)}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-amber-400/50"
            style={{
              left: `${Math.min(100, surahProgressPercent)}%`,
              marginLeft: "-6px",
            }}
          />
          {totalAyahsInSurah <= 30 &&
            Array.from({ length: totalAyahsInSurah - 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full w-px bg-purple-500/30"
                style={{ left: `${((i + 1) / totalAyahsInSurah) * 100}%` }}
              />
            ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 max-w-screen-xl mx-auto">
          {/* Left: Surah info + wave */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AudioWave isPlaying={isPlaying} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-medium">{currentSurah.number}</span>
                <span className="arabic-name text-lg text-amber-400 truncate">{currentSurah.arabicName}</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">{currentSurah.englishName}</span>
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                Ayah {currentAyahInSurah} / {totalAyahsInSurah}
                {totalSurahTime > 0 && (
                  <span className="hidden sm:inline"> &middot; {formatTime(surahPosition)} / {formatTime(totalSurahTime)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={prevSurah} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Previous surah">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className={`p-2.5 rounded-full transition-all active:scale-95 ${
                isPlaying ? "bg-amber-500 text-[#0a0518] hover:bg-amber-400 shadow-lg shadow-amber-500/30" : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={nextSurah} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Next surah">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Volume + Close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-20">
                <Slider min={0} max={1} step={0.01} value={[isMuted ? 0 : volume]} onValueChange={(val) => { setVolume(val[0]); if (val[0] > 0) setIsMuted(false); }} className="cursor-pointer" />
              </div>
            </div>
            <button onClick={hidePlayer} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Close player">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
