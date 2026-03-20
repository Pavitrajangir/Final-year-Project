import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import DoctorCard from './DoctorCard.jsx'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext)
  const related = doctors.filter(d => d.speciality === speciality && d._id !== docId).slice(0,4)
  if (!related.length) return null
  return (
    <section className='mt-16'>
      <h2 className='font-sora font-bold text-2xl text-slate-800 mb-6'>Related Specialists</h2>
      <div className='grid grid-cols-auto gap-5'>
        {related.map(doc => <DoctorCard key={doc._id} doc={doc}/>)}
      </div>
    </section>
  )
}
export default RelatedDoctors
