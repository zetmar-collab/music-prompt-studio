import { create } from 'zustand'
import type { Prompt, Settings, UpdateInfo } from './types'
import { translate } from './i18n'

export type View = 'browse' | 'generator' | 'templates' | 'settings'

interface Filter {
  search: string
  tool: string
  tag: string
  favoritesOnly: boolean
}

interface AppState {
  view: View
  setView: (v: View) => void

  prompts: Prompt[]
  tags: string[]
  tools: { tool: string; count: number }[]
  stats: { total: number; favorites: number; tools: number }
  filter: Filter
  loading: boolean

  settings: Settings | null

  update: UpdateInfo | null
  dismissUpdate: () => void
  checkUpdates: (silent: boolean) => Promise<void>

  helpOpen: boolean
  setHelpOpen: (v: boolean) => void

  // signal counters for keyboard shortcuts (components watch and react)
  newSignal: number
  searchSignal: number
  generateSignal: number
  fireNew: () => void
  fireSearch: () => void
  fireGenerate: () => void

  toast: string | null
  setToast: (t: string | null) => void

  setFilter: (patch: Partial<Filter>) => Promise<void>
  refresh: () => Promise<void>
  loadMeta: () => Promise<void>
  loadSettings: () => Promise<void>
  saveSettings: (patch: Partial<Settings>) => Promise<void>
  toggleFavorite: (id: number) => Promise<void>
  removePrompt: (id: number) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  view: 'browse',
  setView: (v) => set({ view: v }),

  prompts: [],
  tags: [],
  tools: [],
  stats: { total: 0, favorites: 0, tools: 0 },
  filter: { search: '', tool: 'Wszystkie', tag: '', favoritesOnly: false },
  loading: false,

  settings: null,

  update: null,
  dismissUpdate: () => set({ update: null }),
  checkUpdates: async (silent) => {
    const info = await window.api.updates.check()
    if (info.updateAvailable) {
      set({ update: info })
    } else {
      set({ update: null })
      if (!silent) {
        const lang = (get().settings?.language ?? 'pl') as 'pl' | 'en'
        get().setToast(
          info.ok
            ? `${translate(lang, 'upd.latest')} (${info.currentVersion}) ✓`
            : info.error || translate(lang, 'upd.failed')
        )
      }
    }
  },

  helpOpen: false,
  setHelpOpen: (v) => set({ helpOpen: v }),

  newSignal: 0,
  searchSignal: 0,
  generateSignal: 0,
  fireNew: () => set((s) => ({ newSignal: s.newSignal + 1 })),
  fireSearch: () => set((s) => ({ searchSignal: s.searchSignal + 1 })),
  fireGenerate: () => set((s) => ({ generateSignal: s.generateSignal + 1 })),

  toast: null,
  setToast: (t) => {
    set({ toast: t })
    if (t) setTimeout(() => set((s) => (s.toast === t ? { toast: null } : {})), 2600)
  },

  setFilter: async (patch) => {
    set({ filter: { ...get().filter, ...patch } })
    await get().refresh()
  },

  refresh: async () => {
    set({ loading: true })
    const f = get().filter
    const prompts = await window.api.prompts.list({
      search: f.search,
      tool: f.tool,
      tag: f.tag,
      favoritesOnly: f.favoritesOnly
    })
    set({ prompts, loading: false })
  },

  loadMeta: async () => {
    const [tags, tools, stats] = await Promise.all([
      window.api.prompts.tags(),
      window.api.prompts.tools(),
      window.api.prompts.stats()
    ])
    set({ tags, tools, stats })
  },

  loadSettings: async () => {
    const settings = await window.api.settings.get()
    set({ settings })
  },

  saveSettings: async (patch) => {
    const settings = await window.api.settings.save(patch)
    set({ settings })
  },

  toggleFavorite: async (id) => {
    await window.api.prompts.toggleFavorite(id)
    await Promise.all([get().refresh(), get().loadMeta()])
  },

  removePrompt: async (id) => {
    await window.api.prompts.remove(id)
    await Promise.all([get().refresh(), get().loadMeta()])
  }
}))
