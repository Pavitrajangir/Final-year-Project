import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar  from './components/Topbar.jsx'
import Login   from './pages/Login.jsx'
import AdminDashboard    from './pages/admin/Dashboard.jsx'
import AdminAppointments from './pages/admin/Appointments.jsx'
import AddDoctor         from './pages/admin/AddDoctor.jsx'
import DoctorsList       from './pages/admin/DoctorsList.jsx'
import DoctorDashboard   from './pages/doctor/Dashboard.jsx'
import DoctorAppointments from './pages/doctor/Appointments.jsx'
import DoctorProfile     from './pages/doctor/Profile.jsx'

export default function App() {
  const { role } = useContext(AdminContext)
  if (!role) return (
    <>
      <ToastContainer theme='dark' position='top-right' autoClose={3000}/>
      <Login/>
    </>
  )
  return (
    <div className='flex h-screen overflow-hidden' style={{background:'#0F172A'}}>
      <ToastContainer theme='dark' position='top-right' autoClose={3000}/>
      <Sidebar/>
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Topbar/>
        <main className='flex-1 overflow-y-auto p-6'>
          {role === 'admin' && (
            <Routes>
              <Route path='/'             element={<AdminDashboard/>}/>
              <Route path='/dashboard'    element={<AdminDashboard/>}/>
              <Route path='/appointments' element={<AdminAppointments/>}/>
              <Route path='/add-doctor'   element={<AddDoctor/>}/>
              <Route path='/doctors-list' element={<DoctorsList/>}/>
              <Route path='*'             element={<Navigate to='/dashboard'/>}/>
            </Routes>
          )}
          {role === 'doctor' && (
            <Routes>
              <Route path='/'             element={<DoctorDashboard/>}/>
              <Route path='/dashboard'    element={<DoctorDashboard/>}/>
              <Route path='/appointments' element={<DoctorAppointments/>}/>
              <Route path='/profile'      element={<DoctorProfile/>}/>
              <Route path='*'             element={<Navigate to='/dashboard'/>}/>
            </Routes>
          )}
        </main>
      </div>
    </div>
  )
}
