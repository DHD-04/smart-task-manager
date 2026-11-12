import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FolderKanban, ListTodo } from 'lucide-react'

import { type Item, statuses, priorities, request } from './workApi'

export function WorkPage({project=false}: {project?:boolean}) {
  const {pathname} = useLocation()
  return <Editor key={pathname} project={project}/>
}
function Editor({project}:{project:boolean}) {
  const path = project ? 'projects' : 'tasks'
  const noun = project ? 'project' : 'task'
  const {id} = useParams()
  const {pathname} = useLocation()
  const navigate = useNavigate()
  const creating = pathname.endsWith('/new')
  const [items,setItems] = useState<Item[]>([])
  const [projects,setProjects] = useState<Item[]>([])
  const [ready,setReady] = useState(false)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [data, choices] = await Promise.all([creating ? request('auth/me').then(()=>[]) : request(path + (id ? '/' + id : '')), project ? [] : request('projects')])
        if (active) { setItems(id ? [data] : data); setProjects(choices); setReady(true) }
      } catch (e) { if (active) setError((e as Error).message) }
    }
    void load()
    return () => {active=false}
  },[creating,id,path,project])
  const item = id ? items[0] : undefined
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    const body = project ? fields : {...fields, projectId:fields.projectId ? Number(fields.projectId) : null, dueDate:fields.dueDate || null}
    setBusy(true); setError('')
    try { await request(path + (id ? '/' + id : ''), id ? 'PATCH' : 'POST', body); navigate('/'+path) }
    catch (e) { setError((e as Error).message); setBusy(false) }
  }
  async function remove() {
    if (!window.confirm('Delete “' + (item?.name || item?.title) + '”?')) return
    setBusy(true); setError('')
    try { await request(path+'/'+id,'DELETE'); navigate('/'+path) }
    catch (e) { setError((e as Error).message); setBusy(false) }
  }
  return <section className="work"><div className="work-nav"><Link to="/tasks"><ListTodo size={18}/> My tasks</Link><Link to="/kanban">Kanban</Link><Link to="/projects"><FolderKanban size={18}/> Projects</Link></div>
    <h1>{creating ? 'New '+noun : id ? (item?.title || item?.name || 'Details') : project ? 'Projects' : 'My tasks'}</h1>
    {error && <p role="alert">{error}</p>}
    {!ready ? !error && <p>Loading…</p> : id || creating ? <form onSubmit={save}>
      <label>{project?'Name':'Title'}<input required name={project?'name':'title'} maxLength={project?120:200} defaultValue={item?.name || item?.title}/></label>
      <label>Description<textarea name="description" maxLength={10000} defaultValue={item?.description || ''}/></label>
      {!project && <><label>Project<select name="projectId" defaultValue={item?.projectId || ''}><option value="">No project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={item?.status || 'TODO'}>{Object.entries(statuses).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Priority<select name="priority" defaultValue={item?.priority || 'MEDIUM'}>{Object.entries(priorities).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Due date<input type="date" name="dueDate" defaultValue={item?.dueDate?.slice(0,10) || ''}/></label></>}
      {item && <small>Created {new Date(item.createdAt).toLocaleString()} · Updated {new Date(item.updatedAt).toLocaleString()}</small>}
      <div className="work-nav"><button className="button" disabled={busy}>Save {noun}</button><Link to={'/'+path}>Cancel</Link>{id && <button type="button" disabled={busy} onClick={remove}>Delete {noun}</button>}</div></form>
      : <><Link className="button" to={'/'+path+'/new'}>New {noun}</Link>{items.length ? <div className="cards">{items.map(row=><article key={row.id}><h3><Link to={'/'+path+'/'+row.id}>{row.name || row.title}</Link></h3>{project ? <p>{row.description}</p> : <><p>{statuses[row.status as keyof typeof statuses]} · {priorities[row.priority as keyof typeof priorities]}</p><p>{projects.find(p=>p.id===row.projectId)?.name || 'No project'}{row.dueDate && ' · Due '+row.dueDate.slice(0,10)}</p></>}</article>)}</div> : <div className="work-empty"><img src={'/images/empty/no-'+path+'.webp'} alt="" width="160"/><p>No {path} yet.</p></div>}</>}
  </section>
}
