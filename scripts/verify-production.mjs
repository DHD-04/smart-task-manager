import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = process.env.VERIFY_URL
if (!base?.startsWith('https://')) throw new Error('Set VERIFY_URL to the deployment HTTPS origin')
async function call(path, status, method = 'GET', data, cookie = '') {
  const res = await fetch(base + path, {method, headers: {'Content-Type':'application/json', Origin:base, Cookie:cookie}, body:data ? JSON.stringify(data) : undefined})
  assert.equal(res.status, status, `${method} ${path}`)
  return res
}
await call('/api/ready',200)
await call('/api/tasks',401)
const accounts=[]
for (let i=0;i<2;i++) {
  const credentials={email:`release-${randomUUID()}@example.test`,name:'Release verification',password:randomUUID()}
  const res=await call('/api/auth/register',201,'POST',credentials)
  const header=res.headers.get('set-cookie')
  assert.match(header,/__Host-stm=/)
  assert.match(header,/HttpOnly/i)
  assert.match(header,/Secure/i)
  assert.match(header,/SameSite=Strict/i)
  accounts.push({credentials,cookie:header.split(';')[0]})
}
let [owner,other]=accounts
const project=await (await call('/api/projects',201,'POST',{name:'Release verification'},owner.cookie)).json()
const task=await (await call('/api/tasks',201,'POST',{title:'Verify persistence',projectId:project.id},owner.cookie)).json()
await call(`/api/tasks/${task.id}`,200,'PATCH',{status:'DONE'},owner.cookie)
await call('/api/auth/logout',204,'POST',{},owner.cookie)
await call('/api/auth/me',401,'GET',undefined,owner.cookie)
const login=await call('/api/auth/login',200,'POST',owner.credentials)
owner.cookie=login.headers.get('set-cookie').split(';')[0]
assert.equal((await (await call(`/api/tasks/${task.id}`,200,'GET',undefined,owner.cookie)).json()).status,'DONE')
await call(`/api/tasks/${task.id}`,404,'GET',undefined,other.cookie)
await call(`/api/projects/${project.id}`,404,'PATCH',{name:'Forbidden'},other.cookie)
assert.equal((await (await call('/api/dashboard/stats?today=2026-11-16',200,'GET',undefined,owner.cookie)).json()).completed,1)
await call(`/api/tasks/${task.id}`,204,'DELETE',undefined,owner.cookie)
await call(`/api/projects/${project.id}`,204,'DELETE',undefined,owner.cookie)
for (const account of accounts) await call('/api/auth/logout',204,'POST',{},account.cookie)
console.log('PASS: readiness, HTTPS secure cookies, registration, login/logout, CRUD, persistence across sessions, isolation, dashboard. Two empty verification accounts remain; credentials are not retained.')
