import { NextResponse } from 'next/server';

const RECITER_ID_MAP: Record<string, string> = {
  'ar.alafasy': 'ar.alafasy',
  'ar.abdulbasitmujawwad': 'ar.abdulbasit',
  'ar.abdulbasitmurattal': 'ar.abdulbasit',
  'ar.abdurrahmaansudais': 'ar.sudais',
  'ar.abubakralshatri': 'ar.shatri',
  'ar.hanirifai': 'ar.hanirifai',
  'ar.husary': 'ar.husary',
  'ar.husarymuallim': 'ar.husarymuallim',
  'ar.minshawi': 'ar.minshawi',
  'ar.minshawimujawwad': 'ar.minshawi',
  'ar.shuraym': 'ar.shuraym',
  'ar.tablawi': 'ar.tablawi',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const surahNumber = url.searchParams.get('surah');
  const reciterId = url.searchParams.get('reciter');

  if (!surahNumber || !reciterId) {
    return NextResponse.json({ error: 'Missing surah or reciter parameter' }, { status: 400 });
  }

  const alquranReciterId = RECITER_ID_MAP[reciterId] || 'ar.alafasy';

  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${alquranReciterId}`,
      { signal: request.signal }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from alquran.cloud' }, { status: 502 });
    }

    const data = await response.json();
    
    if (data.data?.ayahs?.[0]?.audio) {
      return NextResponse.json({ 
        audioUrl: data.data.ayahs[0].audio,
        format: 'mp3'
      });
    }

    return NextResponse.json({ error: 'No audio found' }, { status: 404 });
  } catch (error) {
    console.error('Audio URL fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch audio URL' }, { status: 500 });
  }
}