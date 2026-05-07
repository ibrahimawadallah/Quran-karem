'use client';

import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import FilterBar from '@/components/filter-bar';
import SurahList from '@/components/surah-list';
import AudioPlayer from '@/components/audio-player';
import ReciterPanel from '@/components/reciter-panel';
import SurahReadingModal from '@/components/surah-reading-modal';
import ScrollToTop from '@/components/scroll-to-top';
import Footer from '@/components/footer';
import { useAudioStore } from '@/lib/audio-store';

export default function Home() {
  const { isPlayerVisible } = useAudioStore();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0a0518' }}>
      {/* Ambient orbs — smaller on mobile */}
      <div
        className="ambient-orb-slow w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-purple-600/20 -top-20 sm:-top-40 -left-20 sm:-left-40"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="ambient-orb w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-amber-500/10 top-1/3 -right-16 sm:-right-32"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="ambient-orb-slow w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-purple-600/15 bottom-20 left-1/4"
        style={{ animationDelay: '-12s' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header / Navbar */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* Filter Bar */}
        <FilterBar />

        {/* Surah List */}
        <main className="flex-1">
          <SurahList />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Fixed components */}
      <ScrollToTop />

      {/* Audio Player (fixed at bottom) */}
      {isPlayerVisible && <AudioPlayer />}

      {/* Reciter Panel (slide-in) */}
      <ReciterPanel />

      {/* Surah Reading Modal */}
      <SurahReadingModal />

      {/* Bottom padding for audio player — accounts for safe area on mobile */}
      {isPlayerVisible && <div className="h-16 sm:h-20" />}
    </div>
  );
}
