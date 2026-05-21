import { NextResponse } from 'next/server';

// Map our internal reciter IDs to alquran.cloud API format
const ALQURAN_RECITER_MAP: Record<string, string> = {
  'ar.alafasy': 'ar.alafasy',
  'ar.abdulbasitmujawwad': 'ar.abdulbasit',
  'ar.abdulbasitmurattal': 'ar.abdulbasit',
  'ar.husary': 'ar.husary',
  'ar.husarymuallim': 'ar.husarymuallim',
  'ar.minshawi': 'ar.minshawi',
  'ar.minshawimujawwad': 'ar.minshawi',
  'ar.saudalshuraim': 'ar.shuraym',
};

// Map our internal reciter IDs to jsdelivr CDN folder names (more reliable)
const JSDELIVR_FOLDER_MAP: Record<string, string> = {
  'ar.alafasy': 'MishariAlafasy',
  'ar.abdulbasitmurattal': 'AbdulBasit/murattal',
  'ar.abdulbasitmujawwad': 'AbdulBasit/mujawwad',
  'ar.husary': 'Husary',
  'ar.husarymuallim': 'Husary',
  'ar.saudalshuraim': 'Shuraim',
  'ar.minshawi': 'Minshawi',
  'ar.minshawimujawwad': 'Minshawi',
  'ar.yasseraldossari': 'YasserAlDossari',
  'ar.mahershakhashiro': 'MaherAlMuaiqly',
  'ar.muhammadayyub': 'MuhammadAyyub',
  'ar.haniarrifai': 'HaniArRifai',
  'ar.ahmedalajmi': 'AhmedAlAjmi',
  'ar.mahmoudalialbanna': 'MahmoudAlBanna',
  'ar.muhammadanwarshahat': 'MuhammadAnwarShahat',
  'ar.aliabdurrahmanalhuthaify': 'AliAlHudhaify',
  'ar.abdullahbasfar': 'AbdullahBasfar',
  'ar.faresabbad': 'FaresAbbaad',
  'ar.ibrahimalakhdar': 'IbrahimAlAkhdar',
  'ar.abdullahalmatrood': 'AbdullahAlMatrood',
  'ar.salahalbudair': 'SalahAlBudair',
  'ar.muhammadalluhaidan': 'MuhammadAlLuhaidan',
  'ar.ibrahimaldossari': 'IbrahimAlDossari',
  'ar.nasseralqatami': 'NasserAlQatami',
  'ar.khaledalqahtani': 'KhaledAlQahtani',
  'ar.abdulbariaththubaity': 'AbdulBariAthThubaity',
  'ar.mustafaismail': 'MustafaIsmail',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const surahNumber = url.searchParams.get('surah');
  const reciterId = url.searchParams.get('reciter');

  if (!surahNumber || !reciterId) {
    return NextResponse.json({ error: 'Missing surah or reciter parameter' }, { status: 400 });
  }

  // Try alquran.cloud API first for supported reciters
  const alquranReciterId = ALQURAN_RECITER_MAP[reciterId];
  if (alquranReciterId) {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/${alquranReciterId}`,
        { signal: request.signal }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data?.ayahs?.[0]?.audio) {
          return NextResponse.json({
            audioUrl: data.data.ayahs[0].audio,
            format: 'mp3'
          });
        }
      }
    } catch {
      // Fall through to jsdelivr fallback
    }
  }

  // Fallback to jsdelivr CDN
  const jsdelivrFolder = JSDELIVR_FOLDER_MAP[reciterId];
  if (jsdelivrFolder) {
    const padded = surahNumber.padStart(3, '0');
    const audioUrl = `https://cdn.jsdelivr.net/gh/mfeti/quran-audio@1.0.0/${jsdelivrFolder}/${padded}.mp3`;
    return NextResponse.json({ audioUrl, format: 'mp3' });
  }

  return NextResponse.json({ error: 'No audio URL found for this reciter and surah' }, { status: 404 });
}