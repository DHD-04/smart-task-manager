import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { type Item, priorities, request, statuses } from './workApi'

type Status = keyof typeof statuses
const stages = Object.keys(statuses) as Status[]
type Move = (task:Item, status:Status) => void

function Card({ task, busy, move }: { task:Item; busy:boolean; move:Move }) {
  const drag = useDraggable({ id:task.id, disabled:busy })
  const transform = drag.transform
  return <article ref={drag.setNodeRef} className="board-card" style={transform ? {
    transform: 'translate3d('+transform.x+'px,'+transform.y+'px,0)', zIndex:2
  } : undefined}>
    <div className="card-title"><Link to={'/tasks/'+task.id}>{task.title}</Link>
      <button ref={drag.setActivatorNodeRef} {...drag.attributes} {...drag.listeners} aria-label={'Drag '+task.title} className="drag-handle"><GripVertical size={18}/></button></div>
    <p>{priorities[task.priority as keyof typeof priorities]}{task.dueDate && ' · '+task.dueDate.slice(0,10)}</p>
    <select aria-label={'Status for '+task.title} value={task.status} disabled={busy} onChange={event=>move(task,event.target.value as Status)}>
      {stages.map(stage=><option key={stage} value={stage}>{statuses[stage]}</option>)}
    </select>
  </article>
}

function Column({stage, tasks, busy, move}:{stage:Status;tasks:Item[];busy:boolean;move:Move}) {
  const drop = useDroppable({id:stage})
  return <section ref={drop.setNodeRef} className={'board-column'+(drop.isOver?' over':'')} aria-label={statuses[stage]}>
    <h2>{statuses[stage]} <small>{tasks.length}</small></h2>
    {tasks.map(task=><Card key={task.id} task={task} busy={busy} move={move}/>)}
  </section>
}

export function Board() {
  const [tasks,setTasks] = useState<Item[]>([])
  const [projects,setProjects] = useState<Item[]>([])
  const [loaded,setLoaded] = useState(false)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [query,setQuery] = useState('')
  const [priority,setPriority] = useState('')
  const [project,setProject] = useState('')
  const [saving,setSaving] = useState(false)
  const pending = useRef(false)
  useEffect(()=>{
    let active = true
    Promise.all([request('tasks'),request('projects')]).then(([rows,groups])=>{
      if (active) { setTasks(rows); setProjects(groups); setLoaded(true) }
    }).catch(e=>{if (active) setError(e.message)})
    return ()=>{active=false}
  },[])
  async function move(task:Item, status:Status) {
    if (pending.current || task.status === status) return
    pending.current = true
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const saved = await request('tasks/'+task.id,'PATCH',{status})
      setTasks(rows=>rows.map(row=>row.id===saved.id ? saved : row))
      setNotice(task.title+' moved to '+statuses[status]+'.')
    } catch (e) { setError((e as Error).message) }
    finally { pending.current=false; setSaving(false) }
  }
  const term = query.trim().toLowerCase()
  const visible = tasks.filter(task=>
    (!priority || priority===task.priority) &&
    (!project || project===String(task.projectId)) &&
    [task.title,task.description].some(text=>text?.toLowerCase().includes(term)))
  return <section className="work"><div className="work-nav"><Link to="/tasks">My tasks</Link><Link to="/projects">Projects</Link></div>
    <h1>Kanban board</h1><Link className="button" to="/tasks/new">New task</Link>
    <div className="board-filters"><label>Search tasks<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label>Priority<select aria-label="Priority" value={priority} onChange={e=>setPriority(e.target.value)}><option value="">All priorities</option>{Object.entries(priorities).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Project<select aria-label="Project" value={project} onChange={e=>setProject(e.target.value)}><option value="">All projects</option><option value="null">No project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
    {error && <p role="alert">{error}</p>}<p role="status">{saving?'Saving status…':notice}</p>
    {loaded ? <>{!visible.length && <p>{tasks.length?'No matching tasks.':'No tasks yet.'}</p>}
    <DndContext onDragEnd={({active,over})=>{
      const task=tasks.find(row=>row.id===active.id)
      if (task && stages.includes(over?.id as Status)) void move(task,over!.id as Status)
    }}><div className="board-grid">{stages.map(stage=><Column key={stage} stage={stage} tasks={visible.filter(t=>t.status===stage)} busy={saving} move={move}/>)}</div></DndContext></> : !error && <p>Loading tasks…</p>}
  </section>
}
