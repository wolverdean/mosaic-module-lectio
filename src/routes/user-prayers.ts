import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

export function createUserPrayersRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db = () => ctxRef.current!.db.raw
  const logger = () => ctxRef.current!.logger

  router.get('/', (req, res) => {
    const userId: number = (req as any).userId
    const start = Date.now()
    return tracer.startActiveSpan('lectio.user_prayers.list', span => {
      try {
        const rows = db().prepare(
          `SELECT id, title, body, sort_order, created_at
           FROM lectio_user_prayers
           WHERE user_id = ?
           ORDER BY sort_order ASC, id ASC`
        ).all(userId)
        counter.add(1, { group: 'user_prayers', op: 'list' })
        hist.record(Date.now() - start, { group: 'user_prayers', op: 'list' })
        span.end()
        res.json(rows)
      } catch (e: any) {
        span.end()
        logger().error({ err: e }, 'user prayers list failed')
        res.status(500).json({ error: 'Internal error' })
      }
    })
  })

  router.post('/', (req, res) => {
    const userId: number = (req as any).userId
    const start = Date.now()
    const { title, body } = req.body ?? {}

    if (!title || !String(title).trim()) {
      logger().warn({ userId, field: 'title' }, 'user prayer validation failed')
      return res.status(400).json({ error: 'title is required' })
    }
    if (!body || !String(body).trim()) {
      logger().warn({ userId, field: 'body' }, 'user prayer validation failed')
      return res.status(400).json({ error: 'body is required' })
    }

    return tracer.startActiveSpan('lectio.user_prayers.create', span => {
      try {
        const raw = db()
        const result = raw.prepare(
          `INSERT INTO lectio_user_prayers (user_id, title, body) VALUES (?, ?, ?)`
        ).run(userId, String(title).trim(), String(body).trim())
        const row = raw.prepare(
          `SELECT id, title, body, sort_order, created_at FROM lectio_user_prayers WHERE id = ?`
        ).get(result.lastInsertRowid)
        counter.add(1, { group: 'user_prayers', op: 'create' })
        hist.record(Date.now() - start, { group: 'user_prayers', op: 'create' })
        span.end()
        res.status(201).json(row)
      } catch (e: any) {
        span.end()
        logger().error({ err: e }, 'user prayers create failed')
        res.status(500).json({ error: 'Internal error' })
      }
    })
  })

  router.delete('/:id', (req, res) => {
    const userId: number = (req as any).userId
    const id = parseInt(req.params.id, 10)
    const start = Date.now()

    if (isNaN(id)) {
      return res.status(400).json({ error: 'invalid id' })
    }

    return tracer.startActiveSpan('lectio.user_prayers.delete', span => {
      try {
        const raw = db()
        const row = raw.prepare(
          `SELECT id, user_id FROM lectio_user_prayers WHERE id = ?`
        ).get(id) as { id: number; user_id: number } | undefined

        if (!row) {
          span.end()
          return res.status(404).json({ error: 'Not found' })
        }

        if (row.user_id !== userId) {
          span.end()
          logger().warn({ userId, prayerId: id }, 'user prayer ownership violation')
          return res.status(403).json({ error: 'Forbidden' })
        }

        raw.prepare(
          `DELETE FROM lectio_user_prayers WHERE id = ? AND user_id = ?`
        ).run(id, userId)

        counter.add(1, { group: 'user_prayers', op: 'delete' })
        hist.record(Date.now() - start, { group: 'user_prayers', op: 'delete' })
        span.end()
        res.status(204).send()
      } catch (e: any) {
        span.end()
        logger().error({ err: e }, 'user prayers delete failed')
        res.status(500).json({ error: 'Internal error' })
      }
    })
  })

  return router
}
