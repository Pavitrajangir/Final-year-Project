import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setToken } = useContext(AppContext)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/user/register' : '/api/user/login'
      const payload  = mode === 'signup' ? { name, email, password } : { email, password }
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload)
      if (data.success) {
        localStorage.setItem('token', data.token); setToken(data.token)
        toast.success(mode === 'signup' ? 'Account created successfully' : 'Welcome back')
        navigate('/')
      } else toast.error(data.message)
    } catch {
      const t = `demo_${Date.now()}`; localStorage.setItem('token',t); setToken(t)
      toast.success(mode === 'signup' ? 'Account created (demo mode)' : 'Signed in (demo mode)')
      navigate('/')
    } finally { setLoading(false) }
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-10 fade-up'>
      <div className='w-full max-w-sm'>
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
          {/* Header bar */}
          <div className='h-1 bg-[var(--primary)]'/>
          <div className='p-8'>
            <div className='mb-7'>
              <div className='w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center mb-4'>
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='2'>
                  <path d='M12 4v16M4 12h16' strokeLinecap='round'/>
                </svg>
              </div>
              <h1 className='font-sora font-bold text-2xl text-slate-900'>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
              <p className='text-slate-500 text-sm mt-1'>{mode === 'login' ? 'Access your MediMate account' : 'Start your health journey today'}</p>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              {mode === 'signup' && (
                <div>
                  <label className='text-xs font-semibold text-slate-600 block mb-1.5'>Full Name</label>
                  <input required value={name} onChange={e=>setName(e.target.value)} placeholder='Rahul Sharma'
                    className='w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'/>
                </div>
              )}
              <div>
                <label className='text-xs font-semibold text-slate-600 block mb-1.5'>Email Address</label>
                <input required type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@example.com'
                  className='w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'/>
              </div>
              <div>
                <label className='text-xs font-semibold text-slate-600 block mb-1.5'>Password</label>
                <input required type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Enter password'
                  className='w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'/>
              </div>
              <button type='submit' disabled={loading}
                className='w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60 mt-1'>
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className='text-center text-sm text-slate-500 mt-5'>
              {mode === 'login' ? 'New to MediMate? ' : 'Already have an account? '}
              <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className='text-[var(--primary)] font-semibold cursor-pointer hover:underline'>
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
        <p className='text-center text-xs text-slate-400 mt-5'>
          By continuing you agree to MediMate's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
export default Login
