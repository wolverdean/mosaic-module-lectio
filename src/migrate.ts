import type { ModuleDb } from '@mosaic/sdk'

export function migrate(db: ModuleDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_journal_entries (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date             TEXT NOT NULL,
      content          TEXT NOT NULL DEFAULT '',
      original_content TEXT,
      updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_reading_cache (
      key        TEXT PRIMARY KEY,
      content    TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_contemplative_reflections (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,
      passage_id  TEXT NOT NULL DEFAULT '',
      source      TEXT NOT NULL DEFAULT '',
      reflection  TEXT NOT NULL DEFAULT '',
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_weekly_reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_start TEXT NOT NULL,
      week_end   TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, week_end)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_user_settings (
      user_id               INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      readings_source       TEXT NOT NULL DEFAULT 'local',
      retreat_start         TEXT,
      retreat_paused        INTEGER NOT NULL DEFAULT 0,
      retreat_paused_days   INTEGER,
      retreat18_start       TEXT,
      retreat18_paused      INTEGER NOT NULL DEFAULT 0,
      retreat18_paused_days INTEGER
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS lectio_intercessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      intention  TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE INDEX IF NOT EXISTS lectio_intercessions_user
      ON lectio_intercessions(user_id, active, sort_order)
  `)
}
