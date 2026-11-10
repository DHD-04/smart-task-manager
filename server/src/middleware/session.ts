import type { RequestHandler } from 'express'
import { db } from '../db/client.js'
import { currentDigest } from '../services/auth.js'

export const publicFields = { id: true, name: true, email: true } as const
export const requireSession: RequestHandler = async (req, res, next) => {
  const digest = currentDigest(req)
  const session = digest && await db.session.findUnique({ where: { digest }, include: { user: { select: publicFields } } })
  if (!session || session.expiresAt <= new Date()) {
    res.status(401).json({ error: 'Please sign in.' })
    return
  }
  res.locals.user = session.user
  next()
}
