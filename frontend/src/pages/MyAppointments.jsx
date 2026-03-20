import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import { formatSlotDate } from '../assets/assets.js'

const AppointmentRowSkeleton = () => (
  <div className='bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4 items-start'>
    <div className='w-14 h-14 rounded-lg shimmer-light flex-shrink-0' />
    <div className='flex-1 flex flex-col gap-2'>
      <div className='flex justify-between'>
        <div className='flex flex-col gap-1.5'>
          <div className='h-4 w-40 rounded shimmer-light' />
          <div className='h-3 w-28 rounded shimmer-light' />
        </div>
        <div className='h-6 w-20 rounded-md shimmer-light' />
      </div>
      <div className='flex gap-4 mt-2'>
        <div className='h-3 w-24 rounded shimmer-light' />
        <div className='h-3 w-16 rounded shimmer-light' />
        <div className='h-3 w-20 rounded shimmer-light' />
      </div>
    </div>
    <div className='flex flex-col gap-2 min-w-[130px]'>
      <div className='h-9 rounded-lg shimmer-light' />
      <div className='h-9 rounded-lg shimmer-light' />
    </div>
  </div>
)

const StatusBadge = ({ apt }) => {
  if (apt.cancelled)   return <span className='text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md font-medium'>Cancelled</span>
  if (apt.isCompleted) return <span className='text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-medium'>Completed</span>
  if (apt.payment)     return <span className='text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-medium'>Paid</span>
  return <span className='text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md font-medium'>Awaiting Payment</span>
}

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [payingId,     setPayingId]     = useState('')
  const [cancellingId, setCancellingId] = useState('')

  const fetchApts = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/appointments`,{},{headers:{token}})
      if (data.success) setAppointments(data.appointments.reverse())
    } catch {
      setAppointments([
        {_id:'d1',docData:{name:'Dr. Arjun Sharma',speciality:'General physician',address:{line1:'Connaught Place',line2:'New Delhi'},fees:500},slotDate:'15_6_2025',slotTime:'10:00 AM',payment:true,isCompleted:false,cancelled:false},
        {_id:'d2',docData:{name:'Dr. Kavitha Reddy',speciality:'Dermatologist',address:{line1:'Indiranagar',line2:'Bengaluru'},fees:600},slotDate:'18_6_2025',slotTime:'2:30 PM',payment:false,isCompleted:true,cancelled:false},
      ])
    } finally { setLoading(false) }
  }

  const cancel = async (id) => {
    setCancellingId(id)
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`,{appointmentId:id},{headers:{token}})
      if (data.success) { toast.success(data.message); fetchApts(); getDoctorsData() }
      else toast.error(data.message)
    } catch {
      setAppointments(p => p.map(a => a._id === id ? {...a, cancelled:true} : a))
      toast.success('Appointment cancelled')
    } finally { setCancellingId('') }
  }

  const pay = (id) => {
    setAppointments(p => p.map(a => a._id === id ? {...a, payment:true} : a))
    setPayingId('')
    toast.success('Payment successful')
  }

  useEffect(() => { fetchApts() }, [token])

  return (
    <div className='py-8 fade-up'>
      <h1 className='font-sora font-bold text-2xl text-slate-900 mb-8'>My Appointments</h1>

      {loading ? (
        <div className='flex flex-col gap-3'>
          {[1,2,3].map(i => <AppointmentRowSkeleton key={i} />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className='flex flex-col items-center gap-3 py-24 text-slate-400 bg-white rounded-xl border border-slate-200'>
          <svg width='40' height='40' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.5'>
            <rect x='3' y='4' width='18' height='18' rx='2'/><line x1='3' y1='10' x2='21' y2='10'/>
            <line x1='8' y1='2' x2='8' y2='6' strokeLinecap='round'/><line x1='16' y1='2' x2='16' y2='6' strokeLinecap='round'/>
          </svg>
          <p className='font-sora font-semibold text-slate-600'>No appointments yet</p>
          <p className='text-sm text-slate-400'>Book your first appointment with a specialist</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {appointments.map(apt => {
            const doc = apt.docData
            return (
              <div key={apt._id} className='bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4 items-start'>
                <div className='w-14 h-14 rounded-lg bg-[var(--primary-light)] flex items-center justify-center font-sora font-bold text-[var(--primary)] text-lg flex-shrink-0'>
                  {doc.name?.split(' ').slice(-1)[0]?.[0]}
                </div>

                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-2 flex-wrap'>
                    <div>
                      <p className='font-sora font-semibold text-slate-900'>{doc.name}</p>
                      <p className='text-sm text-slate-500'>{doc.speciality}</p>
                    </div>
                    <StatusBadge apt={apt} />
                  </div>
                  <div className='flex flex-wrap gap-4 mt-3 text-xs text-slate-500'>
                    <span className='flex items-center gap-1'>
                      <svg width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
                      {formatSlotDate(apt.slotDate)}
                    </span>
                    <span className='flex items-center gap-1'>
                      <svg width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>
                      {apt.slotTime}
                    </span>
                    <span className='flex items-center gap-1'>
                      <svg width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/></svg>
                      {doc.address?.line1}
                    </span>
                    <span className='font-medium text-slate-700'>₹{apt.amount || doc.fees}</span>
                  </div>
                </div>

                {!apt.cancelled && !apt.isCompleted && (
                  <div className='flex flex-col gap-2 min-w-[130px]'>
                    {!apt.payment && payingId !== apt._id && (
                      <button onClick={() => setPayingId(apt._id)}
                        className='bg-[var(--primary)] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-[var(--primary-dark)] transition-colors'>
                        Pay ₹{apt.amount || doc.fees}
                      </button>
                    )}
                    {!apt.payment && payingId === apt._id && (
                      <button onClick={() => pay(apt._id)}
                        className='bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors'>
                        Confirm Payment
                      </button>
                    )}
                    <button
                      onClick={() => cancel(apt._id)}
                      disabled={cancellingId === apt._id}
                      className='border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2.5 rounded-lg hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'>
                      {cancellingId === apt._id ? (
                        <>
                          <svg className='animate-spin' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                            <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
                          </svg>
                          Cancelling...
                        </>
                      ) : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default MyAppointments