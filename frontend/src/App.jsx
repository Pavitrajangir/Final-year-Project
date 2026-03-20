import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import FloatingActions from './components/FloatingActions.jsx'
import Home from './pages/Home.jsx'
import Doctors from './pages/Doctors.jsx'
import Appointment from './pages/Appointment.jsx'
import MyAppointments from './pages/MyAppointments.jsx'
import MyProfile from './pages/MyProfile.jsx'
import Login from './pages/Login.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'

const App = () => (
  <div className='min-h-screen flex flex-col'>
    <ToastContainer position='top-right' autoClose={3000} toastClassName='!rounded-2xl !font-body !text-sm'/>
    <Navbar/>
    <main className='flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8'>
      <Routes>
        <Route path='/'                    element={<Home/>}/>
        <Route path='/doctors'             element={<Doctors/>}/>
        <Route path='/doctors/:speciality' element={<Doctors/>}/>
        <Route path='/appointment/:docId'  element={<Appointment/>}/>
        <Route path='/my-appointments'     element={<MyAppointments/>}/>
        <Route path='/my-profile'          element={<MyProfile/>}/>
        <Route path='/login'               element={<Login/>}/>
        <Route path='/about'               element={<About/>}/>
        <Route path='/contact'             element={<Contact/>}/>
      </Routes>
    </main>
    <Footer/>
    <FloatingActions/>
  </div>
)
export default App
