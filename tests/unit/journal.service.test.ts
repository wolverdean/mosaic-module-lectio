import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import type { ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import * as svc from '../../src/services/journal.service.js'

function makeDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)')
  const mdb: ModuleDb = {
    prepare: db.prepare.bind(db),
    exec: (sql) => { db.exec(sql) },
    transaction: (fn) => db.transaction(fn),
    raw: db,
  }
  migrate(mdb)
  db.prepare('INSERT INTO users (username) VALUES (?)').run('alice')
  return db
}

let db: Database.Database
let userId: number

beforeEach(() => {
  db = makeDb()
  userId = (db.prepare('SELECT id FROM users WHERE username = ?').get('alice') as any).id
})

// ── listEntries ───────────────────────────────────────────────────────────────

describe('listEntries', () => {
  it('returns empty array initially', () => {
    expect(svc.listEntries(db, userId)).toHaveLength(0)
  })

  it('returns entries newest-first limited to 180', () => {
    svc.upsertEntry(db, userId, '2026-06-10', 'A')
    svc.upsertEntry(db, userId, '2026-06-11', 'B')
    const list = svc.listEntries(db, userId) as any[]
    expect(list[0].date).toBe('2026-06-11')
    expect(list[1].date).toBe('2026-06-10')
  })
})

// ── getEntry ──────────────────────────────────────────────────────────────────

describe('getEntry', () => {
  it('returns empty content for missing date', () => {
    const entry = svc.getEntry(db, userId, '2026-06-11')
    expect(entry).toEqual({ date: '2026-06-11', content: '' })
  })

  it('returns saved content', () => {
    svc.upsertEntry(db, userId, '2026-06-11', 'Hello journal')
    const entry = svc.getEntry(db, userId, '2026-06-11') as any
    expect(entry.content).toBe('Hello journal')
  })
})

// ── upsertEntry ───────────────────────────────────────────────────────────────

describe('upsertEntry', () => {
  it('creates a new entry', () => {
    const result = svc.upsertEntry(db, userId, '2026-06-11', 'First') as any
    expect(result.date).toBe('2026-06-11')
    expect(result.content).toBe('First')
  })

  it('overwrites on second call', () => {
    svc.upsertEntry(db, userId, '2026-06-11', 'First')
    svc.upsertEntry(db, userId, '2026-06-11', 'Second')
    const entry = svc.getEntry(db, userId, '2026-06-11') as any
    expect(entry.content).toBe('Second')
  })

  it('preserves original_content on subsequent saves', () => {
    svc.upsertEntry(db, userId, '2026-06-11', 'Original')
    // Simulate condensation: set original_content
    db.prepare("UPDATE lectio_journal_entries SET original_content = content WHERE user_id = ? AND date = ?").run(userId, '2026-06-11')
    // Another save should not overwrite original_content (COALESCE)
    svc.upsertEntry(db, userId, '2026-06-11', 'Updated')
    const row = db.prepare('SELECT original_content FROM lectio_journal_entries WHERE user_id = ? AND date = ?').get(userId, '2026-06-11') as any
    expect(row.original_content).toBe('Original')
  })
})

// ── getRange ──────────────────────────────────────────────────────────────────

describe('getRange', () => {
  it('returns entries within date range', () => {
    svc.upsertEntry(db, userId, '2026-06-09', 'Mon')
    svc.upsertEntry(db, userId, '2026-06-11', 'Wed')
    svc.upsertEntry(db, userId, '2026-06-15', 'Sun')
    const rows = svc.getRange(db, userId, '2026-06-10', '2026-06-12') as any[]
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('2026-06-11')
  })
})

// ── extractJournalText ────────────────────────────────────────────────────────

describe('extractJournalText', () => {
  it('returns plain text as-is', () => {
    expect(svc.extractJournalText('hello')).toBe('hello')
  })

  it('builds labeled transcript from JSON fields', () => {
    const content = JSON.stringify({ general_notes: 'My note', examen_gratitude: 'Thankful' })
    const text = svc.extractJournalText(content)
    expect(text).toContain('General Notes:\nMy note')
    expect(text).toContain('Gratitude:\nThankful')
  })

  it('returns empty string for blank content', () => {
    expect(svc.extractJournalText('')).toBe('')
    expect(svc.extractJournalText('   ')).toBe('')
  })

  it('ignores unknown JSON keys gracefully', () => {
    const content = JSON.stringify({ unknown_key: 'value' })
    const text = svc.extractJournalText(content)
    expect(text).toContain('unknown_key')
  })
})
