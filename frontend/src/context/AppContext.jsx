import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const adminUrl   = import.meta.env.VITE_ADMIN_URL   || 'http://localhost:5174'

  const [doctors, setDoctors]   = useState([])
  const [token,   setToken]     = useState(localStorage.getItem('token') || '')
  const [userData,setUserData]  = useState(null)

  // ── Fetch all doctors ──────────────────────────────────────────────────────
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`)
      if (data.success) setDoctors(data.doctors)
      else toast.error(data.message)
    } catch (err) {
      // Fallback to local mock data when backend is not running
      const { doctors: mockDoctors } = await import('../assets/assets.js')
      setDoctors(mockDoctors)
    }
  }

  // ── Fetch logged-in user profile ───────────────────────────────────────────
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/get-profile`, {}, {
        headers: { token }
      })
      if (data.success) {
        setUserData({
          ...data.userData,
          address: data.userData.address || { line1: '', line2: '' }
        })
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      console.error('Could not load user profile:', err.message)
    }
  }

  useEffect(() => { getDoctorsData() }, [])

  useEffect(() => {
    if (token) loadUserProfileData()
    else setUserData(null)
  }, [token])

  const value = {
    doctors, getDoctorsData,
    backendUrl, adminUrl,
    token, setToken,
    userData, setUserData, loadUserProfileData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
