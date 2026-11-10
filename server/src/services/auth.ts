import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import type { Request } from 'express'

const derive = (password: string, salt: string) => new Promise<Buffer>((resolve, reject) =>
  scrypt(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)))
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return salt + ':' + (await derive(password, salt)).toString('hex')
}
export async function matches(password: string, stored?: string) {
  const [salt, hash] = stored?.split(':') ?? ['unknown-account', '00'.repeat(64)]
  const key = await derive(password, salt)
  return timingSafeEqual(key, Buffer.from(hash, 'hex')) && !!stored
}
export const cookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
export const sessionName = cookie.secure ? '__Host-stm' : 'stm'
const digest = (token: string) => createHash('sha256').update(token).digest('hex')
export function currentDigest(req: Request) {
  const token = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith(sessionName + '='))?.slice(sessionName.length + 1)
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : undefined
}
export function newSession() {
  const token = randomBytes(32).toString('hex')
  return { token, data: { digest: digest(token), expiresAt: new Date(Date.now() + 7 * 86400000) } }
}
