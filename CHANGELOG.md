# Changelog

Wszystkie istotne zmiany w projekcie **Music Prompt Studio**.
Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/); wersjonowanie wg [SemVer](https://semver.org/lang/pl/).

## [1.3.1] – 2026-07-26
### Added
- Workflow GitHub Actions (`.github/workflows/release.yml`) — automatyczny build instalatora na `windows-latest` i publikacja Release przy pushu tagu `v*`.
### Changed
- Konfiguracja `publish` (GitHub) w electron-builder — Release publikowany bezpośrednio przez CI.

## [1.3.0] – 2026-07-26
### Added
- **Motyw jasny/ciemny** — przełącznik w Ustawieniach oraz szybki przełącznik w pasku bocznym; zapisywany trwale, aplikowany przy starcie.
- **Eksport pojedynczego promptu** — przycisk eksportu na każdej karcie (TXT / Markdown / JSON / CSV) z systemowym oknem zapisu.

## [1.2.0] – 2026-07-26
### Added
- **Obsługa języka angielskiego (PL/EN)** — pełne tłumaczenie interfejsu, przełącznik w Ustawieniach ze zmianą natychmiastową.
- **Skróty klawiaturowe** — nawigacja (`Ctrl+1/2/3`, `Ctrl+,`), `Ctrl+F` (szukaj), `Ctrl+N` (nowy), `Ctrl+Enter` (generuj), `F1`/`?` (pomoc), `Esc`.
- **Pomoc w aplikacji** — dwujęzyczne okno pomocy (przycisk w menu / `F1`) oraz pliki `docs/POMOC.md` i `docs/HELP.md`.

## [1.1.0] – 2026-07-26
### Added
- **Trzy nowe narzędzia AI**: Riffusion, AIVA, Soundraw (razem 8 narzędzi, ~3096 promptów).
- **Auto-update** przez GitHub Releases — baner z pobieraniem, konfiguracja repozytorium w Ustawieniach, sprawdzanie przy starcie.
- Bezpieczny „top-up" bazy — przy aktualizacji dosiewane są prompty nowych narzędzi (bez duplikatów).

## [1.0.0] – 2026-07-26
### Added
- Pierwsza wersja: aplikacja desktopowa Electron (React + TypeScript + Vite + SQLite).
- Baza ~2448 promptów dla Suno, Udio, Mureka, Stable Audio, ElevenLabs.
- Generator promptów AI z dwoma silnikami: **Gemini API** (chmura) i **Ollama** (lokalnie).
- Ulubione, tagowanie, wyszukiwarka pełnotekstowa, eksport masowy (JSON/CSV/MD/TXT), własne szablony.
- Własna ikona, instalator Windows (NSIS / Inno Setup).

[1.3.1]: https://github.com/zetmar-collab/music-prompt-studio/releases/tag/v1.3.1
