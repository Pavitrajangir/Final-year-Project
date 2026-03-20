import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate()
  return (
    <section className='bg-slate-900 rounded-2xl my-14 px-8 md:px-14 py-12 relative overflow-hidden'>
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-0 right-0 w-72 h-72 rounded-full bg-white' style={{transform:'translate(25%,-25%)'}}/>
      </div>
      <div className='relative flex flex-col md:flex-row items-center justify-between gap-8'>
        <div>
          <p className='text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3'>Get Started Today</p>
          <h2 className='font-sora font-bold text-2xl md:text-3xl text-white mb-3 leading-snug'>
            Your Health Journey<br/>Begins Here
          </h2>
          <p className='text-slate-400 text-sm mb-6 max-w-sm'>
            Join thousands of patients who trust MediMate for seamless, reliable healthcare access across India.
          </p>
          <button onClick={() => { navigate('/login'); window.scrollTo(0,0) }}
            className='bg-[var(--primary)] text-white font-semibold px-7 py-3 rounded-lg text-sm hover:bg-[var(--primary-dark)] transition-colors'>
            Create Free Account
          </button>
        </div>
        <div className='flex gap-4'>
          {[['10k+', 'Happy Patients'], ['50+', 'Cities'], ['100%', 'Verified']].map(([val, lbl]) => (
            <div key={lbl} className='border border-slate-700 rounded-xl px-5 py-4 text-center'>
              <p className='font-sora font-bold text-white text-xl'>{val}</p>
              <p className='text-slate-500 text-xs mt-0.5'>{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default Banner
