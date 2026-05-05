import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qalam - Quran Kareem",
  description:
    "Qalam (قَلَم) - A premium Quran Kareem streaming application by MedTechAI Arab Organization. Listen to the Holy Quran recited by world-renowned Qaris with beautiful gapless audio streaming, reading mode, and more.",
  keywords: [
    "Quran",
    "Quran Kareem",
    "Qalam",
    "Islamic",
    "Quran Streaming",
    "Qari",
    "Recitation",
    "MedTechAI",
  ],
  openGraph: {
    title: "Qalam - Quran Kareem",
    description: "A premium Quran Kareem streaming application by MedTechAI Arab Organization",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${outfit.variable} font-sans antialiased`}
        style={{
          fontFamily:
            'var(--font-outfit), "Outfit", system-ui, sans-serif',
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
