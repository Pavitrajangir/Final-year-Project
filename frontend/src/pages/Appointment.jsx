import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import { formatSlotDate } from '../assets/assets.js'
import RelatedDoctors from '../components/RelatedDoctors.jsx'

const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']

// Full-page skeleton for the appointment booking page
const AppointmentSkeleton = () => (
  <div className='py-8 fade-up'>
    <div className='bg-white rounded-3xl overflow-hidden border border-slate-100 mb-8'>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-72 h-64 shimmer-light flex-shrink-0' />
        <div className='flex-1 p-7 flex flex-col gap-4'>
          <div className='h-6 w-48 rounded shimmer-light' />
          <div className='h-4 w-64 rounded shimmer-light' />
          <div className='h-4 w-32 rounded shimmer-light' />
          <div className='grid grid-cols-3 gap-3 mt-2'>
            {[1,2,3].map(i => <div key={i} className='h-16 rounded-xl shimmer-light' />)}
          </div>
          <div className='h-20 rounded-2xl shimmer-light' />
          <div className='h-4 w-40 rounded shimmer-light' />
        </div>
      </div>
    </div>
    <div className='bg-white rounded-3xl p-7 border border-slate-100 mb-8'>
      <div className='h-5 w-48 rounded shimmer-light mb-5' />
      <div className='flex gap-3 mb-5'>
        {[1,2,3,4,5,6,7].map(i => <div key={i} className='w-16 h-16 rounded-2xl shimmer-light flex-shrink-0' />)}
      </div>
      <div className='flex flex-wrap gap-2 mb-6'>
        {Array.from({length:12}).map((_,i) => <div key={i} className='w-20 h-8 rounded-full shimmer-light' />)}
      </div>
      <div className='h-14 w-64 rounded-2xl shimmer-light' />
    </div>
  </div>
)

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [docInfo,    setDocInfo]    = useState(null)
  const [docSlots,   setDocSlots]   = useState([])
  const [slotIndex,  setSlotIndex]  = useState(0)
  const [slotTime,   setSlotTime]   = useState('')
  const [booking,    setBooking]    = useState(false)

  useEffect(() => {
    const doc = doctors.find(d => d._id === docId)
    if (doc) setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
  }, [doctors, docId])

  useEffect(() => {
    if (!docInfo) return
    const slots = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const day = new Date(today); day.setDate(today.getDate() + i)
      const endTime = new Date(day); endTime.setHours(21,0,0,0)
      if (i === 0) { day.setHours(day.getHours() > 10 ? day.getHours() + 1 : 10); day.setMinutes(day.getMinutes() > 30 ? 30 : 0) }
      else day.setHours(10,0,0,0)
      const times = []
      while (day < endTime) {
        const timeStr = day.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
        const slotDate = `${day.getDate()}_${day.getMonth()+1}_${day.getFullYear()}`
        if (!(docInfo.slots_booked?.[slotDate] || []).includes(timeStr)) times.push({datetime:new Date(day),time:timeStr})
        day.setMinutes(day.getMinutes()+30)
      }
      slots.push(times)
    }
    setDocSlots(slots)
  }, [docInfo])

  const bookAppointment = async () => {
    if (!token) { toast.warning('Please login to book'); return navigate('/login') }
    if (!slotTime) { toast.warning('Please select a time slot'); return }
    setBooking(true)
    const date = docSlots[slotIndex][0]?.datetime
    const slotDate = `${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}`
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`, { docId, slotDate, slotTime }, { headers: { token } })
      if (data.success) { toast.success(data.message); getDoctorsData(); navigate('/my-appointments') }
      else toast.error(data.message)
    } catch { toast.error('Failed to book. Please try again.') }
    finally { setBooking(false) }
  }

  if (!docInfo) return <AppointmentSkeleton />

  return (
    <div className='py-8 fade-up'>
      {/* Doctor Profile Card */}
      <div className='bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-8'>
        <div className='flex flex-col sm:flex-row'>
          {/* Photo */}
          <div className='sm:w-72 h-64 sm:h-auto bg-gradient-to-br from-sky-50 to-indigo-50 flex-shrink-0 relative overflow-hidden'>
            {docInfo.image ? (
              <img src={docInfo.image} alt={docInfo.name} className='w-full h-full object-cover object-top'
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
            ) : null}
            <div className='w-full h-full flex items-center justify-center bg-slate-100' style={{display: docInfo.image ? 'none' : 'flex'}}>
              <svg width='64' height='64' fill='none' viewBox='0 0 24 24' stroke='#94a3b8' strokeWidth='1'><circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 3.6-7 8-7s8 3 8 7'/></svg>
            </div>
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${docInfo.available ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${docInfo.available ? 'bg-white animate-pulse' : 'bg-slate-200'}`}/>
              {docInfo.available ? 'Available Today' : 'Currently Unavailable'}
            </div>
          </div>

          {/* Info */}
          <div className='flex-1 p-7'>
            <div className='flex items-start gap-2 mb-1'>
              <h1 className='font-sora font-bold text-2xl text-slate-800'>{docInfo.name}</h1>
              <span className='mt-1 text-[var(--primary)] text-lg'>✓</span>
            </div>
            <p className='text-slate-500 text-sm mb-1'>{docInfo.degree} · {docInfo.speciality}</p>
            <span className='inline-block border border-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full mb-5'>{docInfo.experience} Experience</span>

            <div className='grid grid-cols-3 gap-3 mb-6'>
              {[['4.9','Rating'],['500+','Patients'],[docInfo.experience,'Experience']].map(([val,lbl]) => (
                <div key={lbl} className='bg-slate-50 rounded-xl p-3 text-center'>
                  <p className='font-sora font-bold text-slate-800 text-sm'>{val}</p>
                  <p className='text-xs text-slate-500'>{lbl}</p>
                </div>
              ))}
            </div>

            <div className='bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-4'>
              <p className='font-sora font-semibold text-slate-800 text-sm mb-1.5'>About the Doctor</p>
              <p className='text-slate-600 text-sm leading-relaxed'>{docInfo.about}</p>
            </div>

            <div className='flex flex-wrap gap-4'>
              <div>
                <p className='text-xs font-semibold text-slate-500 mb-1'>📍 Address</p>
                <p className='text-sm text-slate-700'>{docInfo.address?.line1}</p>
                <p className='text-sm text-slate-700'>{docInfo.address?.line2}</p>
              </div>
              <div>
                <p className='text-xs font-semibold text-slate-500 mb-1'>💊 Consultation Fee</p>
                <p className='font-sora font-bold text-2xl text-[var(--primary)]'>₹{docInfo.fees}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Slots */}
      <div className='bg-white rounded-3xl p-7 shadow-sm border border-slate-100 mb-8'>
        <h2 className='font-sora font-bold text-xl text-slate-800 mb-5'>Select Appointment Slot</h2>

        <div className='flex gap-3 overflow-x-auto pb-2 mb-5'>
          {docSlots.map((daySlots, i) => (
            <button key={i} onClick={() => { setSlotIndex(i); setSlotTime('') }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-4 rounded-2xl text-sm font-semibold border-2 transition-all min-w-[68px]
                ${slotIndex === i ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg' : 'border-slate-200 text-slate-600 hover:border-[var(--primary)]/40 bg-white'}`}>
              <span className='text-xs mb-1'>{daySlots[0] && DAYS[daySlots[0].datetime.getDay()]}</span>
              <span className='text-lg font-bold'>{daySlots[0] && daySlots[0].datetime.getDate()}</span>
            </button>
          ))}
        </div>

        <div className='flex flex-wrap gap-2.5 mb-6'>
          {docSlots[slotIndex]?.map((item, i) => (
            <button key={i} onClick={() => setSlotTime(item.time)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                ${slotTime === item.time ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' : 'border-slate-200 text-slate-600 hover:border-[var(--primary)]/40 bg-white'}`}>
              {item.time.toLowerCase()}
            </button>
          ))}
          {!docSlots[slotIndex]?.length && <p className='text-sm text-slate-400'>No slots available for this day</p>}
        </div>

        <button onClick={bookAppointment} disabled={booking}
          className='bg-[var(--primary)] text-white font-semibold px-12 py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all text-sm disabled:opacity-60 disabled:scale-100 flex items-center gap-2'>
          {booking ? (
            <>
              <svg className='animate-spin' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
              </svg>
              Booking...
            </>
          ) : `Confirm Appointment — ₹${docInfo.fees}`}
        </button>
      </div>

      <RelatedDoctors speciality={docInfo.speciality} docId={docId}/>
    </div>
  )
}
export default Appointment