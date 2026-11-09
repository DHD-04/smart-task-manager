import { Router } from 'express'
import { health, readiness } from '../controllers/health.js'

export const api = Router()
api.get('/health', health)
api.get('/ready', readiness)
