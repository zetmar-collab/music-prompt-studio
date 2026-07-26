import { ipcMain, dialog, clipboard, shell, BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'
import * as db from './db'
import { getSettings, saveSettings } from './settings'
import { generate, listModels, type GenerateRequest, type Engine } from './ai'
import { checkForUpdates } from './updater'

export function registerIpc(): void {
  // ---- Prompts ----
  ipcMain.handle('prompts:list', (_e, filter) => db.listPrompts(filter || {}))
  ipcMain.handle('prompts:create', (_e, p) => db.createPrompt(p))
  ipcMain.handle('prompts:update', (_e, id, p) => db.updatePrompt(id, p))
  ipcMain.handle('prompts:delete', (_e, id) => db.deletePrompt(id))
  ipcMain.handle('prompts:toggleFavorite', (_e, id) => db.toggleFavorite(id))
  ipcMain.handle('prompts:tags', () => db.allTags())
  ipcMain.handle('prompts:tools', () => db.allTools())
  ipcMain.handle('prompts:stats', () => db.stats())

  // ---- Templates ----
  ipcMain.handle('templates:list', () => db.listTemplates())
  ipcMain.handle('templates:create', (_e, t) => db.createTemplate(t))
  ipcMain.handle('templates:delete', (_e, id) => db.deleteTemplate(id))

  // ---- Settings ----
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_e, patch) => saveSettings(patch))

  // ---- AI ----
  ipcMain.handle('ai:generate', async (_e, req: GenerateRequest) => {
    const s = getSettings()
    // fill secrets from settings if the renderer didn't pass them
    const merged: GenerateRequest = {
      ...req,
      apiKey: req.apiKey || s.geminiApiKey,
      ollamaUrl: req.ollamaUrl || s.ollamaUrl,
      model: req.model || (req.engine === 'gemini' ? s.geminiModel : s.ollamaModel)
    }
    return generate(merged)
  })
  ipcMain.handle('ai:models', async (_e, engine: Engine) => {
    const s = getSettings()
    return listModels(engine, { apiKey: s.geminiApiKey, ollamaUrl: s.ollamaUrl })
  })

  // ---- Clipboard ----
  ipcMain.handle('clipboard:write', (_e, text: string) => {
    clipboard.writeText(text || '')
    return true
  })

  // ---- Export ----
  ipcMain.handle('export:prompts', async (_e, opts: { format: 'json' | 'csv' | 'txt' | 'md'; filter?: unknown }) => {
    const win = BrowserWindow.getFocusedWindow()
    const rows = db.listPrompts((opts.filter as never) || {})
    const map: Record<string, { ext: string; name: string }> = {
      json: { ext: 'json', name: 'JSON' },
      csv: { ext: 'csv', name: 'CSV' },
      txt: { ext: 'txt', name: 'Tekst' },
      md: { ext: 'md', name: 'Markdown' }
    }
    const fmt = map[opts.format] || map.json
    const res = await dialog.showSaveDialog(win!, {
      title: 'Eksportuj prompty',
      defaultPath: `music-prompts.${fmt.ext}`,
      filters: [{ name: fmt.name, extensions: [fmt.ext] }]
    })
    if (res.canceled || !res.filePath) return { ok: false, canceled: true }

    let content = ''
    if (opts.format === 'json') {
      content = JSON.stringify(rows, null, 2)
    } else if (opts.format === 'csv') {
      const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
      content =
        'title,tool,category,genre,tags,favorite,content\n' +
        rows
          .map((r) =>
            [r.title, r.tool, r.category, r.genre || '', r.tags.join('|'), r.favorite ? '1' : '0', r.content]
              .map(esc)
              .join(',')
          )
          .join('\n')
    } else if (opts.format === 'md') {
      content = rows
        .map(
          (r) =>
            `## ${r.title}\n\n- **Narzędzie:** ${r.tool}\n- **Kategoria:** ${r.category}\n- **Gatunek:** ${
              r.genre || '—'
            }\n- **Tagi:** ${r.tags.join(', ')}\n\n\`\`\`\n${r.content}\n\`\`\`\n`
        )
        .join('\n---\n\n')
    } else {
      content = rows.map((r) => `# ${r.title} [${r.tool}]\n${r.content}\n`).join('\n----------------\n\n')
    }

    writeFileSync(res.filePath, content, 'utf-8')
    return { ok: true, path: res.filePath, count: rows.length }
  })

  // ---- Export single prompt ----
  ipcMain.handle(
    'export:one',
    async (_e, opts: { id: number; format: 'json' | 'csv' | 'txt' | 'md' }) => {
      const win = BrowserWindow.getFocusedWindow()
      const p = db.getPrompt(opts.id)
      if (!p) return { ok: false, error: 'not found' }

      const map: Record<string, { ext: string; name: string }> = {
        json: { ext: 'json', name: 'JSON' },
        csv: { ext: 'csv', name: 'CSV' },
        txt: { ext: 'txt', name: 'Tekst' },
        md: { ext: 'md', name: 'Markdown' }
      }
      const fmt = map[opts.format] || map.txt
      const safeTitle = p.title.replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60) || 'prompt'
      const res = await dialog.showSaveDialog(win!, {
        title: 'Eksportuj prompt',
        defaultPath: `${safeTitle}.${fmt.ext}`,
        filters: [{ name: fmt.name, extensions: [fmt.ext] }]
      })
      if (res.canceled || !res.filePath) return { ok: false, canceled: true }

      let content = ''
      if (opts.format === 'json') {
        content = JSON.stringify(p, null, 2)
      } else if (opts.format === 'csv') {
        const esc = (v: string): string => `"${String(v).replace(/"/g, '""')}"`
        content =
          'title,tool,category,genre,tags,favorite,content\n' +
          [p.title, p.tool, p.category, p.genre || '', p.tags.join('|'), p.favorite ? '1' : '0', p.content]
            .map(esc)
            .join(',')
      } else if (opts.format === 'md') {
        content = `# ${p.title}\n\n- **Narzędzie:** ${p.tool}\n- **Kategoria:** ${p.category}\n- **Gatunek:** ${
          p.genre || '—'
        }\n- **Tagi:** ${p.tags.join(', ')}\n\n\`\`\`\n${p.content}\n\`\`\`\n`
      } else {
        content = `${p.title} [${p.tool}]\n\n${p.content}\n`
      }

      writeFileSync(res.filePath, content, 'utf-8')
      return { ok: true, path: res.filePath }
    }
  )

  ipcMain.handle('shell:openPath', (_e, p: string) => shell.showItemInFolder(p))
  ipcMain.handle('shell:openExternal', (_e, url: string) => shell.openExternal(url))

  // ---- Updates ----
  ipcMain.handle('updates:check', async (_e, repoOverride?: string) => {
    const s = getSettings()
    return checkForUpdates(repoOverride || s.updateRepo)
  })
}
