import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

export interface PromptRow {
  id: number
  title: string
  tool: string
  category: string
  content: string
  tags: string // comma-separated in DB, array in API
  genre: string | null
  favorite: number
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: number
  title: string
  tool: string
  category: string
  content: string
  tags: string[]
  genre: string | null
  favorite: boolean
  created_at: string
  updated_at: string
}

export interface TemplateRow {
  id: number
  name: string
  tool: string
  body: string
  fields: string // JSON array of field defs
  created_at: string
}

let db: Database.Database

function rowToPrompt(r: PromptRow): Prompt {
  return {
    id: r.id,
    title: r.title,
    tool: r.tool,
    category: r.category,
    content: r.content,
    tags: r.tags ? r.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    genre: r.genre,
    favorite: !!r.favorite,
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}

export function initDb(): Database.Database {
  const dbPath = join(app.getPath('userData'), 'music-prompt-studio.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tool TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Ogólne',
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      genre TEXT,
      favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_prompts_tool ON prompts(tool);
    CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON prompts(favorite);

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tool TEXT NOT NULL,
      body TEXT NOT NULL,
      fields TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  seedIfEmpty()
  topUpNewTools()
  return db
}

interface SeedPrompt {
  title: string
  tool: string
  category: string
  content: string
  tags: string[]
  genre?: string | null
}

function loadSeedData(): SeedPrompt[] | null {
  // Load seed data bundled with the app (in prod: resources/, in dev: repo root/resources)
  const candidates = [
    join(process.resourcesPath || '', 'prompts.seed.json'),
    join(app.getAppPath(), 'resources', 'prompts.seed.json'),
    join(app.getAppPath(), '..', 'resources', 'prompts.seed.json')
  ]
  let seedFile: string | null = null
  for (const c of candidates) {
    if (c && existsSync(c)) {
      seedFile = c
      break
    }
  }
  if (!seedFile) return null
  try {
    return JSON.parse(readFileSync(seedFile, 'utf-8')) as SeedPrompt[]
  } catch (e) {
    console.error('Seed read error:', e)
    return null
  }
}

function insertSeedRows(rows: SeedPrompt[]): void {
  const insert = db.prepare(
    `INSERT INTO prompts (title, tool, category, content, tags, genre)
     VALUES (@title, @tool, @category, @content, @tags, @genre)`
  )
  const tx = db.transaction((data: SeedPrompt[]) => {
    for (const p of data) {
      insert.run({
        title: p.title,
        tool: p.tool,
        category: p.category || 'Ogólne',
        content: p.content,
        tags: (p.tags || []).join(','),
        genre: p.genre ?? null
      })
    }
  })
  tx(rows)
}

// On upgrade: add prompts for tools that are in the seed file but have no rows yet
// (e.g. newly added engines). Never duplicates existing tools' prompts.
function topUpNewTools(): void {
  const data = loadSeedData()
  if (!data) return
  const existing = new Set(
    (db.prepare('SELECT DISTINCT tool FROM prompts').all() as { tool: string }[]).map((r) => r.tool)
  )
  const missing = data.filter((p) => !existing.has(p.tool))
  if (missing.length === 0) return
  insertSeedRows(missing)
  console.log(`Top-up: dodano ${missing.length} promptów dla nowych narzędzi.`)
}

function seedIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) AS c FROM prompts').get() as { c: number }).c
  if (count > 0) return

  const data = loadSeedData()
  if (!data) return

  try {
    insertSeedRows(data)

    // A couple of starter templates
    const insertT = db.prepare(
      `INSERT INTO templates (name, tool, body, fields) VALUES (@name, @tool, @body, @fields)`
    )
    insertT.run({
      name: 'Suno — Utwór pełny',
      tool: 'Suno',
      body: '[Gatunek: {genre}] [Nastrój: {mood}] [Tempo: {tempo} BPM]\n{instruments}, wokal {vocals}.\nTemat: {theme}.\n[Struktura: Intro, Zwrotka, Refren, Zwrotka, Refren, Outro]',
      fields: JSON.stringify([
        { key: 'genre', label: 'Gatunek', placeholder: 'synthwave' },
        { key: 'mood', label: 'Nastrój', placeholder: 'nostalgiczny' },
        { key: 'tempo', label: 'Tempo (BPM)', placeholder: '110' },
        { key: 'instruments', label: 'Instrumenty', placeholder: 'analogowe syntezatory, perkusja elektroniczna' },
        { key: 'vocals', label: 'Wokal', placeholder: 'męski, eteryczny' },
        { key: 'theme', label: 'Temat', placeholder: 'nocna jazda przez miasto' }
      ])
    })
    insertT.run({
      name: 'Stable Audio — Tekstura/Loop',
      tool: 'Stable Audio',
      body: '{genre} loop, {bpm} BPM, {key}, {instruments}, {mood}, high quality, seamless loop',
      fields: JSON.stringify([
        { key: 'genre', label: 'Gatunek', placeholder: 'lo-fi hip hop' },
        { key: 'bpm', label: 'BPM', placeholder: '85' },
        { key: 'key', label: 'Tonacja', placeholder: 'A minor' },
        { key: 'instruments', label: 'Instrumenty', placeholder: 'dusty piano, vinyl crackle, soft drums' },
        { key: 'mood', label: 'Nastrój', placeholder: 'relaxed, warm' }
      ])
    })
  } catch (e) {
    console.error('Seed error:', e)
  }
}

// ---------- Prompts CRUD ----------

export function listPrompts(filter: {
  search?: string
  tool?: string
  tag?: string
  favoritesOnly?: boolean
}): Prompt[] {
  const where: string[] = []
  const params: Record<string, unknown> = {}

  if (filter.search) {
    where.push('(title LIKE @s OR content LIKE @s OR tags LIKE @s OR genre LIKE @s)')
    params.s = `%${filter.search}%`
  }
  if (filter.tool && filter.tool !== 'Wszystkie') {
    where.push('tool = @tool')
    params.tool = filter.tool
  }
  if (filter.tag) {
    where.push('tags LIKE @tag')
    params.tag = `%${filter.tag}%`
  }
  if (filter.favoritesOnly) {
    where.push('favorite = 1')
  }

  const sql =
    'SELECT * FROM prompts' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY favorite DESC, updated_at DESC LIMIT 2000'
  const rows = db.prepare(sql).all(params) as PromptRow[]
  return rows.map(rowToPrompt)
}

export function createPrompt(p: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'favorite'> & { favorite?: boolean }): Prompt {
  const info = db
    .prepare(
      `INSERT INTO prompts (title, tool, category, content, tags, genre, favorite)
       VALUES (@title, @tool, @category, @content, @tags, @genre, @favorite)`
    )
    .run({
      title: p.title,
      tool: p.tool,
      category: p.category || 'Ogólne',
      content: p.content,
      tags: (p.tags || []).join(','),
      genre: p.genre ?? null,
      favorite: p.favorite ? 1 : 0
    })
  return getPrompt(Number(info.lastInsertRowid))!
}

export function updatePrompt(id: number, p: Partial<Prompt>): Prompt | null {
  const existing = getPrompt(id)
  if (!existing) return null
  const merged = { ...existing, ...p }
  db.prepare(
    `UPDATE prompts SET title=@title, tool=@tool, category=@category, content=@content,
      tags=@tags, genre=@genre, favorite=@favorite, updated_at=datetime('now') WHERE id=@id`
  ).run({
    id,
    title: merged.title,
    tool: merged.tool,
    category: merged.category,
    content: merged.content,
    tags: (merged.tags || []).join(','),
    genre: merged.genre ?? null,
    favorite: merged.favorite ? 1 : 0
  })
  return getPrompt(id)
}

export function getPrompt(id: number): Prompt | null {
  const r = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id) as PromptRow | undefined
  return r ? rowToPrompt(r) : null
}

export function deletePrompt(id: number): void {
  db.prepare('DELETE FROM prompts WHERE id = ?').run(id)
}

export function toggleFavorite(id: number): Prompt | null {
  const r = getPrompt(id)
  if (!r) return null
  return updatePrompt(id, { favorite: !r.favorite })
}

export function allTags(): string[] {
  const rows = db.prepare("SELECT tags FROM prompts WHERE tags <> ''").all() as { tags: string }[]
  const set = new Set<string>()
  for (const row of rows) {
    row.tags.split(',').forEach((t) => {
      const v = t.trim()
      if (v) set.add(v)
    })
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
}

export function allTools(): { tool: string; count: number }[] {
  return db
    .prepare('SELECT tool, COUNT(*) AS count FROM prompts GROUP BY tool ORDER BY tool')
    .all() as { tool: string; count: number }[]
}

export function stats(): { total: number; favorites: number; tools: number } {
  const total = (db.prepare('SELECT COUNT(*) AS c FROM prompts').get() as { c: number }).c
  const favorites = (db.prepare('SELECT COUNT(*) AS c FROM prompts WHERE favorite=1').get() as { c: number }).c
  const tools = (db.prepare('SELECT COUNT(DISTINCT tool) AS c FROM prompts').get() as { c: number }).c
  return { total, favorites, tools }
}

// ---------- Templates ----------

export function listTemplates(): TemplateRow[] {
  return db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all() as TemplateRow[]
}

export function createTemplate(t: { name: string; tool: string; body: string; fields: unknown }): TemplateRow {
  const info = db
    .prepare('INSERT INTO templates (name, tool, body, fields) VALUES (@name, @tool, @body, @fields)')
    .run({ name: t.name, tool: t.tool, body: t.body, fields: JSON.stringify(t.fields ?? []) })
  return db.prepare('SELECT * FROM templates WHERE id = ?').get(info.lastInsertRowid) as TemplateRow
}

export function deleteTemplate(id: number): void {
  db.prepare('DELETE FROM templates WHERE id = ?').run(id)
}

export function getDb(): Database.Database {
  return db
}
