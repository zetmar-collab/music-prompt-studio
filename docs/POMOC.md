# 🎵 Music Prompt Studio — Pomoc

Wersja 1.1.0 · © 2026 Marek Zettel · Cyfrowy Przyjaciel

Music Prompt Studio to aplikacja desktopowa z ponad **3000 gotowych promptów** dla narzędzi AI do tworzenia muzyki, wraz z generatorem promptów opartym o AI.

---

## Spis treści
1. [Pierwsze uruchomienie](#pierwsze-uruchomienie)
2. [Baza promptów](#baza-promptów)
3. [Generator AI](#generator-ai)
4. [Szablony](#szablony)
5. [Ustawienia](#ustawienia)
6. [Aktualizacje](#aktualizacje)
7. [Skróty klawiaturowe](#skróty-klawiaturowe)
8. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

---

## Pierwsze uruchomienie
Po instalacji aplikacja od razu wypełnia lokalną bazę tysiącami promptów — nie trzeba nic konfigurować, żeby przeglądać i kopiować prompty. Aby korzystać z **generatora AI**, skonfiguruj jeden z silników (patrz [Ustawienia](#ustawienia)).

Obsługiwane narzędzia: **Suno, Udio, Mureka, Stable Audio, ElevenLabs, Riffusion, AIVA, Soundraw**.

## Baza promptów
- **Wyszukiwarka** — szukaj po tytule, treści, tagach i gatunku (`Ctrl+F`).
- **Filtr narzędzia** — pokaż prompty tylko dla wybranego narzędzia.
- **Ulubione** — kliknij gwiazdkę na karcie; filtr „Ulubione" pokazuje tylko oznaczone.
- **Tagi** — kliknij tag, aby odfiltrować; ponowne kliknięcie usuwa filtr.
- **Kopiuj** — kopiuje treść promptu do schowka.
- **Edytuj / Usuń** — modyfikuj lub skasuj prompt.
- **Nowy** (`Ctrl+N`) — dodaj własny prompt.
- **Eksport** — zapisz aktualnie przefiltrowane prompty do **JSON, CSV, Markdown lub TXT**.

## Generator AI
1. Wybierz silnik: **Ollama** (lokalnie) lub **Gemini** (chmura).
2. Wybierz model, narzędzie docelowe i opisz swój pomysł.
3. Opcjonalnie podaj gatunek, nastrój i liczbę wariantów.
4. Kliknij **Generuj prompty** (`Ctrl+Enter`).
5. Każdy wynik możesz **skopiować** lub **zapisać do bazy**.

Generator zna specyfikę każdego narzędzia i formatuje prompty odpowiednio (np. tagi `[ ]` dla Suno, format loop dla Stable Audio, kompozycje instrumentalne dla AIVA).

## Szablony
Twórz własne szablony z polami `{placeholder}`. Przykład:
```
{genre} ballad, {tempo} BPM, {instruments}, {vocals} vocals, {mood} mood
```
Pola wykrywane są automatycznie. Po uzupełnieniu wartości szablon składa gotowy prompt do skopiowania lub zapisania.

## Ustawienia
- **Język** — Polski / English (zmiana natychmiastowa).
- **Silnik domyślny** — Ollama lub Gemini.
- **Gemini API** — wklej klucz (pobierzesz go w Google AI Studio). Klucz zapisywany jest **lokalnie** i nigdy nie opuszcza urządzenia.
- **Ollama** — adres serwera (domyślnie `http://localhost:11434`). Przycisk „Testuj połączenie" sprawdza dostępność i listę modeli.
- **Aktualizacje** — repozytorium GitHub i auto-sprawdzanie przy starcie.

## Aktualizacje
Podaj w Ustawieniach repozytorium GitHub w formacie `użytkownik/repo`. Aplikacja sprawdzi najnowsze wydanie (release), a jeśli będzie nowsze niż zainstalowane — pokaże baner z przyciskiem **Pobierz**, kierującym do nowego instalatora.

## Skróty klawiaturowe
| Skrót | Działanie |
|---|---|
| `Ctrl + 1` | Baza promptów |
| `Ctrl + 2` | Generator AI |
| `Ctrl + 3` | Szablony |
| `Ctrl + ,` | Ustawienia |
| `Ctrl + F` | Fokus na wyszukiwarkę |
| `Ctrl + N` | Nowy prompt |
| `Ctrl + Enter` | Generuj (w generatorze) |
| `F1` lub `?` | Otwórz pomoc |
| `Esc` | Zamknij okno / pomoc |

## Rozwiązywanie problemów
**Ollama nie odpowiada** — upewnij się, że działa (`ollama serve`) i że masz pobrany model (`ollama pull llama3.2`). Sprawdź adres w Ustawieniach.

**Gemini zwraca błąd** — sprawdź poprawność klucza API i połączenie z internetem. Użyj „Testuj połączenie".

**Gdzie są moje dane?** — baza i ustawienia znajdują się w katalogu danych aplikacji użytkownika (`%APPDATA%\music-prompt-studio`). Deinstalacja domyślnie ich nie usuwa.
