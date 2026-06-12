import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'
import ignatian   from '../data/ignatian.js'
import ignatian18 from '../data/ignatian18.js'
import { calcIgnatianDay, elapsedDays, shiftedStart } from '../lib/ignatian-calc.js'
import { getAllSettings, upsertAllSettings } from '../services/readings.service.js'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

function track(op: string, fn: () => unknown) {
  const start = Date.now()
  return tracer.startActiveSpan(`lectio.ignatian.${op}`, span => {
    try {
      const result = fn()
      counter.add(1, { group: 'ignatian', op })
      hist.record(Date.now() - start, { group: 'ignatian', op })
      span.end()
      return result
    } catch (e) { span.end(); throw e }
  })
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function getIgnatianDay(s: any) {
  if (!s?.retreat_start) return { needsSetup: true }
  return { ...calcIgnatianDay(ignatian as any[], s.retreat_start, s.retreat_paused ? s.retreat_paused_days : null), isPaused: s.retreat_paused === 1 }
}

function getIgnatian18Day(s: any) {
  if (!s?.retreat18_start) return { needsSetup: true }
  return { ...calcIgnatianDay(ignatian18 as any[], s.retreat18_start, s.retreat18_paused ? s.retreat18_paused_days : null), isPaused: s.retreat18_paused === 1 }
}

export function createIgnatianRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db  = () => ctxRef.current!.db.raw
  const s   = (userId: number) => getAllSettings(db(), userId)

  // ── 19th Annotation ──────────────────────────────────────────────────────────

  router.get('/ignatian', (req, res) => {
    res.json(track('19-get', () => getIgnatianDay(s((req as any).userId))))
  })

  router.put('/ignatian/start', (req, res) => {
    const { start_date } = req.body
    if (!start_date || !DATE_RE.test(start_date)) return res.status(400).json({ error: 'start_date must be YYYY-MM-DD' })
    upsertAllSettings(db(), (req as any).userId, { retreat_start: start_date, retreat_paused: 0, retreat_paused_days: null })
    res.json(track('19-start', () => getIgnatianDay(s((req as any).userId))))
  })

  router.post('/ignatian/pause', (req, res) => {
    const settings = s((req as any).userId)
    if (!settings.retreat_start) return res.status(400).json({ error: 'Retreat not started' })
    if (!settings.retreat_paused) {
      upsertAllSettings(db(), (req as any).userId, { retreat_paused: 1, retreat_paused_days: elapsedDays(settings.retreat_start) })
    }
    res.json(track('19-pause', () => getIgnatianDay(s((req as any).userId))))
  })

  router.post('/ignatian/resume', (req, res) => {
    const settings = s((req as any).userId)
    if (!settings.retreat_start) return res.status(400).json({ error: 'Retreat not started' })
    if (settings.retreat_paused) {
      upsertAllSettings(db(), (req as any).userId, { retreat_start: shiftedStart(settings.retreat_paused_days), retreat_paused: 0, retreat_paused_days: null })
    }
    res.json(track('19-resume', () => getIgnatianDay(s((req as any).userId))))
  })

  router.post('/ignatian/reset', (req, res) => {
    upsertAllSettings(db(), (req as any).userId, { retreat_start: null, retreat_paused: 0, retreat_paused_days: null })
    res.json({ needsSetup: true })
  })

  router.get('/ignatian/schedule', (_req, res) => {
    res.json((ignatian as any[]).map((w: any) => ({ week: w.week, phase: w.phase, title: w.title })))
  })

  // ── 18th Annotation ──────────────────────────────────────────────────────────

  router.get('/ignatian18', (req, res) => {
    res.json(track('18-get', () => getIgnatian18Day(s((req as any).userId))))
  })

  router.put('/ignatian18/start', (req, res) => {
    const { start_date } = req.body
    if (!start_date || !DATE_RE.test(start_date)) return res.status(400).json({ error: 'start_date must be YYYY-MM-DD' })
    upsertAllSettings(db(), (req as any).userId, { retreat18_start: start_date, retreat18_paused: 0, retreat18_paused_days: null })
    res.json(track('18-start', () => getIgnatian18Day(s((req as any).userId))))
  })

  router.post('/ignatian18/pause', (req, res) => {
    const settings = s((req as any).userId)
    if (!settings.retreat18_start) return res.status(400).json({ error: 'Retreat not started' })
    if (!settings.retreat18_paused) {
      upsertAllSettings(db(), (req as any).userId, { retreat18_paused: 1, retreat18_paused_days: elapsedDays(settings.retreat18_start) })
    }
    res.json(track('18-pause', () => getIgnatian18Day(s((req as any).userId))))
  })

  router.post('/ignatian18/resume', (req, res) => {
    const settings = s((req as any).userId)
    if (!settings.retreat18_start) return res.status(400).json({ error: 'Retreat not started' })
    if (settings.retreat18_paused) {
      upsertAllSettings(db(), (req as any).userId, { retreat18_start: shiftedStart(settings.retreat18_paused_days), retreat18_paused: 0, retreat18_paused_days: null })
    }
    res.json(track('18-resume', () => getIgnatian18Day(s((req as any).userId))))
  })

  router.post('/ignatian18/reset', (req, res) => {
    upsertAllSettings(db(), (req as any).userId, { retreat18_start: null, retreat18_paused: 0, retreat18_paused_days: null })
    res.json({ needsSetup: true })
  })

  router.get('/ignatian18/schedule', (_req, res) => {
    res.json((ignatian18 as any[]).map((w: any) => ({ week: w.week, phase: w.phase, title: w.title })))
  })

  return router
}
