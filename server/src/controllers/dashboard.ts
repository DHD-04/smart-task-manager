import type { RequestHandler } from 'express'
import { db } from '../db/client.js'
import { summarize } from '../services/stats.js'

export const dashboard: RequestHandler = async (req,res) => {
  const today = req.query.today
  if (typeof today !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(today)) {
    res.status(400).json({error:'A valid local date is required.'})
    return
  }
  const parsed = new Date(today+'T00:00:00Z')
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== today) {
    res.status(400).json({error:'Invalid date.'})
    return
  }
  const tasks = await db.task.findMany({where:{userId:res.locals.user.id}})
  res.set('Cache-Control','no-store').json(summarize(tasks,today))
}
