import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { request, type Item, statuses, priorities } from './workApi'

type Distribution = {name:string;count:number}[]
type Stats = { total:number;completed:number;pending:number;overdue:number;completion:number;byStatus:Distribution;byPriority:Distribution;upcoming:Item[];overdueTasks:Item[] }
function DistributionChart({title,rows,labels}:{title:string;rows:Distribution;labels:Record<string,string>}) {
  const data = rows.map(row=>({...row,name:labels[row.name]}))
  return <article><h2>{title}</h2><div className="chart" aria-hidden="true"><ResponsiveContainer width="100%" height={230}><BarChart data={data}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#3D85C6" isAnimationActive={false}/></BarChart></ResponsiveContainer></div>
    <ul>{data.map(row=><li key={row.name}>{row.name} — {row.count}</li>)}</ul></article>
}
export function Dashboard() {
  const [stats,setStats]=useState<Stats|null>(null)
  const [error,setError]=useState('')
  const [revision,setRevision]=useState(0)
  useEffect(()=>{
    let active=true
    const now=new Date()
    const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')
    request('dashboard/stats?today='+today).then(data=>{if(active)setStats(data)}).catch(e=>{if(active)setError(e.message)})
    return ()=>{active=false}
  },[revision])
  return <section className="work"><div className="work-nav"><Link to="/tasks">My tasks</Link><Link to="/kanban">Kanban</Link><Link to="/projects">Projects</Link></div><h1>Productivity</h1>
    <button className="button" onClick={()=>{setError('');setStats(null);setRevision(r=>r+1)}}>Refresh statistics</button>
    {error && <p role="alert">{error}</p>}
    {stats ? <><div className="cards">{[['Total tasks',stats.total],['Completed',stats.completed],['Pending',stats.pending],['Overdue',stats.overdue],['Completion',stats.completion+'%']].map(([label,value])=><article key={label}><h2>{label}</h2><p className="metric">{value}</p></article>)}</div>
      <div className="dashboard-charts"><DistributionChart title="Tasks by status" rows={stats.byStatus} labels={statuses}/><DistributionChart title="Tasks by priority" rows={stats.byPriority} labels={priorities}/></div>
      <div className="dashboard-charts">{[{title:'Upcoming deadlines',tasks:stats.upcoming},{title:'Overdue tasks',tasks:stats.overdueTasks}].map(group=><article key={group.title}><h2>{group.title}</h2>{group.tasks.length ? <ul>{group.tasks.map(task=><li key={task.id}><Link to={'/tasks/'+task.id}>{task.title}</Link> · {task.dueDate?.slice(0,10)}</li>)}</ul> : <p>No {group.title.toLowerCase()}.</p>}</article>)}</div></> : !error && <p role="status">Loading statistics…</p>}
    <p>Deadlines use your local calendar date. Tasks due today are upcoming.</p>
  </section>
}
