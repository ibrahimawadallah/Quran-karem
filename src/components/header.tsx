"use client";

import React, { useState, useEffect } from "react";
import {
  PenTool,
  BookOpen,
  Info,
  Heart,
  Menu,
  X,
  Mail,
  Phone,
  Shield,
  MessageSquare,
  ExternalLink,
  Globe,
  Crown,
  Megaphone,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAudioStore } from "@/lib/audio-store";

/** About Qalam modal — includes contact info */
function AboutModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-purple-900/30 sm:max-w-lg max-h-[85vh] overflow-y-auto"
        style={{
          background: "rgba(15, 10, 30, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(139, 92, 246, 0.3) transparent",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-white text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            About Qalam
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Learn more about the Qalam project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <PenTool className="w-6 h-6 text-[#0a0518]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Qalam</h3>
              <p className="text-amber-400 text-sm arabic-name">قَلَم</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Qalam</strong> is a premium Quran
              Kareem streaming application designed to provide Muslims worldwide
              with a beautiful, immersive experience for listening to and reading
              the Holy Quran.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Featuring high-quality audio recitations from world-renowned Qaris,
              gapless playback technology, and a full Arabic text with English
              translation — Qalam brings the words of Allah closer to your heart.
            </p>
          </div>

          {/* Authority badge */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">
                Under the Authority of
              </span>
            </div>
            <p className="text-white font-bold text-base">
              MedTechAI Arab Organization
            </p>
            <p className="text-gray-400 text-xs mt-1">
              A registered organization dedicated to leveraging technology for
              the service of Islam and the Muslim Ummah.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: "114 Surahs", desc: "Complete Quran" },
              {
                icon: MessageSquare,
                label: "10+ Reciters",
                desc: "World-renowned Qaris",
              },
              { icon: PenTool, label: "Read Mode", desc: "Arabic + English" },
              {
                icon: Heart,
                label: "Free Forever",
                desc: "No ads, no subscriptions",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5"
              >
                <feature.icon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-xs font-medium">
                    {feature.label}
                  </p>
                  <p className="text-gray-500 text-[11px]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Our Team
            </h4>
            <div className="space-y-2">
              {[
                {
                  icon: Crown,
                  name: "Hassan",
                  nameAr: "حَسَن",
                  role: "CEO",
                  desc: "Chief Executive Officer",
                  color: "amber",
                },
                {
                  icon: Megaphone,
                  name: "Marketing",
                  nameAr: "التسويق",
                  role: "Marketing",
                  desc: "Brand & Outreach",
                  color: "purple",
                },
                {
                  icon: Search,
                  name: "Seyworts",
                  nameAr: "سيوورتس",
                  role: "SEO",
                  desc: "Search Engine Optimization",
                  color: "emerald",
                },
              ].map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-white/5"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      member.color === "amber"
                        ? "bg-amber-500/15"
                        : member.color === "purple"
                        ? "bg-purple-500/15"
                        : "bg-emerald-500/15"
                    }`}
                  >
                    <member.icon
                      className={`w-5 h-5 ${
                        member.color === "amber"
                          ? "text-amber-400"
                          : member.color === "purple"
                          ? "text-purple-400"
                          : "text-emerald-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{member.name}</p>
                      <span
                        className="arabic-name text-xs text-amber-400/70"
                        style={{ direction: "rtl" }}
                      >
                        {member.nameAr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[11px] font-medium ${
                          member.color === "amber"
                            ? "text-amber-400"
                            : member.color === "purple"
                            ? "text-purple-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {member.role}
                      </span>
                      <span className="text-gray-600 text-[10px]">•</span>
                      <span className="text-gray-500 text-[11px]">{member.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Suggestions */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Contact &amp; Suggestions
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              For any suggestions, reports, or inquiries, please reach out to us:
            </p>

            <div className="space-y-2.5">
              {/* Email */}
              <a
                href="mailto:support@medtechai.net"
                className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Email Support</p>
                  <p className="text-amber-400 text-sm truncate">
                    support@medtechai.net
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
              </a>

              {/* Website */}
              <a
                href="https://quran.medtechai.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Globe className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">Website</p>
                  <p className="text-amber-400 text-sm truncate">
                    quran.medtechai.net
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
              </a>

              {/* Phone */}
              <a
                href="tel:+971525397947"
                className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">
                    Phone / WhatsApp
                  </p>
                  <p className="text-amber-400 text-sm">+971 52 539 7947</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quranic verse */}
          <div className="text-center pt-2 border-t border-white/10">
            <p
              className="text-amber-400/80 text-lg basmala-glow"
              style={{
                fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
                direction: "rtl",
              }}
            >
              إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَـٰفِظُونَ
            </p>
            <p className="text-gray-500 text-[11px] mt-1 italic">
              &ldquo;Indeed, it is We who sent down the Quran and indeed, We will
              be its guardian.&rdquo; — Surah Al-Hijr 15:9
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Header() {
  const [showAbout, setShowAbout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleReciterPanel } = useAudioStore();

  // Listen for custom event from footer's About link
  useEffect(() => {
    const handler = () => setShowAbout(true);
    window.addEventListener("open-about", handler);
    return () => window.removeEventListener("open-about", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-purple-500/10 bg-[rgba(10,5,24,0.7)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
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

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Quran
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button
              onClick={toggleReciterPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
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
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/10"
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
          <div className="sm:hidden border-t border-purple-500/10 bg-[rgba(10,5,24,0.95)] backdrop-blur-xl px-4 py-3 space-y-1">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Quran
            </button>
            <button
              onClick={() => {
                setShowAbout(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button
              onClick={() => {
                toggleReciterPanel();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all"
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
        )}
      </header>

      {/* Modals */}
      <AboutModal open={showAbout} onOpenChange={setShowAbout} />
    </>
  );
}
