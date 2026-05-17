"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { getSurahInfo } from "@/lib/quran-utils";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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

function getCurrentAyahFromTime(currentTime: number, totalAyahs: number, timings: number[]): number {
  if (!timings || timings.length === 0) return 1;

  for (let i = timings.length - 1; i >= 0; i--) {
    if (currentTime >= timings[i]) {
      return Math.min(i + 1, totalAyahs);
    }
  }

  return 1;
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const preloadAudioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const prevSurahKeyRef = useRef("");
  const timeRef = useRef(0);
  const durationRef = useRef(0);
  const lastAyahRef = useRef(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const {
    isPlayerVisible,
    hidePlayer,
    isPlaying,
    setIsPlaying,
    currentSurah,
    nextSurah,
    prevSurah,
    togglePlay,
    currentReciter,
    setIsBuffering,
    isBuffering,
    audioError,
    setAudioError,
    currentAyahInSurah,
    setCurrentAyah,
    playbackSpeed,
    setPlaybackSpeed,
    saveBookmark,
    loadBookmark,
    clearBookmark,
  } = useAudioStore();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextSurah();
      } else {
        prevSurah();
      }
    }
  };

  const [displayTime, setDisplayTime] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [ayahProgress, setAyahProgress] = useState(0);
  const [audioSrc, setAudioSrc] = useState('');
  const ayahTimingsRef = useRef<number[]>([]);

  const surahKey = currentSurah
    ? `${currentReciter}-${currentSurah.number}`
    : "";

  // Fetch real ayah timings from API
  useEffect(() => {
    if (!currentSurah || !currentReciter) return;

    const fetchTimings = async () => {
      try {
        const reciterMap: Record<string, number> = {
          'ar.alafasy': 7,
          'ar.abdulbasitmujawwad': 1,
          'ar.abdulbasitmurattal': 2,
          'ar.husary': 6,
          'ar.husarymuallim': 12,
          'ar.saudalshuraim': 10,
          'ar.minshawi': 9,
          'ar.minshawimujawwad': 8,
          'ar.abdurrahmaansudais': 3,
          'ar.abubakralshatri': 4,
          'ar.hanirifai': 5,
          'ar.tablawi': 11,
        };
        const quranComReciterId = reciterMap[currentReciter] || 7;
        const res = await fetch(`/api/timing/${currentSurah.number}?reciter=${quranComReciterId}`);
        const data = await res.json();
        if (data.timings && Array.isArray(data.timings)) {
          const timings = data.timings
            .map((t: { timestamp: number; ayahKey: string }) => t.timestamp / 1000)
            .sort((a: number, b: number) => a - b);
          ayahTimingsRef.current = timings;
        }
      } catch (err) {
        console.error('Failed to fetch timing data:', err);
        ayahTimingsRef.current = [];
      }
    };

    fetchTimings();
  }, [currentSurah, currentReciter]);

  // Fetch full surah audio URL from Quran.com API
  useEffect(() => {
    if (!currentSurah || !currentReciter) return;

    const fetchAudioUrl = async () => {
      try {
        const reciterMap: Record<string, number> = {
          'ar.alafasy': 7,
          'ar.abdulbasitmujawwad': 1,
          'ar.abdulbasitmurattal': 2,
          'ar.husary': 6,
          'ar.husarymuallim': 12,
          'ar.saudalshuraim': 10,
          'ar.minshawi': 9,
          'ar.minshawimujawwad': 8,
          'ar.abdurrahmaansudais': 3,
          'ar.abubakralshatri': 4,
          'ar.hanirifai': 5,
          'ar.tablawi': 11,
        };
        const quranComReciterId = reciterMap[currentReciter] || 7;
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${quranComReciterId}?chapter=${currentSurah.number}`);
        const data = await res.json();
        if (data.audio_files?.[0]?.audio_url) {
          setAudioSrc(data.audio_files[0].audio_url);
        }
      } catch (err) {
        console.error('Failed to fetch audio URL:', err);
      }
    };

    fetchAudioUrl();
  }, [currentSurah, currentReciter]);

  const loadAudio = useCallback(
    (url: string, autoPlay: boolean) => {
      const audio = audioRef.current;
      if (!audio || !url) return;

      audio.src = url;
      audio.load();

      if (autoPlay) {
        audio.play().catch(() => {});
      }
    },
    []
  );

  // Load new audio when audioSrc changes
  useEffect(() => {
    if (!audioSrc) return;
    if (prevSurahKeyRef.current === surahKey) return;
    prevSurahKeyRef.current = surahKey;

    timeRef.current = 0;
    durationRef.current = 0;

    setAudioError(null);
    setIsBuffering(true);

    loadAudio(audioSrc, isPlaying);
  }, [surahKey, audioSrc, isPlaying, loadAudio, setAudioError, setIsBuffering]);

  // Play/pause based on store state
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

    const onCanPlay = () => {
      setIsBuffering(false);

      if (currentSurah && currentReciter) {
        const surahKey = `${currentSurah.number}-${currentReciter}`;
        const bookmarkTime = loadBookmark(surahKey);
        if (bookmarkTime && bookmarkTime > 0) {
          audio.currentTime = bookmarkTime;
        }
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setAudioError(null);
      setIsPlaying(true);
    };

    const onEnded = () => {
      nextSurah();
    };

    const onError = () => {
      setIsBuffering(false);
      setAudioError("Unable to load audio. Please check your internet connection or try a different reciter.");
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [nextSurah, setIsBuffering, setIsPlaying, setAudioError, loadBookmark, currentSurah, currentReciter]);

  // Apply volume and mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Apply playback speed
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // RAF loop to sync audio time to display
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        const ct = audio.currentTime;
        const dur = audio.duration;
        if (timeRef.current !== ct) {
          timeRef.current = ct;
          setDisplayTime(ct);
          
          if (currentSurah) {
            const newAyah = getCurrentAyahFromTime(
              ct,
              currentSurah.ayahCount,
              ayahTimingsRef.current
            );
            if (newAyah !== lastAyahRef.current) {
              lastAyahRef.current = newAyah;
              setCurrentAyah(newAyah);
              setAyahProgress(0);
            } else {
              const timings = ayahTimingsRef.current;
              if (timings.length > newAyah) {
                const ayahStart = timings[newAyah - 1];
                const ayahEnd = timings[newAyah] || dur;
                const ayahDuration = ayahEnd - ayahStart;
                if (ayahDuration > 0) {
                  const progressInAyah = (ct - ayahStart) / ayahDuration;
                  setAyahProgress(Math.max(0, Math.min(1, progressInAyah)));
                }
              }
            }
          }
        }
        if (isFinite(dur) && durationRef.current !== dur) {
          durationRef.current = dur;
          setDisplayDuration(dur);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentSurah, setCurrentAyah]);

  // Preload next surah
  const preloadNextSurah = useCallback(() => {
    if (!currentSurah || !currentReciter) return;

    const nextSurahNum = currentSurah.number >= 114 ? 1 : currentSurah.number + 1;
    const nextSurah = getSurahInfo(nextSurahNum);
    if (!nextSurah) return;

    const preloadAudio = preloadAudioRef.current;
    if (!preloadAudio) return;

    const reciterMap: Record<string, number> = {
      'ar.alafasy': 7,
      'ar.abdulbasitmujawwad': 1,
      'ar.abdulbasitmurattal': 2,
      'ar.husary': 6,
      'ar.husarymuallim': 12,
      'ar.saudalshuraim': 10,
      'ar.minshawi': 9,
      'ar.minshawimujawwad': 8,
      'ar.abdurrahmaansudais': 3,
      'ar.abubakralshatri': 4,
      'ar.hanirifai': 5,
      'ar.tablawi': 11,
    };
    const quranComReciterId = reciterMap[currentReciter] || 7;

    fetch(`https://api.quran.com/api/v4/chapter_recitations/${quranComReciterId}?chapter=${nextSurahNum}`)
      .then(r => r.json())
      .then(data => {
        if (data.audio_files?.[0]?.audio_url) {
          preloadAudio.src = data.audio_files[0].audio_url;
          preloadAudio.preload = "metadata";
          preloadAudio.load();
        }
      })
      .catch(() => {});
  }, [currentSurah, currentReciter]);

  // Start preloading when surah changes
  useEffect(() => {
    if (isPlaying && currentSurah) {
      preloadNextSurah();

      const checkPreload = () => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;

        const remainingTime = audio.duration - audio.currentTime;
        if (remainingTime <= 30) {
          preloadNextSurah();
        }
      };

      const interval = setInterval(checkPreload, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSurah, preloadNextSurah]);

  // Check bookmark status
  useEffect(() => {
    if (currentSurah && currentReciter) {
      const surahKey = `${currentSurah.number}-${currentReciter}`;
      const bookmarkTime = loadBookmark(surahKey);
      setIsBookmarked(bookmarkTime !== null);
    } else {
      setIsBookmarked(false);
    }
  }, [currentSurah, currentReciter, loadBookmark]);

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
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(
              0,
              audioRef.current.currentTime - 10
            );
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(
              audioRef.current.duration || 0,
              audioRef.current.currentTime + 10
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          hidePlayer();
          break;
        case "KeyN":
          e.preventDefault();
          nextSurah();
          break;
        case "KeyP":
          e.preventDefault();
          prevSurah();
          break;
        case "KeyB":
          e.preventDefault();
          if (currentSurah && currentReciter) {
            const surahKey = `${currentSurah.number}-${currentReciter}`;
            if (isBookmarked) {
              clearBookmark(surahKey);
              setIsBookmarked(false);
            } else {
              const audio = audioRef.current;
              if (audio) {
                saveBookmark(surahKey, audio.currentTime);
                setIsBookmarked(true);
              }
            }
          }
          break;
        case "Digit1":
          e.preventDefault();
          setPlaybackSpeed(0.5);
          break;
        case "Digit2":
          e.preventDefault();
          setPlaybackSpeed(1.0);
          break;
        case "Digit3":
          e.preventDefault();
          setPlaybackSpeed(1.5);
          break;
        case "Digit4":
          e.preventDefault();
          setPlaybackSpeed(2.0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerVisible, currentSurah, togglePlay, hidePlayer]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !durationRef.current) return;

      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      audio.currentTime = ratio * durationRef.current;
    },
    []
  );

  const handleProgressDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !durationRef.current) return;

      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      audio.currentTime = ratio * durationRef.current;
    },
    []
  );

  const handleRetry = useCallback(() => {
    if (!currentSurah) return;
    setAudioError(null);
    setIsBuffering(true);
    timeRef.current = 0;
    durationRef.current = 0;
    lastAyahRef.current = 0;
    setCurrentAyah(1);

    const audio = audioRef.current;
    if (audio && audioSrc) {
      audio.src = audioSrc;
      audio.load();
      audio.play().catch(() => {});
    }
  }, [currentSurah, audioSrc, setAudioError, setIsBuffering, setCurrentAyah]);

  if (!isPlayerVisible || !currentSurah) return null;

  const progressPercent =
    displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <audio ref={preloadAudioRef} preload="none" style={{ display: 'none' }} />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20"
        style={{
          background: "rgba(10, 5, 24, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={progressRef}
          className="w-full h-2 cursor-pointer group relative touch-none select-none"
          onClick={handleProgressClick}
          onPointerMove={(e) => {
            if (e.buttons > 0) handleProgressDrag(e);
          }}
          onPointerDown={handleProgressDrag}
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-[width] duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-amber-400/50 touch-none"
            style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
          />
        </div>

        {audioError && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 bg-red-900/30 border-b border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs text-red-300">{audioError}</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AudioWave isPlaying={isPlaying && !audioError} />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs text-amber-400 font-medium tabular-nums">
                  {currentSurah?.number}
                </span>
                <span className="arabic-name text-sm sm:text-lg text-amber-400 truncate">
                  {currentSurah?.arabicName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] text-muted-foreground tabular-nums">
                <span className="truncate">{currentSurah?.englishMeaning}</span>
                <span className="shrink-0">•</span>
                <span className="shrink-0">{currentSurah?.ayahCount} Ayahs</span>
                {currentSurah && currentAyahInSurah > 0 && (
                  <span className="text-amber-400/80 shrink-0">&bull; Ayah {currentAyahInSurah}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={prevSurah}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95 touch-manipulation"
              aria-label="Previous surah"
            >
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={audioError ? handleRetry : togglePlay}
              className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 touch-manipulation ${
                isPlaying
                  ? "bg-amber-500 text-[#0a0518] hover:bg-amber-400 shadow-lg shadow-amber-500/30"
                  : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
              aria-label={audioError ? "Retry" : isPlaying ? "Pause" : "Play"}
            >
              {audioError ? (
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : isBuffering ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSurah}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95 touch-manipulation"
              aria-label="Next surah"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => {
                if (!currentSurah || !currentReciter) return;
                const audio = audioRef.current;
                if (!audio) return;

                const surahKey = `${currentSurah.number}-${currentReciter}`;
                if (isBookmarked) {
                  clearBookmark(surahKey);
                  setIsBookmarked(false);
                } else {
                  saveBookmark(surahKey, audio.currentTime);
                  setIsBookmarked(true);
                }
              }}
              className={`p-1.5 sm:p-2 transition-colors rounded-full active:scale-95 touch-manipulation ${
                isBookmarked
                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark current position"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="text-[9px] sm:text-[11px] text-muted-foreground tabular-nums shrink-0">
              {formatTime(displayTime)} / {formatTime(displayDuration)}
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/10"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <div className="w-16">
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

            <div className="hidden sm:flex items-center gap-1">
              <Select
                value={playbackSpeed.toString()}
                onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}
              >
                <SelectTrigger className="w-16 h-7 text-[10px] bg-transparent border-purple-500/20 hover:border-purple-500/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1.0">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2.0">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={hidePlayer}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/10 active:scale-95 touch-manipulation"
              aria-label="Close player"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
