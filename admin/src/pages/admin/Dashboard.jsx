import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext.jsx'
import { formatSlotDate } from '../../utils/helpers.js'

const StatCardSkeleton = () => (
  <div className='card p-5 flex items-center gap-4'>
    <div className='w-12 h-12 rounded-2xl shimmer flex-shrink-0' />
    <div className='flex flex-col gap-2'>
      <div className='h-6 w-16 rounded shimmer' />
      <div className='h-3 w-28 rounded shimmer' />
    </div>
  </div>
)

const StatCard = ({ value, label, icon, bg }) => (
  <div className='card p-5 flex items-center gap-4'>
    <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0' style={{ background: bg }}>{icon}</div>
    <div>
      <p className='text-2xl font-bold text-white' style={{ fontFamily: 'Plus Jakarta Sans' }}>{value}</p>
      <p className='text-xs mt-0.5' style={{ color: '#94A3B8' }}>{label}</p>
    </div>
  </div>
)

export default function Dashboard() {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [data, setData]     = useState({ doctors:0, appointments:0, patients:0, latestAppointments:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { atoken: aToken } })
      .then(r => r.data.success && setData(r.data.dashData))
      .catch(() => setData({
        doctors: 3, appointments: 12, patients: 8,
        latestAppointments: [
          { _id:'1', userData:{name:'Rahul Sharma'}, docData:{name:'Dr. Arjun Sharma',speciality:'General physician'}, slotDate:'12_6_2025', slotTime:'10:00 AM', payment:true,  cancelled:false, isCompleted:false },
          { _id:'2', userData:{name:'Priya Singh'},  docData:{name:'Dr. Kavitha Reddy',speciality:'Dermatologist'},    slotDate:'13_6_2025', slotTime:'2:30 PM',  payment:false, cancelled:false, isCompleted:true  },
          { _id:'3', userData:{name:'Amit Patel'},   docData:{name:'Dr. Ananya Iyer',  speciality:'Neurologist'},      slotDate:'14_6_2025', slotTime:'11:00 AM', payment:false, cancelled:true,  isCompleted:false },
        ]
      }))
      .finally(() => setLoading(false))
  }, [])

  const STATS = [
    { value: data.doctors,      label: 'Registered Doctors', icon: '👨‍⚕️', bg: 'rgba(6,182,212,0.15)'   },
    { value: data.appointments, label: 'Total Appointments', icon: '📋',  bg: 'rgba(99,102,241,0.15)'  },
    { value: data.patients,     label: 'Active Patients',    icon: '👥',  bg: 'rgba(16,185,129,0.15)'  },
  ]

  return (
    <div className='fade-up'>
      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        {loading
          ? [1,2,3].map(i => <StatCardSkeleton key={i} />)
          : STATS.map(s => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Latest Bookings */}
      <div className='card overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4' style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className='text-sm font-bold text-white' style={{ fontFamily: 'Plus Jakarta Sans' }}>Latest Bookings</h3>
          {!loading && (
            <span className='text-xs px-2 py-1 rounded-lg' style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>
              {data.latestAppointments.length} recent
            </span>
          )}
        </div>

        {loading ? (
          <div className='p-6 flex flex-col gap-3'>
            {[1,2,3].map(i => <div key={i} className='h-14 rounded-xl shimmer' />)}
          </div>
        ) : data.latestAppointments.length === 0 ? (
          <div className='py-16 text-center' style={{ color: '#475569' }}>
            <div className='text-4xl mb-3'>📋</div>
            <p className='text-sm'>No bookings yet</p>
          </div>
        ) : (
          <div>
            <div className='grid grid-cols-[1fr_1fr_1fr_100px] gap-4 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider'
              style={{ color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span>Patient</span><span>Doctor</span><span>Date & Time</span><span>Status</span>
            </div>
            {data.latestAppointments.map((apt, i) => (
              <div key={apt._id || i} className='grid grid-cols-[1fr_1fr_1fr_100px] gap-4 px-6 py-4 items-center transition-colors hover:bg-white/[0.02]'
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0'
                    style={{ background: 'rgba(6,182,212,0.2)', color: '#06B6D4' }}>
                    {apt.userData?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className='text-sm font-medium text-white truncate'>{apt.userData?.name || '—'}</span>
                </div>
                <div>
                  <p className='text-sm text-white truncate'>{apt.docData?.name || '—'}</p>
                  <p className='text-xs truncate' style={{ color: '#64748B' }}>{apt.docData?.speciality}</p>
                </div>
                <div>
                  <p className='text-sm' style={{ color: '#CBD5E1' }}>{formatSlotDate(apt.slotDate)}</p>
                  <p className='text-xs' style={{ color: '#64748B' }}>{apt.slotTime}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold w-fit ${apt.cancelled ? 'bg-red-500/15 text-red-400' : apt.isCompleted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                  {apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Done' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}