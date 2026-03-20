import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'

// Defined OUTSIDE to avoid focus loss on re-render
const ProfileField = ({ label, field, type = 'text', placeholder, isEdit, value, onChange }) => (
  <div>
    <label className='text-xs font-semibold text-slate-500 block mb-1.5'>{label}</label>
    {isEdit
      ? <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder || label}
          className='w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors bg-white' />
      : <p className='text-sm text-slate-800 py-1 min-h-[28px] border-b border-slate-100'>{value || <span className='text-slate-400'>—</span>}</p>
    }
  </div>
)

const ProfileSkeleton = () => (
  <div className='py-8 max-w-2xl fade-up'>
    {/* Header */}
    <div className='flex items-center justify-between mb-8'>
      <div className='h-7 w-32 rounded shimmer-light' />
      <div className='h-9 w-28 rounded-lg shimmer-light' />
    </div>
    {/* Avatar row */}
    <div className='flex items-center gap-4 mb-8 p-5 bg-white rounded-xl border border-slate-200'>
      <div className='w-16 h-16 rounded-xl shimmer-light flex-shrink-0' />
      <div className='flex flex-col gap-2'>
        <div className='h-5 w-40 rounded shimmer-light' />
        <div className='h-3 w-52 rounded shimmer-light' />
        <div className='h-5 w-16 rounded shimmer-light mt-1' />
      </div>
    </div>
    {/* Sections */}
    <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
      {[1,2,3,4].map((s, idx) => (
        <React.Fragment key={s}>
          {idx > 0 && <hr className='border-slate-100' />}
          <div className='p-6 flex flex-col gap-4'>
            <div className='h-4 w-36 rounded shimmer-light' />
            <div className='grid grid-cols-2 gap-4'>
              <div className='h-10 rounded-lg shimmer-light' />
              <div className='h-10 rounded-lg shimmer-light' />
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
)

const Section = ({ title, subtitle, children, accent }) => (
  <div className={`p-6 ${accent ? 'bg-red-50/20' : ''}`}>
    <div className='mb-4'>
      <h3 className={`font-sora font-semibold text-sm ${accent ? 'text-red-700' : 'text-slate-900'}`}>{title}</h3>
      {subtitle && <p className='text-xs text-slate-400 mt-0.5'>{subtitle}</p>}
    </div>
    {children}
  </div>
)

const MyProfile = () => {
  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  // Show skeleton while profile loads
  if (!userData) return <ProfileSkeleton />

  const user = userData

  const update     = (f, v) => setUserData(p => ({ ...p, [f]: v }))
  const updateAddr = (l, v) => setUserData(p => ({ ...p, address: { ...p.address, [l]: v } }))

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        name: user.name || '', phone: user.phone || '', gender: user.gender || '',
        dob: user.dob || '', address: user.address || { line1: '', line2: '' },
        bloodGroup: user.bloodGroup || '', conditions: user.conditions || '',
        allergies: user.allergies || '', medications: user.medications || '',
        emergencyContact: user.emergencyContact || '',
      }
      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, payload,
        { headers: { token, 'Content-Type': 'application/json' } })
      if (data.success) {
        toast.success('Profile updated')
        await loadUserProfileData()
        setIsEdit(false)
      } else toast.error(data.message || 'Update failed')
    } catch { toast.error('Could not save profile.') }
    finally { setSaving(false) }
  }

  return (
    <div className='py-8 max-w-2xl fade-up'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='font-sora font-bold text-2xl text-slate-900'>My Profile</h1>
        <div className='flex gap-2'>
          {isEdit ? (
            <>
              <button onClick={save} disabled={saving}
                className='bg-[var(--primary)] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60 flex items-center gap-1.5'>
                {saving ? (
                  <>
                    <svg className='animate-spin' width='13' height='13' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                      <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
              <button onClick={() => setIsEdit(false)}
                className='border border-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors'>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEdit(true)}
              className='border border-[var(--primary)] text-[var(--primary)] px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[var(--primary-light)] transition-colors'>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Avatar row */}
      <div className='flex items-center gap-4 mb-8 p-5 bg-white rounded-xl border border-slate-200'>
        <div className='w-16 h-16 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold font-sora flex-shrink-0'>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className='font-sora font-semibold text-slate-900 text-lg'>{user.name || 'Your Name'}</p>
          <p className='text-slate-500 text-sm'>{user.email}</p>
          {user.bloodGroup && (
            <span className='inline-block mt-1.5 bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-md font-medium'>
              {user.bloodGroup}
            </span>
          )}
        </div>
      </div>

      <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>

        <Section title='Contact Information'>
          <div className='grid grid-cols-2 gap-5'>
            <ProfileField label='Full Name'     field='name'  isEdit={isEdit} value={user.name}  onChange={e => update('name',  e.target.value)} />
            <ProfileField label='Phone Number'  field='phone' isEdit={isEdit} value={user.phone} onChange={e => update('phone', e.target.value)} placeholder='+91 98765 43210' />
          </div>
          <div className='mt-5'>
            <label className='text-xs font-semibold text-slate-500 block mb-1.5'>Address</label>
            {isEdit ? (
              <div className='flex flex-col gap-2'>
                <input value={user.address?.line1 || ''} onChange={e => updateAddr('line1', e.target.value)}
                  placeholder='Street, Area, Locality'
                  className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] bg-white' />
                <input value={user.address?.line2 || ''} onChange={e => updateAddr('line2', e.target.value)}
                  placeholder='City, State, PIN Code'
                  className='px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] bg-white' />
              </div>
            ) : (
              <p className='text-sm text-slate-800 py-1 border-b border-slate-100 min-h-[28px]'>
                {user.address?.line1
                  ? `${user.address.line1}${user.address.line2 ? `, ${user.address.line2}` : ''}`
                  : <span className='text-slate-400'>—</span>}
              </p>
            )}
          </div>
        </Section>

        <hr className='border-slate-100' />

        <Section title='Basic Information'>
          <div className='grid grid-cols-3 gap-5'>
            <div>
              <label className='text-xs font-semibold text-slate-500 block mb-1.5'>Gender</label>
              {isEdit ? (
                <select value={user.gender || ''} onChange={e => update('gender', e.target.value)}
                  className='w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] bg-white'>
                  <option>Not Selected</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              ) : <p className='text-sm text-slate-800 py-1 border-b border-slate-100 min-h-[28px]'>{user.gender || <span className='text-slate-400'>—</span>}</p>}
            </div>
            <ProfileField label='Date of Birth'  field='dob'        type='date' isEdit={isEdit} value={user.dob}        onChange={e => update('dob', e.target.value)} />
            <ProfileField label='Blood Group'    field='bloodGroup'            isEdit={isEdit} value={user.bloodGroup}  onChange={e => update('bloodGroup', e.target.value)} placeholder='A+, B-, O+...' />
          </div>
        </Section>

        <hr className='border-slate-100' />

        <Section title='Medical Information' subtitle='Used by AI assistant for personalised health advice'>
          <div className='flex flex-col gap-5'>
            <ProfileField label='Known Conditions'    field='conditions'  isEdit={isEdit} value={user.conditions}  onChange={e => update('conditions',  e.target.value)} placeholder='e.g. Diabetes, Hypertension, Asthma' />
            <ProfileField label='Allergies'           field='allergies'   isEdit={isEdit} value={user.allergies}   onChange={e => update('allergies',   e.target.value)} placeholder='e.g. Penicillin, Peanuts, Dust' />
            <ProfileField label='Current Medications' field='medications' isEdit={isEdit} value={user.medications} onChange={e => update('medications', e.target.value)} placeholder='e.g. Metformin 500mg, Lisinopril 10mg' />
          </div>
        </Section>

        <hr className='border-slate-100' />

        <Section title='Emergency Contact' subtitle='This number will be called or messaged during an SOS emergency' accent>
          <div>
            <label className='text-xs font-semibold text-slate-500 block mb-1.5'>
              Contact Number <span className='font-normal text-slate-400'>(include country code)</span>
            </label>
            {isEdit ? (
              <input
                value={user.emergencyContact || ''}
                onChange={e => update('emergencyContact', e.target.value)}
                placeholder='+91 98765 43210'
                className='w-full px-3.5 py-2.5 border-2 border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-red-50/30'
              />
            ) : (
              <div className='flex items-center gap-3 py-1 border-b border-slate-100'>
                <p className='text-sm font-medium text-slate-800'>{user.emergencyContact || <span className='text-slate-400'>—</span>}</p>
                {user.emergencyContact && (
                  <span className='text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium'>Active</span>
                )}
              </div>
            )}
            <div className='mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3'>
              <p className='text-xs font-semibold text-amber-800 mb-0.5'>Format: +[country code][number]</p>
              <p className='text-xs text-amber-700'>India: +919876543210 &nbsp;|&nbsp; US: +12025551234</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default MyProfile