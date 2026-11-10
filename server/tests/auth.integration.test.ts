import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { db } from '../src/db/client.js'

it.skipIf(process.env.AUTH_DB_TEST !== '1')('validates accounts, isolates sessions and revokes logout', async () => {
  const email = randomUUID() + '@example.test'
  const second = 'second-' + email
  const body = { name: 'Test', email, password: randomUUID() }
  const agent = request.agent(app)
  try {
    await agent.get('/api/auth/me').expect(401)
    await agent.post('/api/auth/register').send({...body, password:'short'}).expect(400)
    const registered = await agent.post('/api/auth/register').send(body).expect(201)
    expect(registered.body).not.toHaveProperty('passwordHash')
    const stored = await db.user.findUniqueOrThrow({where:{email}})
    expect(stored.passwordHash).not.toContain(body.password)
    const token = registered.headers['set-cookie'][0].split(';')[0]
    expect(registered.headers['set-cookie'][0]).toContain('HttpOnly')
    await request(app).post('/api/auth/register').send(body).expect(409)
    const other = request.agent(app)
    await other.post('/api/auth/register').send({...body,email:second}).expect(201)
    expect((await other.get('/api/auth/me')).body.email).toBe(second)
    expect((await agent.get('/api/auth/me')).body.email).toBe(email)
    await agent.post('/api/auth/logout').send({}).expect(204)
    await request(app).get('/api/auth/me').set('Cookie',token).expect(401)
    await agent.post('/api/auth/login').send({...body,password:'wrong'}).expect(401)
    await agent.post('/api/auth/login').send(body).expect(200)
    await agent.get('/api/auth/me').expect(200)
    await agent.post('/api/auth/logout').set('Sec-Fetch-Site','cross-site').send({}).expect(403)
  } finally { await db.user.deleteMany({where:{email:{in:[email,second]}}}) }
})
