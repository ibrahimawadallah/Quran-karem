"use client";

import React from "react";
import { PenTool, BookOpen, Info } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";

export default function Footer() {
  const { toggleReciterPanel } = useAudioStore();

  return (
    <footer className="mt-auto border-t border-purple-500/10 bg-[rgba(10,5,24,0.8)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-[#0a0518]" />
            </div>
            <span
              className="text-lg font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
              style={{
                fontFamily:
                  'var(--font-space-grotesk), "Space Grotesk", sans-serif',
              }}
            >
              Qalam
            </span>
          </div>

          {/* Quranic verse */}
          <p
            className="arabic-name text-lg text-amber-400/80 basmala-glow mb-1"
            style={{ direction: "rtl" }}
          >
            إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ
          </p>
          <p className="text-xs text-muted-foreground italic max-w-md">
            &ldquo;Indeed, it is We who sent down the Quran and indeed, We will
            be its guardian.&rdquo; — Surah Al-Hijr 15:9
          </p>
        </div>

        {/* Links row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 flex-wrap">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Quran
          </button>
          <button
            onClick={() => {
              // Trigger the About modal from header by dispatching a custom event
              window.dispatchEvent(new CustomEvent("open-about"));
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <Info className="w-4 h-4" />
            About
          </button>
          <button
            onClick={toggleReciterPanel}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            Reciters
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-500/10 pt-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <a href="https://quran.medtechai.net" className="text-amber-400/80 font-medium hover:text-amber-400 transition-colors">
                quran.medtechai.net
              </a>{" "}
              — Qalam by{" "}
              <span className="text-amber-400/80 font-medium">
                MedTechAI Arab Organization
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
