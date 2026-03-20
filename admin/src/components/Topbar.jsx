import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext.jsx'

const TITLES = {
  '/dashboard':'Dashboard','/appointments':'Appointments',
  '/add-doctor':'Add Doctor','/doctors-list':'All Doctors','/profile':'My Profile',
  '/':'Dashboard',
}

export default function Topbar() {
  const { role, aToken, dToken } = useContext(AdminContext)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Dashboard'

  return (
    <header className='flex items-center justify-between px-6 py-4 flex-shrink-0' style={{background:'#1E293B',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div>
        <h2 className='text-base font-bold text-white' style={{fontFamily:'Plus Jakarta Sans'}}>{title}</h2>
        <p className='text-xs mt-0.5' style={{color:'#64748B'}}>{role==='admin'?'Administrator':'Doctor'} • MediMate</p>
      </div>
      <div className='flex items-center gap-3'>
        <span className='text-xs px-3 py-1.5 rounded-full font-semibold' style={role==='admin'?{background:'rgba(6,182,212,0.15)',color:'#06B6D4'}:{background:'rgba(16,185,129,0.15)',color:'#10B981'}}>
          {role==='admin'?'️ Admin':'‍️ Doctor'}
        </span>
        <div className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold' style={{background:'linear-gradient(135deg,#06B6D4,#0284C7)',color:'#fff'}}>
          {role==='admin'?'A':'D'}
        </div>
      </div>
    </header>
  )
}
