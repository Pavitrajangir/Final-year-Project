import express from 'express'
import {
  loginDoctor,
  doctorList,
  getDoctorProfile,
  updateDoctorProfile,
  changeAvailability,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancelDoctor,
  doctorDashboard,
  saveConsultationNotes,
} from '../controllers/doctorController.js'
import { authDoctor } from '../middleware/authMiddleware.js'

const doctorRouter = express.Router()

// ── Public ────────────────────────────────────────────────────────────────────
doctorRouter.get('/list',   doctorList)
doctorRouter.post('/login', loginDoctor)

// ── Protected (doctor only) ───────────────────────────────────────────────────
doctorRouter.get('/appointments',          authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment',   authDoctor, appointmentCancelDoctor)
doctorRouter.get('/dashboard',             authDoctor, doctorDashboard)
doctorRouter.get('/profile',               authDoctor, getDoctorProfile)
doctorRouter.post('/update-profile',       authDoctor, updateDoctorProfile)
doctorRouter.post('/change-availability',  authDoctor, changeAvailability)
doctorRouter.post('/save-notes',            authDoctor, saveConsultationNotes)

export default doctorRouter
