import { useEffect, useState } from 'react'
import { LayoutTemplate, Plus, Trash2, Copy, Save, X, Wand2 } from 'lucide-react'
import { TOOLS, type Template, type TemplateField } from '../types'
import { useStore } from '../store'
import { useT } from '../i18n'
import PromptEditor from './PromptEditor'

function parseFields(json: string): TemplateField[] {
  try {
    return JSON.parse(json) as TemplateField[]
  } catch {
    return []
  }
}

function fill(body: string, values: Record<string, string>): string {
  return body.replace(/\{(\w+)\}/g, (_, k) => values[k] || `{${k}}`)
}

export default function Templates(): JSX.Element {
  const t = useT()
  const setToast = useStore((s) => s.setToast)
  const [templates, setTemplates] = useState<Template[]>([])
  const [active, setActive] = useState<Template | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [saveDraft, setSaveDraft] = useState<{ content: string; tool: string } | null>(null)

  const load = async (): Promise<void> => {
    const list = await window.api.templates.list()
    setTemplates(list)
    if (!active && list.length) selectTpl(list[0])
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectTpl = (t: Template): void => {
    setActive(t)
    const fields = parseFields(t.fields)
    const init: Record<string, string> = {}
    fields.forEach((f) => (init[f.key] = ''))
    setValues(init)
  }

  const remove = async (id: number): Promise<void> => {
    await window.api.templates.remove(id)
    if (active?.id === id) setActive(null)
    await load()
    setToast(t('tpl.removed'))
  }

  const output = active ? fill(active.body, values) : ''

  return (
    <div className="view">
      <div className="gen-header">
        <div>
          <h1 className="page-title">
            <LayoutTemplate size={22} /> {t('tpl.title')}
          </h1>
          <p className="page-sub">{t('tpl.sub')}</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> {t('tpl.new')}
        </button>
      </div>

      <div className="tpl-layout">
        <div className="tpl-list">
          {templates.length === 0 && <div className="empty small">{t('tpl.empty')}</div>}
          {templates.map((t) => (
            <button key={t.id} className={`tpl-item ${active?.id === t.id ? 'on' : ''}`} onClick={() => selectTpl(t)}>
              <div>
                <div className="tpl-name">{t.name}</div>
                <div className="tpl-tool">{t.tool}</div>
              </div>
              <span
                className="icon-btn danger"
                onClick={(e) => {
                  e.stopPropagation()
                  void remove(t.id)
                }}
              >
                <Trash2 size={14} />
              </span>
            </button>
          ))}
        </div>

        <div className="tpl-editor">
          {active ? (
            <>
              <div className="tpl-fields">
                {parseFields(active.body ? active.fields : '[]').map((f) => (
                  <label className="field" key={f.key}>
                    <span>{f.label}</span>
                    <input
                      value={values[f.key] || ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
              <div className="tpl-output">
                <div className="result-head">
                  <span className="mono">{t('tpl.preview')}</span>
                  <div className="row">
                    <button
                      className="icon-btn"
                      title={t('card.copy')}
                      onClick={async () => {
                        await window.api.clipboard.write(output)
                        setToast(t('gen.copied'))
                      }}
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      className="icon-btn"
                      title={t('gen.saveToDb')}
                      onClick={() => setSaveDraft({ content: output, tool: active.tool })}
                    >
                      <Save size={15} />
                    </button>
                  </div>
                </div>
                <pre className="result-text">{output}</pre>
              </div>
            </>
          ) : (
            <div className="empty small">
              <Wand2 size={22} />
              <p>{t('tpl.choose')}</p>
            </div>
          )}
        </div>
      </div>

      {creating && <TemplateCreator onClose={() => setCreating(false)} onSaved={load} />}
      {saveDraft && (
        <PromptEditor presetContent={saveDraft.content} presetTool={saveDraft.tool} onClose={() => setSaveDraft(null)} />
      )}
    </div>
  )
}

function TemplateCreator({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> }): JSX.Element {
  const t = useT()
  const setToast = useStore((s) => s.setToast)
  const [name, setName] = useState('')
  const [tool, setTool] = useState<string>(TOOLS[0])
  const [body, setBody] = useState('')

  const detected = Array.from(new Set([...body.matchAll(/\{(\w+)\}/g)].map((m) => m[1])))

  const save = async (): Promise<void> => {
    if (!name.trim() || !body.trim()) {
      setToast(t('tpl.needName'))
      return
    }
    const fields: TemplateField[] = detected.map((k) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1)
    }))
    await window.api.templates.create({ name: name.trim(), tool, body: body.trim(), fields })
    setToast(t('tpl.created'))
    await onSaved()
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t('tpl.newTitle')}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="form-grid">
          <label className="field span2">
            <span>{t('tpl.name')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Udio — Ballad" />
          </label>
          <label className="field span2">
            <span>{t('editor.tool')}</span>
            <select value={tool} onChange={(e) => setTool(e.target.value)}>
              {TOOLS.map((tl) => (
                <option key={tl}>{tl}</option>
              ))}
            </select>
          </label>
          <label className="field span2">
            <span>{t('tpl.bodyLabel')}</span>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="{genre} ballad, {tempo} BPM, {instruments}, {vocals} vocals, {mood} mood"
            />
          </label>
        </div>
        {detected.length > 0 && (
          <div className="hint">
            {t('tpl.detected')} {detected.map((d) => `{${d}}`).join('  ')}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            {t('editor.cancel')}
          </button>
          <button className="btn-primary" onClick={save}>
            {t('tpl.create')}
          </button>
        </div>
      </div>
    </div>
  )
}
