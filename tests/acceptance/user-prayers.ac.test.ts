/**
 * Acceptance tests — User Prayers feature
 *
 * AC1  — "Add Prayer" button appears in the My Prayers section (NOT TESTABLE — requires browser)
 * AC2  — Clicking it opens a form with Title and Body fields (NOT TESTABLE — requires browser)
 * AC3  — Submitting valid title + body saves and immediately appears (NOT TESTABLE — requires browser)
 * AC4  — User-created prayers are only visible to the user who created them ← API-level
 * AC5  — User-created prayer cards have a delete affordance (NOT TESTABLE — requires browser)
 * AC6  — Built-in Common Prayers section has no add/delete controls (NOT TESTABLE — requires browser)
 * AC7  — DELETE /user-prayers/:id by non-owner → 403 ← API-level
 * AC8  — POST /user-prayers with empty title → 400 ← API-level
 * AC9  — POST /user-prayers with empty body → 400 ← API-level
 * AC10 — Built-in prayers and user prayers appear in their own distinct sections ← API-level
 */

import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import express from 'express'
import request from 'supertest'
import type { ModuleContext, ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import { createUserPrayersRouter } from '../../src/routes/user-prayers.js'
import { createPrayersRouter }     from '../../src/routes/prayers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const noopLogger: ModuleContext['logger'] = {
  info:  () => {},
  warn:  () => {},
  error: () => {},
  debug: () => {},
}

function makeDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)')
  const mdb: ModuleDb = {
    prepare:     db.prepare.bind(db),
    exec:        (sql) => { db.exec(sql) },
    transaction: (fn) => db.transaction(fn),
    raw:         db,
  }
  migrate(mdb)
  db.prepare('INSERT INTO users (username) VALUES (?)').run('alice')
  db.prepare('INSERT INTO users (username) VALUES (?)').run('bob')
  return db
}

function makeCtxRef(db: Database.Database): { current: ModuleContext | null } {
  return {
    current: {
      db: {
        prepare:     db.prepare.bind(db),
        exec:        (sql) => { db.exec(sql) },
        transaction: (fn) => db.transaction(fn),
        raw:         db,
      },
      logger:    noopLogger,
      ai:        {} as any,
      events:    {} as any,
      notify:    {} as any,
      config:    {} as any,
      scheduler: {} as any,
      store:     {} as any,
      calendar:  {} as any,
      slug:      'lectio',
    },
  }
}

/**
 * Build a minimal Express app that injects req.userId and mounts both the
 * user-prayers and (built-in) prayers routers — mirroring the real mount layout.
 */
function makeApp(db: Database.Database, userId: number) {
  const ctxRef = makeCtxRef(db)
  const app = express()
  app.use(express.json())
  app.use((_req, _res, next) => { (_req as any).userId = userId; next() })
  app.use('/user-prayers', createUserPrayersRouter(ctxRef))
  app.use('/prayers',      createPrayersRouter(ctxRef))
  return app
}

// ─── State ────────────────────────────────────────────────────────────────────

let db:      Database.Database
let aliceId: number
let bobId:   number

beforeEach(() => {
  db      = makeDb()
  aliceId = (db.prepare('SELECT id FROM users WHERE username = ?').get('alice') as any).id
  bobId   = (db.prepare('SELECT id FROM users WHERE username = ?').get('bob')   as any).id
})

// ─── Browser-only ACs (documented, not automated) ────────────────────────────

describe('AC1 — Add Prayer button appears in My Prayers section', () => {
  it.skip('NOT TESTABLE (requires browser): a rendered Prayer tab must be loaded and the My Prayers section must contain an "Add Prayer" button visible to the user', () => {})
})

describe('AC2 — Clicking Add Prayer opens a form with Title and Body fields', () => {
  it.skip('NOT TESTABLE (requires browser): clicking the Add Prayer button must open/reveal a form containing labelled Title and Body inputs', () => {})
})

describe('AC3 — Submitting valid title + body saves prayer and it immediately appears', () => {
  it.skip('NOT TESTABLE (requires browser): after form submission with a valid title and body, the new prayer card must appear in the My Prayers list without a page reload', () => {})
})

describe('AC5 — User-created prayer cards have a delete affordance', () => {
  it.skip('NOT TESTABLE (requires browser): each user-created prayer card must render a visible delete button or affordance; built-in cards must not', () => {})
})

describe('AC6 — Built-in Common Prayers section has no add/delete controls', () => {
  it.skip('NOT TESTABLE (requires browser): the Common Prayers section must render no Add or Delete buttons; confirming the built-in section is read-only to the user', () => {})
})

// ─── AC4 — Isolation: each user sees only their own prayers ──────────────────

describe('AC4 — User-created prayers are only visible to their creator', () => {
  it('GET /user-prayers returns only the authenticated user\'s own prayers', async () => {
    // Seed one prayer for alice, one for bob
    db.prepare('INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)').run(aliceId, 'Alice Prayer', 'Alice body')
    db.prepare('INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)').run(bobId,   'Bob Prayer',   'Bob body')

    // Alice should only see her own prayer
    const aliceApp = makeApp(db, aliceId)
    const aliceRes = await request(aliceApp).get('/user-prayers')
    expect(aliceRes.status).toBe(200)
    expect(aliceRes.body).toHaveLength(1)
    expect(aliceRes.body[0].title).toBe('Alice Prayer')

    // Bob should only see his own prayer
    const bobApp = makeApp(db, bobId)
    const bobRes = await request(bobApp).get('/user-prayers')
    expect(bobRes.status).toBe(200)
    expect(bobRes.body).toHaveLength(1)
    expect(bobRes.body[0].title).toBe('Bob Prayer')
  })

  it('GET /user-prayers returns [] for a new user with no prayers', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).get('/user-prayers')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

// ─── AC7 — Authorization: non-owner DELETE is forbidden ──────────────────────

describe('AC7 — DELETE /user-prayers/:id by non-owner → 403', () => {
  it('returns 403 when a different user attempts to delete another user\'s prayer', async () => {
    const row = db.prepare(
      'INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)'
    ).run(aliceId, 'Alice Prayer', 'Alice body')
    const id = row.lastInsertRowid

    // Bob tries to delete Alice's prayer — must be forbidden
    const bobApp = makeApp(db, bobId)
    const res = await request(bobApp).delete(`/user-prayers/${id}`)
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Forbidden' })
  })

  it('the prayer still exists in the DB after a 403 rejection', async () => {
    const row = db.prepare(
      'INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)'
    ).run(aliceId, 'Alice Prayer', 'Alice body')
    const id = row.lastInsertRowid

    const bobApp = makeApp(db, bobId)
    await request(bobApp).delete(`/user-prayers/${id}`)

    const remaining = db.prepare('SELECT id FROM lectio_user_prayers WHERE id = ?').get(id)
    expect(remaining).toBeDefined()
  })

  it('returns 404 for a non-existent prayer id', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).delete('/user-prayers/99999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })

  it('owner can delete their own prayer → 204', async () => {
    const row = db.prepare(
      'INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)'
    ).run(aliceId, 'Alice Prayer', 'Alice body')
    const id = row.lastInsertRowid

    const aliceApp = makeApp(db, aliceId)
    const res = await request(aliceApp).delete(`/user-prayers/${id}`)
    expect(res.status).toBe(204)
  })
})

// ─── AC8 — Validation: empty title rejected ───────────────────────────────────

describe('AC8 — POST /user-prayers with empty title → 400', () => {
  it('rejects an empty string title with 400 and an informative error', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: '', body: 'Some body text' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'title is required' })
  })

  it('rejects a whitespace-only title with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: '   ', body: 'Some body text' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'title is required' })
  })

  it('rejects a missing title field with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ body: 'Some body text' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'title is required' })
  })
})

// ─── AC9 — Validation: empty body rejected ────────────────────────────────────

describe('AC9 — POST /user-prayers with empty body → 400', () => {
  it('rejects an empty string body with 400 and an informative error', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: 'My Prayer', body: '' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'body is required' })
  })

  it('rejects a whitespace-only body with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: 'My Prayer', body: '   ' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'body is required' })
  })

  it('rejects a missing body field with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: 'My Prayer' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'body is required' })
  })

  it('accepts a valid title + body and returns 201', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/user-prayers').send({ title: 'Morning', body: 'Lord, guide me.' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.title).toBe('Morning')
    expect(res.body.body).toBe('Lord, guide me.')
  })
})

// ─── AC10 — Sections: built-ins and user prayers are distinct endpoints ───────

describe('AC10 — Built-in prayers and user prayers appear in distinct sections', () => {
  it('GET /prayers returns the seeded built-in prayers (Common Prayers)', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).get('/prayers')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    // Spot-check a known built-in
    const ourFather = res.body.find((p: any) => p.id === 'our-father')
    expect(ourFather).toBeDefined()
    expect(ourFather.title).toBe('Our Father')
  })

  it('GET /user-prayers returns a separate list that does not include built-in prayers', async () => {
    const app = makeApp(db, aliceId)
    // Seed a user prayer
    db.prepare('INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)').run(aliceId, 'Personal Litany', 'My personal prayer')

    const userRes    = await request(app).get('/user-prayers')
    const builtinRes = await request(app).get('/prayers')

    expect(userRes.status).toBe(200)
    expect(builtinRes.status).toBe(200)

    // User prayers list must not contain built-ins
    const userIds    = userRes.body.map((p: any) => p.id)
    const builtinIds = builtinRes.body.map((p: any) => p.id)
    const overlap    = userIds.filter((id: any) => builtinIds.includes(id))
    expect(overlap).toHaveLength(0)
  })

  it('built-in prayers have string IDs; user prayers have numeric IDs', async () => {
    db.prepare('INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)').run(aliceId, 'My Prayer', 'Body text')
    const app = makeApp(db, aliceId)

    const builtinRes = await request(app).get('/prayers')
    const userRes    = await request(app).get('/user-prayers')

    for (const p of builtinRes.body) {
      expect(typeof p.id).toBe('string')
    }
    for (const p of userRes.body) {
      expect(typeof p.id).toBe('number')
    }
  })

  it('user prayers in /user-prayers do not leak into /prayers', async () => {
    db.prepare('INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)').run(aliceId, 'Unique User Prayer XYZ', 'body')
    const app = makeApp(db, aliceId)

    const builtinRes = await request(app).get('/prayers')
    const titles     = builtinRes.body.map((p: any) => p.title)
    expect(titles).not.toContain('Unique User Prayer XYZ')
  })
})
