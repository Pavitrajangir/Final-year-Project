import React, { useState } from 'react'

const Contact = () => {
  const [sent, setSent] = useState(false)
  return (
    <div className='py-10 fade-up'>
      <div className='mb-10'>
        <h1 className='font-sora font-bold text-3xl text-slate-900 mb-2'>Contact Us</h1>
        <p className='text-slate-500 text-sm'>We're here to help. Reach out anytime.</p>
      </div>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Info */}
        <div className='flex flex-col gap-4 md:w-72'>
          {[
            { icon: <svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/><circle cx='12' cy='9' r='2.5'/></svg>, title:'Our Office', lines:['MediMate Health Tech Pvt. Ltd.', 'Tower B, 4th Floor, DLF Cyber City', 'Sector 24, Gurugram, Haryana 122022'] },
            { icon: <svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><path d='M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 10.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/></svg>, title:'Phone', lines:['+91 98765 43210', '+91 11 4567 8900'] },
            { icon: <svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>, title:'Email', lines:['care@medimate.in', 'support@medimate.in'] },
            { icon: <svg width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><polyline points='12,6 12,12 16,14'/></svg>, title:'Working Hours', lines:['Mon – Sat: 8:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 4:00 PM'] },
          ].map(({icon, title, lines}) => (
            <div key={title} className='bg-white border border-slate-200 rounded-xl p-5'>
              <div className='text-slate-500 mb-3'>{icon}</div>
              <p className='font-sora font-semibold text-slate-900 mb-1 text-sm'>{title}</p>
              {lines.map(l => <p key={l} className='text-slate-500 text-xs leading-relaxed'>{l}</p>)}
            </div>
          ))}
        </div>
        {/* Form */}
        <div className='flex-1 bg-white border border-slate-200 rounded-xl p-8'>
          <h3 className='font-sora font-bold text-slate-900 mb-6'>Send a Message</h3>
          {sent ? (
            <div className='text-center py-12'>
              <div className='w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='#059669' strokeWidth='2.5'><path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round'/></svg>
              </div>
              <p className='font-sora font-bold text-slate-900 mb-2'>Message Sent</p>
              <p className='text-slate-500 text-sm'>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <input placeholder='Your name' className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]'/>
                <input placeholder='Email address' className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]'/>
              </div>
              <input placeholder='Subject' className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]'/>
              <textarea rows={4} placeholder='Your message...' className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--primary)]'/>
              <button onClick={() => setSent(true)}
                className='bg-[var(--primary)] text-white font-semibold py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors text-sm'>
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Contact
