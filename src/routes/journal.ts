import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'
import * as svc from '../services/journal.service.js'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

function track(op: string, fn: () => unknown) {
  const start = Date.now()
  return tracer.startActiveSpan(`lectio.journal.${op}`, span => {
    try {
      const result = fn()
      counter.add(1, { group: 'journal', op })
      hist.record(Date.now() - start, { group: 'journal', op })
      span.end()
      return result
    } catch (e) {
      span.end()
      throw e
    }
  })
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function createJournalRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db = () => ctxRef.current!.db.raw

  router.get('/', (req, res) => {
    try {
      const rows = track('list', () => svc.listEntries(db(), (req as any).userId))
      res.json(rows)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'journal list failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/range', (req, res) => {
    const { start, end } = req.query as { start?: string; end?: string }
    if (!start || !end || !DATE_RE.test(start) || !DATE_RE.test(end)) {
      return res.status(400).json({ error: 'start and end must be YYYY-MM-DD' })
    }
    try {
      const rows = track('range', () => svc.getRange(db(), (req as any).userId, start, end))
      res.json(rows)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'journal range failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/:date', (req, res) => {
    const { date } = req.params
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
    try {
      const entry = track('get', () => svc.getEntry(db(), (req as any).userId, date))
      res.json(entry)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'journal get failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.put('/:date', (req, res) => {
    const { date } = req.params
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
    const { content = '' } = req.body
    try {
      const result = track('upsert', () => svc.upsertEntry(db(), (req as any).userId, date, content))
      res.json(result)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'journal upsert failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  return router
}
