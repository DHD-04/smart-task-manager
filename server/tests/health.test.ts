import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { isDatabaseReady } from '../src/services/readiness.js'

vi.mock('../src/services/readiness.js', () => ({ isDatabaseReady: vi.fn() }))

describe('Day 1 API', () => {
  it('reports liveness', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' })
  })
  it.each([true, false])('reflects database readiness %s', async ready => {
    vi.mocked(isDatabaseReady).mockResolvedValue(ready)
    await request(app).get('/api/ready').expect(ready ? 200 : 503, { database: ready ? 'connected' : 'unavailable' })
  })
  it('returns JSON for unknown routes', async () => {
    await request(app).get('/api/missing').expect(404, { error: 'Route not found' })
  })
  it('rejects malformed JSON', async () => {
    const result = await request(app).post('/api/health').type('json').send('{').expect(400)
    expect(result.body.error).toBe('Invalid JSON')
  })
})
