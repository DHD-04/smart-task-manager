import type { ErrorRequestHandler } from 'express'
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }
  res.status(500).json({ error: 'Internal server error' })
}
