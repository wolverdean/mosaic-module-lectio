import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import type { ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import * as svc from '../../src/services/contemplative.service.js'

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
  db.prepare('INSERT INTO users (username) VALUES (?)').run('carol')
  return db
}

let db: Database.Database
let userId: number

beforeEach(() => {
  db = makeDb()
  userId = (db.prepare('SELECT id FROM users WHERE username = ?').get('carol') as any).id
})

describe('getReflection', () => {
  it('returns empty reflection for date with no record', () => {
    const r = svc.getReflection(db, userId, '2026-06-11') as any
    expect(r).toEqual({ date: '2026-06-11', reflection: '' })
  })

  it('returns saved reflection', () => {
    svc.saveReflection(db, userId, '2026-06-11', 'p1', 'cassian', 'My reflection')
    const r = svc.getReflection(db, userId, '2026-06-11') as any
    expect(r.reflection).toBe('My reflection')
  })
})

describe('saveReflection', () => {
  it('upserts on second call', () => {
    svc.saveReflection(db, userId, '2026-06-11', 'p1', 'cloud', 'First')
    svc.saveReflection(db, userId, '2026-06-11', 'p1', 'cloud', 'Second')
    const r = svc.getReflection(db, userId, '2026-06-11') as any
    expect(r.reflection).toBe('Second')
  })
})

describe('getReflectionRange', () => {
  it('returns only non-empty reflections in range', () => {
    svc.saveReflection(db, userId, '2026-06-10', 'p1', 'merton', 'Note on Monday')
    svc.saveReflection(db, userId, '2026-06-11', 'p2', 'merton', '')
    svc.saveReflection(db, userId, '2026-06-12', 'p3', 'keating', 'Note on Wednesday')
    const rows = svc.getReflectionRange(db, userId, '2026-06-09', '2026-06-13') as any[]
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.date)).toContain('2026-06-10')
    expect(rows.map(r => r.date)).not.toContain('2026-06-11')
  })

  it('returns rows ordered by date descending', () => {
    svc.saveReflection(db, userId, '2026-06-10', 'p1', 'merton', 'A')
    svc.saveReflection(db, userId, '2026-06-12', 'p3', 'merton', 'B')
    const rows = svc.getReflectionRange(db, userId, '2026-06-09', '2026-06-13') as any[]
    expect(rows[0].date).toBe('2026-06-12')
    expect(rows[1].date).toBe('2026-06-10')
  })
})
