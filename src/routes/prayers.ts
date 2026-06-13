import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

export function createPrayersRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db = () => ctxRef.current!.db.raw

  router.get('/', (_req, res) => {
    const start = Date.now()
    return tracer.startActiveSpan('lectio.prayers.list', span => {
      try {
        const rows = db().prepare(
          'SELECT id, title, body, sort_order FROM lectio_prayers ORDER BY sort_order, title'
        ).all()
        counter.add(1, { group: 'prayers', op: 'list' })
        hist.record(Date.now() - start, { group: 'prayers', op: 'list' })
        span.end()
        res.json(rows)
      } catch (e: any) {
        span.end()
        ctxRef.current!.logger.error({ err: e }, 'prayers list failed')
        res.status(500).json({ error: 'Internal error' })
      }
    })
  })

  return router
}
