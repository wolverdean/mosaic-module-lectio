import type Database from 'better-sqlite3'

export function getSettings(db: Database.Database, userId: number) {
  const row = db.prepare('SELECT readings_source FROM lectio_user_settings WHERE user_id = ?').get(userId) as any
  return row ?? { readings_source: 'local' }
}

export function updateSettings(db: Database.Database, userId: number, fields: { readings_source?: string }) {
  db.prepare(`
    INSERT INTO lectio_user_settings (user_id, readings_source)
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET readings_source = excluded.readings_source
  `).run(userId, fields.readings_source ?? 'local')
  return getSettings(db, userId)
}

export function getAllSettings(db: Database.Database, userId: number) {
  const row = db.prepare('SELECT * FROM lectio_user_settings WHERE user_id = ?').get(userId) as any
  return row ?? {
    user_id: userId,
    readings_source: 'local',
    retreat_start: null, retreat_paused: 0, retreat_paused_days: null,
    retreat18_start: null, retreat18_paused: 0, retreat18_paused_days: null,
  }
}

export function upsertAllSettings(db: Database.Database, userId: number, fields: Record<string, unknown>) {
  const cols = Object.keys(fields)
  if (cols.length === 0) return getAllSettings(db, userId)
  const updates = cols.map(c => `${c} = excluded.${c}`).join(', ')
  const placeholders = cols.map(() => '?').join(', ')
  db.prepare(`
    INSERT INTO lectio_user_settings (user_id, ${cols.join(', ')})
    VALUES (?, ${placeholders})
    ON CONFLICT(user_id) DO UPDATE SET ${updates}
  `).run(userId, ...Object.values(fields))
  return getAllSettings(db, userId)
}

export function getWeeklyReview(db: Database.Database, userId: number) {
  return db.prepare(
    'SELECT week_start, week_end, content, created_at FROM lectio_weekly_reviews WHERE user_id = ? ORDER BY week_end DESC LIMIT 1'
  ).get(userId) ?? null
}

export function saveWeeklyReview(db: Database.Database, userId: number, weekStart: string, weekEnd: string, content: string) {
  db.prepare(`
    INSERT INTO lectio_weekly_reviews (user_id, week_start, week_end, content)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, week_end) DO UPDATE SET content = excluded.content
  `).run(userId, weekStart, weekEnd, content)
}

export function getWeeklyReviews(db: Database.Database, userId: number, year: number, month: number) {
  const mm    = String(month).padStart(2, '0')
  const start = `${year}-${mm}-01`
  const end   = `${year}-${mm}-31`
  return db.prepare(
    'SELECT week_start, week_end, content FROM lectio_weekly_reviews WHERE user_id = ? AND week_end >= ? AND week_end <= ? ORDER BY week_end ASC'
  ).all(userId, start, end)
}
