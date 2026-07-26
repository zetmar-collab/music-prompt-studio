import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

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

const DEFAULTS: Settings = {
  geminiApiKey: '',
  ollamaUrl: 'http://localhost:11434',
  defaultEngine: 'ollama',
  geminiModel: 'gemini-2.0-flash',
  ollamaModel: 'llama3.2',
  theme: 'dark',
  language: 'pl',
  updateRepo: '',
  autoCheckUpdates: true
}

function file(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): Settings {
  try {
    if (existsSync(file())) {
      const raw = JSON.parse(readFileSync(file(), 'utf-8'))
      return { ...DEFAULTS, ...raw }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS }
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch }
  writeFileSync(file(), JSON.stringify(next, null, 2), 'utf-8')
  return next
}
