// @vitest-environment jsdom
import React from 'react'
import { afterEach,expect,it,vi } from 'vitest'
import { cleanup,fireEvent,render,screen } from '@testing-library/react'
import { Settings,ThemeToggle } from './Settings'
import { request } from './workApi'
vi.mock('./workApi',()=>({request:vi.fn()}))
Object.assign(globalThis,{React})
afterEach(()=>{cleanup();vi.resetAllMocks();localStorage.clear();delete document.documentElement.dataset.theme})
it('persists the selected theme and can restore light mode',()=>{
 render(<ThemeToggle/>)
 fireEvent.click(screen.getByRole('button',{name:'Use dark theme'}))
 expect(localStorage.getItem('theme')).toBe('dark')
 expect(document.documentElement.dataset.theme).toBe('dark')
 fireEvent.click(screen.getByRole('button',{name:'Use light theme'}))
 expect(localStorage.getItem('theme')).toBe('light')
})
it('submits a profile change and announces success',async()=>{
 vi.mocked(request).mockResolvedValueOnce({name:'Original',email:'test@example.test'}).mockResolvedValueOnce({name:'Updated',email:'test@example.test'})
 render(<Settings/>)
 fireEvent.change(await screen.findByLabelText('Name'),{target:{value:'Updated'}})
 fireEvent.click(screen.getByRole('button',{name:'Save profile'}))
 expect(await screen.findByText('Profile saved.')).toBeTruthy()
 expect(request).toHaveBeenLastCalledWith('auth/profile','PATCH',{name:'Updated'})
})
