import express from 'express'
import {
  registerUser, loginUser,
  getProfile, updateProfile, updateProfileImage,
  bookAppointment, listAppointments, cancelAppointment, getAppointmentsWithNotes
} from '../controllers/userController.js'
import { authUser } from '../middleware/authMiddleware.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router()

// Public
userRouter.post('/register', registerUser)
userRouter.post('/login',    loginUser)

// Protected
userRouter.post('/get-profile',          authUser, getProfile)
userRouter.post('/update-profile',       authUser, updateProfile)           // plain JSON
userRouter.post('/update-profile-image', authUser, upload.single('image'), updateProfileImage)
userRouter.post('/book-appointment',     authUser, bookAppointment)
userRouter.post('/appointments',         authUser, listAppointments)
userRouter.post('/cancel-appointment',   authUser, cancelAppointment)
userRouter.post('/appointments-with-notes', authUser, getAppointmentsWithNotes)

export default userRouter
