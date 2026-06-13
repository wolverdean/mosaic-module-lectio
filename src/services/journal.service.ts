import type Database from 'better-sqlite3'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const JOURNAL_FIELD_ORDER: [string, string][] = [
  ['free_write',               'Journal'],
  ['morning_reflection',       'Morning Prayer (Lauds)'],
  ['midday_reflection',        'Midday Prayer'],
  ['evening_reflection',       'Evening Prayer (Vespers)'],
  ['night_reflection',         'Night Prayer (Compline)'],
  ['prayer_notes',             'Prayer Notes'],
  ['sacredspace_reflection',   'Sacred Space'],
  ['utmost_reflection',        'My Utmost'],
  ['psalm_reflection',         'Daily Psalm'],
  ['catholic_reflection',      'Catholic'],
  ['orthodox_reflection',      'Orthodox'],
  ['contemplative_reflection', 'Contemplative'],
  ['ignatian_reflection',      'Ignatian'],
  ['examen_gratitude',         'Gratitude'],
  ['examen_light',             'Ask for Light'],
  ['examen_review',            'Review the Day'],
  ['examen_shortcomings',      'Face Your Shortcomings'],
  ['examen_forward',           'Look Forward'],
  // legacy keys kept for backwards-compat with old data
  ['general_notes',            'General Notes'],
  ['how',                      'How do you come today?'],
  ['desire',                   'Desire'],
  ['reflection',               'Reflection'],
]

const KNOWN_KEYS = new Set(JOURNAL_FIELD_ORDER.map(([k]) => k))

export function extractJournalText(content: string): string {
  if (!content?.trim()) return ''
  if (content.trimStart().startsWith('{')) {
    try {
      const fields = JSON.parse(content) as Record<string, string>
      const pairs: [string, string][] = [
        ...JOURNAL_FIELD_ORDER.filter(([k]) => fields[k]?.trim()).map(([k, label]): [string, string] => [label, fields[k].trim()]),
        ...Object.entries(fields).filter(([k, v]) => !KNOWN_KEYS.has(k) && v?.trim()).map(([k, v]): [string, string] => [k, v.trim()]),
      ]
      return pairs.map(([label, val]) => `${label}:\n${val}`).join('\n\n')
    } catch {}
  }
  return content.trim()
}

export function listEntries(db: Database.Database, userId: number) {
  return db.prepare(
    'SELECT date, content, updated_at FROM lectio_journal_entries WHERE user_id = ? ORDER BY date DESC LIMIT 180'
  ).all(userId)
}

export function getEntry(db: Database.Database, userId: number, date: string) {
  const row = db.prepare('SELECT date, content FROM lectio_journal_entries WHERE user_id = ? AND date = ?').get(userId, date) as any
  return row ?? { date, content: '' }
}

export function upsertEntry(db: Database.Database, userId: number, date: string, content: string) {
  db.prepare(`
    INSERT INTO lectio_journal_entries (user_id, date, content, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, date) DO UPDATE SET
      content          = excluded.content,
      original_content = COALESCE(original_content, excluded.original_content),
      updated_at       = excluded.updated_at
  `).run(userId, date, content)
  return { date, content }
}

export function getRange(db: Database.Database, userId: number, start: string, end: string) {
  if (!DATE_RE.test(start) || !DATE_RE.test(end)) return null
  return db.prepare(
    'SELECT date, content, original_content FROM lectio_journal_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC'
  ).all(userId, start, end)
}
