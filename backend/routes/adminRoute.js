import express from 'express'
import {
  loginAdmin,
  addDoctor,
  allDoctors,
  changeAvailabilityAdmin,
  appointmentsAdmin,
  cancelAppointmentAdmin,
  adminDashboard,
} from '../controllers/adminController.js'
import { authAdmin }  from '../middleware/authMiddleware.js'
import upload         from '../middleware/multer.js'

const adminRouter = express.Router()

// ── Public 
adminRouter.post('/login', loginAdmin)

// ── Protected (admin only)
adminRouter.post('/add-doctor',           authAdmin, upload.single('image'), addDoctor)
adminRouter.get('/all-doctors',           authAdmin, allDoctors)
adminRouter.post('/change-availability',  authAdmin, changeAvailabilityAdmin)
adminRouter.get('/appointments',          authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment',   authAdmin, cancelAppointmentAdmin)
adminRouter.get('/dashboard',             authAdmin, adminDashboard)

export default adminRouter
