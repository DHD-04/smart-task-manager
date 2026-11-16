import { Router } from 'express'
import { health, readiness } from '../controllers/health.js'

export const api = Router()
api.get('/health', health)
api.get('/ready', readiness)
import { authenticate, logout } from '../controllers/auth.js'
import { requireSession } from '../middleware/session.js'

api.use('/auth', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  if (!['GET', 'HEAD'].includes(req.method) && (!req.is('application/json') || req.headers['sec-fetch-site'] === 'cross-site')) {
    res.status(403).json({ error: 'Authentication requires a same-site JSON request.' })
    return
  }
  next()
})
api.post('/auth/register', authenticate(true))
api.post('/auth/login', authenticate(false))
api.post('/auth/logout', logout)
api.get('/auth/me', requireSession, (_req, res) => { res.json(res.locals.user) })
import { workRouter } from '../controllers/work.js'
api.use('/tasks', workRouter(false))
api.use('/projects', workRouter(true))
import { dashboard } from '../controllers/dashboard.js'
api.get('/dashboard/stats', requireSession, dashboard)
import { db } from '../db/client.js'
import { publicFields } from '../middleware/session.js'
api.patch('/auth/profile', requireSession, async (req,res) => {
  const name = req.body?.name
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    res.status(400).json({error:'Enter a name of 1–100 characters.'})
    return
  }
  const user = await db.user.update({where:{id:res.locals.user.id},data:{name:name.trim()},select:publicFields})
  res.json(user)
})
