'use client';

import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { TRANSLATION_LANGUAGES } from '@/lib/quran-types';
import type { TranslationLanguage } from '@/lib/quran-types';

const LANG_OPTIONS = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'urdu', name: 'Urdu', flag: '🇵🇰' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'indonesian', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'turkish', name: 'Turkish', flag: '🇹🇷' },
  { code: 'russian', name: 'Russian', flag: '🇷🇺' },
];

export default function TranslationSelector() {
  const { showTranslations, setShowTranslations } = useAudioStore();

  return (
    <div className="relative">
      <button
        onClick={() => setShowTranslations(!showTranslations)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white"
      >
        <span>🌐 Translations</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showTranslations ? 'rotate-180' : ''}`} />
      </button>

      {showTranslations && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[rgba(15,10,30,0.95)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl z-50 p-3">
          <h4 className="text-white text-sm font-semibold mb-2">Select Translations</h4>
          <div className="space-y-1">
            {LANG_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}