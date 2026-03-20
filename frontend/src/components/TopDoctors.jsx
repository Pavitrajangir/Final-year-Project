import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import DoctorCard from './DoctorCard.jsx'

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

const TopDoctors = () => {
  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()
  const loading = doctors.length === 0

  return (
    <section className='py-10'>
      <div className='flex items-end justify-between mb-8'>
        <div>
          <h2 className='font-sora font-bold text-2xl text-slate-900 mb-1'>Top Specialists</h2>
          <p className='text-slate-500 text-sm'>Trusted by patients across India</p>
        </div>
        <button onClick={() => { navigate('/doctors'); window.scrollTo(0,0) }}
          className='hidden sm:flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] border border-[var(--primary)]/30 px-4 py-2 rounded-lg hover:bg-[var(--primary-light)] transition-colors'>
          View all
          <svg width='14' height='14' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2.5'><path d='M9 18l6-6-6-6'/></svg>
        </button>
      </div>

      <div className='grid grid-cols-auto gap-4'>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <DoctorCardSkeleton key={i} />)
          : doctors.slice(0, 10).map(doc => <DoctorCard key={doc._id} doc={doc}/>)
        }
      </div>

      <div className='flex justify-center mt-8'>
        <button onClick={() => { navigate('/doctors'); window.scrollTo(0,0) }}
          className='sm:hidden bg-[var(--primary)] text-white text-sm font-semibold px-8 py-3 rounded-lg'>
          View all doctors
        </button>
      </div>
    </section>
  )
}
export default TopDoctors