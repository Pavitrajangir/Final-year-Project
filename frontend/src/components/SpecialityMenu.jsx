import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets.js'

// SVG icons for each speciality — professional, no emojis
const SpecialityIcons = {
  'General physician': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <path d='M9 12h6M12 9v6' strokeLinecap='round'/>
      <circle cx='12' cy='12' r='9'/>
    </svg>
  ),
  'Gynecologist': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <circle cx='12' cy='8' r='4'/><path d='M12 12v8M9 17h6' strokeLinecap='round'/>
    </svg>
  ),
  'Dermatologist': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <path d='M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z'/><path d='M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4' strokeLinecap='round'/>
    </svg>
  ),
  'Pediatricians': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <circle cx='12' cy='7' r='3'/><path d='M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7' strokeLinecap='round'/>
    </svg>
  ),
  'Neurologist': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <path d='M12 2a7 7 0 0 1 7 7c0 4-2 6-3 8H8c-1-2-3-4-3-8a7 7 0 0 1 7-7z'/><path d='M9 21h6' strokeLinecap='round'/>
    </svg>
  ),
  'Gastroenterologist': (
    <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
      <path d='M8 3c0 5-4 5-4 10a8 8 0 0 0 16 0c0-5-4-5-4-10' strokeLinecap='round'/><path d='M12 3v2' strokeLinecap='round'/>
    </svg>
  ),
}

const COLORS = [
  { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: 'text-blue-600' },
  { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   icon: 'text-pink-600' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-600' },
  { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-700',   icon: 'text-teal-600' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
  { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-700',icon: 'text-emerald-600' },
]

const SpecialityMenu = () => (
  <section id='speciality' className='py-14'>
    <div className='mb-10'>
      <h2 className='font-sora font-bold text-2xl text-slate-900 mb-2'>Browse by Speciality</h2>
      <p className='text-slate-500 text-sm'>Select a speciality to find and book with the right doctor</p>
    </div>
    <div className='flex flex-wrap gap-3'>
      {specialityData.map((item, i) => {
        const c = COLORS[i % COLORS.length]
        return (
          <Link key={item.speciality} to={`/doctors/${item.speciality}`} onClick={() => window.scrollTo(0,0)}
            className={`card-hover flex items-center gap-3 px-5 py-4 rounded-xl border ${c.bg} ${c.border} group min-w-[160px]`}>
            <div className={`${c.icon} flex-shrink-0`}>
              {SpecialityIcons[item.speciality]}
            </div>
            <span className={`text-sm font-semibold ${c.text}`}>{item.speciality}</span>
          </Link>
        )
      })}
    </div>
  </section>
)
export default SpecialityMenu
