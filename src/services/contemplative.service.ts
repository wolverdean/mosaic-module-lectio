import type Database from 'better-sqlite3'

export function getReflection(db: Database.Database, userId: number, date: string) {
  const row = db.prepare(
    'SELECT date, reflection FROM lectio_contemplative_reflections WHERE user_id = ? AND date = ?'
  ).get(userId, date) as any
  return row ?? { date, reflection: '' }
}

export function saveReflection(db: Database.Database, userId: number, date: string, passageId: string, source: string, reflection: string) {
  db.prepare(`
    INSERT INTO lectio_contemplative_reflections (user_id, date, passage_id, source, reflection, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, date) DO UPDATE SET
      reflection = excluded.reflection,
      updated_at = excluded.updated_at
  `).run(userId, date, passageId, source, reflection)
  return { ok: true }
}

export function getReflectionRange(db: Database.Database, userId: number, start: string, end: string) {
  return db.prepare(
    "SELECT date, passage_id, source, reflection FROM lectio_contemplative_reflections WHERE user_id = ? AND date >= ? AND date <= ? AND reflection != '' ORDER BY date DESC"
  ).all(userId, start, end)
}
