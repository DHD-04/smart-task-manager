import type { RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { db } from '../db/client.js'
import { publicFields } from '../middleware/session.js'
import { cookie, currentDigest, hashPassword, matches, newSession, sessionName } from '../services/auth.js'

export function authenticate(register: boolean): RequestHandler {
  return async (req, res) => {
    const { name, password, email } = req.body ?? {}
    const address = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 254 ||
        typeof password !== 'string' || !password.length || password.length > 128 ||
        (register && (password.length < 12 || typeof name !== 'string' || !name.trim() || name.trim().length > 100))) {
      res.status(400).json({ error: register ? 'Enter a name, valid email and a password of 12–128 characters.' : 'Enter a valid email and password.' })
      return
    }
    const session = newSession()
    let user
    if (register) {
      try {
        user = await db.user.create({ data: { name: name.trim(), email: address, passwordHash: await hashPassword(password), sessions: { create: session.data } }, select: publicFields })
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
        res.status(409).json({ error: 'This email is already registered.' })
        return
      }
    } else {
      const account = await db.user.findUnique({ where: { email: address } })
      if (!await matches(password, account?.passwordHash) || !account) {
        res.status(401).json({ error: 'Email or password is incorrect.' })
        return
      }
      await db.session.create({ data: { ...session.data, userId: account.id } })
      user = { id: account.id, email: account.email, name: account.name }
    }
    res.cookie(sessionName, session.token, { ...cookie, expires: session.data.expiresAt }).status(register ? 201 : 200).json(user)
  }
}
export const logout: RequestHandler = async (req, res) => {
  const digest = currentDigest(req)
  if (digest) await db.session.deleteMany({ where: { digest } })
  res.clearCookie(sessionName, cookie).sendStatus(204)
}
