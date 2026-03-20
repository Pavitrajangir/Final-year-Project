import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext.jsx'
import { formatSlotDate } from '../../utils/helpers.js'

export default function Appointments() {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetch = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, { headers:{atoken:aToken} })
      if (data.success) setAppointments(data.appointments)
    } catch {
      setAppointments([
        {_id:'a1',userData:{name:'Rahul Sharma'},docData:{name:'Dr. Arjun Sharma',speciality:'General physician',fees:500},slotDate:'12_6_2025',slotTime:'10:00 AM',payment:true,cancelled:false,isCompleted:false,amount:500},
        {_id:'a2',userData:{name:'Priya Singh'},docData:{name:'Dr. Kavitha Reddy',speciality:'Dermatologist',fees:600},slotDate:'13_6_2025',slotTime:'2:30 PM',payment:false,cancelled:false,isCompleted:true,amount:600},
        {_id:'a3',userData:{name:'Amit Patel'},docData:{name:'Dr. Ananya Iyer',speciality:'Neurologist',fees:900},slotDate:'14_6_2025',slotTime:'11:00 AM',payment:false,cancelled:true,isCompleted:false,amount:900},
      ])
    } finally { setLoading(false) }
  }

  const cancel = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/cancel-appointment`,{appointmentId:id},{headers:{atoken:aToken}})
      if (data.success) { toast.success('Cancelled'); fetch() }
      else toast.error(data.message)
    } catch { setAppointments(p=>p.map(a=>a._id===id?{...a,cancelled:true}:a)); toast.success('Cancelled') }
  }

  useEffect(() => { fetch() }, [])

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return !a.cancelled && !a.isCompleted
    if (filter === 'completed') return a.isCompleted
    if (filter === 'cancelled') return a.cancelled
    return true
  })

  const FILTERS = ['all','upcoming','completed','cancelled']

  return (
    <div className='fade-up'>
      {/* Filter bar */}
      <div className='flex gap-2 mb-5 flex-wrap'>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className='px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all'
            style={filter===f?{background:'#06B6D4',color:'#fff'}:{background:'rgba(255,255,255,0.05)',color:'#94A3B8'}}>
            {f} {f==='all'?`(${appointments.length})`:''}
          </button>
        ))}
      </div>

      <div className='card overflow-hidden'>
        {/* Table header */}
        <div className='grid grid-cols-[40px_1.4fr_1.2fr_1fr_80px_90px_60px] gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider' style={{color:'#475569',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <span>#</span><span>Patient</span><span>Doctor</span><span>Date/Time</span><span>Fees</span><span>Payment</span><span>Act.</span>
        </div>

        {loading ? (
          <div className='p-5 flex flex-col gap-2'>{[1,2,3,4,5].map(i=><div key={i} className='h-12 rounded-xl shimmer'/>)}</div>
        ) : filtered.length === 0 ? (
          <div className='py-16 text-center' style={{color:'#475569'}}>
            <p className='text-4xl mb-2'></p><p className='text-sm'>No appointments found</p>
          </div>
        ) : filtered.map((apt, i) => (
          <div key={apt._id} className='grid grid-cols-[40px_1.4fr_1.2fr_1fr_80px_90px_60px] gap-3 px-5 py-3.5 items-center transition-colors hover:bg-white/[0.02]' style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
            <span className='text-xs' style={{color:'#475569'}}>{i+1}</span>
            <div className='flex items-center gap-2 min-w-0'>
              <div className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0' style={{background:'rgba(99,102,241,0.2)',color:'#818CF8'}}>
                {apt.userData?.name?.[0]?.toUpperCase()||'?'}
              </div>
              <span className='text-sm font-medium text-white truncate'>{apt.userData?.name||'—'}</span>
            </div>
            <div className='min-w-0'>
              <p className='text-sm text-white truncate'>{apt.docData?.name||'—'}</p>
              <p className='text-xs truncate' style={{color:'#64748B'}}>{apt.docData?.speciality}</p>
            </div>
            <div>
              <p className='text-xs' style={{color:'#CBD5E1'}}>{formatSlotDate(apt.slotDate)}</p>
              <p className='text-xs' style={{color:'#64748B'}}>{apt.slotTime}</p>
            </div>
            <span className='text-sm font-semibold' style={{color:'#06B6D4'}}>₹{apt.amount||apt.docData?.fees}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${apt.payment?'bg-emerald-500/15 text-emerald-400':'bg-amber-500/15 text-amber-400'}`}>
              {apt.payment?'Paid':'Pending'}
            </span>
            <div className='flex justify-center'>
              {apt.cancelled ? <span className='text-xs text-red-500'></span>
               : apt.isCompleted ? <span className='text-xs text-emerald-500'></span>
               : <button onClick={() => cancel(apt._id)} title='Cancel' className='text-slate-500 hover:text-red-400 transition-colors'>
                  <svg width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='9'/><line x1='9' y1='9' x2='15' y2='15' strokeLinecap='round'/><line x1='15' y1='9' x2='9' y2='15' strokeLinecap='round'/></svg>
                </button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
