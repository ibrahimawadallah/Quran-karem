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
}

export interface AudioQuality {
  label: string;
  value: string;
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
