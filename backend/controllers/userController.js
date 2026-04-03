import jwt              from 'jsonwebtoken'
import bcrypt           from 'bcryptjs'
import validator        from 'validator'
import userModel        from '../models/userModel.js'
import doctorModel      from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import { v2 as cloudinary } from 'cloudinary'

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.json({ success: false, message: 'All fields are required' })
    if (!validator.isEmail(email))
      return res.json({ success: false, message: 'Enter a valid email' })
    if (password.length < 8)
      return res.json({ success: false, message: 'Password must be at least 8 characters' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user  = new userModel({ name, email, password: hashedPassword })
    await user.save()
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user)    return res.json({ success: false, message: 'User not found' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const userId   = req.userId   // set by authUser middleware on req directly
    const userData = await userModel.findById(userId).select('-password')
    if (!userData) return res.json({ success: false, message: 'User not found' })
    res.json({ success: true, userData })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Update profile (plain JSON body) ─────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId   // from authUser middleware

    const {
      name, phone, address, gender, dob,
      bloodGroup, conditions, allergies, medications, emergencyContact
    } = req.body

    if (!userId) return res.json({ success: false, message: 'Not authorised' })

    let parsedAddress = { line1: '', line2: '' }
    if (address) {
      try {
        parsedAddress = typeof address === 'string' ? JSON.parse(address) : address
      } catch {
        parsedAddress = { line1: '', line2: '' }
      }
    }

    const updateData = {
      name:             name             || '',
      phone:            phone            || '',
      gender:           gender           || '',
      dob:              dob              || '',
      address:          parsedAddress,
      bloodGroup:       bloodGroup       || '',
      conditions:       conditions       || '',
      allergies:        allergies        || '',
      medications:      medications      || '',
      emergencyContact: emergencyContact || '',
    }

    await userModel.findByIdAndUpdate(userId, updateData)
    res.json({ success: true, message: 'Profile updated successfully' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Update profile image ──────────────────────────────────────────────────────
export const updateProfileImage = async (req, res) => {
  try {
    const userId    = req.userId
    const imageFile = req.file
    if (!imageFile) return res.json({ success: false, message: 'No image provided' })
    const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
    await userModel.findByIdAndUpdate(userId, { image: result.secure_url })
    res.json({ success: true, message: 'Profile image updated' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Book appointment ──────────────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId
    const { docId, slotDate, slotTime } = req.body
    const doctor = await doctorModel.findById(docId).select('-password')
    if (!doctor.available)
      return res.json({ success: false, message: 'Doctor is not available' })
    let slots_booked = doctor.slots_booked
    if (slots_booked[slotDate]?.includes(slotTime))
      return res.json({ success: false, message: 'Slot already booked' })
    if (!slots_booked[slotDate]) slots_booked[slotDate] = []
    slots_booked[slotDate].push(slotTime)
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    const userData    = await userModel.findById(userId).select('-password')
    const appointment = new appointmentModel({
      userId, docId, slotDate, slotTime,
      userData, docData: doctor, amount: doctor.fees, date: Date.now()
    })
    await appointment.save()
    res.json({ success: true, message: 'Appointment booked successfully' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── List appointments ─────────────────────────────────────────────────────────
export const listAppointments = async (req, res) => {
  try {
    const userId       = req.userId
    const appointments = await appointmentModel.find({ userId })
    res.json({ success: true, appointments })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Cancel appointment ────────────────────────────────────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)
    if (String(appointment.userId) !== String(userId))
      return res.json({ success: false, message: 'Unauthorized' })
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
    const { docId, slotDate, slotTime } = appointment
    const doctor = await doctorModel.findById(docId)
    let slots_booked = doctor.slots_booked
    slots_booked[slotDate] = slots_booked[slotDate].filter(t => t !== slotTime)
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    res.json({ success: true, message: 'Appointment cancelled' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get appointments with doctor notes (for AI context) ──────────────────────
export const getAppointmentsWithNotes = async (req, res) => {
  try {
    const userId = req.userId
    const appointments = await appointmentModel
      .find({ userId, isCompleted: true })
      .sort({ date: -1 })
      .limit(10)  // last 10 completed appointments
    res.json({ success: true, appointments })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}
