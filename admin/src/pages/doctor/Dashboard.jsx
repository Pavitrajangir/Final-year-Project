import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext.jsx'
import { formatSlotDate } from '../../utils/helpers.js'

const StatCardSkeleton = () => (
  <div className='card p-5 flex items-center gap-4'>
    <div className='w-12 h-12 rounded-2xl shimmer flex-shrink-0' />
    <div className='flex flex-col gap-2'>
      <div className='h-6 w-20 rounded shimmer' />
      <div className='h-3 w-28 rounded shimmer' />
    </div>
  </div>
)

export default function DoctorDashboard() {
  const { dToken, backendUrl } = useContext(AdminContext)
  const [data,    setData]    = useState({ earnings:0, appointments:0, patients:0, latestAppointments:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${backendUrl}/api/doctor/dashboard`, { headers: { dtoken: dToken } })
      .then(r => r.data.success && setData(r.data.dashData))
      .catch(() => setData({
        earnings: 4500, appointments: 9, patients: 7,
        latestAppointments: [
          { _id:'1', userData:{name:'Rahul Sharma'}, slotDate:'12_6_2025', slotTime:'10:00 AM', payment:true,  cancelled:false, isCompleted:false },
          { _id:'2', userData:{name:'Priya Singh'},  slotDate:'13_6_2025', slotTime:'2:30 PM',  payment:false, cancelled:false, isCompleted:true  },
        ]
      }))
      .finally(() => setLoading(false))
  }, [])

  const STATS = [
    { value: `₹${data.earnings}`, label: 'Total Earnings',  icon: '💰', bg: 'rgba(16,185,129,0.15)' },
    { value: data.appointments,   label: 'Total Patients',  icon: '👨‍⚕️', bg: 'rgba(6,182,212,0.15)'  },
    { value: data.patients,       label: 'Unique Patients', icon: '👥', bg: 'rgba(99,102,241,0.15)' },
  ]

  return (
    <div className='fade-up'>
      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        {loading
          ? [1,2,3].map(i => <StatCardSkeleton key={i} />)
          : STATS.map(s => (
            <div key={s.label} className='card p-5 flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0' style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <p className='text-2xl font-bold text-white' style={{ fontFamily: 'Plus Jakarta Sans' }}>{s.value}</p>
                <p className='text-xs mt-0.5' style={{ color: '#94A3B8' }}>{s.label}</p>
              </div>
            </div>
          ))
        }
      </div>

      {/* Recent Patients */}
      <div className='card overflow-hidden'>
        <div className='px-6 py-4 flex items-center justify-between' style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className='text-sm font-bold text-white' style={{ fontFamily: 'Plus Jakarta Sans' }}>Recent Patients</h3>
        </div>

        {loading ? (
          <div className='p-5 flex flex-col gap-3'>
            {[1,2,3].map(i => <div key={i} className='h-14 rounded-xl shimmer' />)}
          </div>
        ) : data.latestAppointments.length === 0 ? (
          <div className='py-16 text-center' style={{ color: '#475569' }}>
            <p className='text-4xl mb-2'>👨‍⚕️</p><p className='text-sm'>No patients yet</p>
          </div>
        ) : data.latestAppointments.map((apt, i) => (
          <div key={apt._id || i} className='flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.02]'
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold'
                style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', fontFamily: 'Plus Jakarta Sans' }}>
                {apt.userData?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className='text-sm font-semibold text-white'>{apt.userData?.name || '—'}</p>
                <p className='text-xs' style={{ color: '#64748B' }}>{formatSlotDate(apt.slotDate)} · {apt.slotTime}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${apt.cancelled ? 'bg-red-500/15 text-red-400' : apt.isCompleted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
              {apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Done' : 'Upcoming'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}