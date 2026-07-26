import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Download
} from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'

export default function SettingsView(): JSX.Element {
  const t = useT()
  const settings = useStore((s) => s.settings)
  const saveSettings = useStore((s) => s.saveSettings)
  const setToast = useStore((s) => s.setToast)
  const checkUpdates = useStore((s) => s.checkUpdates)
  const update = useStore((s) => s.update)

  const [geminiApiKey, setKey] = useState('')
  const [ollamaUrl, setUrl] = useState('http://localhost:11434')
  const [defaultEngine, setEngine] = useState<'gemini' | 'ollama'>('ollama')
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [updateRepo, setRepo] = useState('')
  const [autoCheckUpdates, setAutoCheck] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [test, setTest] = useState<{ gemini?: string; ollama?: string }>({})

  useEffect(() => {
    if (settings) {
      setKey(settings.geminiApiKey)
      setUrl(settings.ollamaUrl)
      setEngine(settings.defaultEngine)
      setLanguage(settings.language ?? 'pl')
      setTheme(settings.theme ?? 'dark')
      setRepo(settings.updateRepo || '')
      setAutoCheck(settings.autoCheckUpdates ?? true)
    }
  }, [settings])

  // apply language immediately for instant UI feedback
  const changeLanguage = async (lang: 'pl' | 'en'): Promise<void> => {
    setLanguage(lang)
    await saveSettings({ language: lang })
  }

  const changeTheme = async (th: 'dark' | 'light'): Promise<void> => {
    setTheme(th)
    await saveSettings({ theme: th })
  }

  const save = async (): Promise<void> => {
    await saveSettings({ geminiApiKey, ollamaUrl, defaultEngine, language, theme, updateRepo, autoCheckUpdates })
    setToast(t('set.saved'))
  }

  const runCheck = async (): Promise<void> => {
    await saveSettings({ updateRepo, autoCheckUpdates })
    setChecking(true)
    await checkUpdates(false)
    setChecking(false)
  }

  const testConn = async (engine: 'gemini' | 'ollama'): Promise<void> => {
    await saveSettings({ geminiApiKey, ollamaUrl, defaultEngine })
    const res = await window.api.ai.models(engine)
    setTest((t) => ({
      ...t,
      [engine]: res.ok ? `OK — ${res.models.length} modeli` : res.error || 'Błąd'
    }))
  }

  return (
    <div className="view">
      <h1 className="page-title">
        <SettingsIcon size={22} /> {t('set.title')}
      </h1>

      <div className="settings-card">
        <h3>{t('set.language')}</h3>
        <div className="engine-toggle">
          <button className={`engine ${language === 'pl' ? 'on' : ''}`} onClick={() => changeLanguage('pl')}>
            🇵🇱 Polski
          </button>
          <button className={`engine ${language === 'en' ? 'on' : ''}`} onClick={() => changeLanguage('en')}>
            🇬🇧 English
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h3>{t('set.theme')}</h3>
        <div className="engine-toggle">
          <button className={`engine ${theme === 'dark' ? 'on' : ''}`} onClick={() => changeTheme('dark')}>
            🌙 {t('theme.dark')}
          </button>
          <button className={`engine ${theme === 'light' ? 'on' : ''}`} onClick={() => changeTheme('light')}>
            ☀️ {t('theme.light')}
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h3>{t('set.defaultEngine')}</h3>
        <div className="engine-toggle">
          <button className={`engine ${defaultEngine === 'ollama' ? 'on' : ''}`} onClick={() => setEngine('ollama')}>
            Ollama ({t('gen.local')})
          </button>
          <button className={`engine ${defaultEngine === 'gemini' ? 'on' : ''}`} onClick={() => setEngine('gemini')}>
            Gemini (API)
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h3>{t('set.geminiApi')}</h3>
        <label className="field">
          <span>{t('set.apiKey')}</span>
          <div className="row">
            <input
              type={showKey ? 'text' : 'password'}
              value={geminiApiKey}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza…"
            />
            <button className="icon-btn" onClick={() => setShowKey((s) => !s)}>
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>
        <div className="row between">
          <button
            className="link"
            onClick={() => window.api.shell.openExternal('https://aistudio.google.com/app/apikey')}
          >
            {t('set.getKey')} <ExternalLink size={13} />
          </button>
          <button className="btn-ghost" onClick={() => testConn('gemini')}>
            {t('set.testConn')}
          </button>
        </div>
        {test.gemini && (
          <div className={`test-result ${test.gemini.startsWith('OK') ? 'ok' : 'bad'}`}>
            {test.gemini.startsWith('OK') ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {test.gemini}
          </div>
        )}
      </div>

      <div className="settings-card">
        <h3>{t('set.ollamaLocal')}</h3>
        <label className="field">
          <span>{t('set.serverAddr')}</span>
          <input value={ollamaUrl} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:11434" />
        </label>
        <div className="row between">
          <span className="hint">{t('set.ollamaHint')}</span>
          <button className="btn-ghost" onClick={() => testConn('ollama')}>
            {t('set.testConn')}
          </button>
        </div>
        {test.ollama && (
          <div className={`test-result ${test.ollama.startsWith('OK') ? 'ok' : 'bad'}`}>
            {test.ollama.startsWith('OK') ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {test.ollama}
          </div>
        )}
      </div>

      <div className="settings-card">
        <h3>{t('set.updates')}</h3>
        <label className="field">
          <span>{t('set.repo')}</span>
          <input value={updateRepo} onChange={(e) => setRepo(e.target.value)} placeholder="np. marekzettel/music-prompt-studio" />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={autoCheckUpdates} onChange={(e) => setAutoCheck(e.target.checked)} />
          <span>{t('set.autoCheck')}</span>
        </label>
        <div className="row between">
          <span className="hint">{t('set.updatesHint')}</span>
          <button className="btn-ghost" onClick={runCheck} disabled={checking}>
            {checking ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />} {t('set.checkNow')}
          </button>
        </div>
        {update?.updateAvailable && (
          <div className="test-result ok" style={{ marginTop: 12 }}>
            <Download size={15} /> {update.latestVersion}
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={save}>
          {t('set.save')}
        </button>
      </div>
    </div>
  )
}
