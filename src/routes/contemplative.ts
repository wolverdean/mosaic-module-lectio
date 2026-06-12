import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'
import { getTodayPassage, getPassagesBySource, SOURCE_META, VALID_SOURCES } from '../lib/contemplative.js'
import * as svc from '../services/contemplative.service.js'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

function track(op: string, fn: () => unknown) {
  const start = Date.now()
  return tracer.startActiveSpan(`lectio.contemplative.${op}`, span => {
    try {
      const result = fn()
      counter.add(1, { group: 'contemplative', op })
      hist.record(Date.now() - start, { group: 'contemplative', op })
      span.end()
      return result
    } catch (e) { span.end(); throw e }
  })
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function createContemplativeRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db = () => ctxRef.current!.db.raw

  router.get('/today', (req, res) => {
    try {
      const passage = getTodayPassage()
      const today   = new Date().toISOString().slice(0, 10)
      const row     = track('today', () => svc.getReflection(db(), (req as any).userId, today)) as any
      res.json({ passage, reflection: row?.reflection || '', date: today })
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'contemplative today failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/browse', (req, res) => {
    const { source } = req.query as { source?: string }
    if (source && !(VALID_SOURCES as readonly string[]).includes(source)) {
      return res.status(400).json({ error: 'Unknown source' })
    }
    try {
      const all = getPassagesBySource()
      const sources: Record<string, unknown> = {}
      for (const src of (source ? [source] : VALID_SOURCES)) {
        sources[src] = all[src as keyof typeof all]
      }
      res.json({ sources, meta: SOURCE_META })
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'contemplative browse failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/reflection/:date', (req, res) => {
    const { date } = req.params
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
    try {
      res.json(track('get-reflection', () => svc.getReflection(db(), (req as any).userId, date)))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'contemplative get-reflection failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/reflections', (req, res) => {
    const { start, end } = req.query as { start?: string; end?: string }
    if (!start || !end) return res.status(400).json({ error: 'start and end required' })
    try {
      res.json(track('list-reflections', () => svc.getReflectionRange(db(), (req as any).userId, start, end)))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'contemplative list-reflections failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.put('/reflection/:date', (req, res) => {
    const { date } = req.params
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' })
    const { reflection = '', passage_id = '', source = '' } = req.body
    try {
      track('save-reflection', () => svc.saveReflection(db(), (req as any).userId, date, passage_id, source, reflection))
      res.json({ ok: true })
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'contemplative save-reflection failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  return router
}
