import { contextBridge, ipcRenderer } from 'electron'

const api = {
  prompts: {
    list: (filter: unknown) => ipcRenderer.invoke('prompts:list', filter),
    create: (p: unknown) => ipcRenderer.invoke('prompts:create', p),
    update: (id: number, p: unknown) => ipcRenderer.invoke('prompts:update', id, p),
    remove: (id: number) => ipcRenderer.invoke('prompts:delete', id),
    toggleFavorite: (id: number) => ipcRenderer.invoke('prompts:toggleFavorite', id),
    tags: () => ipcRenderer.invoke('prompts:tags'),
    tools: () => ipcRenderer.invoke('prompts:tools'),
    stats: () => ipcRenderer.invoke('prompts:stats')
  },
  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    create: (t: unknown) => ipcRenderer.invoke('templates:create', t),
    remove: (id: number) => ipcRenderer.invoke('templates:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (patch: unknown) => ipcRenderer.invoke('settings:save', patch)
  },
  ai: {
    generate: (req: unknown) => ipcRenderer.invoke('ai:generate', req),
    models: (engine: string) => ipcRenderer.invoke('ai:models', engine)
  },
  clipboard: {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text)
  },
  exportPrompts: (opts: unknown) => ipcRenderer.invoke('export:prompts', opts),
  exportOne: (opts: unknown) => ipcRenderer.invoke('export:one', opts),
  updates: {
    check: (repo?: string) => ipcRenderer.invoke('updates:check', repo)
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
