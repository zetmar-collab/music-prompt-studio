// Generuje resources/prompts.seed.json — kilka tysięcy realistycznych promptów
// dla Suno, Udio, Mureka, Stable Audio, ElevenLabs.
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'resources', 'prompts.seed.json')

const genres = [
  { g: 'synthwave', pl: 'synthwave', tags: ['retro', 'lata80', 'neon'] },
  { g: 'lo-fi hip hop', pl: 'lo-fi', tags: ['chill', 'nauka', 'relaks'] },
  { g: 'cinematic orchestral', pl: 'muzyka filmowa', tags: ['epicki', 'orkiestra', 'trailer'] },
  { g: 'deep house', pl: 'deep house', tags: ['klub', 'taniec', 'groove'] },
  { g: 'ambient', pl: 'ambient', tags: ['medytacja', 'sen', 'tło'] },
  { g: 'trap', pl: 'trap', tags: ['hip-hop', '808', 'bass'] },
  { g: 'acoustic folk', pl: 'folk akustyczny', tags: ['gitara', 'intymny', 'ognisko'] },
  { g: 'drum and bass', pl: 'drum and bass', tags: ['szybki', 'energetyczny', 'bass'] },
  { g: 'jazz', pl: 'jazz', tags: ['swing', 'saksofon', 'klub'] },
  { g: 'metalcore', pl: 'metalcore', tags: ['ciężki', 'gitary', 'agresywny'] },
  { g: 'pop', pl: 'pop', tags: ['radiowy', 'chwytliwy', 'refren'] },
  { g: 'reggaeton', pl: 'reggaeton', tags: ['latino', 'taniec', 'lato'] },
  { g: 'techno', pl: 'techno', tags: ['klub', 'hipnotyczny', 'berlin'] },
  { g: 'blues', pl: 'blues', tags: ['gitara', 'dusza', 'melancholia'] },
  { g: 'country', pl: 'country', tags: ['gitara', 'americana', 'droga'] },
  { g: 'phonk', pl: 'phonk', tags: ['drift', 'memphis', 'bass'] },
  { g: 'future bass', pl: 'future bass', tags: ['edm', 'kolorowy', 'drop'] },
  { g: 'gospel', pl: 'gospel', tags: ['chór', 'podniosły', 'dusza'] },
  { g: 'classical piano', pl: 'pianino klasyczne', tags: ['pianino', 'romantyczny', 'solowy'] },
  { g: 'indie rock', pl: 'indie rock', tags: ['gitary', 'alternatywa', 'garaż'] },
  { g: 'afrobeat', pl: 'afrobeat', tags: ['rytm', 'perkusja', 'taniec'] },
  { g: 'dubstep', pl: 'dubstep', tags: ['wobble', 'drop', 'bass'] },
  { g: 'bossa nova', pl: 'bossa nova', tags: ['brazylia', 'gitara', 'lekki'] },
  { g: 'hardstyle', pl: 'hardstyle', tags: ['rave', 'kick', 'energia'] }
]

const moods = [
  { m: 'nostalgic', pl: 'nostalgiczny' },
  { m: 'uplifting', pl: 'podnoszący na duchu' },
  { m: 'melancholic', pl: 'melancholijny' },
  { m: 'energetic', pl: 'energetyczny' },
  { m: 'dreamy', pl: 'senny' },
  { m: 'dark', pl: 'mroczny' },
  { m: 'romantic', pl: 'romantyczny' },
  { m: 'epic', pl: 'epicki' },
  { m: 'relaxing', pl: 'relaksujący' },
  { m: 'aggressive', pl: 'agresywny' },
  { m: 'hopeful', pl: 'pełen nadziei' },
  { m: 'mysterious', pl: 'tajemniczy' }
]

const themes = [
  { en: 'a night drive through neon city', pl: 'nocna jazda przez neonowe miasto' },
  { en: 'lost love and second chances', pl: 'utracona miłość i drugie szanse' },
  { en: 'chasing dreams against all odds', pl: 'pogoń za marzeniami wbrew przeciwnościom' },
  { en: 'rainy afternoon by the window', pl: 'deszczowe popołudnie przy oknie' },
  { en: 'a hero rising from defeat', pl: 'bohater powstający z porażki' },
  { en: 'summer road trip with friends', pl: 'letnia podróż z przyjaciółmi' },
  { en: 'quiet solitude in the mountains', pl: 'cicha samotność w górach' },
  { en: 'first light of a new day', pl: 'pierwsze światło nowego dnia' },
  { en: 'dancing until sunrise', pl: 'taniec aż do wschodu słońca' },
  { en: 'memories of childhood home', pl: 'wspomnienia rodzinnego domu' },
  { en: 'facing your inner demons', pl: 'konfrontacja z wewnętrznymi demonami' },
  { en: 'freedom on the open road', pl: 'wolność na otwartej drodze' },
  { en: 'city lights and lonely hearts', pl: 'światła miasta i samotne serca' },
  { en: 'a storm passing over the sea', pl: 'burza przechodząca nad morzem' },
  { en: 'reunion after many years', pl: 'spotkanie po wielu latach' },
  { en: 'letting go and moving on', pl: 'odpuszczenie i pójście dalej' },
  { en: 'midnight confession', pl: 'wyznanie o północy' },
  { en: 'victory after a long fight', pl: 'zwycięstwo po długiej walce' },
  { en: 'walking home in the snow', pl: 'powrót do domu w śniegu' },
  { en: 'a promise under the stars', pl: 'obietnica pod gwiazdami' }
]

const tempos = [70, 80, 90, 100, 110, 120, 128, 140, 150, 174]
const keys = ['C minor', 'A minor', 'G major', 'D minor', 'E minor', 'F major', 'B minor']
const instruments = {
  'synthwave': 'analog synths, gated reverb drums, punchy bass',
  'lo-fi hip hop': 'dusty piano, vinyl crackle, mellow drums, warm bass',
  'cinematic orchestral': 'full strings, brass, timpani, choir',
  'deep house': 'deep bassline, warm pads, four-on-the-floor kick',
  'ambient': 'evolving pads, field recordings, soft drones',
  'trap': '808 bass, crisp hi-hats, dark piano',
  'acoustic folk': 'fingerpicked acoustic guitar, soft vocals, light percussion',
  'drum and bass': 'fast breakbeats, deep sub bass, atmospheric pads',
  'jazz': 'upright bass, brushed drums, saxophone, piano',
  'metalcore': 'downtuned guitars, double kick, screamed vocals',
  'pop': 'bright synths, punchy drums, catchy vocal hook',
  'reggaeton': 'dembow rhythm, latin percussion, deep bass',
  'techno': 'driving kick, hypnotic synth stabs, industrial textures',
  'blues': 'electric guitar, Hammond organ, shuffle drums',
  'country': 'acoustic guitar, pedal steel, banjo, warm vocals',
  'phonk': 'distorted 808 cowbell, memphis vocal chops, lo-fi drums',
  'future bass': 'supersaws, pitched vocal chops, big drop',
  'gospel': 'choir, organ, powerful lead vocals, clapping',
  'classical piano': 'expressive grand piano, subtle strings',
  'indie rock': 'jangly guitars, driving bass, live drums',
  'afrobeat': 'polyrhythmic percussion, horns, groovy bass',
  'dubstep': 'wobble bass, heavy drops, glitchy percussion',
  'bossa nova': 'nylon guitar, soft brushes, gentle piano',
  'hardstyle': 'distorted kick, euphoric leads, reverse bass'
}
const vocalsList = ['męski, eteryczny', 'żeński, mocny', 'chóralny', 'szeptany', 'instrumentalny (bez wokalu)', 'rap']

let idc = 0
const prompts = []
const add = (p) => prompts.push(p)

// ---------- SUNO ----------
const structures = [
  { name: 'Pełna piosenka', s: 'Intro, Verse, Pre-Chorus, Chorus, Verse, Chorus, Bridge, Chorus, Outro' },
  { name: 'Radiowy singiel', s: 'Intro, Verse, Chorus, Verse, Chorus, Outro' },
  { name: 'Instrumentalny', s: 'Intro, Theme A, Theme B, Theme A, Solo, Outro' }
]
for (const g of genres) {
  for (const th of themes) {
    for (const struct of structures) {
      const t = tempos[idc % tempos.length]
      const mood = moods[idc % moods.length]
      const voc = vocalsList[idc % vocalsList.length]
      idc++
      add({
        title: `Suno: ${g.pl} — ${th.pl} (${struct.name})`,
        tool: 'Suno',
        category: 'Utwór z wokalem',
        genre: g.g,
        tags: [...g.tags, mood.pl],
        content: `[Genre: ${g.g}] [Mood: ${mood.m}] [Tempo: ${t} BPM]\n${instruments[g.g]}, wokal ${voc}.\nTemat: ${th.en}.\n[Structure: ${struct.s}]`
      })
    }
  }
}

// ---------- UDIO ----------
for (const g of genres) {
  for (const mood of moods) {
    idc++
    const t = tempos[idc % tempos.length]
    add({
      title: `Udio: ${g.pl} (${mood.pl})`,
      tool: 'Udio',
      category: 'Styl / produkcja',
      genre: g.g,
      tags: [...g.tags, mood.pl],
      content: `${g.g}, ${mood.m}, ${t} BPM, ${instruments[g.g]}, rich production, wide stereo, warm analog mastering`
    })
  }
}

// ---------- MUREKA ----------
for (const g of genres) {
  for (const th of themes) {
    idc++
    const mood = moods[idc % moods.length]
    add({
      title: `Mureka: ${g.pl} — ${th.pl}`,
      tool: 'Mureka',
      category: 'Kompozycja',
      genre: g.g,
      tags: [...g.tags, mood.pl],
      content: `Gatunek: ${g.g}. Nastrój: ${mood.pl}. Instrumenty: ${instruments[g.g]}. Temat: ${th.pl}. Klarowna, melodyjna produkcja.`
    })
  }
}

// ---------- STABLE AUDIO ----------
for (const g of genres) {
  for (const key of keys) {
    idc++
    const t = tempos[idc % tempos.length]
    const mood = moods[idc % moods.length]
    add({
      title: `Stable Audio: ${g.pl} loop ${key}`,
      tool: 'Stable Audio',
      category: 'Loop / tekstura',
      genre: g.g,
      tags: [...g.tags, 'loop', mood.pl],
      content: `${g.g} loop, ${t} BPM, ${key}, ${instruments[g.g]}, ${mood.m}, high quality, seamless loop`
    })
  }
}

// ---------- ELEVENLABS (SFX + music beds) ----------
const sfx = [
  { t: 'deszcz uderzający o szybę, dalekie grzmoty, przytulny nastrój', title: 'Deszcz za oknem' },
  { t: 'trzaskający ogień w kominku, ciepły pokój, spokój', title: 'Kominek' },
  { t: 'fale oceanu rozbijające się o skały, mewy, bryza', title: 'Ocean' },
  { t: 'gwar kawiarni, brzęk filiżanek, przytłumione rozmowy', title: 'Kawiarnia' },
  { t: 'nocny las, świerszcze, sowa, delikatny wiatr', title: 'Nocny las' },
  { t: 'futurystyczny interfejs, elektroniczne beepy, sci-fi UI', title: 'Interfejs sci-fi' },
  { t: 'startująca rakieta, potężny ryk silników, wibracje', title: 'Start rakiety' },
  { t: 'magiczny błysk, iskrzące cząsteczki, fantasy', title: 'Magiczny błysk' },
  { t: 'ruchliwa ulica miasta, klaksony, tłum, metro', title: 'Miasto' },
  { t: 'klawiatura mechaniczna, szybkie pisanie, biuro', title: 'Pisanie na klawiaturze' }
]
for (const s of sfx) {
  for (const mood of moods.slice(0, 6)) {
    idc++
    add({
      title: `ElevenLabs SFX: ${s.title} (${mood.pl})`,
      tool: 'ElevenLabs',
      category: 'Efekt dźwiękowy',
      genre: null,
      tags: ['sfx', 'tło', mood.pl],
      content: `${s.t}, nastrój ${mood.m}, wysoka jakość, realistyczne, płynna pętla, stereo`
    })
  }
}
for (const g of genres.slice(0, 12)) {
  idc++
  add({
    title: `ElevenLabs Music: ${g.pl} podkład`,
    tool: 'ElevenLabs',
    category: 'Podkład muzyczny',
    genre: g.g,
    tags: [...g.tags, 'podkład'],
    content: `${g.g} background music, ${instruments[g.g]}, instrumental, loopable, medium energy, clean mix`
  })
}

// ---------- RIFFUSION ----------
for (const g of genres) {
  for (const th of themes.slice(0, 10)) {
    idc++
    const t = tempos[idc % tempos.length]
    const mood = moods[idc % moods.length]
    add({
      title: `Riffusion: ${g.pl} — ${th.pl}`,
      tool: 'Riffusion',
      category: 'Utwór generatywny',
      genre: g.g,
      tags: [...g.tags, mood.pl],
      content: `${g.g}, ${mood.m}, ${t} BPM, ${instruments[g.g]}. Theme: ${th.en}. Rich, vivid production.`
    })
  }
}

// ---------- AIVA (instrumental / filmowe) ----------
const aivaUses = [
  { en: 'epic movie trailer', pl: 'zwiastun filmowy' },
  { en: 'emotional drama scene', pl: 'wzruszająca scena dramatu' },
  { en: 'fantasy video game', pl: 'gra fantasy' },
  { en: 'meditation and relaxation', pl: 'medytacja i relaks' },
  { en: 'corporate presentation', pl: 'prezentacja biznesowa' },
  { en: 'documentary underscore', pl: 'podkład do dokumentu' },
  { en: 'wedding ceremony', pl: 'ceremonia ślubna' },
  { en: 'sci-fi adventure', pl: 'przygoda sci-fi' }
]
const aivaGenres = [
  'cinematic orchestral',
  'classical piano',
  'ambient',
  'synthwave',
  'jazz'
]
for (const gg of aivaGenres) {
  for (const use of aivaUses) {
    for (const mood of moods.slice(0, 6)) {
      idc++
      const t = tempos[idc % tempos.length]
      add({
        title: `AIVA: ${gg} — ${use.pl} (${mood.pl})`,
        tool: 'AIVA',
        category: 'Kompozycja instrumentalna',
        genre: gg,
        tags: ['instrumental', mood.pl, 'filmowe'],
        content: `Instrumental ${gg} composition for ${use.en}, ${mood.m}, ${t} BPM, ${instruments[gg]}, emotional arc, no vocals.`
      })
    }
  }
}

// ---------- SOUNDRAW (royalty-free do wideo) ----------
const energies = ['low', 'medium', 'high']
const soundrawUses = [
  { en: 'vlog', pl: 'vlog' },
  { en: 'advertisement', pl: 'reklama' },
  { en: 'podcast intro', pl: 'intro podcastu' },
  { en: 'travel video', pl: 'film z podróży' },
  { en: 'product showcase', pl: 'prezentacja produktu' },
  { en: 'social media reel', pl: 'rolka social media' },
  { en: 'tutorial background', pl: 'tło do poradnika' }
]
const soundrawGenres = ['lo-fi hip hop', 'future bass', 'pop', 'deep house', 'ambient', 'indie rock', 'trap', 'afrobeat']
for (const gg of soundrawGenres) {
  for (const use of soundrawUses) {
    for (const en of energies) {
      idc++
      const t = tempos[idc % tempos.length]
      const mood = moods[idc % moods.length]
      add({
        title: `Soundraw: ${gg} — ${use.pl} (${en} energy)`,
        tool: 'Soundraw',
        category: 'Podkład do wideo',
        genre: gg,
        tags: ['royalty-free', 'wideo', mood.pl],
        content: `${gg} track for ${use.en}, ${mood.m} mood, ${en} energy, ${t} BPM, instrumental, clean mix, royalty-free.`
      })
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(prompts, null, 0), 'utf-8')
console.log(`Zapisano ${prompts.length} promptów do ${OUT}`)
