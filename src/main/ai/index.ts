import { generateGemini, listGeminiModels } from './gemini'
import { generateOllama, listOllamaModels } from './ollama'

export type Engine = 'gemini' | 'ollama'

export interface GenerateRequest {
  engine: Engine
  model?: string
  apiKey?: string // Gemini
  ollamaUrl?: string
  tool: string // Suno / Udio / ...
  idea: string // user's rough idea
  genre?: string
  mood?: string
  language?: string // language of the prompt output
  count?: number // how many variants
}

export interface GenerateResult {
  ok: boolean
  engine: Engine
  model: string
  prompts: string[]
  error?: string
}

const TOOL_GUIDE: Record<string, string> = {
  Suno:
    'Suno przyjmuje opis stylu + tekst. Używaj tagów w nawiasach kwadratowych: [Gatunek], [Nastrój], [Tempo BPM], [Instrumenty], [Wokal], [Struktura]. Krótko, konkretnie, po angielsku styl + ewentualnie temat.',
  Udio:
    'Udio lubi bogate opisy stylu muzycznego: gatunek, epoka, instrumentarium, produkcja, wokal, nastrój. Oddzielaj przecinkami. Bez zbędnego tekstu piosenki, chyba że proszono.',
  Mureka:
    'Mureka: opis gatunku, tempa, instrumentów i nastroju + opcjonalnie temat tekstu. Zwięźle i klarownie.',
  'Stable Audio':
    'Stable Audio to model tekst→audio dla loopów/tekstur. Format: gatunek, BPM, tonacja, instrumenty, nastrój, jakość, "seamless loop". Bez wokalu i tekstu piosenki.',
  ElevenLabs:
    'ElevenLabs (Sound Effects / Music): opisz brzmienie, źródło dźwięku, charakter, długość, nastrój. Dla efektów dźwiękowych bądź bardzo konkretny co do zdarzenia akustycznego.',
  Riffusion:
    'Riffusion generuje muzykę z opisu tekstowego (i tekstu piosenki). Podaj gatunek, nastrój, instrumenty i BPM po angielsku, zwięźle. Możesz dołączyć krótki tekst piosenki. Dobrze reaguje na konkretne, obrazowe opisy brzmienia.',
  AIVA:
    'AIVA komponuje muzykę instrumentalną (głównie orkiestrową/filmową/emocjonalną). Opisz gatunek/styl, nastrój, tempo, instrumentarium i przeznaczenie (np. trailer, gra, medytacja). Bez wokalu i tekstu piosenki — AIVA tworzy kompozycje instrumentalne.',
  Soundraw:
    'Soundraw generuje royalty-free muzykę do wideo. Opisz nastrój, gatunek, energię (low/medium/high), tempo i przeznaczenie (vlog, reklama, podcast). Zwięźle, po angielsku. Bez wokalu — to podkłady instrumentalne.'
}

function buildSystemPrompt(req: GenerateRequest): string {
  const lang = req.language || 'polski (opis) z angielskimi terminami muzycznymi'
  const guide = TOOL_GUIDE[req.tool] || 'Twórz zwięzłe, skuteczne prompty muzyczne.'
  const n = req.count || 3
  return [
    `Jesteś ekspertem od promptów dla narzędzia AI do muzyki: ${req.tool}.`,
    `Zasady dla ${req.tool}: ${guide}`,
    req.genre ? `Preferowany gatunek: ${req.genre}.` : '',
    req.mood ? `Nastrój: ${req.mood}.` : '',
    `Język odpowiedzi: ${lang}.`,
    `Wygeneruj dokładnie ${n} różnych, gotowych do wklejenia promptów.`,
    `Każdy prompt oddziel linią zawierającą wyłącznie: ---`,
    `Nie numeruj, nie dodawaj komentarzy ani nagłówków. Tylko treść promptów.`
  ]
    .filter(Boolean)
    .join('\n')
}

function splitVariants(text: string, expected: number): string[] {
  let parts = text
    .split(/^\s*---\s*$/m)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) {
    // fallback: split on blank lines if the model ignored the separator
    parts = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
  }
  return parts.slice(0, Math.max(expected, parts.length))
}

export async function generate(req: GenerateRequest): Promise<GenerateResult> {
  const system = buildSystemPrompt(req)
  const user = `Pomysł użytkownika: ${req.idea}`
  try {
    if (req.engine === 'gemini') {
      const { text, model } = await generateGemini({
        apiKey: req.apiKey || '',
        model: req.model,
        system,
        user
      })
      return { ok: true, engine: 'gemini', model, prompts: splitVariants(text, req.count || 3) }
    } else {
      const { text, model } = await generateOllama({
        url: req.ollamaUrl,
        model: req.model,
        system,
        user
      })
      return { ok: true, engine: 'ollama', model, prompts: splitVariants(text, req.count || 3) }
    }
  } catch (e) {
    return {
      ok: false,
      engine: req.engine,
      model: req.model || '',
      prompts: [],
      error: e instanceof Error ? e.message : String(e)
    }
  }
}

export async function listModels(
  engine: Engine,
  opts: { apiKey?: string; ollamaUrl?: string }
): Promise<{ ok: boolean; models: string[]; error?: string }> {
  try {
    if (engine === 'gemini') {
      const models = await listGeminiModels(opts.apiKey || '')
      return { ok: true, models }
    } else {
      const models = await listOllamaModels(opts.ollamaUrl)
      return { ok: true, models }
    }
  } catch (e) {
    return { ok: false, models: [], error: e instanceof Error ? e.message : String(e) }
  }
}
