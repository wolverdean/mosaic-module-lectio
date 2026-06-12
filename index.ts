import { trace, metrics } from '@opentelemetry/api'
import type { ModuleManifest, ModuleContext } from '@mosaic/sdk'
import { migrate }        from './src/migrate.js'
import { createRouter }   from './src/routes/index.js'
import { archiveDailyReadings } from './src/lib/readings.js'
import { extractJournalText }   from './src/services/journal.service.js'
import { saveWeeklyReview }     from './src/services/readings.service.js'

const tracer  = trace.getTracer('lectio')
const jobRuns = metrics.getMeter('lectio').createCounter('lectio_job_runs_total')
const jobDur  = metrics.getMeter('lectio').createHistogram('lectio_job_duration_ms')

function pad(n: number) { return String(n).padStart(2, '0') }
function dateOffset(days: number): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function condenseJournalEntries(ctx: ModuleContext): Promise<void> {
  const yesterday = dateOffset(-1)
  const db        = ctx.db.raw
  const users     = db.prepare('SELECT id FROM users').all() as { id: number }[]

  for (const { id: userId } of users) {
    const row = db.prepare('SELECT content FROM lectio_journal_entries WHERE user_id = ? AND date = ?').get(userId, yesterday) as any
    const rawText = extractJournalText(row?.content)
    if (!rawText) continue

    try {
      const response = await ctx.ai.client.messages.create({
        model: ctx.ai.models.efficient,
        max_tokens: 768,
        system: 'You are helping write a personal journal. Take the following prayer notes, reflections, and inputs from a single day and condense them into a cohesive, flowing journal entry written in first person (2–5 paragraphs). Preserve the spiritual and personal character of the content. Do not use headers, bullets, or labels — write only prose.',
        messages: [{ role: 'user', content: rawText }],
      })
      const condensed = (response.content.find(b => b.type === 'text') as any)?.text || ''
      if (!condensed) continue

      db.prepare(`
        INSERT INTO lectio_journal_entries (user_id, date, content, original_content, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, date) DO UPDATE SET
          content          = excluded.content,
          original_content = COALESCE(original_content, excluded.original_content),
          updated_at       = excluded.updated_at
      `).run(userId, yesterday, condensed, row.content)

      ctx.logger.info({ userId, date: yesterday }, '[lectio:condense] condensed')
    } catch (e: any) {
      ctx.logger.error({ err: e, userId }, '[lectio:condense] failed')
    }
  }
}

async function weeklyJournalReview(ctx: ModuleContext): Promise<void> {
  const endDate   = dateOffset(-1)
  const startDate = dateOffset(-7)
  const db        = ctx.db.raw
  const users     = db.prepare('SELECT id FROM users').all() as { id: number }[]

  for (const { id: userId } of users) {
    const rows = db.prepare(
      'SELECT date, content FROM lectio_journal_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC'
    ).all(userId, startDate, endDate) as any[]

    if (rows.length === 0) continue

    const weekText = rows.map(r => {
      const text = extractJournalText(r.content)
      return text ? `[${r.date}]\n${text}` : null
    }).filter(Boolean).join('\n\n---\n\n')

    if (!weekText.trim()) continue

    try {
      const response = await ctx.ai.client.messages.create({
        model: ctx.ai.models.efficient,
        max_tokens: 512,
        system: `You are an objective outside observer reading someone's private journal entries from the past week.
Identify the recurring themes, patterns, and dominant topics that appeared across the week.
Write a short, factual summary (3–5 sentences) from a neutral third-person perspective.
Do not interpret, judge, advise, or frame anything in religious terms.
Just describe what was on the person's mind — what came up repeatedly, what seemed to matter, what shifted.`,
        messages: [{ role: 'user', content: weekText }],
      })
      const review = (response.content.find(b => b.type === 'text') as any)?.text || ''
      if (!review) continue

      saveWeeklyReview(db, userId, startDate, endDate, review)
      ctx.logger.info({ userId, startDate, endDate }, '[lectio:weekly-review] saved')
    } catch (e: any) {
      ctx.logger.error({ err: e, userId }, '[lectio:weekly-review] failed')
    }
  }
}

const ctxRef: { current: ModuleContext | null } = { current: null }

const manifest: ModuleManifest = {
  name:    'Lectio',
  slug:    'lectio',
  version: '1.0.0',
  sdk:     '>=1.0.0',

  migrate,
  router: createRouter(ctxRef),

  async onInit(ctx) {
    ctxRef.current = ctx
    ctx.logger.info('Lectio module initialised')
  },

  nav: {
    label: 'Lectio',
    icon:  'book-open',
    order: 20,
    async badge(ctx, userId) {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const row = ctx.db.raw.prepare('SELECT id FROM lectio_journal_entries WHERE user_id = ? AND date = ?').get(userId, today)
        return row ? 0 : 1
      } catch { return 0 }
    },
  },

  frontend: { entry: '/api/lectio/ui.js' },

  jobs: [
    {
      name:     'lectio:archive-readings',
      schedule: '5 0 * * *',
      async fn(ctx) {
        const start = Date.now()
        const span  = tracer.startSpan('lectio.job.archive-readings')
        try {
          await archiveDailyReadings(ctx.db.raw)
          jobRuns.add(1, { job: 'lectio:archive-readings' })
          jobDur.record(Date.now() - start, { job: 'lectio:archive-readings' })
        } finally { span.end() }
      },
    },
    {
      name:     'lectio:condense-journal',
      schedule: '0 3 * * *',
      async fn(ctx) {
        const start = Date.now()
        const span  = tracer.startSpan('lectio.job.condense-journal')
        try {
          await condenseJournalEntries(ctx)
          jobRuns.add(1, { job: 'lectio:condense-journal' })
          jobDur.record(Date.now() - start, { job: 'lectio:condense-journal' })
        } finally { span.end() }
      },
    },
    {
      name:     'lectio:weekly-review',
      schedule: '5 3 * * 5',
      async fn(ctx) {
        const start = Date.now()
        const span  = tracer.startSpan('lectio.job.weekly-review')
        try {
          await weeklyJournalReview(ctx)
          jobRuns.add(1, { job: 'lectio:weekly-review' })
          jobDur.record(Date.now() - start, { job: 'lectio:weekly-review' })
        } finally { span.end() }
      },
    },
  ],

  async health(ctx) {
    ctx.db.raw.prepare('SELECT 1 FROM lectio_journal_entries LIMIT 1').get()
  },
  healthInterval: 60,
}

export default manifest
