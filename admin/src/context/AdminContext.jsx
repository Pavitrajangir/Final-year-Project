import { createContext, useState } from 'react'
import axios from 'axios'

export const AdminContext = createContext()

/**
 * AdminContextProvider
 * Manages:
 *   - aToken     — JWT for admin login
 *   - dToken     — JWT for doctor login
 *   - role       — 'admin' | 'doctor' | null
 *   - doctorData — logged-in doctor's profile
 */
const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const [aToken,     setAToken]     = useState(localStorage.getItem('aToken')  || '')
  const [dToken,     setDToken]     = useState(localStorage.getItem('dToken')  || '')
  const [role,       setRole]       = useState(localStorage.getItem('adminRole') || null)
  const [doctorData, setDoctorData] = useState(null)

  // ── Login helpers ─────────────────────────────────────────────────────────
  const loginAsAdmin = (token) => {
    localStorage.setItem('aToken',    token)
    localStorage.setItem('adminRole', 'admin')
    setAToken(token)
    setRole('admin')
  }

  const loginAsDoctor = (token) => {
    localStorage.setItem('dToken',    token)
    localStorage.setItem('adminRole', 'doctor')
    setDToken(token)
    setRole('doctor')
  }

  const logout = () => {
    localStorage.removeItem('aToken')
    localStorage.removeItem('dToken')
    localStorage.removeItem('adminRole')
    setAToken('')
    setDToken('')
    setRole(null)
    setDoctorData(null)
  }

  // ── Fetch doctor profile after login ──────────────────────────────────────
  const loadDoctorProfile = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { dtoken: dToken }
      })
      if (data.success) setDoctorData(data.profileData)
    } catch (err) {
      console.error('Could not load doctor profile:', err.message)
    }
  }

  const value = {
    backendUrl,
    aToken, setAToken, loginAsAdmin,
    dToken, setDToken, loginAsDoctor,
    role,
    doctorData, setDoctorData, loadDoctorProfile,
    logout,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
