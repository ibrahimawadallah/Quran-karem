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
} from "lucide-react";
import { useAudioStore, getStartingAyahNumber } from "@/lib/audio-store";
import { RECITERS } from "@/lib/quran-data";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Check if a reciter uses surah-level audio (one file per surah) */
function isSurahSource(reciterId: string): boolean {
  const r = RECITERS.find((rec) => rec.id === reciterId);
  return r?.audioSource === "surah";
}

/** Build URL for surah-level audio */
function buildSurahAudioUrl(surahNumber: number, reciterId: string): string {
  const r = RECITERS.find((rec) => rec.id === reciterId);
  if (r?.audioBaseUrl) {
    const padded = surahNumber.toString().padStart(3, "0");
    return `${r.audioBaseUrl}/${padded}.mp3`;
  }
  return "";
}

/** Audio wave animation bars */
function AudioWave({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[2px] sm:gap-[3px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[2px] sm:w-[3px] rounded-full bg-amber-500"
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
  // === AYAH-LEVEL ENGINE (ping-pong for cdn.islamic.network) ===
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);

  // === SURAH-LEVEL ENGINE (single file for mp3quran.net) ===
  const surahAudioRef = useRef<HTMLAudioElement>(null);

  // Imperative engine state
  const engineRef = useRef({
    activeSide: "A" as "A" | "B",
    loadedKey: { A: "", B: "" },
    currentAyah: 1,
    totalAyahs: 7,
    surahNum: 1,
    isTransitioning: false,
    volume: 0.8,
    muted: false,
    retryCount: { A: 0, B: 0 },
    preloadedUpTo: 0,
    // Surah-level state
    surahMode: false,
    surahLoadedKey: "",
  });

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // RAF-based smooth progress
  const rafRef = useRef<number>(0);
  const earlyPreloadTriggeredRef = useRef(false);

  // Surah-level progress state
  const [surahCurrentTime, setSurahCurrentTime] = useState(0);
  const [surahDuration, setSurahDuration] = useState(0);

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

  const surahNum = currentSurah?.number ?? 1;
  const surahMode = isSurahSource(currentReciter);

  // Sync surahMode to engine
  useEffect(() => {
    engineRef.current.surahMode = surahMode;
  }, [surahMode]);

  /** Get audio URL for an ayah — always use 128k minimum for quality */
  function buildAudioUrl(ayahInSurah: number, sNum: number, quality: string, reciter: string): string {
    const absoluteAyah = getStartingAyahNumber(sNum) + ayahInSurah - 1;
    const effectiveQuality = parseInt(quality) < 128 ? "128" : quality;
    return `https://cdn.islamic.network/quran/audio/${effectiveQuality}/${reciter}/${absoluteAyah}.mp3`;
  }

  // === AYAH-LEVEL FUNCTIONS ===
  function getActive(): HTMLAudioElement | null {
    return engineRef.current.activeSide === "A" ? audioARef.current : audioBRef.current;
  }

  function getInactive(): HTMLAudioElement | null {
    return engineRef.current.activeSide === "A" ? audioBRef.current : audioARef.current;
  }

  function loadIntoSide(side: "A" | "B", ayahInSurah: number, sNum: number, quality: string, reciter: string) {
    const audio = side === "A" ? audioARef.current : audioBRef.current;
    if (!audio) return;
    const url = buildAudioUrl(ayahInSurah, sNum, quality, reciter);
    audio.src = url;
    audio.preload = "auto";
    audio.load();
    engineRef.current.loadedKey[side] = `${sNum}-${ayahInSurah}`;
    engineRef.current.retryCount[side] = 0;
  }

  function preloadNext() {
    const eng = engineRef.current;
    const nextAyah = eng.currentAyah + 1;
    if (nextAyah > eng.totalAyahs) return;
    const state = useAudioStore.getState();
    const inactiveSide = eng.activeSide === "A" ? "B" : "A";
    loadIntoSide(inactiveSide, nextAyah, eng.surahNum, state.audioQuality, state.currentReciter);
  }

  function playAyah(ayahInSurah: number, sNum: number, quality: string, reciter: string) {
    const eng = engineRef.current;
    const key = `${sNum}-${ayahInSurah}`;

    if (audioARef.current) audioARef.current.pause();
    if (audioBRef.current) audioBRef.current.pause();

    if (eng.loadedKey[eng.activeSide] === key) {
      const audio = getActive();
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    } else {
      const inactiveSide = eng.activeSide === "A" ? "B" : "A";
      if (eng.loadedKey[inactiveSide] === key) {
        eng.activeSide = inactiveSide;
        const newActive = getActive();
        if (newActive) { newActive.currentTime = 0; newActive.play().catch(() => {}); }
      } else {
        loadIntoSide(eng.activeSide, ayahInSurah, sNum, quality, reciter);
        const audio = getActive();
        if (audio) { audio.play().catch(() => {}); }
      }
    }

    eng.currentAyah = ayahInSurah;
    eng.surahNum = sNum;
    eng.isTransitioning = false;
    setTimeout(preloadNext, 50);
  }

  const handleAyahEnd = useCallback(() => {
    const eng = engineRef.current;
    if (eng.isTransitioning) return;
    eng.isTransitioning = true;

    const nextAyah = eng.currentAyah + 1;
    const state = useAudioStore.getState();

    if (nextAyah <= eng.totalAyahs) {
      eng.activeSide = eng.activeSide === "A" ? "B" : "A";
      const newActive = getActive();
      if (newActive) { newActive.currentTime = 0; newActive.play().catch(() => {}); }
      eng.currentAyah = nextAyah;
      advanceToNextAyah();

      if (nextAyah + 1 <= eng.totalAyahs) {
        loadIntoSide(eng.activeSide === "A" ? "B" : "A", nextAyah + 1, eng.surahNum, state.audioQuality, state.currentReciter);
      }
      setTimeout(() => { eng.isTransitioning = false; }, 150);
    } else {
      advanceToNextAyah();
      eng.isTransitioning = false;
    }
  }, [advanceToNextAyah]);

  function handleAudioError(side: "A" | "B") {
    const eng = engineRef.current;
    const audio = side === "A" ? audioARef.current : audioBRef.current;
    if (!audio || side !== eng.activeSide) return;
    const retryCount = eng.retryCount[side];
    if (retryCount < 2) {
      eng.retryCount[side] = retryCount + 1;
      const url = buildAudioUrl(eng.currentAyah, eng.surahNum, useAudioStore.getState().audioQuality, useAudioStore.getState().currentReciter);
      audio.src = url; audio.load(); audio.play().catch(() => {});
    } else {
      if (!eng.isTransitioning) handleAyahEnd();
    }
  }

  // === SURAH-LEVEL PLAYBACK ===
  const playSurahAudio = useCallback((sNum: number, reciterId: string) => {
    const audio = surahAudioRef.current;
    if (!audio) return;
    const url = buildSurahAudioUrl(sNum, reciterId);
    if (!url) return;

    // Pause ayah-level audio
    if (audioARef.current) audioARef.current.pause();
    if (audioBRef.current) audioBRef.current.pause();

    const key = `${sNum}-${reciterId}`;
    if (engineRef.current.surahLoadedKey === key && audio.src) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.src = url;
      audio.preload = "auto";
      audio.load();
      audio.play().catch(() => {});
      engineRef.current.surahLoadedKey = key;
    }
  }, []);

  // Set up surah audio event listeners
  useEffect(() => {
    const audio = surahAudioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (isFinite(audio.currentTime)) setSurahCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0) setSurahDuration(audio.duration);
    };
    const onCanPlay = () => setIsBuffering(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); };
    const onEnded = () => {
      // Auto-advance to next surah
      const state = useAudioStore.getState();
      state.nextSurah();
    };
    const onError = () => {
      // Retry once
      const eng = engineRef.current;
      if (eng.retryCount.A < 1) {
        eng.retryCount.A++;
        audio.load();
        audio.play().catch(() => {});
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
  }, []);

  // === RAF-BASED PROGRESS (ayah mode only) ===
  useEffect(() => {
    if (surahMode || !isPlaying || !currentSurah) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      return;
    }

    const animate = () => {
      const audio = getActive();
      if (audio && !audio.paused && isFinite(audio.currentTime) && isFinite(audio.duration) && audio.duration > 0) {
        setCurrentAyahTime(audio.currentTime);

        if (!earlyPreloadTriggeredRef.current && audio.currentTime / audio.duration > 0.8) {
          earlyPreloadTriggeredRef.current = true;
          const eng = engineRef.current;
          const nextAyah = eng.currentAyah + 1;
          if (nextAyah <= eng.totalAyahs) {
            const state = useAudioStore.getState();
            const inactiveSide = eng.activeSide === "A" ? "B" : "A";
            if (eng.loadedKey[inactiveSide] !== `${eng.surahNum}-${nextAyah}`) {
              loadIntoSide(inactiveSide, nextAyah, eng.surahNum, state.audioQuality, state.currentReciter);
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; } };
  }, [isPlaying, currentSurah, surahNum, surahMode]);

  useEffect(() => { earlyPreloadTriggeredRef.current = false; }, [currentAyahInSurah]);

  // === AYAH-LEVEL EVENT HANDLERS ===
  useEffect(() => {
    const setupEvents = (audio: HTMLAudioElement, side: "A" | "B") => {
      const isActiveAudio = () => engineRef.current.activeSide === side;
      const onDurationChange = () => {
        if (isActiveAudio() && isFinite(audio.duration) && audio.duration > 0) {
          setCurrentAyahDuration(audio.duration);
          const state = useAudioStore.getState();
          const idx = state.currentAyahInSurah - 1;
          if (idx >= 0) addAyahDuration(idx, audio.duration);
        }
      };
      const onCanPlay = () => { if (isActiveAudio()) setIsBuffering(false); };
      const onWaiting = () => { if (isActiveAudio()) setIsBuffering(true); };
      const onPlaying = () => { if (isActiveAudio()) { setIsBuffering(false); setIsPlaying(true); engineRef.current.retryCount[side] = 0; } };
      const onEnded = () => { if (isActiveAudio()) handleAyahEnd(); };
      const onError = () => { if (isActiveAudio()) handleAudioError(side); };

      audio.addEventListener("durationchange", onDurationChange);
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("playing", onPlaying);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      return () => {
        audio.removeEventListener("durationchange", onDurationChange);
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("waiting", onWaiting);
        audio.removeEventListener("playing", onPlaying);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
      };
    };

    const cleanups: (() => void)[] = [];
    if (audioARef.current) cleanups.push(setupEvents(audioARef.current, "A"));
    if (audioBRef.current) cleanups.push(setupEvents(audioBRef.current, "B"));
    return () => cleanups.forEach((c) => c());
  }, []);

  // === START PLAYING (dispatches to correct engine) ===
  useEffect(() => {
    if (!currentSurah) return;
    const eng = engineRef.current;
    eng.totalAyahs = totalAyahsInSurah;

    if (surahMode) {
      playSurahAudio(surahNum, currentReciter);
    } else {
      if (currentAyahInSurah !== eng.currentAyah || surahNum !== eng.surahNum) {
        playAyah(currentAyahInSurah, surahNum, audioQuality, currentReciter);
      }
    }
  }, [currentAyahInSurah, surahNum, currentSurah, totalAyahsInSurah, audioQuality, currentReciter, surahMode, playSurahAudio]);

  // Handle reciter/quality change
  useEffect(() => {
    if (!currentSurah) return;
    const eng = engineRef.current;

    if (surahMode) {
      playSurahAudio(surahNum, currentReciter);
      return;
    }

    const activeAudio = getActive();
    if (!activeAudio || !activeAudio.src) {
      playAyah(eng.currentAyah, eng.surahNum, audioQuality, currentReciter);
      return;
    }
    const expectedPart = `/${audioQuality}/${currentReciter}/`;
    const effectivePart = `/128/${currentReciter}/`;
    if (!activeAudio.src.includes(expectedPart) && !activeAudio.src.includes(effectivePart)) {
      eng.loadedKey = { A: "", B: "" };
      playAyah(eng.currentAyah, eng.surahNum, audioQuality, currentReciter);
    }
  }, [currentReciter, audioQuality, surahMode, playSurahAudio]);

  // Sync play/pause
  useEffect(() => {
    if (surahMode) {
      const audio = surahAudioRef.current;
      if (!audio || !audio.src) return;
      if (isPlaying) { audio.play().catch(() => {}); } else { audio.pause(); }
    } else {
      const audio = getActive();
      if (!audio || !audio.src) return;
      if (isPlaying) { audio.play().catch(() => {}); } else { audio.pause(); }
    }
  }, [isPlaying, surahMode]);

  // Volume
  useEffect(() => {
    const vol = isMuted ? 0 : volume;
    engineRef.current.volume = volume;
    engineRef.current.muted = isMuted;
    if (audioARef.current) audioARef.current.volume = vol;
    if (audioBRef.current) audioBRef.current.volume = vol;
    if (surahAudioRef.current) surahAudioRef.current.volume = vol;
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerVisible || !currentSurah) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case "Space": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft": e.preventDefault(); prevSurah(); break;
        case "ArrowRight": e.preventDefault(); nextSurah(); break;
        case "Escape": e.preventDefault(); hidePlayer(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerVisible, currentSurah, togglePlay, prevSurah, nextSurah, hidePlayer]);

  // Stuck detection (ayah mode only)
  useEffect(() => {
    if (surahMode || !isPlaying || !currentSurah) return;
    const stuckTimer = setInterval(() => {
      const eng = engineRef.current;
      const audio = getActive();
      if (!audio || !audio.src) return;
      if (audio.paused && !audio.ended) { audio.play().catch(() => {}); }
      else if (audio.ended) { if (!eng.isTransitioning) handleAyahEnd(); }
    }, 5000);
    return () => clearInterval(stuckTimer);
  }, [isPlaying, currentSurah, surahMode]);

  // Progress bar click/touch handlers
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSurah) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    if (surahMode) {
      const audio = surahAudioRef.current;
      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = ratio * audio.duration;
      }
    } else {
      const targetAyah = Math.max(1, Math.ceil(ratio * totalAyahsInSurah));
      seekToAyah(targetAyah);
    }
  }, [currentSurah, totalAyahsInSurah, seekToAyah, surahMode]);

  const handleProgressTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!currentSurah || !e.touches[0]) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));

    if (surahMode) {
      const audio = surahAudioRef.current;
      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = ratio * audio.duration;
      }
    } else {
      const targetAyah = Math.max(1, Math.ceil(ratio * totalAyahsInSurah));
      seekToAyah(targetAyah);
    }
  }, [currentSurah, totalAyahsInSurah, seekToAyah, surahMode]);

  if (!isPlayerVisible || !currentSurah) return null;

  // === PROGRESS CALCULATION ===
  let surahProgressPercent = 0;
  let displayPosition = "0:00";
  let displayDuration = "0:00";

  if (surahMode) {
    surahProgressPercent = surahDuration > 0 ? (surahCurrentTime / surahDuration) * 100 : 0;
    displayPosition = formatTime(surahCurrentTime);
    displayDuration = formatTime(surahDuration);
  } else {
    const ayahProgress = currentAyahDuration > 0 ? Math.min(1, currentAyahTime / currentAyahDuration) : 0;
    surahProgressPercent = totalAyahsInSurah > 0 ? ((currentAyahInSurah - 1 + ayahProgress) / totalAyahsInSurah) * 100 : 0;
    const totalSurahTime = accumulatedTime + currentAyahDuration;
    const surahPosition = accumulatedTime + currentAyahTime;
    displayPosition = formatTime(surahPosition);
    displayDuration = formatTime(totalSurahTime);
  }

  return (
    <>
      {/* Ayah-level audio elements */}
      <audio ref={audioARef} preload="auto" />
      <audio ref={audioBRef} preload="auto" />
      {/* Surah-level audio element */}
      <audio ref={surahAudioRef} preload="auto" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/20 safe-area-bottom"
        style={{
          background: "rgba(10, 5, 24, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 sm:h-1.5 cursor-pointer group relative touch-none"
          onClick={handleProgressClick}
          onTouchMove={handleProgressTouch}
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600"
            style={{
              width: `${Math.min(100, surahProgressPercent)}%`,
              transition: surahProgressPercent > 0 ? "none" : "width 0.3s ease",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-amber-400/50"
            style={{ left: `${Math.min(100, surahProgressPercent)}%`, marginLeft: "-5px" }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-4 px-2 sm:px-6 py-2 sm:py-3 max-w-screen-xl mx-auto">
          {/* Left: Surah info + wave */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <AudioWave isPlaying={isPlaying} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-amber-400 font-medium">{currentSurah.number}</span>
                <span className="arabic-name text-base sm:text-lg text-amber-400 truncate">{currentSurah.arabicName}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:inline">{currentSurah.englishName}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground tabular-nums">
                {surahMode ? (
                  <span>{displayPosition}/{displayDuration}</span>
                ) : (
                  <>
                    {currentAyahInSurah}/{totalAyahsInSurah}
                    {(accumulatedTime + currentAyahDuration) > 0 && (
                      <span className="hidden sm:inline"> &middot; {displayPosition}/{displayDuration}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <button onClick={prevSurah} className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Previous surah">
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={togglePlay}
              className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 ${
                isPlaying ? "bg-amber-500 text-[#0a0518] hover:bg-amber-400 shadow-lg shadow-amber-500/30" : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
            </button>
            <button onClick={nextSurah} className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Next surah">
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right: Volume + Close */}
          <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-end">
            <button onClick={() => setIsMuted(!isMuted)} className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-20">
                <Slider min={0} max={1} step={0.01} value={[isMuted ? 0 : volume]} onValueChange={(val) => { setVolume(val[0]); if (val[0] > 0) setIsMuted(false); }} className="cursor-pointer" />
              </div>
            </div>
            <button onClick={hidePlayer} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-purple-500/10 active:scale-95" aria-label="Close player">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
