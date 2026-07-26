import { useEffect, useRef, useState } from 'react'
import { Sparkles, Copy, Save, Cpu, Cloud, RefreshCw, AlertCircle } from 'lucide-react'
import { TOOLS, type GenerateResult } from '../types'
import { useStore } from '../store'
import { useT } from '../i18n'
import PromptEditor from './PromptEditor'

export default function Generator(): JSX.Element {
  const t = useT()
  const settings = useStore((s) => s.settings)
  const setToast = useStore((s) => s.setToast)
  const generateSignal = useStore((s) => s.generateSignal)

  const [engine, setEngine] = useState<'gemini' | 'ollama'>('ollama')
  const [tool, setTool] = useState<string>(TOOLS[0])
  const [idea, setIdea] = useState('')
  const [genre, setGenre] = useState('')
  const [mood, setMood] = useState('')
  const [count, setCount] = useState(3)
  const [models, setModels] = useState<string[]>([])
  const [model, setModel] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [saveDraft, setSaveDraft] = useState<{ content: string } | null>(null)
  const runRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (settings) setEngine(settings.defaultEngine)
  }, [settings])

  // keyboard shortcut: Ctrl+Enter -> generate
  useEffect(() => {
    if (generateSignal > 0) runRef.current()
  }, [generateSignal])

  const loadModels = async (): Promise<void> => {
    const res = await window.api.ai.models(engine)
    if (res.ok) {
      setModels(res.models)
      setModel(res.models[0] || '')
    } else {
      setModels([])
      setToast(res.error || 'Nie udało się pobrać modeli')
    }
  }

  useEffect(() => {
    void loadModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine])

  const run = async (): Promise<void> => {
    if (!idea.trim()) {
      setToast(t('gen.needIdea'))
      return
    }
    setBusy(true)
    setResult(null)
    const res: GenerateResult = await window.api.ai.generate({
      engine,
      model: model || undefined,
      tool,
      idea: idea.trim(),
      genre: genre.trim() || undefined,
      mood: mood.trim() || undefined,
      count
    })
    setResult(res)
    setBusy(false)
    if (!res.ok) setToast(res.error || 'Błąd generowania')
  }
  runRef.current = run

  const copy = async (text: string): Promise<void> => {
    await window.api.clipboard.write(text)
    setToast(t('gen.copied'))
  }

  return (
    <div className="view">
      <div className="gen-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={22} /> {t('gen.title')}
          </h1>
          <p className="page-sub">{t('gen.sub')}</p>
        </div>
      </div>

      <div className="gen-layout">
        <div className="gen-form">
          <div className="engine-toggle">
            <button className={`engine ${engine === 'ollama' ? 'on' : ''}`} onClick={() => setEngine('ollama')}>
              <Cpu size={16} /> Ollama <small>{t('gen.local')}</small>
            </button>
            <button className={`engine ${engine === 'gemini' ? 'on' : ''}`} onClick={() => setEngine('gemini')}>
              <Cloud size={16} /> Gemini <small>API</small>
            </button>
          </div>

          <label className="field">
            <span>{t('gen.model')}</span>
            <div className="row">
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {models.length === 0 && <option value="">— brak / wpisz ręcznie —</option>}
                {models.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button className="icon-btn" title={t('gen.refreshModels')} onClick={loadModels}>
                <RefreshCw size={15} />
              </button>
            </div>
          </label>

          <label className="field">
            <span>{t('gen.targetTool')}</span>
            <select value={tool} onChange={(e) => setTool(e.target.value)}>
              {TOOLS.map((tl) => (
                <option key={tl}>{tl}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('gen.yourIdea')}</span>
            <textarea
              rows={4}
              value={idea}
              placeholder={t('gen.ideaPlaceholder')}
              onChange={(e) => setIdea(e.target.value)}
            />
          </label>

          <div className="row2">
            <label className="field">
              <span>{t('gen.genreOpt')}</span>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="lo-fi" />
            </label>
            <label className="field">
              <span>{t('gen.moodOpt')}</span>
              <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="calm" />
            </label>
          </div>

          <label className="field">
            <span>
              {t('gen.variants')}: {count}
            </span>
            <input type="range" min={1} max={6} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>

          <button className="btn-primary big" onClick={run} disabled={busy}>
            {busy ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
            {busy ? t('gen.generating') : t('gen.generate')}
          </button>

          {engine === 'gemini' && !settings?.geminiApiKey && (
            <div className="hint warn">
              <AlertCircle size={14} /> {t('gen.noKey')}
            </div>
          )}
        </div>

        <div className="gen-results">
          {!result && !busy && <div className="empty small">{t('gen.resultsHere')}</div>}
          {busy && (
            <div className="empty small">
              {engine} {t('gen.working')}
            </div>
          )}
          {result?.ok &&
            result.prompts.map((p, i) => (
              <div className="result-card" key={i}>
                <div className="result-head">
                  <span className="mono">
                    {result.engine} · {result.model}
                  </span>
                  <div className="row">
                    <button className="icon-btn" title={t('card.copy')} onClick={() => copy(p)}>
                      <Copy size={15} />
                    </button>
                    <button className="icon-btn" title={t('gen.saveToDb')} onClick={() => setSaveDraft({ content: p })}>
                      <Save size={15} />
                    </button>
                  </div>
                </div>
                <pre className="result-text">{p}</pre>
              </div>
            ))}
          {result && !result.ok && (
            <div className="result-card error">
              <AlertCircle size={16} /> {result.error}
            </div>
          )}
        </div>
      </div>

      {saveDraft && (
        <PromptEditor presetContent={saveDraft.content} presetTool={tool} onClose={() => setSaveDraft(null)} />
      )}
    </div>
  )
}
