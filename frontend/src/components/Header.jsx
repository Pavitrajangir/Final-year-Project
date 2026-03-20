import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()
  return (
    <section className='bg-[var(--primary)] rounded-2xl mt-6 mb-2 overflow-hidden relative'>
      {/* Subtle background pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-0 right-0 w-80 h-80 rounded-full bg-white' style={{transform:'translate(30%,-30%)'}}/>
        <div className='absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white' style={{transform:'translate(-30%,30%)'}}/>
      </div>

      <div className='relative flex flex-col md:flex-row items-center gap-10 px-8 md:px-14 py-12 md:py-16'>
        {/* Left */}
        <div className='flex-1 text-center md:text-left'>
          <div className='inline-flex items-center gap-2 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-5'>
            <span className='w-1.5 h-1.5 bg-emerald-300 rounded-full'/>
            Verified Doctors Available Now
          </div>
          <h1 className='font-sora font-bold text-3xl md:text-5xl text-white leading-tight mb-4'>
            Quality Healthcare,<br/>
            <span className='text-blue-200'>At Your Fingertips</span>
          </h1>
          <p className='text-white/75 text-sm md:text-base leading-relaxed max-w-md mb-8'>
            Connect with India's top doctors. Book appointments, get AI-powered health insights, and manage your complete health journey in one place.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center md:justify-start'>
            <button onClick={() => document.getElementById('speciality')?.scrollIntoView({behavior:'smooth'})}
              className='bg-white text-[var(--primary)] font-semibold px-7 py-3 rounded-lg text-sm hover:bg-blue-50 transition-colors'>
              Book Appointment
            </button>
            <button onClick={() => navigate('/doctors')}
              className='border border-white/40 text-white font-medium px-7 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors'>
              Browse Doctors
            </button>
          </div>
        </div>

        {/* Right — stats */}
        <div className='flex gap-4 flex-shrink-0'>
          {[['15+', 'Specialists'], ['500+', 'Patients'], ['4.9', 'Avg Rating']].map(([val, lbl]) => (
            <div key={lbl} className='bg-white/15 border border-white/20 rounded-xl px-5 py-4 text-center'>
              <p className='font-sora font-bold text-white text-2xl'>{val}</p>
              <p className='text-white/65 text-xs mt-0.5'>{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default Header
