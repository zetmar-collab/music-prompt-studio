const DEFAULT_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'llama3.2'

function baseUrl(url?: string): string {
  return (url || DEFAULT_URL).replace(/\/+$/, '')
}

export async function generateOllama(opts: {
  url?: string
  model?: string
  system: string
  user: string
}): Promise<{ text: string; model: string }> {
  const url = baseUrl(opts.url)
  const model = opts.model || DEFAULT_MODEL

  let res: Response
  try {
    res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 1.0 },
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user }
        ]
      })
    })
  } catch (e) {
    throw new Error(
      `Nie można połączyć się z Ollama (${url}). Upewnij się, że Ollama jest uruchomiona (ollama serve). Szczegóły: ${
        e instanceof Error ? e.message : String(e)
      }`
    )
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    if (res.status === 404) {
      throw new Error(`Model "${model}" nie jest pobrany w Ollama. Uruchom: ollama pull ${model}`)
    }
    throw new Error(`Ollama HTTP ${res.status}: ${body || res.statusText}`)
  }

  const data = (await res.json()) as { message?: { content?: string } }
  const text = data.message?.content ?? ''
  if (!text) throw new Error('Ollama zwróciła pustą odpowiedź.')
  return { text, model }
}

export async function listOllamaModels(url?: string): Promise<string[]> {
  const u = baseUrl(url)
  let res: Response
  try {
    res = await fetch(`${u}/api/tags`)
  } catch (e) {
    throw new Error(
      `Nie można połączyć się z Ollama (${u}). Uruchom "ollama serve". ${
        e instanceof Error ? e.message : String(e)
      }`
    )
  }
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
  const data = (await res.json()) as { models?: Array<{ name: string }> }
  const models = (data.models || []).map((m) => m.name)
  return models.length ? models : [DEFAULT_MODEL]
}
