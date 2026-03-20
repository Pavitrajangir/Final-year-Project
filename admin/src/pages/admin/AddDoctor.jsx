import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext.jsx'

const SPECIALITIES = ['General physician','Gynecologist','Dermatologist','Pediatricians','Neurologist','Gastroenterologist']
const EXPERIENCE   = ['1 Year','2 Years','3 Years','4 Years','5 Years','6 Years','7 Years','8 Years','9 Years','10+ Years']

// CRITICAL: Field and SelectField are defined OUTSIDE AddDoctor.
// Defining sub-components INSIDE a parent causes React to treat them as a new
// component type on every render → unmount/remount on each keystroke → focus lost.
const Field = ({ label, value, onChange, type = 'text', placeholder, required = false }) => (
  <div>
    <label className='block text-xs font-semibold mb-1.5' style={{ color: '#94A3B8' }}>
      {label}{required && <span className='text-red-400 ml-0.5'>*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      className='w-full px-4 py-2.5 text-sm'
    />
  </div>
)

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className='block text-xs font-semibold mb-1.5' style={{ color: '#94A3B8' }}>{label}</label>
    <select value={value} onChange={onChange} className='w-full px-4 py-2.5 text-sm'>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
)

const Skeleton = () => (
  <div className='fade-up max-w-3xl'>
    <div className='card p-7'>
      <div className='flex items-center gap-4 mb-7'>
        <div className='w-20 h-20 rounded-2xl shimmer flex-shrink-0' />
        <div className='flex flex-col gap-2'>
          <div className='h-4 w-28 rounded shimmer' />
          <div className='h-3 w-40 rounded shimmer' />
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className='h-3 w-24 rounded shimmer mb-2' />
            <div className='h-10 rounded-xl shimmer' />
          </div>
        ))}
      </div>
      <div className='mb-6'>
        <div className='h-3 w-16 rounded shimmer mb-2' />
        <div className='h-24 rounded-xl shimmer' />
      </div>
      <div className='h-12 w-40 rounded-xl shimmer' />
    </div>
  </div>
)

export default function AddDoctor() {
  const { aToken, backendUrl } = useContext(AdminContext)

  const [preview,    setPreview]    = useState(null)
  const [image,      setImage]      = useState(null)
  const [ready,      setReady]      = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', speciality: 'General physician',
    degree: '', experience: '1 Year', fees: '', address1: '', address2: '', about: ''
  })

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(t)
  }, [])

  const u = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleImage = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImage(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.degree || !form.fees || !form.about) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`, fd,
        { headers: { atoken: aToken, 'Content-Type': 'multipart/form-data' } }
      )
      if (data.success) {
        toast.success(data.message)
        setForm({ name: '', email: '', password: '', speciality: 'General physician', degree: '', experience: '1 Year', fees: '', address1: '', address2: '', about: '' })
        setImage(null)
        setPreview(null)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed. Check server connection.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) return <Skeleton />

  return (
    <div className='fade-up max-w-3xl'>
      <div className='card p-7'>
        <form onSubmit={submit} autoComplete='off'>

          <label htmlFor='docImg' className='inline-flex items-center gap-4 mb-7 cursor-pointer group'>
            <div
              className='w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all group-hover:ring-2 group-hover:ring-cyan-500'
              style={{ background: '#0F172A', border: '2px dashed rgba(255,255,255,0.1)' }}
            >
              {preview
                ? <img src={preview} alt='preview' className='w-full h-full object-cover' />
                : <svg width='24' height='24' fill='none' viewBox='0 0 24 24' stroke='#475569' strokeWidth='1.5'>
                    <circle cx='12' cy='8' r='4' /><path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' />
                  </svg>
              }
            </div>
            <div>
              <p className='text-sm font-semibold text-white mb-0.5'>Upload Photo</p>
              <p className='text-xs' style={{ color: '#64748B' }}>JPG, PNG — 2 MB max</p>
            </div>
            <input id='docImg' type='file' accept='image/*' hidden onChange={handleImage} />
          </label>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
            <Field label='Full Name'   value={form.name}       onChange={u('name')}       required placeholder='Dr. Arjun Sharma' />
            <SelectField label='Speciality' value={form.speciality} onChange={u('speciality')} options={SPECIALITIES} />
            <Field label='Email'       value={form.email}      onChange={u('email')}      type='email'    required placeholder='doctor@medimate.in' />
            <Field label='Degree'      value={form.degree}     onChange={u('degree')}     required placeholder='MBBS, MD' />
            <Field label='Password'    value={form.password}   onChange={u('password')}   type='password' required placeholder='••••••••' />
            <SelectField label='Experience' value={form.experience} onChange={u('experience')} options={EXPERIENCE} />
            <Field label='Fees (Rs.)'  value={form.fees}       onChange={u('fees')}       type='number'  required placeholder='500' />
            <div>
              <label className='block text-xs font-semibold mb-1.5' style={{ color: '#94A3B8' }}>Address</label>
              <input value={form.address1} onChange={u('address1')} placeholder='Street, Area'     className='w-full px-4 py-2.5 text-sm mb-2' />
              <input value={form.address2} onChange={u('address2')} placeholder='City, State, PIN' className='w-full px-4 py-2.5 text-sm' />
            </div>
          </div>

          <div className='mb-6'>
            <label className='block text-xs font-semibold mb-1.5' style={{ color: '#94A3B8' }}>
              About <span className='text-red-400'>*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.about}
              onChange={u('about')}
              placeholder='Doctor biography, specialisations, achievements...'
              className='w-full px-4 py-3 text-sm resize-none'
            />
          </div>

          <button
            type='submit'
            disabled={submitting}
            className='px-10 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2'
            style={{ background: 'linear-gradient(135deg,#06B6D4,#0284C7)' }}
          >
            {submitting ? (
              <>
                <svg className='animate-spin' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                  <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round' />
                </svg>
                Adding Doctor...
              </>
            ) : '+ Add Doctor'}
          </button>

        </form>
      </div>
    </div>
  )
}