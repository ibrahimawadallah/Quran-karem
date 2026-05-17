import { NextResponse } from 'next/server';

interface TimingSegment {
  timestamp: number;
  duration: number;
  segment: string;
}

const RECITER_ID_MAP: Record<string, number> = {
  'ar.alafasy': 7,
  'ar.abdulbasitmujawwad': 1,
  'ar.abdulbasitmurattal': 2,
  'ar.abdurrahmaansudais': 3,
  'ar.abubakralshatri': 4,
  'ar.hanirifai': 5,
  'ar.husary': 6,
  'ar.husarymuallim': 12,
  'ar.minshawi': 9,
  'ar.minshawimujawwad': 8,
  'ar.shuraym': 10,
  'ar.tablawi': 11,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ surahNumber: string }> }
) {
  try {
    const { surahNumber: surahStr } = await params;
    const surahNumber = parseInt(surahStr, 10);
    const url = new URL(request.url);
    let reciterId = url.searchParams.get('reciter') || '7';
    
    if (RECITER_ID_MAP[reciterId]) {
      reciterId = String(RECITER_ID_MAP[reciterId]);
    }

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}`,
      { signal: request.signal }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch timing data from API.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    const timings: { timestamp: number; ayahKey: string }[] = [];
    
    if (data.audio_files && Array.isArray(data.audio_files)) {
      for (const audioFile of data.audio_files) {
        if (audioFile.segments && Array.isArray(audioFile.segments)) {
          for (const seg of audioFile.segments) {
            if (Array.isArray(seg) && seg.length >= 3 && seg[0] > 0) {
              timings.push({
                timestamp: seg[0],
                ayahKey: audioFile.verse_key || `${surahNumber}:${seg[2]}`,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      surahNumber,
      reciterId,
      timings,
    });
  } catch (error) {
    console.error('Timing fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred fetching timing data.' },
      { status: 500 }
    );
  }
}