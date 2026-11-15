import type { Task } from '@prisma/client'

export function summarize(tasks: Task[], today: string) {
  const completed = tasks.filter(task => task.status === 'DONE').length
  const unfinished = tasks.filter(task => task.status !== 'DONE')
  const dated = unfinished.filter(task => task.dueDate).sort((a,b) => a.dueDate!.getTime() - b.dueDate!.getTime() || a.id-b.id)
  const overdueTasks = dated.filter(task => task.dueDate!.toISOString().slice(0,10) < today)
  const upcoming = dated.filter(task => task.dueDate!.toISOString().slice(0,10) >= today)
  return {
    total: tasks.length, completed, pending: tasks.length-completed,
    overdue: overdueTasks.length,
    completion: tasks.length ? Math.round(completed/tasks.length*100) : 0,
    byStatus: ['TODO','IN_PROGRESS','DONE'].map(name => ({name, count:tasks.filter(task=>task.status===name).length})),
    byPriority: ['LOW','MEDIUM','HIGH','URGENT'].map(name => ({name, count:tasks.filter(task=>task.priority===name).length})),
    upcoming, overdueTasks
  }
}
