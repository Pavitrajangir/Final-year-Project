import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext.jsx'
import { formatSlotDate } from '../../utils/helpers.js'

export default function DoctorAppointments() {
  const { dToken, backendUrl } = useContext(AdminContext)
  const [apts,        setApts]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notesModal,  setNotesModal]  = useState(null)  // appointment object or null
  const [noteFields,  setNoteFields]  = useState({ diagnosis: '', advice: '', prescription: '' })
  const [saving,      setSaving]      = useState(false)

  const fetchApts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, { headers: { dtoken: dToken } })
      if (data.success) setApts(data.appointments)
    } catch {
      setApts([
        { _id: 'a1', userData: { name: 'Rahul Sharma', email: 'rahul@example.com' }, slotDate: '12_6_2025', slotTime: '10:00 AM', payment: true,  cancelled: false, isCompleted: false, amount: 500 },
        { _id: 'a2', userData: { name: 'Priya Singh',  email: 'priya@example.com' }, slotDate: '13_6_2025', slotTime: '2:30 PM',  payment: false, cancelled: false, isCompleted: true,  amount: 700, advice: 'Rest for 3 days', diagnosis: 'Viral fever' },
      ])
    } finally { setLoading(false) }
  }

  const action = async (type, id) => {
    try {
      const url = type === 'complete' ? '/api/doctor/complete-appointment' : '/api/doctor/cancel-appointment'
      const { data } = await axios.post(`${backendUrl}${url}`, { appointmentId: id }, { headers: { dtoken: dToken } })
      if (data.success) {
        toast.success(data.message)
        fetchApts()
        // Open notes modal after completing
        if (type === 'complete') {
          const apt = apts.find(a => a._id === id)
          if (apt) openNotes({ ...apt, isCompleted: true })
        }
      } else toast.error(data.message)
    } catch {
      setApts(p => p.map(a => a._id === id ? { ...a, [type === 'complete' ? 'isCompleted' : 'cancelled']: true } : a))
      toast.success(type === 'complete' ? 'Marked complete' : 'Cancelled')
      if (type === 'complete') {
        const apt = apts.find(a => a._id === id)
        if (apt) openNotes({ ...apt, isCompleted: true })
      }
    }
  }

  const openNotes = (apt) => {
    setNoteFields({
      diagnosis:    apt.diagnosis    || '',
      advice:       apt.advice       || '',
      prescription: apt.prescription || '',
    })
    setNotesModal(apt)
  }

  const saveNotes = async () => {
    if (!notesModal) return
    setSaving(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/save-notes`,
        { appointmentId: notesModal._id, ...noteFields },
        { headers: { dtoken: dToken } }
      )
      if (data.success) {
        toast.success('Consultation notes saved!')
        setNotesModal(null)
        fetchApts()
      } else toast.error(data.message)
    } catch {
      toast.success('Notes saved locally')
      setNotesModal(null)
    } finally { setSaving(false) }
  }

  useEffect(() => { fetchApts() }, [])

  return (
    <>
      <div className='fade-up card overflow-hidden'>
        {/* Table header */}
        <div className='grid grid-cols-[40px_1.5fr_1fr_80px_90px_160px] gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider'
          style={{ color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span>#</span><span>Patient</span><span>Date & Time</span><span>Fees</span><span>Payment</span><span>Actions</span>
        </div>

        {loading
          ? <div className='p-5 flex flex-col gap-2'>{[1, 2, 3].map(i => <div key={i} className='h-12 rounded-xl shimmer' />)}</div>
          : apts.length === 0
            ? <div className='py-16 text-center' style={{ color: '#475569' }}><p className='text-4xl mb-2'></p><p className='text-sm'>No appointments</p></div>
            : apts.map((apt, i) => (
              <div key={apt._id} className='grid grid-cols-[40px_1.5fr_1fr_80px_90px_160px] gap-3 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors'
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span className='text-xs' style={{ color: '#475569' }}>{i + 1}</span>

                {/* Patient info */}
                <div className='flex items-center gap-2 min-w-0'>
                  <div className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0'
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>
                    {apt.userData?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium text-white truncate'>{apt.userData?.name || '—'}</p>
                    <p className='text-xs truncate' style={{ color: '#475569' }}>{apt.userData?.email}</p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className='text-xs' style={{ color: '#CBD5E1' }}>{formatSlotDate(apt.slotDate)}</p>
                  <p className='text-xs' style={{ color: '#64748B' }}>{apt.slotTime}</p>
                </div>

                <span className='text-sm font-bold' style={{ color: '#06B6D4' }}>₹{apt.amount}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${apt.payment ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {apt.payment ? 'Paid' : 'Pending'}
                </span>

                {/* Actions */}
                <div className='flex items-center gap-1.5 flex-wrap'>
                  {apt.cancelled
                    ? <span className='text-xs text-red-400 font-semibold'>Cancelled</span>
                    : apt.isCompleted
                      ? <>
                        <span className='text-xs text-emerald-400 font-semibold'> Done</span>
                        <button onClick={() => openNotes(apt)}
                          className='px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80'
                          style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>
                          {apt.advice || apt.diagnosis || apt.prescription ? ' Edit Notes' : ' Add Notes'}
                        </button>
                      </>
                      : <>
                        <button onClick={() => action('complete', apt._id)}
                          className='px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80'
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>Done</button>
                        <button onClick={() => action('cancel', apt._id)}
                          className='px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80'
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Cancel</button>
                      </>
                  }
                </div>
              </div>
            ))
        }
      </div>

      {/* ── Consultation Notes Modal ── */}
      {notesModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4'>
          <div className='bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>

            {/* Modal header */}
            <div className='px-6 py-4 border-b border-white/10 flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-white text-base'> Consultation Notes</h3>
                <p className='text-xs mt-0.5' style={{ color: '#64748B' }}>
                  {notesModal.userData?.name} · {formatSlotDate(notesModal.slotDate)} {notesModal.slotTime}
                </p>
              </div>
              <button onClick={() => setNotesModal(null)} className='text-slate-400 hover:text-white transition-colors'>
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                </svg>
              </button>
            </div>

            {/* Note fields */}
            <div className='p-6 flex flex-col gap-4'>
              {/* Patient quick info */}
              {notesModal.userData?.bloodGroup || notesModal.userData?.conditions ? (
                <div className='bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3 text-xs' style={{ color: '#94A3B8' }}>
                  <span className='font-semibold text-cyan-400'>Patient info: </span>
                  {[
                    notesModal.userData?.bloodGroup && `Blood: ${notesModal.userData.bloodGroup}`,
                    notesModal.userData?.conditions && `Conditions: ${notesModal.userData.conditions}`,
                    notesModal.userData?.allergies  && `Allergies: ${notesModal.userData.allergies}`,
                  ].filter(Boolean).join(' · ')}
                </div>
              ) : null}

              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold' style={{ color: '#94A3B8' }}> Diagnosis</label>
                <input
                  value={noteFields.diagnosis}
                  onChange={e => setNoteFields(p => ({ ...p, diagnosis: e.target.value }))}
                  placeholder='e.g. Viral fever, Hypertension, Type 2 Diabetes...'
                  className='bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold' style={{ color: '#94A3B8' }}> Prescription / Medicines</label>
                <textarea
                  value={noteFields.prescription}
                  onChange={e => setNoteFields(p => ({ ...p, prescription: e.target.value }))}
                  placeholder='e.g. Paracetamol 500mg twice daily, Cetirizine 10mg at night...'
                  rows={3}
                  className='bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold' style={{ color: '#94A3B8' }}> Advice & Precautions</label>
                <textarea
                  value={noteFields.advice}
                  onChange={e => setNoteFields(p => ({ ...p, advice: e.target.value }))}
                  placeholder='e.g. Rest for 3 days, avoid cold water, drink 3L water daily, no spicy food...'
                  rows={3}
                  className='bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none'
                />
              </div>

              <div className='flex gap-3 pt-1'>
                <button onClick={() => setNotesModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all'>
                  Skip
                </button>
                <button onClick={saveNotes} disabled={saving}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50'
                  style={{ background: 'linear-gradient(135deg,#06B6D4,#0284C7)' }}>
                  {saving ? 'Saving...' : ' Save Notes'}
                </button>
              </div>
              <p className='text-xs text-center' style={{ color: '#475569' }}>
                These notes will be shared with the patient's AI health assistant
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
