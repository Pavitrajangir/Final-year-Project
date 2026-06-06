import React, { useContext, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const { token, setToken, userData, adminUrl } = useContext(AppContext)

  const isHome = location.pathname === '/'
  const logout = () => { localStorage.removeItem('token'); setToken(''); navigate('/login') }
  // const openAdmin = () => window.open(adminUrl || 'https://final-year-project-dts8.vercel.app', '_blank')
  const openAdmin = () => {
  window.open(import.meta.env.VITE_ADMIN_URL, '_blank');
};

  return (
    <nav className='sticky top-0 z-50 bg-white border-b border-slate-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16'>

        {/* Logo */}
        <div onClick={() => navigate('/')} className='flex items-center gap-2.5 cursor-pointer select-none'>
          <div className='w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center'>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
              <path d='M12 4v16M4 12h16' stroke='white' strokeWidth='2.5' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-sora font-bold text-lg text-slate-900'>Medi<span className='text-[var(--primary)]'>Mate</span></span>
        </div>

        {/* Desktop links */}
        <ul className='hidden md:flex items-center gap-7 text-sm font-medium text-slate-600'>
          {[['/', 'Home'], ['/doctors', 'Doctors'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
            <li key={path}>
              <NavLink to={path} className={({ isActive }) =>
                `transition-colors hover:text-[var(--primary)] ${isActive ? 'text-[var(--primary)]' : ''}`
              }>{label}</NavLink>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className='flex items-center gap-2'>
          {isHome && !token && (
            <button onClick={openAdmin}
              className='hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-300 px-3 py-1.5 rounded-md hover:border-slate-400 transition-colors'>
              <svg width='13' height='13' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                <rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/>
                <rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/>
              </svg>
              Admin
            </button>
          )}

          {token && userData ? (
            <div className='relative'>
              <button onClick={() => setDropOpen(!dropOpen)}
                className='flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 transition-colors bg-white'>
                <div className='w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold font-sora'>
                  {userData?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className='hidden sm:block text-sm font-medium text-slate-700 max-w-[90px] truncate'>{userData?.name?.split(' ')[0]}</span>
                <svg width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2.5'><path d='M6 9l6 6 6-6'/></svg>
              </button>
              {dropOpen && (
                <div className='absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg w-48 py-1 z-50'>
                  <p onClick={() => { navigate('/my-profile'); setDropOpen(false) }}
                    className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer'>
                    <svg width='15' height='15' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 3.6-7 8-7s8 3 8 7'/></svg>
                    My Profile
                  </p>
                  <p onClick={() => { navigate('/my-appointments'); setDropOpen(false) }}
                    className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer'>
                    <svg width='15' height='15' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='3' y1='10' x2='21' y2='10'/><line x1='8' y1='2' x2='8' y2='6' strokeLinecap='round'/><line x1='16' y1='2' x2='16' y2='6' strokeLinecap='round'/></svg>
                    My Appointments
                  </p>
                  <div className='my-1 border-t border-slate-100'/>
                  <p onClick={() => { logout(); setDropOpen(false) }}
                    className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer'>
                    <svg width='15' height='15' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><path d='M17 16l4-4m0 0l-4-4m4 4H7'/><path d='M3 12H7' strokeLinecap='round'/></svg>
                    Sign Out
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')}
              className='hidden md:block bg-[var(--primary)] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors'>
              Sign In
            </button>
          )}

          <button onClick={() => setMenuOpen(true)} className='md:hidden text-slate-600 p-1'>
            <svg width='22' height='22' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className='fixed inset-0 bg-white z-50 flex flex-col'>
          <div className='flex justify-between items-center px-6 py-4 border-b border-slate-100'>
            <span className='font-sora font-bold text-lg text-slate-900'>Medi<span className='text-[var(--primary)]'>Mate</span></span>
            <button onClick={() => setMenuOpen(false)}>
              <svg width='22' height='22' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>
            </button>
          </div>
          <div className='flex flex-col p-6 gap-1'>
            {[['/', 'Home'], ['/doctors', 'All Doctors'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
              <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}
                className='py-3 px-4 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm'>
                {label}
              </NavLink>
            ))}
            {!token && (
              <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
                className='mt-4 bg-[var(--primary)] text-white py-3 rounded-lg font-semibold text-sm'>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
export default Navbar
