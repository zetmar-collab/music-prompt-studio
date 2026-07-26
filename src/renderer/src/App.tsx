import { useEffect } from 'react'
import { Download, X, Sparkles } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Browse from './components/Browse'
import Generator from './components/Generator'
import Templates from './components/Templates'
import SettingsView from './components/SettingsView'
import Help from './components/Help'
import { useStore } from './store'
import { useT } from './i18n'

export default function App(): JSX.Element {
  const t = useT()
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const toast = useStore((s) => s.toast)
  const update = useStore((s) => s.update)
  const dismissUpdate = useStore((s) => s.dismissUpdate)
  const helpOpen = useStore((s) => s.helpOpen)
  const setHelpOpen = useStore((s) => s.setHelpOpen)
  const fireNew = useStore((s) => s.fireNew)
  const fireSearch = useStore((s) => s.fireSearch)
  const fireGenerate = useStore((s) => s.fireGenerate)
  const theme = useStore((s) => s.settings?.theme ?? 'dark')
  const refresh = useStore((s) => s.refresh)
  const loadMeta = useStore((s) => s.loadMeta)
  const loadSettings = useStore((s) => s.loadSettings)
  const checkUpdates = useStore((s) => s.checkUpdates)

  // apply theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    void refresh()
    void loadMeta()
    void loadSettings().then(() => {
      const s = useStore.getState().settings
      if (s?.autoCheckUpdates && s.updateRepo) {
        void checkUpdates(true)
      }
    })
  }, [refresh, loadMeta, loadSettings, checkUpdates])

  // global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // Help: F1 or "?" (Shift+/)
      if (e.key === 'F1' || (e.key === '?' && !typing)) {
        e.preventDefault()
        setHelpOpen(!useStore.getState().helpOpen)
        return
      }
      if (e.key === 'Escape') {
        if (useStore.getState().helpOpen) setHelpOpen(false)
        return
      }

      if (e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setView('browse')
            break
          case '2':
            e.preventDefault()
            setView('generator')
            break
          case '3':
            e.preventDefault()
            setView('templates')
            break
          case ',':
            e.preventDefault()
            setView('settings')
            break
          case 'f':
          case 'F':
            e.preventDefault()
            setView('browse')
            fireSearch()
            break
          case 'n':
          case 'N':
            e.preventDefault()
            setView('browse')
            fireNew()
            break
          case 'Enter':
            if (useStore.getState().view === 'generator') {
              e.preventDefault()
              fireGenerate()
            }
            break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView, setHelpOpen, fireNew, fireSearch, fireGenerate])

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        {update?.updateAvailable && (
          <div className="update-banner">
            <Sparkles size={16} />
            <span>
              {t('upd.available')} <b>{update.latestVersion}</b> ({t('upd.youHave')} {update.currentVersion}).
            </span>
            <button
              className="update-btn"
              onClick={() => window.api.shell.openExternal(update.downloadUrl || update.releaseUrl || '')}
            >
              <Download size={14} /> {t('upd.download')}
            </button>
            <button className="icon-btn" onClick={dismissUpdate}>
              <X size={16} />
            </button>
          </div>
        )}
        {view === 'browse' && <Browse />}
        {view === 'generator' && <Generator />}
        {view === 'templates' && <Templates />}
        {view === 'settings' && <SettingsView />}
      </main>
      {helpOpen && <Help />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
