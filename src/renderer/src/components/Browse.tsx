import { useEffect, useRef, useState } from 'react'
import { Search, Star, Plus, Download, X } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import type { Prompt } from '../types'
import PromptCard from './PromptCard'
import PromptEditor from './PromptEditor'

const EXPORTS: { fmt: 'json' | 'csv' | 'md' | 'txt'; label: string }[] = [
  { fmt: 'json', label: 'JSON' },
  { fmt: 'csv', label: 'CSV' },
  { fmt: 'md', label: 'Markdown' },
  { fmt: 'txt', label: 'TXT' }
]

export default function Browse(): JSX.Element {
  const t = useT()
  const { prompts, filter, tools, tags, loading, setFilter, setToast } = useStore()
  const newSignal = useStore((s) => s.newSignal)
  const searchSignal = useStore((s) => s.searchSignal)
  const [editing, setEditing] = useState<Prompt | null>(null)
  const [creating, setCreating] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setExportOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // keyboard shortcut: Ctrl+N -> new prompt
  useEffect(() => {
    if (newSignal > 0) setCreating(true)
  }, [newSignal])

  // keyboard shortcut: Ctrl+F -> focus search
  useEffect(() => {
    if (searchSignal > 0) searchRef.current?.focus()
  }, [searchSignal])

  const doExport = async (fmt: 'json' | 'csv' | 'md' | 'txt'): Promise<void> => {
    setExportOpen(false)
    const res = await window.api.exportPrompts({ format: fmt, filter })
    if (res?.ok) setToast(`Wyeksportowano ${res.count} promptów ✓`)
    else if (!res?.canceled) setToast('Eksport nie powiódł się')
  }

  const toolOptions = ['Wszystkie', ...tools.map((t) => t.tool)]

  return (
    <div className="view">
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            ref={searchRef}
            placeholder={t('browse.search')}
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
          {filter.search && (
            <button className="icon-btn" onClick={() => setFilter({ search: '' })}>
              <X size={15} />
            </button>
          )}
        </div>

        <select className="select" value={filter.tool} onChange={(e) => setFilter({ tool: e.target.value })}>
          {toolOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'Wszystkie' ? t('browse.all') : opt}
            </option>
          ))}
        </select>

        <button
          className={`chip ${filter.favoritesOnly ? 'on' : ''}`}
          onClick={() => setFilter({ favoritesOnly: !filter.favoritesOnly })}
        >
          <Star size={15} fill={filter.favoritesOnly ? 'currentColor' : 'none'} /> {t('browse.favorites')}
        </button>

        <div className="spacer" />

        <div className="export-wrap">
          <button className="btn-ghost" onClick={() => setExportOpen((o) => !o)}>
            <Download size={15} /> {t('browse.export')}
          </button>
          {exportOpen && (
            <div className="dropdown">
              {EXPORTS.map((e) => (
                <button key={e.fmt} onClick={() => doExport(e.fmt)}>
                  {e.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> {t('browse.new')}
        </button>
      </div>

      {(filter.tag || filter.favoritesOnly) && (
        <div className="active-filters">
          {filter.tag && (
            <span className="pill">
              #{filter.tag}
              <button onClick={() => setFilter({ tag: '' })}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="tag-cloud">
          {tags.slice(0, 24).map((t) => (
            <button
              key={t}
              className={`tag ${filter.tag === t ? 'active' : ''}`}
              onClick={() => setFilter({ tag: filter.tag === t ? '' : t })}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="empty">{t('browse.loading')}</div>
      ) : prompts.length === 0 ? (
        <div className="empty">
          <p>{t('browse.empty')}</p>
          <button className="btn-primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> {t('browse.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid">
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} onEdit={setEditing} />
          ))}
        </div>
      )}

      {editing && <PromptEditor initial={editing} onClose={() => setEditing(null)} />}
      {creating && <PromptEditor onClose={() => setCreating(false)} />}
    </div>
  )
}
