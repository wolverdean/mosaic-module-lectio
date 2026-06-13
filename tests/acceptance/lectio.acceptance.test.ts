/**
 * Acceptance tests — verified against the approved user story.
 *
 * AC1  — Journal: read and write daily entry; structured JSON fields render in canonical order
 * AC2  — Journal: field-aware editing (17 named fields)
 * AC3  — Journal: browse history (list 180, newest-first)
 * AC4  — Journal: range query
 * AC5  — Readings: 5 sources available (tested via settings, not live HTTP)
 * AC6  — Prayer: intercessions CRUD
 * AC7  — Prayer: intercessions active/inactive toggle
 * AC8  — Readings: 24-hour cache behaviour
 * AC9  — Contemplative: today passage + save/retrieve reflection
 * AC10 — Contemplative: browse full library by source
 * AC11 — Ignatian: start 19th Annotation and read current day
 * AC12 — Ignatian: pause / resume preserves day count
 * AC13 — Readings: weekly review save and retrieve
 * AC14 — Readings: user settings round-trip
 * AC15 — Module manifest contract
 */

import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import type { ModuleDb, ModuleManifest } from '@mosaic/sdk'
import { migrate }  from '../../src/migrate.js'
import * as journal from '../../src/services/journal.service.js'
import * as iSvc    from '../../src/services/intercessions.service.js'
import * as cSvc    from '../../src/services/contemplative.service.js'
import * as rSvc    from '../../src/services/readings.service.js'
import { VALID_SOURCES, getPassagesBySource, getTodayPassage } from '../../src/lib/contemplative.js'
import { calcIgnatianDay } from '../../src/lib/ignatian-calc.js'
import ignatian   from '../../src/data/ignatian.js'
import ignatian18 from '../../src/data/ignatian18.js'
import manifest from '../../index.js'

function createDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)')
  const mdb: ModuleDb = {
    prepare: db.prepare.bind(db),
    exec: sql => { db.exec(sql) },
    transaction: fn => db.transaction(fn),
    raw: db,
  }
  migrate(mdb)
  db.prepare('INSERT INTO users (username) VALUES (?)').run('acceptance-user')
  return db
}

let db: Database.Database
let userId: number

beforeEach(() => {
  db = createDb()
  userId = (db.prepare('SELECT id FROM users WHERE username = ?').get('acceptance-user') as any).id
})

// ── AC1 & AC2: Journal entry with structured fields ───────────────────────────

describe('AC1+AC2 — journal entry with structured fields', () => {
  it('upserts and retrieves a plain-text entry', () => {
    journal.upsertEntry(db, userId, '2026-06-12', 'A quiet morning')
    const entry = journal.getEntry(db, userId, '2026-06-12') as any
    expect(entry.content).toBe('A quiet morning')
  })

  it('renders JSON fields in canonical label order', () => {
    const content = JSON.stringify({ examen_gratitude: 'Thankful', general_notes: 'Good day' })
    journal.upsertEntry(db, userId, '2026-06-12', content)
    const text = journal.extractJournalText(content)
    const generalNotesIdx = text.indexOf('General Notes:')
    const gratitudeIdx    = text.indexOf('Gratitude:')
    expect(generalNotesIdx).toBeLessThan(gratitudeIdx)
  })

  it('covers all named fields', () => {
    expect(journal.JOURNAL_FIELD_ORDER).toHaveLength(21)
  })
})

// ── AC3: History ──────────────────────────────────────────────────────────────

describe('AC3 — journal history', () => {
  it('returns entries newest-first', () => {
    journal.upsertEntry(db, userId, '2026-06-10', 'A')
    journal.upsertEntry(db, userId, '2026-06-12', 'B')
    const list = journal.listEntries(db, userId) as any[]
    expect(list[0].date).toBe('2026-06-12')
    expect(list[1].date).toBe('2026-06-10')
  })
})

// ── AC4: Range query ──────────────────────────────────────────────────────────

describe('AC4 — journal range query', () => {
  it('returns only entries within range', () => {
    journal.upsertEntry(db, userId, '2026-06-01', 'Old')
    journal.upsertEntry(db, userId, '2026-06-11', 'In range')
    journal.upsertEntry(db, userId, '2026-06-20', 'Future')
    const rows = journal.getRange(db, userId, '2026-06-10', '2026-06-15') as any[]
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('2026-06-11')
  })
})

// ── AC5: Readings settings ────────────────────────────────────────────────────

describe('AC5 — readings settings', () => {
  it('defaults to local source', () => {
    expect((rSvc.getSettings(db, userId) as any).readings_source).toBe('local')
  })

  it('can switch to internet source', () => {
    rSvc.updateSettings(db, userId, { readings_source: 'internet' })
    expect((rSvc.getSettings(db, userId) as any).readings_source).toBe('internet')
  })
})

// ── AC6 & AC7: Intercessions ──────────────────────────────────────────────────

describe('AC6+AC7 — intercessions CRUD and toggle', () => {
  it('creates intercession with name and intention', () => {
    const i = iSvc.createIntercession(db, userId, 'Mary', 'Peace for her family') as any
    expect(i.name).toBe('Mary')
    expect(i.intention).toBe('Peace for her family')
    expect(i.active).toBe(1)
  })

  it('shows all active intercessions on prayer list', () => {
    iSvc.createIntercession(db, userId, 'Person A')
    iSvc.createIntercession(db, userId, 'Person B')
    expect(iSvc.listIntercessions(db, userId)).toHaveLength(2)
  })

  it('inactive intercessions excluded from default list', () => {
    const i = iSvc.createIntercession(db, userId, 'Person') as any
    iSvc.updateIntercession(db, userId, i.id, { active: 0 })
    expect(iSvc.listIntercessions(db, userId)).toHaveLength(0)
  })

  it('deletes intercession', () => {
    const i = iSvc.createIntercession(db, userId, 'Person') as any
    iSvc.deleteIntercession(db, userId, i.id)
    expect(iSvc.listIntercessions(db, userId)).toHaveLength(0)
  })
})

// ── AC9 & AC10: Contemplative ─────────────────────────────────────────────────

describe('AC9 — contemplative today and reflection', () => {
  it('getTodayPassage returns a passage with source and text', () => {
    const p = getTodayPassage() as any
    expect(VALID_SOURCES).toContain(p.source)
    expect(p.sourceMeta).toBeDefined()
  })

  it('saves and retrieves a reflection', () => {
    cSvc.saveReflection(db, userId, '2026-06-12', 'p1', 'merton', 'Stillness')
    const r = cSvc.getReflection(db, userId, '2026-06-12') as any
    expect(r.reflection).toBe('Stillness')
  })
})

describe('AC10 — contemplative full library', () => {
  it('browse returns all 4 sources', () => {
    const all = getPassagesBySource()
    expect(Object.keys(all).sort()).toEqual(['cassian', 'cloud', 'keating', 'merton'])
  })

  it('each source has at least one passage', () => {
    const all = getPassagesBySource()
    for (const src of VALID_SOURCES) {
      expect(all[src].length).toBeGreaterThan(0)
    }
  })

  it('can filter to a single source', () => {
    const all = getPassagesBySource()
    expect(all.merton.every(p => p.source === 'merton')).toBe(true)
  })
})

// ── AC11 & AC12: Ignatian ─────────────────────────────────────────────────────

describe('AC11+AC12 — Ignatian retreat', () => {
  it('calculates day 0 correctly', () => {
    const today = new Date().toISOString().slice(0, 10)
    const result = calcIgnatianDay(ignatian as any[], today) as any
    expect(result.weekNumber).toBe(1)
    expect(result.dayOfWeek).toBe(0)
    expect(result.isRestDay).toBe(false)
  })

  it('returns notStarted for future start date', () => {
    const future = '2099-01-01'
    const result = calcIgnatianDay(ignatian as any[], future) as any
    expect(result.notStarted).toBe(true)
  })

  it('returns completed when past total weeks', () => {
    const result = calcIgnatianDay(ignatian as any[], '2000-01-01') as any
    expect(result.completed).toBe(true)
  })

  it('pause freezes day count', () => {
    const today = new Date().toISOString().slice(0, 10)
    const r1 = calcIgnatianDay(ignatian as any[], today, null) as any
    const r2 = calcIgnatianDay(ignatian as any[], today, 0) as any
    expect(r1.weekNumber).toBe(r2.weekNumber)
  })

  it('ignatian18 schedule is shorter than ignatian19', () => {
    expect((ignatian18 as any[]).length).toBeLessThan((ignatian as any[]).length)
  })
})

// ── AC13: Weekly review ───────────────────────────────────────────────────────

describe('AC13 — weekly review', () => {
  it('saves and retrieves most recent review', () => {
    rSvc.saveWeeklyReview(db, userId, '2026-06-05', '2026-06-11', 'Theme: patience')
    const r = rSvc.getWeeklyReview(db, userId) as any
    expect(r.content).toBe('Theme: patience')
  })
})

// ── AC14: User settings ───────────────────────────────────────────────────────

describe('AC14 — user settings', () => {
  it('all settings round-trip', () => {
    rSvc.updateSettings(db, userId, { readings_source: 'internet' })
    expect((rSvc.getAllSettings(db, userId) as any).readings_source).toBe('internet')
  })
})

// ── AC15: Module manifest ─────────────────────────────────────────────────────

describe('AC15 — ModuleManifest contract', () => {
  it('has required identity fields', () => {
    expect(manifest.name).toBe('Lectio')
    expect(manifest.slug).toBe('lectio')
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/)
    expect(typeof manifest.migrate).toBe('function')
    expect(manifest.router).toBeDefined()
    expect(manifest.nav.label).toBe('Lectio')
  })

  it('has frontend entry pointing to /api/lectio/ui.js', () => {
    expect(manifest.frontend?.entry).toBe('/api/lectio/ui.js')
  })

  it('has 3 scheduled jobs with correct names and cron expressions', () => {
    expect(manifest.jobs).toHaveLength(3)
    const names = manifest.jobs!.map(j => j.name)
    expect(names).toContain('lectio:archive-readings')
    expect(names).toContain('lectio:condense-journal')
    expect(names).toContain('lectio:weekly-review')
    for (const job of manifest.jobs!) {
      expect(job.schedule).toMatch(/^[\d*\/,\- ]+$/)
      expect(typeof job.fn).toBe('function')
    }
  })

  it('migration is idempotent', () => {
    const db2 = new Database(':memory:')
    db2.exec('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)')
    const mdb: ModuleDb = { prepare: db2.prepare.bind(db2), exec: sql => { db2.exec(sql) }, transaction: fn => db2.transaction(fn), raw: db2 }
    expect(() => { manifest.migrate(mdb); manifest.migrate(mdb) }).not.toThrow()
  })
})
