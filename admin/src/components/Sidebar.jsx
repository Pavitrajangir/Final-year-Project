import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext.jsx'

const ADMIN_LINKS = [
  { to:'/dashboard',    label:'Dashboard',    icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/></svg> },
  { to:'/appointments', label:'Appointments', icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='3' y1='10' x2='21' y2='10'/><line x1='8' y1='2' x2='8' y2='6' strokeLinecap='round'/><line x1='16' y1='2' x2='16' y2='6' strokeLinecap='round'/></svg> },
  { to:'/add-doctor',   label:'Add Doctor',   icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><circle cx='12' cy='12' r='9'/><line x1='12' y1='8' x2='12' y2='16' strokeLinecap='round'/><line x1='8' y1='12' x2='16' y2='12' strokeLinecap='round'/></svg> },
  { to:'/doctors-list', label:'Doctors',      icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><path strokeLinecap='round' strokeLinejoin='round' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'/></svg> },
]

const DOCTOR_LINKS = [
  { to:'/dashboard',    label:'Dashboard',    icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/></svg> },
  { to:'/appointments', label:'My Patients',  icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='3' y1='10' x2='21' y2='10'/><line x1='8' y1='2' x2='8' y2='6' strokeLinecap='round'/><line x1='16' y1='2' x2='16' y2='6' strokeLinecap='round'/></svg> },
  { to:'/profile',      label:'My Profile',   icon:<svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' strokeLinecap='round'/></svg> },
]

export default function Sidebar() {
  const { role, logout } = useContext(AdminContext)
  const navigate = useNavigate()
  const links = role === 'admin' ? ADMIN_LINKS : DOCTOR_LINKS

  return (
    <aside className='flex flex-col w-56 flex-shrink-0 py-5 px-3' style={{background:'#1E293B',borderRight:'1px solid rgba(255,255,255,0.05)'}}>
      {/* Logo */}
      <div className='flex items-center gap-2.5 px-3 mb-8'>
        <div className='w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg' style={{background:'linear-gradient(135deg,#06B6D4,#0284C7)'}}>️</div>
        <div>
          <p className='text-sm font-bold text-white' style={{fontFamily:'Plus Jakarta Sans'}}>MediMate</p>
          <p className='text-[10px]' style={{color:'#64748B'}}>{role==='admin'?'Admin Console':'Doctor Panel'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex flex-col gap-1 flex-1'>
        <p className='text-[10px] font-semibold px-3 mb-2 uppercase tracking-widest' style={{color:'#475569'}}>Navigation</p>
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className='mt-4 pt-4' style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <a href='http://localhost:5173' target='_blank' rel='noreferrer'
          className='nav-item mb-1'>
          <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.8'><path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6'/><polyline points='15,3 21,3 21,9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>
          User Panel
        </a>
        <button onClick={logout} className='nav-item w-full text-left' style={{color:'#EF4444'}}>
          <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='#EF4444' strokeWidth='1.8'><path d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'/></svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
