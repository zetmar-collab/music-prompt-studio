export interface Shortcut {
  keys: string
  pl: string
  en: string
}

export const SHORTCUTS: Shortcut[] = [
  { keys: 'Ctrl + 1', pl: 'Baza promptów', en: 'Prompt library' },
  { keys: 'Ctrl + 2', pl: 'Generator AI', en: 'AI generator' },
  { keys: 'Ctrl + 3', pl: 'Szablony', en: 'Templates' },
  { keys: 'Ctrl + ,', pl: 'Ustawienia', en: 'Settings' },
  { keys: 'Ctrl + F', pl: 'Fokus na wyszukiwarkę', en: 'Focus search' },
  { keys: 'Ctrl + N', pl: 'Nowy prompt', en: 'New prompt' },
  { keys: 'Ctrl + Enter', pl: 'Generuj (w generatorze)', en: 'Generate (in generator)' },
  { keys: 'F1  /  ?', pl: 'Otwórz pomoc', en: 'Open help' },
  { keys: 'Esc', pl: 'Zamknij okno / pomoc', en: 'Close dialog / help' }
]
