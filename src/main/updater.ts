import { app } from 'electron'

export interface UpdateInfo {
  ok: boolean
  updateAvailable: boolean
  currentVersion: string
  latestVersion?: string
  releaseUrl?: string
  downloadUrl?: string
  notes?: string
  error?: string
}

// Prosty updater oparty o GitHub Releases (pasuje do instalatora Inno Setup —
// nie wymaga podpisanego NSIS ani serwera electron-updater). Sprawdza najnowsze
// wydanie, porównuje wersje i zwraca link do pobrania nowego instalatora.

function parseSemver(v: string): number[] {
  return v
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

function isNewer(latest: string, current: string): boolean {
  const a = parseSemver(latest)
  const b = parseSemver(current)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0
    const y = b[i] || 0
    if (x > y) return true
    if (x < y) return false
  }
  return false
}

export async function checkForUpdates(repo: string): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()
  if (!repo || !repo.includes('/')) {
    return {
      ok: false,
      updateAvailable: false,
      currentVersion,
      error: 'Podaj repozytorium GitHub w formacie "użytkownik/repo" w Ustawieniach.'
    }
  }

  const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`
  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MusicPromptStudio-Updater'
      }
    })
    if (res.status === 404) {
      return {
        ok: false,
        updateAvailable: false,
        currentVersion,
        error: 'Nie znaleziono wydań (releases) w tym repozytorium.'
      }
    }
    if (!res.ok) {
      return {
        ok: false,
        updateAvailable: false,
        currentVersion,
        error: `GitHub API HTTP ${res.status}`
      }
    }
    const data = (await res.json()) as {
      tag_name?: string
      name?: string
      html_url?: string
      body?: string
      assets?: Array<{ name: string; browser_download_url: string }>
    }
    const latestVersion = (data.tag_name || data.name || '').replace(/^v/i, '')
    if (!latestVersion) {
      return {
        ok: false,
        updateAvailable: false,
        currentVersion,
        error: 'Wydanie nie ma numeru wersji (tag).'
      }
    }
    const asset =
      (data.assets || []).find((a) => /setup.*\.exe$/i.test(a.name)) ||
      (data.assets || []).find((a) => /\.exe$/i.test(a.name))

    return {
      ok: true,
      updateAvailable: isNewer(latestVersion, currentVersion),
      currentVersion,
      latestVersion,
      releaseUrl: data.html_url,
      downloadUrl: asset?.browser_download_url || data.html_url,
      notes: data.body
    }
  } catch (e) {
    return {
      ok: false,
      updateAvailable: false,
      currentVersion,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
