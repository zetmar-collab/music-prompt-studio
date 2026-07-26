# 🎵 Music Prompt Studio

Aplikacja desktopowa (Electron) z **tysiącami promptów** dla narzędzi AI do tworzenia muzyki:
**Suno · Udio · Mureka · Stable Audio · ElevenLabs**.

Zamiast e-booka — wygodna wyszukiwarka i generator promptów.

## Funkcje

- 📚 **Baza promptów** — ~2400 gotowych promptów, pełnotekstowa wyszukiwarka (SQLite)
- ✨ **Generator AI** — dwa silniki: **Gemini API** (chmura) i **Ollama** (lokalnie, offline)
- ⭐ **Ulubione** — oznaczaj i filtruj najlepsze prompty
- 🏷️ **Tagowanie** — chmura tagów, filtrowanie jednym kliknięciem
- 📤 **Eksport** — JSON, CSV, Markdown, TXT
- 🧩 **Własne szablony** — pola `{placeholder}` składane w gotowy prompt

## Technologia

| Warstwa | Stack |
|--------|-------|
| Powłoka | Electron 33 |
| UI | React 18 + TypeScript + Vite |
| Baza | better-sqlite3 (lokalny plik w katalogu użytkownika) |
| AI (chmura) | Gemini API (`@google/genai`) |
| AI (lokalnie) | Ollama REST (`http://localhost:11434`) |

## Uruchomienie (dev)

```bash
npm install
npm run dev
```

## Budowa instalatora (Windows)

```bash
npm run dist
```

Instalator NSIS pojawi się w `dist/Music Prompt Studio-Setup-1.0.0.exe`.

## Silniki AI

- **Ollama (domyślny, lokalny)** — zainstaluj [Ollama](https://ollama.com), uruchom `ollama serve`, pobierz model: `ollama pull llama3.2`. Działa w pełni offline, bez kosztów.
- **Gemini (chmura)** — pobierz klucz w [Google AI Studio](https://aistudio.google.com/app/apikey) i wklej w **Ustawieniach**.

Klucz API przechowywany jest lokalnie w `settings.json` (katalog danych aplikacji) i nigdy nie trafia do kodu ani repozytorium.

## Historia zmian

Zobacz [CHANGELOG.md](CHANGELOG.md).

---

© 2026 Marek Zettel · Cyfrowy Przyjaciel
