import { useEffect, useState, type FormEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { request } from './workApi'

export function ThemeToggle() {
  const [dark,setDark] = useState(()=>document.documentElement.dataset.theme === 'dark')
  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }
  return <button className="theme-toggle" onClick={toggle} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun size={20}/> : <Moon size={20}/>}</button>
}
export function Settings() {
  const [user,setUser] = useState<{name:string;email:string}|null>(null)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [busy,setBusy] = useState(false)
  useEffect(()=>{
    let active=true
    request('auth/me').then(data=>{if(active)setUser(data)}).catch(e=>{if(active)setError(e.message)})
    return ()=>{active=false}
  },[])
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = new FormData(event.currentTarget).get('name')
    setBusy(true);setError('');setNotice('')
    try { setUser(await request('auth/profile','PATCH',{name}));setNotice('Profile saved.') }
    catch(e) {setError((e as Error).message)}
    finally {setBusy(false)}
  }
  return <section className="work"><h1>Profile & settings</h1>{error && <p role="alert">{error}</p>}<p role="status">{notice}</p>
    {user ? <form onSubmit={save}><label>Name<input name="name" required maxLength={100} defaultValue={user.name}/></label><p>Email · {user.email}</p><button className="button" disabled={busy}>{busy?'Saving…':'Save profile'}</button></form> : !error && <p role="status">Loading profile…</p>}
  </section>
}
