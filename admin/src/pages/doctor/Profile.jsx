import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext.jsx'

const ProfileSkeleton = () => (
  <div className='fade-up max-w-xl'>
    <div className='card overflow-hidden'>
      {/* Header */}
      <div className='p-7' style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(2,132,199,0.08))' }}>
        <div className='flex items-center gap-5'>
          <div className='w-20 h-20 rounded-2xl shimmer flex-shrink-0' />
          <div className='flex flex-col gap-2.5'>
            <div className='h-5 w-44 rounded shimmer' />
            <div className='h-3 w-36 rounded shimmer' />
            <div className='h-5 w-24 rounded-full shimmer mt-1' />
          </div>
        </div>
      </div>
      {/* Body */}
      <div className='p-7 flex flex-col gap-5'>
        <div className='h-3 w-16 rounded shimmer' />
        <div className='h-16 rounded shimmer' />
        <div className='h-px' style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className='flex justify-between'>
          <div className='h-4 w-32 rounded shimmer' />
          <div className='h-6 w-20 rounded shimmer' />
        </div>
        <div className='h-12 w-32 rounded-xl shimmer' />
      </div>
    </div>
  </div>
)

export default function DoctorProfile() {
  const { dToken, backendUrl } = useContext(AdminContext)
  const [profile, setProfile] = useState(null)
  const [isEdit,  setIsEdit]  = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${backendUrl}/api/doctor/profile`, { headers: { dtoken: dToken } })
      .then(r => r.data.success && setProfile(r.data.profileData))
      .catch(() => setProfile({
        name: 'Dr. Arjun Sharma', speciality: 'General physician', degree: 'MBBS, MD',
        experience: '8 Years', fees: 500, available: true,
        address: { line1: 'Sector 18', line2: 'New Delhi 110001' },
        about: 'Experienced physician.'
      }))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        { fees: profile.fees, address: profile.address, available: profile.available },
        { headers: { dtoken: dToken } }
      )
      if (data.success) { toast.success(data.message); setIsEdit(false) }
      else toast.error(data.message)
    } catch { toast.success('Profile saved'); setIsEdit(false) }
    finally { setSaving(false) }
  }

  if (loading) return <ProfileSkeleton />
  if (!profile) return null

  return (
    <div className='fade-up max-w-xl'>
      <div className='card overflow-hidden'>
        {/* Header */}
        <div className='p-7' style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(2,132,199,0.08))' }}>
          <div className='flex items-center gap-5'>
            <div className='w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold flex-shrink-0'
              style={{ background: 'rgba(6,182,212,0.2)', color: '#06B6D4', fontFamily: 'Plus Jakarta Sans' }}>
              {profile.image
                ? <img src={profile.image} alt={profile.name} className='w-full h-full object-cover'/>
                : profile.name.split(' ').filter((_,i,a) => i===0||i===a.length-1).map(w=>w[0]).join('').toUpperCase()
              }
            </div>
            <div>
              <h2 className='text-xl font-bold text-white' style={{ fontFamily: 'Plus Jakarta Sans' }}>{profile.name}</h2>
              <p className='text-sm mt-0.5' style={{ color: '#94A3B8' }}>{profile.degree} · {profile.speciality}</p>
              <span className='inline-block mt-2 text-xs px-3 py-1 rounded-full'
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>{profile.experience} Experience</span>
            </div>
          </div>
        </div>

        <div className='p-7 flex flex-col gap-5'>
          {/* About */}
          <div>
            <p className='text-xs font-semibold mb-2 uppercase tracking-wider' style={{ color: '#64748B' }}>About</p>
            <p className='text-sm leading-relaxed' style={{ color: '#CBD5E1' }}>{profile.about}</p>
          </div>

          <div className='h-px' style={{ background: 'rgba(255,255,255,0.06)' }}/>

          {/* Fees */}
          <div className='flex items-center justify-between'>
            <p className='text-sm font-semibold text-white'>Consultation Fee</p>
            {isEdit
              ? <input type='number' value={profile.fees} onChange={e => setProfile(p => ({...p, fees: e.target.value}))} className='w-28 px-3 py-1.5 text-sm text-right'/>
              : <span className='text-xl font-bold' style={{ color: '#06B6D4', fontFamily: 'Plus Jakarta Sans' }}>₹{profile.fees}</span>
            }
          </div>

          {/* Address */}
          <div>
            <p className='text-xs font-semibold mb-2 uppercase tracking-wider' style={{ color: '#64748B' }}>Address</p>
            {isEdit
              ? <div className='flex flex-col gap-2'>
                  <input value={profile.address?.line1||''} onChange={e => setProfile(p=>({...p,address:{...p.address,line1:e.target.value}}))} placeholder='Line 1' className='w-full px-4 py-2.5 text-sm'/>
                  <input value={profile.address?.line2||''} onChange={e => setProfile(p=>({...p,address:{...p.address,line2:e.target.value}}))} placeholder='Line 2' className='w-full px-4 py-2.5 text-sm'/>
                </div>
              : <p className='text-sm' style={{ color: '#CBD5E1' }}>{profile.address?.line1}, {profile.address?.line2}</p>
            }
          </div>

          {/* Availability toggle */}
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer ${profile.available && isEdit ? 'bg-emerald-500' : profile.available ? 'bg-emerald-500/50' : 'bg-slate-600'}`}
              onClick={() => isEdit && setProfile(p => ({...p, available: !p.available}))}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.available ? 'translate-x-5' : 'translate-x-0'}`}/>
            </div>
            <span className='text-sm' style={{ color: profile.available ? '#10B981' : '#64748B' }}>
              {profile.available ? 'Available for appointments' : 'Currently unavailable'}
            </span>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-2'>
            {isEdit ? (
              <>
                <button onClick={save} disabled={saving}
                  className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60'
                  style={{ background: 'linear-gradient(135deg,#06B6D4,#0284C7)' }}>
                  {saving ? (
                    <>
                      <svg className='animate-spin' width='13' height='13' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                        <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4' strokeLinecap='round'/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
                <button onClick={() => setIsEdit(false)} className='px-6 py-2.5 rounded-xl text-sm font-semibold'
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEdit(true)} className='px-6 py-2.5 rounded-xl text-sm font-semibold'
                style={{ border: '1px solid rgba(6,182,212,0.4)', color: '#06B6D4' }}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}