import express from 'express'
import { api } from './routes/index.js'
import { errorHandler } from './middleware/errors.js'

export const app = express()
app.disable('x-powered-by')
app.use('/api', express.json(), api)
app.use((_req, res) => { res.status(404).json({ error: 'Route not found' }) })
app.use(errorHandler)
