import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { Activity, ArrowDownRight, ArrowUpRight, KanbanSquare, Database, FolderOpen, Layers3, LayoutGrid, ListChecks, RefreshCw, Server } from 'lucide-react'
import { AuthForm, Workspace } from './Auth'
import { WorkPage } from './Work'
import { Board } from './Board'
import './style.css'

const repo = 'https://github.com/DHD-04/smart-task-manager'
const workflow = [
  { icon: ListChecks, title: 'Capture tasks', text: 'Give each task a clear outcome, priority and due date.' },
  { icon: FolderOpen, title: 'Organize projects', text: 'Group related tasks so each project has a home.' },
  { icon: KanbanSquare, title: 'Track progress', text: 'Move work from To Do to In Progress to Done.' }
]

function Overview() {
  return <><header className="hero"><div><p className="eyebrow text-left">Workspace guide</p><h1>Smart Task<br/>Manager<span>.</span></h1>
    <p className="intro">A personal workspace for tasks, projects<br className="wide"/> and the work ahead.</p>
    <Link className="button" to="/register">Create an account <ArrowDownRight size={17}/></Link></div>
    <img className="hero-art" src="/images/landing/workspace.webp" width="960" height="640" fetchPriority="high" alt="Illustrated workspace with a Kanban board, calendar and progress chart." /></header>
    <section id="workflow"><p className="eyebrow text-left">How it works</p><h2>From idea to done</h2>
    <div className="cards">{workflow.map(({icon:Icon,title,text})=><article key={title}><Icon size={25}/><h3>{title}</h3><p>{text}</p></article>)}</div></section></>
}

function System() {
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState<string[]>([])
  useEffect(() => {
    const controller = new AbortController()
    async function probe(path: string, key: string, value: string) {
      try {
        const result = await fetch('/api/' + path, { signal: controller.signal, cache: 'no-store' })
        return result.ok && (await result.json())[key] === value ? 'Connected' : 'Unavailable'
      } catch { return 'Unavailable' }
    }
    Promise.all([probe('health','status','ok'), probe('ready','database','connected')]).then(values => {
      if (!controller.signal.aborted) setStatus(values)
    })
    return () => controller.abort()
  }, [revision])
  return <section className="system"><p className="eyebrow text-left">Workspace diagnostics</p><h1>System status<span>.</span></h1>
    <div className="cards" aria-live="polite">{[Server,Database].map((Icon,i)=><article key={i}><Icon/><h3>{['Express API','MySQL connection'][i]}</h3><p>{status[i] || 'Checking…'}</p></article>)}</div>
    <button className="button" disabled={!status.length} onClick={()=>{setStatus([]);setRevision(r=>r+1)}}><RefreshCw size={16}/> Refresh status</button></section>
}

function App() {
  return <><a className="skip" href="#main">Skip to content</a><nav><div className="nav-inner"><Link to="/" className="brand"><span className="mark"><Layers3 size={23}/></span>Smart Task Manager</Link>
    <div className="links"><NavLink to="/" end><LayoutGrid size={16}/>Overview</NavLink><NavLink to="/status"><Activity size={16}/>System status</NavLink><NavLink to="/workspace">My workspace</NavLink></div></div></nav>
    <main id="main"><Routes><Route path="/" element={<Overview/>}/><Route path="/status" element={<System/>}/><Route path="/login" element={<AuthForm key="login"/>}/><Route path="/register" element={<AuthForm key="register" register/>}/><Route path="/workspace" element={<Workspace/>}/><Route path="/kanban" element={<Board/>}/><Route path="/tasks" element={<WorkPage/>}/><Route path="/tasks/new" element={<WorkPage/>}/><Route path="/tasks/:id" element={<WorkPage/>}/><Route path="/projects" element={<WorkPage project/>}/><Route path="/projects/new" element={<WorkPage project/>}/><Route path="/projects/:id" element={<WorkPage project/>}/><Route path="*" element={<section className="system"><h1>Page not found</h1><Link className="button" to="/">Return to overview</Link></section>}/></Routes></main>
    <footer><span>Built by <strong>DHD</strong></span><a href={repo}>Source on GitHub <ArrowUpRight size={14}/></a></footer></>
}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App/></BrowserRouter></StrictMode>)
