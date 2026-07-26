export interface Prompt {
  id: number
  title: string
  tool: string
  category: string
  content: string
  tags: string[]
  genre: string | null
  favorite: boolean
  created_at: string
  updated_at: string
}

export interface TemplateField {
  key: string
  label: string
  placeholder?: string
}

export interface Template {
  id: number
  name: string
  tool: string
  body: string
  fields: string // JSON string of TemplateField[]
  created_at: string
}

export interface Settings {
  geminiApiKey: string
  ollamaUrl: string
  defaultEngine: 'gemini' | 'ollama'
  geminiModel: string
  ollamaModel: string
  theme: 'dark' | 'light'
  language: 'pl' | 'en'
  updateRepo: string
  autoCheckUpdates: boolean
}

export interface UpdateInfo {
  ok: boolean
  updateAvailable: boolean
  currentVersion: string
  latestVersion?: string
  releaseUrl?: string
  downloadUrl?: string
  notes?: string
  error?: string
}

export interface GenerateResult {
  ok: boolean
  engine: 'gemini' | 'ollama'
  model: string
  prompts: string[]
  error?: string
}

export const TOOLS = [
  'Suno',
  'Udio',
  'Mureka',
  'Stable Audio',
  'ElevenLabs',
  'Riffusion',
  'AIVA',
  'Soundraw'
] as const
export type Tool = (typeof TOOLS)[number]
