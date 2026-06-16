import { Router } from 'express'
import { trace, metrics } from '@opentelemetry/api'
import type { ModuleContext } from '@mosaic/sdk'
import * as svc from '../services/intercessions.service.js'

const tracer  = trace.getTracer('lectio')
const counter = metrics.getMeter('lectio').createCounter('lectio_requests_total')
const hist    = metrics.getMeter('lectio').createHistogram('lectio_request_duration_ms')

function track(op: string, fn: () => unknown) {
  const start = Date.now()
  return tracer.startActiveSpan(`lectio.prayer.${op}`, span => {
    try {
      const result = fn()
      counter.add(1, { group: 'prayer', op })
      hist.record(Date.now() - start, { group: 'prayer', op })
      span.end()
      return result
    } catch (e) { span.end(); throw e }
  })
}

export function createIntercessionsRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()
  const db = () => ctxRef.current!.db.raw

  router.get('/', (req, res) => {
    try {
      res.json(track('list', () => svc.listIntercessions(db(), (req as any).userId, true)))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'intercessions list failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.post('/', (req, res) => {
    const { name, intention } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
    try {
      res.status(201).json(track('create', () => svc.createIntercession(db(), (req as any).userId, name.trim(), intention)))
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'intercessions create failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'invalid id' })
    const { name, intention, active, sort_order } = req.body
    try {
      const result = track('update', () => svc.updateIntercession(db(), (req as any).userId, id, { name, intention, active, sort_order }))
      if (!result) return res.status(404).json({ error: 'Not found' })
      res.json(result)
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'intercessions update failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) return res.status(400).json({ error: 'invalid id' })
    try {
      const ok = track('delete', () => svc.deleteIntercession(db(), (req as any).userId, id))
      if (!ok) return res.status(404).json({ error: 'Not found' })
      res.json({ ok: true })
    } catch (e: any) {
      ctxRef.current!.logger.error({ err: e }, 'intercessions delete failed')
      res.status(500).json({ error: 'Internal error' })
    }
  })

  return router
}
