import { NavLink } from 'react-router-dom'
import { ListTodo, KanbanSquare, FolderKanban } from 'lucide-react'

const views = [
  {to:'/tasks', label:'My tasks', icon:ListTodo},
  {to:'/kanban', label:'Kanban', icon:KanbanSquare},
  {to:'/projects', label:'Projects', icon:FolderKanban}
]

export function WorkNavigation() {
  return <nav className="view-switcher" aria-label="Workspace views">
    {views.map(({to,label,icon:Icon}) =>
      <NavLink key={to} to={to}><Icon size={18} aria-hidden="true"/><span>{label}</span></NavLink>
    )}
  </nav>
}
