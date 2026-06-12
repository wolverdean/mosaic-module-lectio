import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import type { ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import * as svc from '../../src/services/intercessions.service.js'

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
  db.prepare('INSERT INTO users (username) VALUES (?)').run('bob')
  return db
}

let db: Database.Database
let userId: number

beforeEach(() => {
  db = makeDb()
  userId = (db.prepare('SELECT id FROM users WHERE username = ?').get('bob') as any).id
})

describe('listIntercessions', () => {
  it('returns empty list initially', () => {
    expect(svc.listIntercessions(db, userId)).toHaveLength(0)
  })

  it('returns only active intercessions by default', () => {
    const a = svc.createIntercession(db, userId, 'Active Person') as any
    const b = svc.createIntercession(db, userId, 'Inactive Person') as any
    svc.updateIntercession(db, userId, b.id, { active: 0 })
    const list = svc.listIntercessions(db, userId) as any[]
    expect(list.map(i => i.name)).toContain('Active Person')
    expect(list.map(i => i.name)).not.toContain('Inactive Person')
  })

  it('returns all when includeInactive = true', () => {
    const a = svc.createIntercession(db, userId, 'A') as any
    svc.updateIntercession(db, userId, a.id, { active: 0 })
    const list = svc.listIntercessions(db, userId, true) as any[]
    expect(list).toHaveLength(1)
  })
})

describe('createIntercession', () => {
  it('creates with name only', () => {
    const i = svc.createIntercession(db, userId, 'Mary') as any
    expect(i.name).toBe('Mary')
    expect(i.intention).toBeNull()
    expect(i.active).toBe(1)
  })

  it('creates with name and intention', () => {
    const i = svc.createIntercession(db, userId, 'John', 'Recovery from illness') as any
    expect(i.intention).toBe('Recovery from illness')
  })
})

describe('updateIntercession', () => {
  it('updates name', () => {
    const i = svc.createIntercession(db, userId, 'Old Name') as any
    const updated = svc.updateIntercession(db, userId, i.id, { name: 'New Name' }) as any
    expect(updated.name).toBe('New Name')
  })

  it('updates intention', () => {
    const i = svc.createIntercession(db, userId, 'Person') as any
    const updated = svc.updateIntercession(db, userId, i.id, { intention: 'Healing' }) as any
    expect(updated.intention).toBe('Healing')
  })

  it('toggles active flag', () => {
    const i = svc.createIntercession(db, userId, 'Person') as any
    const updated = svc.updateIntercession(db, userId, i.id, { active: 0 }) as any
    expect(updated.active).toBe(0)
  })

  it('returns null for unknown id', () => {
    expect(svc.updateIntercession(db, userId, 9999, { name: 'X' })).toBeNull()
  })
})

describe('deleteIntercession', () => {
  it('deletes and returns true', () => {
    const i = svc.createIntercession(db, userId, 'Delete Me') as any
    expect(svc.deleteIntercession(db, userId, i.id)).toBe(true)
    expect(svc.listIntercessions(db, userId)).toHaveLength(0)
  })

  it('returns false for unknown id', () => {
    expect(svc.deleteIntercession(db, userId, 9999)).toBe(false)
  })
})
