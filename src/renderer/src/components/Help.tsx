import { X, Keyboard, BookOpen, Sparkles, Library, LayoutTemplate, Cpu, Cloud } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import { SHORTCUTS } from '../shortcuts'

export default function Help(): JSX.Element {
  const t = useT()
  const setHelpOpen = useStore((s) => s.setHelpOpen)
  const lang = useStore((s) => s.settings?.language ?? 'pl')

  const isPl = lang === 'pl'

  return (
    <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
      <div className="modal help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>
            <BookOpen size={19} style={{ verticalAlign: -3, marginRight: 8 }} />
            {t('help.title')} — Music Prompt Studio
          </h2>
          <button className="icon-btn" onClick={() => setHelpOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="help-body">
          <section className="help-section">
            <h3>
              <Library size={16} /> {t('nav.browse')}
            </h3>
            <p>
              {isPl
                ? 'Przeglądaj ponad 3000 gotowych promptów dla 8 narzędzi AI (Suno, Udio, Mureka, Stable Audio, ElevenLabs, Riffusion, AIVA, Soundraw). Wyszukuj po tytule, treści, tagach i gatunku, filtruj po narzędziu i ulubionych, oznaczaj gwiazdką i eksportuj do JSON / CSV / Markdown / TXT.'
                : 'Browse 3000+ ready prompts for 8 AI tools (Suno, Udio, Mureka, Stable Audio, ElevenLabs, Riffusion, AIVA, Soundraw). Search by title, content, tags and genre, filter by tool and favorites, star them and export to JSON / CSV / Markdown / TXT.'}
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Sparkles size={16} /> {t('nav.generator')}
            </h3>
            <p>
              {isPl
                ? 'Opisz swój pomysł, a AI ułoży gotowe prompty dopasowane do wybranego narzędzia. Dwa silniki:'
                : 'Describe your idea and AI crafts ready prompts tailored to the chosen tool. Two engines:'}
            </p>
            <ul>
              <li>
                <Cpu size={14} /> <b>Ollama</b> —{' '}
                {isPl
                  ? 'działa lokalnie i offline, bez kosztów. Wymaga zainstalowanej Ollamy (ollama serve) i modelu (np. ollama pull llama3.2).'
                  : 'runs locally and offline, free. Requires Ollama installed (ollama serve) and a model (e.g. ollama pull llama3.2).'}
              </li>
              <li>
                <Cloud size={14} /> <b>Gemini</b> —{' '}
                {isPl
                  ? 'silnik w chmurze. Wklej klucz API w Ustawieniach (pobierzesz go w Google AI Studio).'
                  : 'cloud engine. Paste your API key in Settings (get one at Google AI Studio).'}
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>
              <LayoutTemplate size={16} /> {t('nav.templates')}
            </h3>
            <p>
              {isPl
                ? 'Twórz własne szablony z polami {placeholder}. Uzupełnij pola, a program złoży gotowy prompt, który możesz skopiować lub zapisać do bazy.'
                : 'Create your own templates with {placeholder} fields. Fill them in and the app builds a ready prompt you can copy or save to the library.'}
            </p>
          </section>

          <section className="help-section">
            <h3>
              <Keyboard size={16} /> {t('help.shortcuts')}
            </h3>
            <table className="shortcut-table">
              <tbody>
                {SHORTCUTS.map((s) => (
                  <tr key={s.keys}>
                    <td>
                      <kbd>{s.keys}</kbd>
                    </td>
                    <td>{isPl ? s.pl : s.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="help-section muted-section">
            <p>
              {isPl
                ? 'Baza i ustawienia zapisywane są lokalnie na Twoim komputerze. Klucz API nigdy nie opuszcza urządzenia.'
                : 'The library and settings are stored locally on your computer. Your API key never leaves the device.'}
            </p>
            <p className="help-footer">© 2026 Marek Zettel · Cyfrowy Przyjaciel · v1.3.1</p>
          </section>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={() => setHelpOpen(false)}>
            {t('help.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
