import { Router } from 'express'
import { health, readiness } from '../controllers/health.js'

export const api = Router()
api.get('/health', health)
api.get('/ready', readiness)
import { authenticate, logout } from '../controllers/auth.js'
import { requireSession } from '../middleware/session.js'

api.use('/auth', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  if (req.method === 'POST' && (!req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site')) {
    res.status(403).json({ error: 'Authentication requires a same-site JSON request.' })
    return
  }
  next()
})
api.post('/auth/register', authenticate(true))
api.post('/auth/login', authenticate(false))
api.post('/auth/logout', logout)
api.get('/auth/me', requireSession, (_req, res) => { res.json(res.locals.user) })
