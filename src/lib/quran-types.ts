export interface Surah {
  number: number;
  arabicName: string;
  englishName: string;
  englishMeaning: string;
  ayahCount: number;
  revelationType: "Meccan" | "Medinan";
  description: string;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  country: string;
  category: "Popular" | "Egyptian" | "Saudi" | "Other";
  style: "Murattal" | "Mujawwad";
  /** Audio source type: "ayah" = per-ayah files from cdn.islamic.network, "surah" = per-surah files from mp3quran.net */
  audioSource?: "ayah" | "surah";
  /** For surah-source reciters: the CDN base URL (e.g., "https://server8.mp3quran.net/afs") */
  audioBaseUrl?: string;
  /** For surah-source reciters: the surah file prefix (e.g., "afs") */
  audioPrefix?: string;
}

export interface AyahText {
  number: number;
  numberInSurah: number;
  text: string;
}

export interface SurahText {
  surahNumber: number;
  arabicAyahs: AyahText[];
  englishAyahs: AyahText[];
}
