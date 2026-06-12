import path   from 'node:path'
import { Router } from 'express'
import type { ModuleContext } from '@mosaic/sdk'
import { createJournalRouter }       from './journal.js'
import { createReadingsRouter }      from './readings.js'
import { createContemplativeRouter } from './contemplative.js'
import { createIgnatianRouter }      from './ignatian.js'
import { createIntercessionsRouter } from './intercessions.js'

export function createRouter(ctxRef: { current: ModuleContext | null }): Router {
  const router = Router()

  router.use('/journal',        createJournalRouter(ctxRef))
  router.use('/readings',       createReadingsRouter(ctxRef))
  router.use('/contemplative',  createContemplativeRouter(ctxRef))
  router.use('/intercessions',  createIntercessionsRouter(ctxRef))

  const ignatianRouter = createIgnatianRouter(ctxRef)
  router.use('/', ignatianRouter)

  router.get('/ui.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript')
    res.sendFile(path.resolve(__dirname, '../../public/ui.js'))
  })

  return router
}
