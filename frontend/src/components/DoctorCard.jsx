import React from 'react'
import { useNavigate } from 'react-router-dom'

const DoctorCard = ({ doc }) => {
  const navigate = useNavigate()
  return (
    <div onClick={() => { navigate(`/appointment/${doc._id}`); window.scrollTo(0,0) }}
      className='card-hover bg-white rounded-xl overflow-hidden cursor-pointer border border-slate-200 group'>
      {/* Photo */}
      <div className='relative h-44 bg-slate-100 overflow-hidden'>
        {doc.image ? (
          <img src={doc.image} alt={doc.name}
            className='w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500'
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
        ) : null}
        <div className='w-full h-full flex items-center justify-center bg-slate-100' style={{display: doc.image ? 'none' : 'flex'}}>
          <svg width='48' height='48' fill='none' viewBox='0 0 24 24' stroke='#94a3b8' strokeWidth='1'>
            <circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 3.6-7 8-7s8 3 8 7'/>
          </svg>
        </div>
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
          ${doc.available ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${doc.available ? 'bg-white' : 'bg-slate-300'}`}/>
          {doc.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
      {/* Info */}
      <div className='p-4'>
        <p className='font-sora font-semibold text-slate-900 text-sm leading-tight'>{doc.name}</p>
        <p className='text-xs text-slate-500 mt-0.5'>{doc.speciality}</p>
        <div className='flex items-center justify-between mt-3 pt-3 border-t border-slate-100'>
          <span className='text-xs text-slate-400'>{doc.experience}</span>
          <span className='text-sm font-semibold text-[var(--primary)]'>&#8377;{doc.fees}</span>
        </div>
      </div>
    </div>
  )
}
export default DoctorCard
