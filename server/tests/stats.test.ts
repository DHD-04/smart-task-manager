import { describe,it,expect } from 'vitest'
import type { Task } from '@prisma/client'
import { summarize } from '../src/services/stats.js'
function task(id:number,status:Task['status'],dueDate:string|null,priority:Task['priority']='MEDIUM'):Task {
 return {id,title:'Task',description:null,status,priority,dueDate:dueDate?new Date(dueDate+'T00:00:00Z'):null,userId:1,projectId:null,createdAt:new Date(),updatedAt:new Date()}
}
describe('dashboard calculations',()=>{
 it('handles an empty account',()=>{
  expect(summarize([],'2026-11-15')).toMatchObject({total:0,pending:0,overdue:0,completion:0,upcoming:[]})
 })
 it('counts all tasks and separates overdue from today and future',()=>{
  const result=summarize([task(1,'DONE','2026-11-01'),task(2,'TODO','2026-11-14','HIGH'),task(3,'IN_PROGRESS','2026-11-15'),task(4,'TODO',null),task(5,'TODO','2026-12-01')],'2026-11-15')
  expect(result).toMatchObject({total:5,completed:1,pending:4,overdue:1,completion:20})
  expect(result.upcoming.map(t=>t.id)).toEqual([3,5])
  expect(result.byStatus.map(t=>t.count)).toEqual([3,1,1])
  expect(result.byPriority.map(t=>t.count)).toEqual([0,4,1,0])
 })
})
