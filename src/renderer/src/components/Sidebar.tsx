import {
  Library,
  Sparkles,
  LayoutTemplate,
  Settings as SettingsIcon,
  Music4,
  Star,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react'
import { useStore, type View } from '../store'
import { useT } from '../i18n'

const NAV: { id: View; key: string; icon: JSX.Element }[] = [
  { id: 'browse', key: 'nav.browse', icon: <Library size={18} /> },
  { id: 'generator', key: 'nav.generator', icon: <Sparkles size={18} /> },
  { id: 'templates', key: 'nav.templates', icon: <LayoutTemplate size={18} /> },
  { id: 'settings', key: 'nav.settings', icon: <SettingsIcon size={18} /> }
]

export default function Sidebar(): JSX.Element {
  const t = useT()
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const setHelpOpen = useStore((s) => s.setHelpOpen)
  const stats = useStore((s) => s.stats)
  const theme = useStore((s) => s.settings?.theme ?? 'dark')
  const saveSettings = useStore((s) => s.saveSettings)

  const toggleTheme = (): void => {
    void saveSettings({ theme: theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <Music4 size={22} />
        </div>
        <div>
          <div className="brand-title">Music Prompt</div>
          <div className="brand-sub">{t('brand.studio')}</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${view === n.id ? 'active' : ''}`}
            onClick={() => setView(n.id)}
          >
            {n.icon}
            <span>{t(n.key)}</span>
          </button>
        ))}
        <button className="nav-item" onClick={() => setHelpOpen(true)}>
          <HelpCircle size={18} />
          <span>{t('nav.help')}</span>
        </button>
      </nav>

      <div className="sidebar-stats">
        <div className="stat">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">{t('stats.prompts')}</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            <Star size={13} className="inline-star" /> {stats.favorites}
          </span>
          <span className="stat-label">{t('stats.favorites')}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stats.tools}</span>
          <span className="stat-label">{t('stats.tools')}</span>
        </div>
      </div>

      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
      </button>

      <div className="sidebar-footer">Cyfrowy Przyjaciel · v1.3</div>
    </aside>
  )
}
