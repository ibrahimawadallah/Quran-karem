'use client';

import { Play, Pause, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAudioStore } from '@/lib/audio-store';
import type { Surah } from '@/lib/quran-types';

export default function SurahList() {
  const { filteredSurahs, viewMode, currentSurah, isPlaying, play, togglePlay, openReadingModal } =
    useAudioStore();

  const surahs = filteredSurahs();

  const handlePlay = (surah: Surah, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSurah?.number === surah.number) {
      togglePlay();
    } else {
      play(surah.number);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    openReadingModal(surah);
  };

  if (surahs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg font-medium">No surahs found</p>
        <p className="text-sm mt-1">Try a different search or filter</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 px-4 py-4 max-w-6xl mx-auto">
        {surahs.map((surah) => {
          const isCurrentSurah = currentSurah?.number === surah.number;
          return (
            <div
              key={surah.number}
              onClick={() => handleSurahClick(surah)}
              className={`glass-card-hover rounded-xl p-4 cursor-pointer interactive-transition ${
                isCurrentSurah ? 'playing-highlight' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                {/* Surah number badge */}
                <div className="surah-number-badge w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#0a0518]">
                  {surah.number}
                </div>
                {/* Play button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handlePlay(surah, e)}
                  className={`h-9 w-9 rounded-full active:scale-95 ${
                    isCurrentSurah
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  {isCurrentSurah && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Arabic name */}
              <p className="arabic-name text-xl text-amber-400 mb-1 text-right">{surah.arabicName}</p>

              {/* English name & meaning */}
              <p className="text-sm font-medium text-foreground truncate">{surah.englishName}</p>
              <p className="text-xs text-muted-foreground truncate">{surah.englishMeaning}</p>

              {/* Footer: ayah count + revelation type */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/10">
                <span className="text-xs text-muted-foreground">{surah.ayahCount} Ayahs</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0 ${
                    surah.revelationType === 'Meccan'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {surah.revelationType}
                </Badge>
              </div>

              {/* Audio bars for playing surah */}
              {isCurrentSurah && isPlaying && (
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="audio-bar w-1 bg-amber-400 rounded-full" style={{ height: '4px', animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className="px-4 py-3 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        {surahs.map((surah) => {
          const isCurrentSurah = currentSurah?.number === surah.number;
          return (
            <div
              key={surah.number}
              onClick={() => handleSurahClick(surah)}
              className={`glass-card-hover rounded-xl px-3 sm:px-4 py-2.5 cursor-pointer interactive-transition flex items-center gap-3 sm:gap-4 ${
                isCurrentSurah ? 'playing-highlight' : ''
              }`}
            >
              {/* Surah number badge */}
              <div className="surah-number-badge w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#0a0518] shrink-0">
                {surah.number}
              </div>

              {/* Surah info */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="arabic-name text-lg text-amber-400">{surah.arabicName}</p>
                    <div className="min-w-0 hidden sm:block">
                      <p className="text-sm font-medium text-foreground truncate">{surah.englishName}</p>
                      <p className="text-xs text-muted-foreground truncate">{surah.englishMeaning}</p>
                    </div>
                  </div>
                  {/* Mobile-only English name below Arabic */}
                  <div className="sm:hidden mt-0.5">
                    <p className="text-xs font-medium text-foreground truncate">{surah.englishName}</p>
                  </div>
                </div>

                {/* Right section: ayah count, revelation badge, buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">{surah.ayahCount} Ayahs</span>

                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0 hidden sm:inline-flex ${
                      surah.revelationType === 'Meccan'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {surah.revelationType}
                  </Badge>

                  {/* Read button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openReadingModal(surah);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-purple-300 hover:bg-purple-500/10 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>

                  {/* Play button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handlePlay(surah, e)}
                    className={`h-9 w-9 rounded-full active:scale-95 ${
                      isCurrentSurah
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    {isCurrentSurah && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Audio bars for playing surah */}
                  {isCurrentSurah && isPlaying && (
                    <div className="flex items-center gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="audio-bar w-1 bg-amber-400 rounded-full" style={{ height: '4px', animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
