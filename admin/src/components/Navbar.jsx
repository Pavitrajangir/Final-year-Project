import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext.jsx'

/**
 * Navbar — top bar shown after login.
 * Matches screenshot: Logo left | Admin + User Panel buttons center-left | Logout right
 */
const Navbar = () => {
  const { role, logout } = useContext(AdminContext)
  const navigate = useNavigate()

  const frontendUrl = 'http://localhost:5173'

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50'>

      {/* Left — Logo + panel toggle buttons */}
      <div className='flex items-center gap-4'>
        {/* Logo */}
        <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate('/dashboard')}>
          <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl'>
            ️
          </div>
          <span className='font-bold text-lg text-gray-800'>MediMate</span>
        </div>

        {/* Panel mode pills — matching screenshot */}
        <div className='flex items-center gap-2 ml-2'>
          <span className='px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-600 font-medium cursor-default'>
            {role === 'admin' ? 'Admin' : 'Doctor'}
          </span>
          <a
            href={frontendUrl}
            target='_blank'
            rel='noreferrer'
            className='px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-indigo-600 transition-colors'
          >
            User Panel
          </a>
        </div>
      </div>

      {/* Right — Logout */}
      <button
        onClick={logout}
        className='bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold
                   hover:bg-indigo-600 transition-colors'
      >
        Logout
      </button>
    </header>
  )
}

export default Navbar
