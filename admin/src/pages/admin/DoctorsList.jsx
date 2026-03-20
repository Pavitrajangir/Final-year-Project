import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext.jsx'

const MOCK = [
  {_id:'d1',name:'Dr. Arjun Sharma',speciality:'General physician',experience:'8 Years',fees:500,available:true,image:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces'},
  {_id:'d2',name:'Dr. Priya Nair',speciality:'Gynecologist',experience:'6 Years',fees:700,available:true,image:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=faces'},
  {_id:'d3',name:'Dr. Kavitha Reddy',speciality:'Dermatologist',experience:'5 Years',fees:600,available:false,image:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=faces'},
]

export default function DoctorsList() {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, { headers:{atoken:aToken} })
      if (data.success) setDoctors(data.doctors)
      else setDoctors(MOCK)
    } catch { setDoctors(MOCK) }
    finally { setLoading(false) }
  }

  const toggle = async (docId, current) => {
    try {
      await axios.post(`${backendUrl}/api/admin/change-availability`, {docId}, { headers:{atoken:aToken} })
      setDoctors(p => p.map(d => d._id===docId ? {...d,available:!current} : d))
    } catch { setDoctors(p => p.map(d => d._id===docId ? {...d,available:!current} : d)) }
  }

  useEffect(() => { fetchDoctors() }, [])

  if (loading) return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 fade-up'>
      {[1,2,3,4,5,6].map(i=><div key={i} className='h-64 rounded-2xl shimmer'/>)}
    </div>
  )

  return (
    <div className='fade-up'>
      <div className='flex items-center justify-between mb-5'>
        <p className='text-sm' style={{color:'#64748B'}}>{doctors.length} doctors registered</p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {doctors.map(doc => {
          const initials = doc.name.split(' ').filter((_,i,a)=>i===0||i===a.length-1).map(w=>w[0]).join('').toUpperCase()
          return (
            <div key={doc._id} className='card overflow-hidden group hover:border-cyan-500/30 transition-all' style={{border:'1px solid rgba(255,255,255,0.06)'}}>
              {/* Photo */}
              <div className='h-44 overflow-hidden relative' style={{background:'linear-gradient(180deg,rgba(6,182,212,0.1),rgba(2,132,199,0.1))'}}>
                {doc.image
                  ? <img src={doc.image} alt={doc.name} className='w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500'
                      onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex'}}/>
                  : null
                }
                <div className='w-full h-full flex items-center justify-center text-3xl font-bold text-cyan-400' style={{display:doc.image?'none':'flex',fontFamily:'Plus Jakarta Sans'}}>{initials}</div>
              </div>
              {/* Info */}
              <div className='p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <div className={`flex items-center gap-1.5 cursor-pointer`} onClick={()=>toggle(doc._id,doc.available)}>
                    <div className={`w-7 h-3.5 rounded-full transition-all flex items-center px-0.5 ${doc.available?'bg-emerald-500':'bg-slate-600'}`}>
                      <div className={`w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${doc.available?'translate-x-3.5':'translate-x-0'}`}/>
                    </div>
                    <span className='text-[10px] font-semibold' style={{color:doc.available?'#10B981':'#64748B'}}>{doc.available?'Active':'Off'}</span>
                  </div>
                  <span className='text-xs font-bold' style={{color:'#06B6D4'}}>₹{doc.fees}</span>
                </div>
                <p className='text-sm font-bold text-white leading-tight truncate' style={{fontFamily:'Plus Jakarta Sans'}}>{doc.name}</p>
                <p className='text-xs mt-0.5 truncate' style={{color:'#64748B'}}>{doc.speciality}</p>
                <p className='text-xs mt-1' style={{color:'#475569'}}>{doc.experience}</p>
              </div>
            </div>
          )
        })}
        {doctors.length===0 && (
          <div className='col-span-full py-20 text-center' style={{color:'#475569'}}>
            <p className='text-4xl mb-3'>‍️</p>
            <p className='text-sm'>No doctors yet. Add your first doctor.</p>
          </div>
        )}
      </div>
    </div>
  )
}
