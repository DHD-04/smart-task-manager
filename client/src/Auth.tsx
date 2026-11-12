import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function AuthForm({ register = false }: { register?: boolean }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    setError('')
    try {
      const result = await fetch('/api/auth/' + (register ? 'register' : 'login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!result.ok) throw new Error((await result.json()).error)
      navigate('/workspace', { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.') }
    finally { setBusy(false) }
  }
  return <section className="auth-layout"><form onSubmit={submit}><h1>{register ? 'Create an account' : 'Sign in'}</h1>
    {register && <label>Name<input name="name" autoComplete="name" maxLength={100} required/></label>}
    <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>
    <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : 1} maxLength={128} required/>{register && <small>Use at least 12 characters.</small>}</label>
    {error && <p role="alert">{error}</p>}
    <button disabled={busy} className="button">{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    <Link to={register ? '/login' : '/register'}>{register ? 'Already registered? Sign in' : 'Create an account'}</Link>
    </form><img src="/images/auth/team-planning.webp" alt="" width="512" height="341"/></section>
}

export function Workspace() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{name: string, email: string} | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/auth/me', {signal: controller.signal})
        if (res.status === 401) return navigate('/login', {replace:true})
        if (!res.ok) throw new Error()
        setUser(await res.json())
      } catch { if (!controller.signal.aborted) setError('Could not load your workspace. Please refresh.') }
    }
    void load()
    return () => controller.abort()
  }, [navigate])
  async function logout() {
    try {
      const res = await fetch('/api/auth/logout', {method:'POST', headers:{'Content-Type':'application/json'}, body:'{}'})
      if (!res.ok) throw new Error()
      navigate('/login', {replace:true})
    } catch { setError('Sign out failed. Please try again.') }
  }
  return <section className="system"><p className="eyebrow">Your workspace</p>{user ? <><h1>Welcome, {user.name}</h1><p>{user.email}</p><div className="work-nav"><Link to="/tasks">My tasks</Link><Link to="/kanban">Kanban</Link><Link to="/projects">Projects</Link></div><button className="button" onClick={logout}>Sign out</button></> : !error && <p>Loading account…</p>}{error && <p role="alert">{error}</p>}</section>
}
