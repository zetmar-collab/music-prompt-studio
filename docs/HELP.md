# 🎵 Music Prompt Studio — Help

Version 1.1.0 · © 2026 Marek Zettel · Cyfrowy Przyjaciel

Music Prompt Studio is a desktop app with **3000+ ready prompts** for AI music-creation tools, plus an AI-powered prompt generator.

---

## Contents
1. [Getting started](#getting-started)
2. [Prompt library](#prompt-library)
3. [AI generator](#ai-generator)
4. [Templates](#templates)
5. [Settings](#settings)
6. [Updates](#updates)
7. [Keyboard shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## Getting started
After installation the app immediately fills a local database with thousands of prompts — no setup needed to browse and copy them. To use the **AI generator**, configure one of the engines (see [Settings](#settings)).

Supported tools: **Suno, Udio, Mureka, Stable Audio, ElevenLabs, Riffusion, AIVA, Soundraw**.

## Prompt library
- **Search** — by title, content, tags and genre (`Ctrl+F`).
- **Tool filter** — show prompts for a single tool.
- **Favorites** — click the star on a card; the "Favorites" filter shows only starred ones.
- **Tags** — click a tag to filter; click again to clear.
- **Copy** — copies the prompt content to the clipboard.
- **Edit / Delete** — modify or remove a prompt.
- **New** (`Ctrl+N`) — add your own prompt.
- **Export** — save the currently filtered prompts to **JSON, CSV, Markdown or TXT**.

## AI generator
1. Pick an engine: **Ollama** (local) or **Gemini** (cloud).
2. Choose a model, target tool, and describe your idea.
3. Optionally set genre, mood and number of variants.
4. Click **Generate prompts** (`Ctrl+Enter`).
5. Each result can be **copied** or **saved to the library**.

The generator knows each tool's conventions and formats prompts accordingly (e.g. `[ ]` tags for Suno, loop format for Stable Audio, instrumental compositions for AIVA).

## Templates
Create your own templates with `{placeholder}` fields. Example:
```
{genre} ballad, {tempo} BPM, {instruments}, {vocals} vocals, {mood} mood
```
Fields are detected automatically. Fill in the values and the template builds a ready prompt to copy or save.

## Settings
- **Language** — Polski / English (applies instantly).
- **Default engine** — Ollama or Gemini.
- **Gemini API** — paste your key (get one at Google AI Studio). The key is stored **locally** and never leaves your device.
- **Ollama** — server address (default `http://localhost:11434`). "Test connection" checks availability and model list.
- **Updates** — GitHub repository and auto-check on startup.

## Updates
Enter a GitHub repository as `user/repo` in Settings. The app checks the latest release, and if it's newer than the installed version it shows a banner with a **Download** button linking to the new installer.

## Keyboard shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + 1` | Prompt library |
| `Ctrl + 2` | AI generator |
| `Ctrl + 3` | Templates |
| `Ctrl + ,` | Settings |
| `Ctrl + F` | Focus search |
| `Ctrl + N` | New prompt |
| `Ctrl + Enter` | Generate (in generator) |
| `F1` or `?` | Open help |
| `Esc` | Close dialog / help |

## Troubleshooting
**Ollama not responding** — make sure it's running (`ollama serve`) and you've pulled a model (`ollama pull llama3.2`). Check the address in Settings.

**Gemini returns an error** — verify the API key and your internet connection. Use "Test connection".

**Where is my data?** — the database and settings live in the user's app-data folder (`%APPDATA%\music-prompt-studio`). Uninstalling does not remove them by default.
