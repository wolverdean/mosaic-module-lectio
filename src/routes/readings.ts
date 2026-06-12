import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'
import { getCached, todayKey, fetchSacredSpace, fetchUtmost, fetchPsalm, fetchCatholic, fetchOrthodox, fetchPractices } from '../lib/readings.js'
import * as svc from '../services/readings.service.js'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

function track(op: string, fn: () => unknown) {
  const start = Date.now()
  return tracer.startActiveSpan(`lectio.readings.${op}`, span => {
    try {
      const result = fn()
      counter.add(1, { group: 'readings', op })
      hist.record(Date.now() - start, { group: 'readings', op })
      span.end()
      return result
    } catch (e) { span.end(); throw e }
  })
}

export function createReadingsRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db     = () => ctxRef.current!.db.raw
  const local  = (userId: number) => svc.getSettings(db(), userId).readings_source !== 'internet'

  function readingRoute(path: string, cacheKey: (date: string) => string, fetchFn: () => Promise<unknown>, source: string, url: string) {
    router.get(path, async (req, res) => {
      const userId = (req as any).userId
      try {
        const data = local(userId)
          ? await getCached(db(), cacheKey(todayKey()), fetchFn)
          : await fetchFn()
        counter.add(1, { group: 'readings', op: path.slice(1) })
        res.json(data)
      } catch (e: any) {
        ctxRef.current!.logger.error({ err: e, source }, 'reading fetch failed')
        res.status(502).json({ error: e.message, source, url })
      }
    })
  }

  readingRoute('/sacred-space', d => `sacred-space-${d}`, fetchSacredSpace, 'Sacred Space · Irish Jesuits', 'https://sacredspace.com/daily-prayer/')
  readingRoute('/utmost',       d => `utmost-${d}`,        fetchUtmost,      'My Utmost for His Highest',    'https://utmost.org')
  readingRoute('/psalm',        d => `psalm-${d}`,         fetchPsalm,       'Psalms',                       'https://bolls.life')
  readingRoute('/orthodox',     d => `orthodox-${d}`,      fetchOrthodox,    'Orthodox',                     'https://orthocal.info')
  readingRoute('/practices',    d => `practices-${d}`,     fetchPractices,   'Daily Practices',              '')

  router.get('/catholic', async (req, res) => {
    const userId = (req as any).userId
    try {
      const todayDateStr = todayKey().replace(/-/g, '')
      const data = local(userId)
        ? await getCached(db(), `catholic-${todayKey()}`, () => fetchCatholic(todayDateStr))
        : await fetchCatholic()
      counter.add(1, { group: 'readings', op: 'catholic' })
      res.json(data)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'catholic reading failed')
      res.status(502).json({ error: e.message, source: 'Universalis', url: 'https://universalis.com/mass.htm' })
    }
  })

  // User settings
  router.get('/settings', (req, res) => {
    try {
      res.json(svc.getSettings(db(), (req as any).userId))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'settings get failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.put('/settings', (req, res) => {
    const { readings_source } = req.body
    try {
      res.json(svc.updateSettings(db(), (req as any).userId, { readings_source }))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'settings update failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  // Weekly reviews
  router.get('/weekly-review', (req, res) => {
    try {
      res.json(svc.getWeeklyReview(db(), (req as any).userId))
    } catch (e: any) {
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.get('/weekly-reviews', (req, res) => {
    const year  = parseInt(req.query.year  as string, 10) || new Date().getFullYear()
    const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1
    try {
      res.json(svc.getWeeklyReviews(db(), (req as any).userId, year, month))
    } catch (e: any) {
      res.status(500).json({ error: 'Internal error' })
    }
  })

  return router
}
