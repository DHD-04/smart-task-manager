import type { RequestHandler } from 'express'
import { isDatabaseReady } from '../services/readiness.js'

export const health: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' })
}

export const readiness: RequestHandler = async (_req, res) => {
  const ready = await isDatabaseReady()
  res.status(ready ? 200 : 503).json({ database: ready ? 'connected' : 'unavailable' })
}
