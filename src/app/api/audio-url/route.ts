import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const surahNumber = url.searchParams.get('surah');
  const reciterId = url.searchParams.get('reciter');

  if (!surahNumber || !reciterId) {
    return NextResponse.json({ error: 'Missing surah or reciter parameter' }, { status: 400 });
  }

  const surah = parseInt(surahNumber, 10);
  const qfReciterId = RECITER_ID_MAP[reciterId];

  if (!qfReciterId) {
    return NextResponse.json({ error: 'Invalid reciter ID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${qfReciterId}?chapter=${surah}`,
      { signal: request.signal }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch audio from Quran.com' }, { status: 502 });
    }

    const data = await response.json();
    
    if (data.audio_files?.[0]?.audio_url) {
      return NextResponse.json({ 
        audioUrl: data.audio_files[0].audio_url,
        fileSize: data.audio_files[0].file_size,
        format: data.audio_files[0].format
      });
    }

    return NextResponse.json({ error: 'No audio file found' }, { status: 404 });
  } catch (error) {
    console.error('Audio URL fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch audio URL' }, { status: 500 });
  }
}