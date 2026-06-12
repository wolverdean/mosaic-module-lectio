import type Database from 'better-sqlite3'

export function listIntercessions(db: Database.Database, userId: number, includeInactive = false) {
  if (includeInactive) {
    return db.prepare(
      'SELECT id, name, intention, active, sort_order, created_at FROM lectio_intercessions WHERE user_id = ? ORDER BY sort_order ASC, id ASC'
    ).all(userId)
  }
  return db.prepare(
    'SELECT id, name, intention, active, sort_order, created_at FROM lectio_intercessions WHERE user_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC'
  ).all(userId)
}

export function createIntercession(db: Database.Database, userId: number, name: string, intention?: string) {
  const maxOrder = (db.prepare('SELECT MAX(sort_order) AS m FROM lectio_intercessions WHERE user_id = ?').get(userId) as any)?.m ?? -1
  const result = db.prepare(
    'INSERT INTO lectio_intercessions (user_id, name, intention, sort_order) VALUES (?, ?, ?, ?)'
  ).run(userId, name, intention ?? null, maxOrder + 1)
  return db.prepare('SELECT id, name, intention, active, sort_order, created_at FROM lectio_intercessions WHERE id = ?').get(result.lastInsertRowid)
}

export function updateIntercession(db: Database.Database, userId: number, id: number, fields: { name?: string; intention?: string; active?: number; sort_order?: number }) {
  const row = db.prepare('SELECT id FROM lectio_intercessions WHERE id = ? AND user_id = ?').get(id, userId)
  if (!row) return null

  const updates: string[] = []
  const params: unknown[] = []
  if (fields.name       !== undefined) { updates.push('name = ?');       params.push(fields.name) }
  if (fields.intention  !== undefined) { updates.push('intention = ?');  params.push(fields.intention) }
  if (fields.active     !== undefined) { updates.push('active = ?');     params.push(fields.active) }
  if (fields.sort_order !== undefined) { updates.push('sort_order = ?'); params.push(fields.sort_order) }
  if (updates.length === 0) return db.prepare('SELECT id, name, intention, active, sort_order, created_at FROM lectio_intercessions WHERE id = ?').get(id)

  params.push(id, userId)
  db.prepare(`UPDATE lectio_intercessions SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params)
  return db.prepare('SELECT id, name, intention, active, sort_order, created_at FROM lectio_intercessions WHERE id = ?').get(id)
}

export function deleteIntercession(db: Database.Database, userId: number, id: number): boolean {
  const result = db.prepare('DELETE FROM lectio_intercessions WHERE id = ? AND user_id = ?').run(id, userId)
  return result.changes > 0
}
