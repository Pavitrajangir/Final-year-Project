import jwt              from 'jsonwebtoken'
import bcrypt            from 'bcryptjs'
import doctorModel       from '../models/doctorModel.js'
import appointmentModel  from '../models/appointmentModel.js'
import { v2 as cloudinary } from 'cloudinary'

// ── Admin Login 
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' })
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid admin credentials' })
    }
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Add Doctor
export const addDoctor = async (req, res) => {
  try {
    const {
      name, email, password, speciality, degree,
      experience, about, fees, address1, address2
    } = req.body
    const imageFile = req.file

    // Validate required fields
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees) {
      return res.json({ success: false, message: 'Please fill all required fields' })
    }

    // Check if doctor already exists
    const existing = await doctorModel.findOne({ email })
    if (existing) {
      return res.json({ success: false, message: 'A doctor with this email already exists' })
    }

    // Upload image to Cloudinary (if provided)
    let imageUrl = ''
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      imageUrl = imageUpload.secure_url
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      image:      imageUrl,
      speciality,
      degree,
      experience,
      about,
      fees:    Number(fees),
      address: { line1: address1 || '', line2: address2 || '' },
      date:    Date.now(),
    }

    const doctor = new doctorModel(doctorData)
    await doctor.save()

    res.json({ success: true, message: `Dr. ${name} added successfully` })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get all doctors (admin view — includes availability toggle) 
export const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password')
    res.json({ success: true, doctors })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Toggle doctor availability 
export const changeAvailabilityAdmin = async (req, res) => {
  try {
    const { docId } = req.body
    const doctor = await doctorModel.findById(docId)
    if (!doctor) return res.json({ success: false, message: 'Doctor not found' })
    await doctorModel.findByIdAndUpdate(docId, { available: !doctor.available })
    res.json({ success: true, message: 'Availability updated' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get all appointments (latest first) 
export const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).sort({ date: -1 })
    res.json({ success: true, appointments })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Cancel appointment (admin)
export const cancelAppointmentAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // Release the slot from doctor's schedule
    const { docId, slotDate, slotTime } = appointment
    const doctor = await doctorModel.findById(docId)
    if (doctor) {
      let slots_booked = doctor.slots_booked
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter((t) => t !== slotTime)
      }
      await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Admin Dashboard — live stats + latest bookings 
export const adminDashboard = async (req, res) => {
  try {
    const doctors      = await doctorModel.find({})
    const appointments = await appointmentModel.find({}).sort({ date: -1 })

    // Unique patients count
    const uniquePatients = [...new Set(appointments.map((a) => String(a.userId)))]

    const dashData = {
      doctors:            doctors.length,
      appointments:       appointments.length,
      patients:           uniquePatients.length,
      // Latest 5 bookings shown on dashboard
      latestAppointments: appointments.slice(0, 5),
    }

    res.json({ success: true, dashData })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}
