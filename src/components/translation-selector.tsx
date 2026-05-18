'use client';

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import type { TranslationLanguage } from '@/lib/quran-types';

const LANG_OPTIONS: { code: TranslationLanguage; name: string; flag: string }[] = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'urdu', name: 'Urdu', flag: '🇵🇰' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'indonesian', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'turkish', name: 'Turkish', flag: '🇹🇷' },
  { code: 'russian', name: 'Russian', flag: '🇷🇺' },
];

export default function TranslationSelector() {
  const { showTranslations, setShowTranslations, selectedTranslations, toggleTranslation } = useAudioStore();

  const handleToggle = (code: TranslationLanguage) => {
    toggleTranslation(code);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTranslations(!showTranslations)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white min-h-[44px] touch-manipulation w-full sm:w-auto"
      >
        <span>🌐 Translations ({selectedTranslations.length})</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showTranslations ? 'rotate-180' : ''}`} />
      </button>

      {showTranslations && (
        <div className="mt-2 w-full sm:absolute sm:top-full sm:left-0 sm:mt-2 sm:w-64 bg-[rgba(15,10,30,0.98)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl z-50 p-3">
          <h4 className="text-white text-sm font-semibold mb-2">Select Translations</h4>
          <div className="space-y-1">
            {LANG_OPTIONS.map((lang) => {
              const isSelected = selectedTranslations.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => handleToggle(lang.code)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 text-white text-sm min-h-[44px] touch-manipulation active:scale-[0.98]"
                >
                  <span>{isSelected ? <Check className="w-4 h-4 text-green-400" /> : <span className="w-4" />}</span>
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
