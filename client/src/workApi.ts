export type Item = { id:number; name?:string; title?:string; description:string|null; projectId?:number|null; status?:string; priority?:string; dueDate?:string|null; createdAt:string; updatedAt:string }
export const statuses = { TODO:'To Do', IN_PROGRESS:'In Progress', DONE:'Done' }
export const priorities = { LOW:'Low', MEDIUM:'Medium', HIGH:'High', URGENT:'Urgent' }

export async function request(path:string, method='GET', body?:object) {
  const res = await fetch('/api/' + path, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})
  if (res.status === 401) { window.location.replace('/login'); throw new Error('Please sign in.') }
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed.')
  return res.status === 204 ? null : res.json()
}
