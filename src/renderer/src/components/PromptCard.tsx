import { useEffect, useRef, useState } from 'react'
import { Star, Copy, Trash2, Pencil, Download } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import type { Prompt } from '../types'

const TOOL_COLORS: Record<string, string> = {
  Suno: '#8b5cf6',
  Udio: '#ec4899',
  Mureka: '#06b6d4',
  'Stable Audio': '#f59e0b',
  ElevenLabs: '#22c55e',
  Riffusion: '#ef4444',
  AIVA: '#3b82f6',
  Soundraw: '#14b8a6'
}

const EXPORT_FORMATS: ('txt' | 'md' | 'json' | 'csv')[] = ['txt', 'md', 'json', 'csv']

export default function PromptCard({
  prompt,
  onEdit
}: {
  prompt: Prompt
  onEdit: (p: Prompt) => void
}): JSX.Element {
  const t = useT()
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const removePrompt = useStore((s) => s.removePrompt)
  const setToast = useStore((s) => s.setToast)
  const setFilter = useStore((s) => s.setFilter)
  const [exportOpen, setExportOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent): void => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    if (exportOpen) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [exportOpen])

  const copy = async (): Promise<void> => {
    await window.api.clipboard.write(prompt.content)
    setToast(t('card.copied'))
  }

  const exportAs = async (format: 'txt' | 'md' | 'json' | 'csv'): Promise<void> => {
    setExportOpen(false)
    const res = await window.api.exportOne({ id: prompt.id, format })
    if (res?.ok) setToast(t('card.exported'))
    else if (!res?.canceled) setToast(t('card.exportFailed'))
  }

  const color = TOOL_COLORS[prompt.tool] || '#64748b'

  return (
    <div className="card">
      <div className="card-head">
        <span className="tool-badge" style={{ background: color + '22', color, borderColor: color + '55' }}>
          {prompt.tool}
        </span>
        <button
          className={`icon-btn fav ${prompt.favorite ? 'on' : ''}`}
          title={prompt.favorite ? t('card.removeFav') : t('card.addFav')}
          onClick={() => toggleFavorite(prompt.id)}
        >
          <Star size={16} fill={prompt.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="card-title">{prompt.title}</h3>
      <p className="card-content">{prompt.content}</p>

      <div className="card-meta">
        {prompt.genre && <span className="genre">{prompt.genre}</span>}
        {prompt.tags.map((tag) => (
          <button key={tag} className="tag" onClick={() => setFilter({ tag })}>
            #{tag}
          </button>
        ))}
      </div>

      <div className="card-actions">
        <button className="btn-ghost" onClick={copy}>
          <Copy size={14} /> {t('card.copy')}
        </button>
        <button className="btn-ghost" onClick={() => onEdit(prompt)}>
          <Pencil size={14} /> {t('card.edit')}
        </button>
        <div className="card-export-wrap" ref={wrapRef}>
          <button className="btn-ghost" title={t('card.export')} onClick={() => setExportOpen((o) => !o)}>
            <Download size={14} />
          </button>
          {exportOpen && (
            <div className="dropdown up">
              {EXPORT_FORMATS.map((f) => (
                <button key={f} onClick={() => exportAs(f)}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-ghost danger" onClick={() => removePrompt(prompt.id)}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
