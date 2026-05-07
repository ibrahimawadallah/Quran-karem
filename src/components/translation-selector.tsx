'use client';

import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { TRANSLATION_LANGUAGES, TranslationLanguage } from '@/lib/quran-types';
import { useAudioStore } from '@/lib/audio-store';

export default function TranslationSelector() {
  const { selectedTranslations, showTranslations, toggleTranslation, setShowTranslations } = useAudioStore();

  const toggleLang = (lang: TranslationLanguage) => {
    toggleTranslation(lang);
  };

  const getSelectedLangs = () => {
    return selectedTranslations.map(lang => TRANSLATION_LANGUAGES[lang]);
  };

  return (
    <div className="relative">
      {/* Mobile trigger button */}
      <button
        onClick={() => setShowTranslations(!showTranslations)}
        className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white"
      >
        <span>Translations</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showTranslations ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected languages pills */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        {getSelectedLangs().map((lang) => (
          <div
            key={lang.code}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-white"
          >
            <span>{lang.flag}</span>
            <span>{lang.code.toUpperCase()}</span>
            <button
              onClick={() => toggleLang(lang.code as TranslationLanguage)}
              className="ml-1 hover:text-red-400 transition-colors"
              aria-label={`Remove ${lang.name} translation`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        <button
          onClick={() => setShowTranslations(!showTranslations)}
          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors text-xs text-amber-400"
        >
          {showTranslations ? 'Close' : 'Add'}
        </button>
      </div>

      {/* Dropdown panel */}
      {(showTranslations || selectedTranslations.length === 0) && (
        <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[rgba(15,10,30,0.95)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30">
          <div className="p-3 border-b border-purple-500/20">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              <span className="text-amber-400">📖</span>
              Select Translations
            </h4>
            <p className="text-gray-400 text-[10px] mt-1">
              Up to 5 languages. English is always included.
            </p>
          </div>

          <div className="p-2 space-y-1">
            {/* English (always selected) */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span>
                <div>
                  <p className="text-white text-sm font-medium">English</p>
                  <p className="text-gray-400 text-[10px]">Hilali-Khan</p>
                </div>
              </div>
              <Check className="w-4 h-4 text-amber-400" />
            </div>

            {/* Other languages */}
            {Object.entries(TRANSLATION_LANGUAGES)
              .filter(([code]) => code !== 'english')
              .map(([code, lang]) => {
                const isSelected = selectedTranslations.includes(code as TranslationLanguage);
                const isMaxReached = selectedTranslations.length >= 5 && !isSelected;

                return (
                  <button
                    key={code}
                    onClick={() => toggleLang(code as TranslationLanguage)}
                    disabled={isMaxReached}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white/10 border border-purple-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    } ${
                      isMaxReached ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <div className="text-left">
                        <p className="text-white text-sm">{lang.name}</p>
                        <p className="text-gray-400 text-[10px]">{lang.arabicName}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
          </div>

          {selectedTranslations.length > 1 && (
            <div className="p-3 border-t border-purple-500/20">
              <button
                onClick={() => {
                  // Keep only English
                  const { selectedTranslations, toggleTranslation } = useAudioStore.getState();
                  selectedTranslations.forEach(lang => {
                    if (lang !== 'english') toggleTranslation(lang);
                  });
                }}
                className="w-full text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Remove all except English
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
