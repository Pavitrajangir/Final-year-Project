import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../context/AdminContext.jsx'

export default function Login() {
  const { backendUrl, loginAsAdmin, loginAsDoctor } = useContext(AdminContext)
  const [mode, setMode]       = useState('admin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = mode === 'admin' ? '/api/admin/login' : '/api/doctor/login'
      const { data } = await axios.post(`${backendUrl}${url}`, { email, password })
      if (data.success) {
        mode === 'admin' ? loginAsAdmin(data.token) : loginAsDoctor(data.token)
        toast.success(`Welcome${mode === 'admin' ? ', Admin!' : ', Doctor!'}`)
      } else toast.error(data.message)
    } catch { toast.error('Cannot reach server. Check backend.') }
    finally { setLoading(false) }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4' style={{background:'linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#0F172A 100%)'}}>
      {/* Glow */}
      <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10' style={{background:'radial-gradient(circle, #06B6D4, transparent 70%)'}}/>

      <div className='relative w-full max-w-sm fade-up'>
        {/* Brand */}
        <div className='flex flex-col items-center mb-8'>
          <div className='w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-2xl' style={{background:'linear-gradient(135deg,#06B6D4,#0284C7)'}}>️</div>
          <h1 className='text-2xl font-bold text-white' style={{fontFamily:'Plus Jakarta Sans'}}>MediMate</h1>
          <p className='text-sm mt-1' style={{color:'#64748B'}}>Management Console</p>
        </div>

        <div className='card p-7' style={{background:'rgba(30,41,59,0.8)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)'}}>
          {/* Tab toggle */}
          <div className='flex gap-1 p-1 rounded-xl mb-6' style={{background:'#0F172A'}}>
            {['admin','doctor'].map(m => (
              <button key={m} onClick={() => { setMode(m); setEmail(''); setPassword('') }}
                className='flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all'
                style={mode===m ? {background:'#06B6D4',color:'#fff'} : {color:'#64748B'}}>
                {m === 'admin' ? '️ Admin' : '‍️ Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className='flex flex-col gap-4'>
            <div>
              <label className='block text-xs font-semibold mb-1.5' style={{color:'#94A3B8'}}>Email Address</label>
              <input type='email' required value={email} onChange={e=>setEmail(e.target.value)}
                placeholder={mode==='admin' ? 'admin@medimate.com' : 'doctor@medimate.com'}
                className='w-full px-4 py-3 text-sm'/>
            </div>
            <div>
              <label className='block text-xs font-semibold mb-1.5' style={{color:'#94A3B8'}}>Password</label>
              <input type='password' required value={password} onChange={e=>setPassword(e.target.value)}
                placeholder='••••••••' className='w-full px-4 py-3 text-sm'/>
            </div>
            <button type='submit' disabled={loading}
              className='w-full py-3.5 rounded-xl text-sm font-bold text-white mt-1 transition-all hover:opacity-90 disabled:opacity-50'
              style={{background:'linear-gradient(135deg,#06B6D4,#0284C7)'}}>
              {loading ? 'Signing in...' : `Sign in as ${mode==='admin'?'Admin':'Doctor'} →`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
