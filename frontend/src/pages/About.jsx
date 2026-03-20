import React from 'react'

const About = () => (
  <div className='py-10 fade-up'>
    <div className='mb-12'>
      <h1 className='font-sora font-bold text-3xl text-slate-900 mb-2'>About MediMate</h1>
      <p className='text-slate-500 max-w-xl'>Transforming healthcare access for every Indian family</p>
    </div>

    <div className='flex flex-col md:flex-row gap-10 mb-14 items-start'>
      <div className='w-56 h-56 bg-[var(--primary-light)] rounded-2xl flex items-center justify-center flex-shrink-0'>
        <svg width='80' height='80' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='1'>
          <rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/>
          <path d='M12 12v4M10 14h4' strokeLinecap='round' strokeWidth='1.5'/>
        </svg>
      </div>
      <div className='flex flex-col gap-5 text-slate-600 text-sm leading-relaxed'>
        <p>Welcome to MediMate — India's most trusted digital healthcare platform. We bridge the gap between patients and verified medical specialists across 50+ cities, making quality healthcare accessible to every Indian family.</p>
        <p>Founded with a vision to democratize healthcare access, MediMate has helped over 10,000 patients connect with top doctors for timely consultations, reducing wait times and improving health outcomes.</p>
        <div className='bg-[var(--primary-light)] border border-blue-200 rounded-xl p-5'>
          <h3 className='font-sora font-bold text-slate-900 mb-2 text-sm'>Our Vision</h3>
          <p>A healthier India where every citizen, regardless of location or income, has instant access to world-class medical care through technology.</p>
        </div>
      </div>
    </div>

    <h3 className='font-sora font-bold text-xl text-slate-900 mb-6'>Why Choose MediMate?</h3>
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {[
        {
          icon: <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='1.5'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2' strokeLinecap='round'/></svg>,
          title: 'Instant Booking',
          desc: 'Book appointments in under 60 seconds. No calls, no queues, no hassle.'
        },
        {
          icon: <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='1.5'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>,
          title: 'Verified Doctors',
          desc: 'Every doctor is credentialed, verified, and reviewed by real patients.'
        },
        {
          icon: <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='var(--primary)' strokeWidth='1.5'><circle cx='12' cy='12' r='10'/><path d='M12 8v4l3 3' strokeLinecap='round'/><path d='M8 3.5A9 9 0 0 1 21 12' strokeLinecap='round'/></svg>,
          title: 'AI Health Guide',
          desc: 'Get instant AI-powered health insights and personalised product safety checks.'
        },
      ].map(({icon, title, desc}) => (
        <div key={title} className='bg-white border border-slate-200 rounded-xl p-6'>
          <div className='mb-4'>{icon}</div>
          <h4 className='font-sora font-bold text-slate-900 mb-2 text-sm'>{title}</h4>
          <p className='text-slate-500 text-sm leading-relaxed'>{desc}</p>
        </div>
      ))}
    </div>
  </div>
)
export default About
