import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { it, expect } from 'vitest'
import { app } from '../src/app.js'
import { db } from '../src/db/client.js'

it.skipIf(process.env.AUTH_DB_TEST !== '1')('persists task and project changes and isolates ownership', async () => {
  const owner = request.agent(app)
  const other = request.agent(app)
  const emails = [randomUUID()+'@example.test', randomUUID()+'@example.test']
  try {
    await request(app).get('/api/tasks').expect(401)
    for (const [i,agent] of [owner, other].entries()) {
      await agent.post('/api/auth/register').send({email:emails[i],name:'Test',password:randomUUID()}).expect(201)
    }
    const project = (await owner.post('/api/projects').send({name:'Planning'}).expect(201)).body
    const projectPath = '/api/projects/'+project.id
    await owner.patch(projectPath).send({name:'Release'}).expect(200)
    await other.post('/api/tasks').send({title:'Foreign assignment',projectId:project.id}).expect(409)
    const task = (await owner.post('/api/tasks').send({title:'Draft', projectId:project.id}).expect(201)).body
    const taskPath = '/api/tasks/'+task.id
    await owner.patch(taskPath).send({title:'Publish',status:'DONE',priority:'URGENT',dueDate:'2026-11-30'}).expect(200)
    expect((await owner.get(taskPath)).body).toMatchObject({title:'Publish', status:'DONE',priority:'URGENT',projectId:project.id,dueDate:'2026-11-30T00:00:00.000Z'})
    for (const [path,update] of [[taskPath,{title:'Other'}],[projectPath,{name:'Other'}]] as const) {
      await other.get(path).expect(404)
      await other.patch(path).send(update).expect(404)
      await other.delete(path).expect(404)
    }
    expect((await other.get('/api/tasks')).body).toEqual([])
    expect((await other.get('/api/projects')).body).toEqual([])
    for (const data of [{title:' '},{dueDate:'2026-02-31'},{status:'INVALID'},{userId:1}]) {
      await owner.patch(taskPath).send(data).expect(400)
    }
    await owner.delete(projectPath).expect(409)
    await owner.patch(taskPath).send({projectId:null,dueDate:null}).expect(200)
    await owner.delete(projectPath).expect(204)
    await owner.delete(taskPath).expect(204)
    await owner.get(taskPath).expect(404)
  } finally {
    const where = {user:{email:{in:emails}}}
    await db.task.deleteMany({where})
    await db.project.deleteMany({where})
    await db.user.deleteMany({where:{email:{in:emails}}})
  }
})
