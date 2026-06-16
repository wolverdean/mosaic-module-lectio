import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import express from 'express'
import request from 'supertest'
import type { ModuleContext, ModuleDb } from '@mosaic/sdk'
import { migrate } from '../../src/migrate.js'
import { createUserPrayersRouter } from '../../src/routes/user-prayers.js'

// ─── Test helpers ─────────────────────────────────────────────────────────────

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

const noopLogger: ModuleContext['logger'] = {
  info:  () => {},
  warn:  () => {},
  error: () => {},
  debug: () => {},
}

function makeApp(db: Database.Database, userId: number) {
  const ctxRef: { current: ModuleContext | null } = {
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

  const app = express()
  app.use(express.json())
  // Inject userId so the router sees req.userId
  app.use((req, _res, next) => { (req as any).userId = userId; next() })
  app.use('/', createUserPrayersRouter(ctxRef))
  return app
}

// ─── Tests ────────────────────────────────────────────────────────────────────

let db: Database.Database
let aliceId: number
let bobId: number

beforeEach(() => {
  db = makeDb()
  aliceId = (db.prepare('SELECT id FROM users WHERE username = ?').get('alice') as any).id
  bobId   = (db.prepare('SELECT id FROM users WHERE username = ?').get('bob')   as any).id
})

// 1. GET returns [] for user with no prayers
describe('GET /user-prayers', () => {
  it('returns [] for user with no prayers', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  // 2. GET returns only the requesting user's prayers
  it('returns only the requesting user\'s prayers', async () => {
    db.prepare(`INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)`).run(aliceId, 'Alice Prayer', 'Alice body')
    db.prepare(`INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)`).run(bobId, 'Bob Prayer', 'Bob body')

    const aliceApp = makeApp(db, aliceId)
    const res = await request(aliceApp).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Alice Prayer')
  })
})

// 3. POST creates a prayer → 201
describe('POST /user-prayers', () => {
  it('creates a prayer with valid title and body → 201', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/').send({ title: 'Morning', body: 'Lord, guide me.' })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.title).toBe('Morning')
    expect(res.body.body).toBe('Lord, guide me.')
    expect(res.body.created_at).toBeDefined()
  })

  // 4. POST with empty title → 400
  it('rejects empty title with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/').send({ title: '', body: 'Some body' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'title is required' })
  })

  // 5. POST with whitespace-only title → 400
  it('rejects whitespace-only title with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/').send({ title: '   ', body: 'Some body' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'title is required' })
  })

  // 6. POST with empty body → 400
  it('rejects empty body with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/').send({ title: 'A title', body: '' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'body is required' })
  })

  // 7. POST with whitespace-only body → 400
  it('rejects whitespace-only body with 400', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).post('/').send({ title: 'A title', body: '   ' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'body is required' })
  })
})

// 8. DELETE by owner → 204
describe('DELETE /user-prayers/:id', () => {
  it('deletes own prayer → 204', async () => {
    const row = db.prepare(
      `INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)`
    ).run(aliceId, 'To Delete', 'body')
    const id = row.lastInsertRowid

    const app = makeApp(db, aliceId)
    const res = await request(app).delete(`/${id}`)
    expect(res.status).toBe(204)

    const remaining = db.prepare('SELECT * FROM lectio_user_prayers WHERE id = ?').get(id)
    expect(remaining).toBeUndefined()
  })

  // 9. DELETE by non-owner → 403
  it('returns 403 when deleting another user\'s prayer', async () => {
    const row = db.prepare(
      `INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)`
    ).run(aliceId, 'Alice Prayer', 'Alice body')
    const id = row.lastInsertRowid

    // Bob tries to delete Alice's prayer
    const bobApp = makeApp(db, bobId)
    const res = await request(bobApp).delete(`/${id}`)
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Forbidden' })
  })

  // 10. DELETE unknown id → 404
  it('returns 404 for unknown id', async () => {
    const app = makeApp(db, aliceId)
    const res = await request(app).delete('/99999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })
})
