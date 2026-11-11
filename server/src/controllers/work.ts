import { Priority, Status, Prisma } from '@prisma/client'
import { Router, type ErrorRequestHandler } from 'express'
import { db } from '../db/client.js'
import { requireSession } from '../middleware/session.js'

class Invalid extends Error {}
function workInput(raw: unknown, project: boolean, create: boolean) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Invalid('Expected an object.')
  const body = raw as Record<string, unknown>
  const label = project ? 'name' : 'title'
  const fields = project ? ['name','description'] : ['title','description','projectId','dueDate','status','priority']
  if (!Object.keys(body).length || Object.keys(body).some(k => !fields.includes(k))) throw new Invalid('Unknown or missing fields.')
  const value = body[label]
  if (create || label in body) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > (project ? 120 : 200)) throw new Invalid('A valid ' + label + ' is required.')
  }
  const description = body.description
  if (description != null && (typeof description !== 'string' || description.length > 10000)) throw new Invalid('Description is too long or invalid.')
  const projectId = body.projectId
  if (projectId != null && (typeof projectId !== 'number' || !Number.isInteger(projectId) || projectId < 1 || projectId > 2147483647)) throw new Invalid('Invalid project.')
  if ('status' in body && !Object.values(Status).includes(body.status as Status)) throw new Invalid('Invalid status.')
  if ('priority' in body && !Object.values(Priority).includes(body.priority as Priority)) throw new Invalid('Invalid priority.')
  let date: Date | null | undefined
  if (body.dueDate === null) date = null
  else if ('dueDate' in body) {
    const day = body.dueDate
    if (typeof day !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(day)) throw new Invalid('Invalid deadline.')
    date = new Date(day + 'T00:00:00Z')
    if (!Number.isFinite(date.getTime()) || !date.toISOString().startsWith(day)) throw new Invalid('Invalid deadline.')
  }
  return { label: typeof value === 'string' ? value.trim() : undefined, description: description as string | null | undefined,
    task: { status: body.status as Status | undefined, priority: body.priority as Priority | undefined, projectId: projectId as number | null | undefined, dueDate: date } }
}
const errors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof Invalid) res.status(400).json({error:err.message})
  else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') res.status(404).json({error:'Item not found.'})
  else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') res.status(409).json({error:'Check the project assignment. Detach its tasks before deleting a project.'})
  else next(err)
}
export function workRouter(project: boolean) {
  const router = Router()
  router.use(requireSession, (req,res,next) => {
    res.set('Cache-Control','no-store')
    if (req.headers['sec-fetch-site'] === 'cross-site') { res.sendStatus(403); return }
    next()
  })
  router.param('id', (_req,res,next,raw) => {
    const id = Number(raw)
    if (!/^[1-9]\d*$/.test(raw) || id > 2147483647) return next(new Invalid('Invalid identifier.'))
    res.locals.id = id
    next()
  })
  router.get('/', async (_req,res) => {
    const args = {where:{userId:res.locals.user.id}, orderBy:{id:'desc' as const}}
    res.json(project ? await db.project.findMany(args) : await db.task.findMany(args))
  })
  router.get('/:id', async (_req,res) => {
    const where = {id:res.locals.id, userId:res.locals.user.id}
    res.json(project ? await db.project.findUniqueOrThrow({where}) : await db.task.findUniqueOrThrow({where}))
  })
  router.post('/', async (req,res) => {
    const {label,description,task} = workInput(req.body,project,true)
    const userId = res.locals.user.id
    const item = project ? await db.project.create({data:{userId,name:label!,description}})
      : await db.task.create({data:{userId,title:label!,description,...task}})
    res.status(201).json(item)
  })
  router.patch('/:id', async (req,res) => {
    const {label,description,task} = workInput(req.body,project,false)
    const where = {id:res.locals.id,userId:res.locals.user.id}
    res.json(project ? await db.project.update({where,data:{name:label,description}})
      : await db.task.update({where,data:{title:label,description,...task}}))
  })
  router.delete('/:id', async (_req,res) => {
    const where = {id:res.locals.id,userId:res.locals.user.id}
    if (project) await db.project.delete({where})
    else await db.task.delete({where})
    res.sendStatus(204)
  })
  return router.use(errors)
}
