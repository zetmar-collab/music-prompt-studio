import { GoogleGenAI } from '@google/genai'

const DEFAULT_MODEL = 'gemini-2.0-flash'

export async function generateGemini(opts: {
  apiKey: string
  model?: string
  system: string
  user: string
}): Promise<{ text: string; model: string }> {
  if (!opts.apiKey) {
    throw new Error('Brak klucza API Gemini. Dodaj go w Ustawieniach.')
  }
  const ai = new GoogleGenAI({ apiKey: opts.apiKey })
  const model = opts.model || DEFAULT_MODEL

  const response = await ai.models.generateContent({
    model,
    contents: opts.user,
    config: {
      systemInstruction: opts.system,
      temperature: 1.0,
      maxOutputTokens: 2048
    }
  })

  const text = response.text ?? ''
  if (!text) throw new Error('Gemini zwrócił pustą odpowiedź.')
  return { text, model }
}

export async function listGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey) throw new Error('Brak klucza API Gemini.')
  const ai = new GoogleGenAI({ apiKey })
  const out: string[] = []
  const pager = await ai.models.list()
  for await (const m of pager) {
    const name = (m.name || '').replace(/^models\//, '')
    const actions = m.supportedActions || []
    if (name && (actions.length === 0 || actions.includes('generateContent'))) {
      out.push(name)
    }
  }
  // Keep the common ones first
  const preferred = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro']
  out.sort((a, b) => {
    const ia = preferred.indexOf(a)
    const ib = preferred.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  return out.length ? out : [DEFAULT_MODEL]
}
