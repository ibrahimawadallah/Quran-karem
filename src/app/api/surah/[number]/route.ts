import { NextResponse } from 'next/server';
import { AyahText, SurahText } from '@/lib/quran-types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number: surahNumberStr } = await params;
    const surahNumber = parseInt(surahNumberStr, 10);

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    // Fetch Arabic (Uthmani) and English (Hilali-Khan) texts in parallel
    const [arabicRes, englishRes] = await Promise.allSettled([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.hilali`),
    ]);

    if (arabicRes.status === 'rejected' || englishRes.status === 'rejected') {
      return NextResponse.json(
        { error: 'Failed to fetch surah data from external API.' },
        { status: 502 }
      );
    }

    const arabicData = await arabicRes.value.json();
    const englishData = await englishRes.value.json();

    if (arabicData.code !== 200 || englishData.code !== 200) {
      return NextResponse.json(
        { error: 'External API returned an error.', details: { arabic: arabicData, english: englishData } },
        { status: 502 }
      );
    }

    const arabicAyahs: AyahText[] = arabicData.data.ayahs.map(
      (ayah: { number: number; numberInSurah: number; text: string }) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
      })
    );

    const englishAyahs: AyahText[] = englishData.data.ayahs.map(
      (ayah: { number: number; numberInSurah: number; text: string }) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
      })
    );

    const result: SurahText = {
      surahNumber,
      arabicAyahs,
      englishAyahs,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching surah data.' },
      { status: 500 }
    );
  }
}
