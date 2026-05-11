import { BookOpen, Info, X, Menu } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { useState } from 'react';

export default function Header() {
  const { toggleReciterPanel } = useAudioStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-purple-500/10 bg-[rgba(10,5,24,0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(10,5,24,0.5)]">
         <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
           {/* Brand */}
           <div className="flex items-center gap-2 min-w-0">
             <img
               src="/mushaf-logo.jpg"
               alt="Qalam Logo"
               className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
               loading="eager"
             />
             <span
               className="text-base sm:text-lg font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent truncate"
               style={{
                 fontFamily:
                   'var(--font-space-grotesk), "Space Grotesk", sans-serif',
               }}
             >
               Qalam
             </span>
           </div>

           {/* Desktop nav */}
           <nav className="hidden sm:flex items-center gap-0.5">
             <button
               onClick={() =>
                 window.scrollTo({ top: 0, behavior: "smooth" })
               }
               className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all whitespace-nowrap"
             >
               <BookOpen className="w-4 h-4 flex-shrink-0" />
               <span className="hidden xs:inline">Quran</span>
             </button>
             <button
               onClick={() => setShowAbout(true)}
               className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all whitespace-nowrap"
             >
               <Info className="w-4 h-4 flex-shrink-0" />
               <span className="hidden xs:inline">About</span>
             </button>
             <button
               onClick={toggleReciterPanel}
               className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all whitespace-nowrap"
             >
               <svg
                 className="w-4 h-4 flex-shrink-0"
                 fill="currentColor"
                 viewBox="0 0 24 24"
               >
                 <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                 <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
               </svg>
               <span className="hidden xs:inline">Reciters</span>
             </button>
           </nav>

           {/* Mobile menu button */}
           <button
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className="sm:hidden p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/10 active:scale-95 touch-manipulation"
             aria-label="Toggle menu"
           >
             {mobileMenuOpen ? (
               <X className="w-5 h-5" />
             ) : (
               <Menu className="w-5 h-5" />
             )}
           </button>
         </div>

         {/* Mobile menu dropdown */}
         {mobileMenuOpen && (
           <div className="sm:hidden border-t border-purple-500/10 bg-[rgba(10,5,24,0.95)] backdrop-blur-xl px-3 py-3 space-y-1">
             <button
               onClick={() => {
                 window.scrollTo({ top: 0, behavior: "smooth" });
                 setMobileMenuOpen(false);
               }}
               className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all touch-manipulation"
             >
               <BookOpen className="w-4 h-4 flex-shrink-0" />
               <span className="truncate">Quran</span>
             </button>
             <button
               onClick={() => {
                 setShowAbout(true);
                 setMobileMenuOpen(false);
               }}
               className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all touch-manipulation"
             >
               <Info className="w-4 h-4 flex-shrink-0" />
               <span className="truncate">About</span>
             </button>
             <button
               onClick={() => {
                 toggleReciterPanel();
                 setMobileMenuOpen(false);
               }}
               className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all touch-manipulation"
             >
               <svg
                 className="w-4 h-4 flex-shrink-0"
                 fill="currentColor"
                 viewBox="0 0 24 24"
               >
                 <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                 <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
               </svg>
               <span className="truncate">Reciters</span>
             </button>
           </div>
         )}
        </header>
  );
}