import 'dotenv/config'
import { app } from './app.js'
import { db } from './db/client.js'

const port = Number(process.env.PORT || 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT')
const server = app.listen(port, '127.0.0.1', () => console.log('API listening on port', port))
function shutdown() {
  server.close(async () => { await db.$disconnect() })
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
