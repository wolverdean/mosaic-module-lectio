import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import type { ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import * as svc from '../../src/services/readings.service.js'

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
  db.prepare('INSERT INTO users (username) VALUES (?)').run('dave')
  return db
}

let db: Database.Database
let userId: number

beforeEach(() => {
  db = makeDb()
  userId = (db.prepare('SELECT id FROM users WHERE username = ?').get('dave') as any).id
})

describe('getSettings / updateSettings', () => {
  it('returns default settings when none saved', () => {
    const s = svc.getSettings(db, userId) as any
    expect(s.readings_source).toBe('local')
  })

  it('updates readings_source', () => {
    svc.updateSettings(db, userId, { readings_source: 'internet' })
    const s = svc.getSettings(db, userId) as any
    expect(s.readings_source).toBe('internet')
  })

  it('round-trips multiple updates', () => {
    svc.updateSettings(db, userId, { readings_source: 'internet' })
    svc.updateSettings(db, userId, { readings_source: 'local' })
    expect((svc.getSettings(db, userId) as any).readings_source).toBe('local')
  })
})

describe('getWeeklyReview / saveWeeklyReview', () => {
  it('returns null when no review exists', () => {
    expect(svc.getWeeklyReview(db, userId)).toBeNull()
  })

  it('saves and retrieves a weekly review', () => {
    svc.saveWeeklyReview(db, userId, '2026-06-05', '2026-06-11', 'A reflective week')
    const r = svc.getWeeklyReview(db, userId) as any
    expect(r.content).toBe('A reflective week')
    expect(r.week_start).toBe('2026-06-05')
    expect(r.week_end).toBe('2026-06-11')
  })

  it('overwrites on conflict (same week_end)', () => {
    svc.saveWeeklyReview(db, userId, '2026-06-05', '2026-06-11', 'First')
    svc.saveWeeklyReview(db, userId, '2026-06-05', '2026-06-11', 'Second')
    expect((svc.getWeeklyReview(db, userId) as any).content).toBe('Second')
  })
})

describe('getWeeklyReviews', () => {
  it('returns reviews for a given year+month', () => {
    svc.saveWeeklyReview(db, userId, '2026-06-01', '2026-06-07', 'Week 1')
    svc.saveWeeklyReview(db, userId, '2026-07-01', '2026-07-07', 'July week')
    const rows = svc.getWeeklyReviews(db, userId, 2026, 6) as any[]
    expect(rows).toHaveLength(1)
    expect(rows[0].content).toBe('Week 1')
  })
})
