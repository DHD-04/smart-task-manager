import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { resolve } from 'node:path'
import { api } from './routes/index.js'
import { errorHandler } from './middleware/errors.js'

export const app = express()
app.disable('x-powered-by')
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)
app.use(helmet())
app.use(['/api/auth/login','/api/auth/register'], rateLimit({
  windowMs:15*60*1000, limit:30, standardHeaders:'draft-8', legacyHeaders:false,
  message:{error:'Too many attempts. Please try again in 15 minutes.'}
}))
app.use('/api', express.json({limit:'32kb'}), api)
app.use('/api', (_req,res)=>{res.status(404).json({error:'Route not found'})})
if (process.env.NODE_ENV === 'production') {
  const root = resolve('client/dist')
  app.use(express.static(root))
  app.get('/{*path}', (_req,res)=>{res.sendFile(resolve(root,'index.html'))})
}
app.use((_req, res) => { res.status(404).json({ error: 'Route not found' }) })
app.use(errorHandler)
