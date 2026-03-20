import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import DoctorCard from '../components/DoctorCard.jsx'
import { specialityData } from '../assets/assets.js'
import { SymptomCheckerFloat } from '../components/SymptomChecker.jsx'

// Skeleton card matching DoctorCard dimensions
const DoctorCardSkeleton = () => (
  <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
    <div className='h-44 shimmer-light' />
    <div className='p-4 flex flex-col gap-2'>
      <div className='h-4 w-3/4 rounded shimmer-light' />
      <div className='h-3 w-1/2 rounded shimmer-light' />
      <div className='h-3 w-1/3 rounded shimmer-light mt-1' />
      <div className='h-8 rounded-lg shimmer-light mt-2' />
    </div>
  </div>
)

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const [filtered, setFiltered] = useState([])
  const [search,   setSearch]   = useState('')
  const [ready,    setReady]    = useState(false)

  // Reflect doctors loading state — doctors array starts empty
  useEffect(() => {
    if (doctors.length > 0) setReady(true)
    // Also set ready after 1.5s even if no doctors (empty state)
    const t = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(t)
  }, [doctors])

  useEffect(() => {
    let list = speciality ? doctors.filter(d => d.speciality === speciality) : doctors
    if (search) list = list.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }, [doctors, speciality, search])

  const toggle = (sp) => { navigate(speciality === sp ? '/doctors' : `/doctors/${sp}`); window.scrollTo(0,0) }

  return (
    <div className='py-8 fade-up'>
      <div className='mb-8'>
        <h1 className='font-sora font-bold text-2xl text-slate-900 mb-1'>Find a Doctor</h1>
        <p className='text-slate-500 text-sm'>Browse verified specialists and book instant appointments</p>
      </div>

      {/* Search */}
      <div className='relative mb-6'>
        <svg className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
          <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder='Search by doctor name or speciality...'
          className='w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] bg-white'/>
      </div>

      <div className='flex flex-col sm:flex-row gap-6'>

        {/* Sidebar */}
        <aside className='sm:w-56 flex-shrink-0 flex flex-col gap-3'>
          <SymptomCheckerFloat />
          <div className='border-t border-slate-200 pt-3'>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1'>Specialities</p>
            <div className='flex flex-row sm:flex-col gap-2 overflow-x-auto pb-2 sm:pb-0'>
              <button onClick={() => { navigate('/doctors'); setSearch('') }}
                className={`flex-shrink-0 text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${!speciality ? 'bg-[var(--primary)] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--primary)]/40'}`}>
                All Doctors
              </button>
              {specialityData.map(item => (
                <button key={item.speciality} onClick={() => toggle(item.speciality)}
                  className={`flex-shrink-0 text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${speciality === item.speciality ? 'bg-[var(--primary)] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--primary)]/40'}`}>
                  {item.speciality}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Doctor grid */}
        <section className='flex-1'>
          {!ready ? (
            <div className='grid grid-cols-auto gap-4'>
              {Array.from({ length: 6 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-20 text-slate-400 bg-white rounded-xl border border-slate-200'>
              <svg width='36' height='36' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
                <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
              </svg>
              <p className='text-sm'>No doctors found. Try a different search or speciality.</p>
            </div>
          ) : (
            <>
              <p className='text-xs text-slate-400 mb-4'>
                {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
                {speciality ? ` in ${speciality}` : ''}
              </p>
              <div className='grid grid-cols-auto gap-4'>
                {filtered.map(doc => <DoctorCard key={doc._id} doc={doc}/>)}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
export default Doctors