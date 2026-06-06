import jwt            from 'jsonwebtoken'
import bcrypt          from 'bcryptjs'
import doctorModel     from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'

// ── Doctor Login 
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const doctor = await doctorModel.findOne({ email })
    if (!doctor) return res.json({ success: false, message: 'Doctor not found' })

    const isMatch = await bcrypt.compare(password, doctor.password)
    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' })

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, token })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get all doctors list (public — for frontend)
export const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password -email')
    res.json({ success: true, doctors })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get doctor profile
export const getDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId
    const doctor = await doctorModel.findById(docId).select('-password')
    res.json({ success: true, profileData: doctor })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.docId
    const { fees, address, available } = req.body
    await doctorModel.findByIdAndUpdate(docId, { fees, address, available })
    res.json({ success: true, message: 'Profile updated successfully' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Toggle availability (doctor self)
export const changeAvailability = async (req, res) => {
  try {
    const docId = req.docId
    const doctor = await doctorModel.findById(docId)
    if (!doctor) return res.json({ success: false, message: 'Doctor not found' })
    await doctorModel.findByIdAndUpdate(docId, { available: !doctor.available })
    res.json({ success: true, message: 'Availability updated' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Get doctor's appointments (latest first)
export const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId
    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 })
    res.json({ success: true, appointments })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Doctor completes an appointment 
export const appointmentComplete = async (req, res) => {
  try {
    const docId = req.docId
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (String(appointment.docId) !== docId)
      return res.json({ success: false, message: 'Unauthorized action' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
    res.json({ success: true, message: 'Appointment marked as completed' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Doctor cancels an appointment
export const appointmentCancelDoctor = async (req, res) => {
  try {
    const docId = req.docId
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (String(appointment.docId) !== docId)
      return res.json({ success: false, message: 'Unauthorized action' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // Release slot
    const { slotDate, slotTime } = appointment
    const doctor = await doctorModel.findById(docId)
    let slots_booked = doctor.slots_booked
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter((t) => t !== slotTime)
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment cancelled' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Doctor Dashboard stats
export const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId
    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 })

    // Unique patients for this doctor
    const uniquePatients = [...new Set(appointments.map((a) => String(a.userId)))]

    // Earnings from completed + paid appointments
    const earnings = appointments.reduce((sum, a) => {
      if (a.isCompleted || a.payment) return sum + (a.amount || 0)
      return sum
    }, 0)

    const dashData = {
      earnings,
      appointments:       appointments.length,
      patients:           uniquePatients.length,
      latestAppointments: appointments.slice(0, 5),
    }

    res.json({ success: true, dashData })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

// ── Doctor saves consultation notes (prescription, advice, diagnosis)
export const saveConsultationNotes = async (req, res) => {
  try {
    const docId = req.docId
    const { appointmentId, prescription, advice, diagnosis } = req.body
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (String(appointment.docId) !== docId)
      return res.json({ success: false, message: 'Unauthorized' })
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      prescription: prescription || '',
      advice:       advice       || '',
      diagnosis:    diagnosis    || '',
    })
    res.json({ success: true, message: 'Consultation notes saved' })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}
