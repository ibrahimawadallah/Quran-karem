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
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const prevUrlRef = useRef("");

  const {
    isPlayerVisible,
    hidePlayer,
    isPlaying,
    setIsPlaying,
    currentSurah,
    currentAyahInSurah,
    setCurrentAyahInSurah,
    totalAyahsInSurah,
    nextSurah,
    prevSurah,
    togglePlay,
    currentReciter,
    audioQuality,
    setIsBuffering,
    isBuffering,
  } = useAudioStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Compute the audio URL for the current ayah
  const surahNum = currentSurah?.number ?? 1;
  const absoluteAyah = getStartingAyahNumber(surahNum) + currentAyahInSurah - 1;
  const audioUrl = `https://cdn.islamic.network/quran/audio/${audioQuality}/${currentReciter}/${absoluteAyah}.mp3`;

  // Effect: update audio source when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (prevUrlRef.current === audioUrl) return;
    prevUrlRef.current = audioUrl;

    audio.src = audioUrl;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay may be blocked
      });
    }
  }, [audioUrl, isPlaying]);

  // Effect: play/pause based on store state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onCanPlay = () => setIsBuffering(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onEnded = () => {
      // Auto-advance to next ayah in surah
      const state = useAudioStore.getState();
      if (state.currentAyahInSurah < state.totalAyahsInSurah) {
        setCurrentAyahInSurah(state.currentAyahInSurah + 1);
      } else {
        // All ayahs done, go to next surah
        nextSurah();
      }
    };
    const onError = () => {
      // Skip to next ayah on error
      const state = useAudioStore.getState();
      if (state.currentAyahInSurah < state.totalAyahsInSurah) {
        setCurrentAyahInSurah(state.currentAyahInSurah + 1);
      } else {
        nextSurah();
      }
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
  }, [nextSurah, setCurrentAyahInSurah, setIsBuffering, setIsPlaying]);

  // Effect: apply volume and mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerVisible || !currentSurah) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

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
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = ratio * duration;
  };

  if (!isPlayerVisible || !currentSurah) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="auto" />

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20"
        style={{
          background: "rgba(10, 5, 24, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Progress bar (thin, clickable) */}
        <div
          ref={progressRef}
          className="w-full h-1 cursor-pointer group relative"
          onClick={handleProgressClick}
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-amber-400/50"
            style={{ left: `${progressPercent}%`, marginLeft: "-6px" }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 max-w-screen-xl mx-auto">
          {/* Left: Surah info + wave */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AudioWave isPlaying={isPlaying} />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-medium">
                  {currentSurah.number}
                </span>
                <span className="arabic-name text-lg text-amber-400 truncate">
                  {currentSurah.arabicName}
                </span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                  {currentSurah.englishName}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                Ayah {currentAyahInSurah} / {totalAyahsInSurah}
              </div>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Previous */}
            <button
              onClick={prevSurah}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95"
              aria-label="Previous surah"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className={`p-2.5 rounded-full transition-all active:scale-95 ${
                isPlaying
                  ? "bg-amber-500 text-[#0a0518] hover:bg-amber-400 shadow-lg shadow-amber-500/30"
                  : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSurah}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95"
              aria-label="Next surah"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Time + Volume + Close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
            {/* Time display */}
            <div className="text-[11px] text-muted-foreground hidden sm:block tabular-nums whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="w-20">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[isMuted ? 0 : volume]}
                  onValueChange={(val) => {
                    setVolume(val[0]);
                    if (val[0] > 0) setIsMuted(false);
                  }}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Close */}
            <button
              onClick={hidePlayer}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
