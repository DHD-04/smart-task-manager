import { db } from '../db/client.js'

export async function isDatabaseReady() {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
