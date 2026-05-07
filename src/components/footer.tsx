'use client';

import Image from 'next/image';
import { Heart, BookOpen, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-purple-500/10 bg-[rgba(10,5,24,0.8)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Brand with mushaf logo */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-amber-500/30">
              <Image
                src="/mushaf-logo.png"
                alt="Qalam"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="text-lg font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
            >
              Qalam
            </span>
          </div>

          {/* Quranic verse */}
          <p className="arabic-name text-lg text-amber-400/80 basmala-glow mb-1" style={{ direction: 'rtl' }}>
            إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ
          </p>
          <p className="text-xs text-muted-foreground italic max-w-md">
            &ldquo;Indeed, it is We who sent down the Quran and indeed, We will be its guardian.&rdquo; — Surah Al-Hijr 15:9
          </p>
        </div>

        {/* MedTechAI Authority */}
        <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/10 max-w-lg mx-auto">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400/80 text-center leading-relaxed">
            Under the Authority of <span className="font-semibold text-amber-400">MedTechAI Arab Organization</span> — A registered organization dedicated to leveraging technology for the service of Islam and the Muslim Ummah.
          </p>
        </div>

        {/* Links row */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Quran
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <Heart className="w-4 h-4" />
            About
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-500/10 pt-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Qalam — Quran Kareem Streaming App. Under the authority of MedTechAI Arab Organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
