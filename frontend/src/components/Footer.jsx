import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  return (
    <footer className='bg-slate-900 text-slate-400 mt-16 rounded-t-2xl'>
      <div className='max-w-7xl mx-auto px-8 pt-12 pb-8'>
        <div className='flex flex-wrap gap-12 mb-10'>
          <div className='max-w-xs'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center'>
                <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                  <path d='M12 4v16M4 12h16' stroke='white' strokeWidth='2.5' strokeLinecap='round'/>
                </svg>
              </div>
              <span className='font-sora font-bold text-base text-white'>Medi<span className='text-[var(--primary)]'>Mate</span></span>
            </div>
            <p className='text-sm leading-relaxed'>India's trusted healthcare platform connecting patients with verified specialists across 50+ cities.</p>
          </div>
          <div>
            <p className='font-sora font-semibold text-white mb-4 text-sm'>Navigation</p>
            <ul className='flex flex-col gap-2 text-sm'>
              {[['/', 'Home'], ['/doctors', 'Find Doctors'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([path, label]) => (
                <li key={path} onClick={() => navigate(path)} className='hover:text-white cursor-pointer transition-colors'>{label}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className='font-sora font-semibold text-white mb-4 text-sm'>Specialities</p>
            <ul className='flex flex-col gap-2 text-sm'>
              {['General Physician','Gynecologist','Dermatologist','Neurologist','Pediatricians'].map(s => (
                <li key={s} className='hover:text-white cursor-pointer transition-colors'>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className='font-sora font-semibold text-white mb-4 text-sm'>Contact</p>
            <ul className='flex flex-col gap-2 text-sm'>
              <li>+91 98765 43210</li>
              <li>care@medimate.in</li>
              <li className='leading-relaxed'>Connaught Place,<br/>New Delhi</li>
            </ul>
          </div>
        </div>
        <div className='border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs'>
          <p>© {new Date().getFullYear()} MediMate Health Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Privacy Policy · Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}
export default Footer
