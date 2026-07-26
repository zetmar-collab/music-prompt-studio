import { useState } from 'react'
import { X } from 'lucide-react'
import { TOOLS, type Prompt } from '../types'
import { useStore } from '../store'
import { useT } from '../i18n'

export default function PromptEditor({
  initial,
  presetContent,
  presetTool,
  onClose
}: {
  initial?: Prompt | null
  presetContent?: string
  presetTool?: string
  onClose: () => void
}): JSX.Element {
  const t = useT()
  const refresh = useStore((s) => s.refresh)
  const loadMeta = useStore((s) => s.loadMeta)
  const setToast = useStore((s) => s.setToast)

  const [title, setTitle] = useState(initial?.title || '')
  const [tool, setTool] = useState(initial?.tool || presetTool || TOOLS[0])
  const [category, setCategory] = useState(initial?.category || 'Ogólne')
  const [genre, setGenre] = useState(initial?.genre || '')
  const [tags, setTags] = useState((initial?.tags || []).join(', '))
  const [content, setContent] = useState(initial?.content || presetContent || '')

  const save = async (): Promise<void> => {
    if (!title.trim() || !content.trim()) {
      setToast(t('editor.needTitle'))
      return
    }
    const payload = {
      title: title.trim(),
      tool,
      category: category.trim() || 'Ogólne',
      genre: genre.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      content: content.trim()
    }
    if (initial) {
      await window.api.prompts.update(initial.id, payload)
      setToast(t('editor.saved'))
    } else {
      await window.api.prompts.create(payload)
      setToast(t('editor.added'))
    }
    await Promise.all([refresh(), loadMeta()])
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? t('editor.editTitle') : t('editor.newTitle')}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <label className="field span2">
            <span>{t('editor.title')}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Synthwave night drive" />
          </label>
          <label className="field">
            <span>{t('editor.tool')}</span>
            <select value={tool} onChange={(e) => setTool(e.target.value)}>
              {TOOLS.map((tl) => (
                <option key={tl}>{tl}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('editor.category')}</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ogólne" />
          </label>
          <label className="field">
            <span>{t('editor.genre')}</span>
            <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="synthwave" />
          </label>
          <label className="field">
            <span>{t('editor.tags')}</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="retro, night, instrumental" />
          </label>
          <label className="field span2">
            <span>{t('editor.content')}</span>
            <textarea rows={7} value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            {t('editor.cancel')}
          </button>
          <button className="btn-primary" onClick={save}>
            {initial ? t('editor.save') : t('editor.add')}
          </button>
        </div>
      </div>
    </div>
  )
}
