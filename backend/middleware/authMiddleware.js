import jwt from 'jsonwebtoken'

//User auth — stores userId on req directly, never touches req.body
export const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token
    if (!token) return res.json({ success: false, message: 'Not authorised. Login again.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id   // store on req, NOT on req.body
    next()
  } catch {
    res.json({ success: false, message: 'Not authorised. Login again.' })
  }
}

// ── Admin auth 
export const authAdmin = async (req, res, next) => {
  try {
    const atoken = req.headers.atoken
    if (!atoken) return res.json({ success: false, message: 'Not authorised. Login again.' })
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET)
    if (decoded.email !== process.env.ADMIN_EMAIL)
      return res.json({ success: false, message: 'Not authorised. Login again.' })
    next()
  } catch {
    res.json({ success: false, message: 'Not authorised. Login again.' })
  }
}

// ── Doctor auth 
export const authDoctor = async (req, res, next) => {
  try {
    const dtoken = req.headers.dtoken
    if (!dtoken) return res.json({ success: false, message: 'Not authorised. Login again.' })
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)
    req.docId = decoded.id    // store on req, NOT on req.body
    next()
  } catch {
    res.json({ success: false, message: 'Not authorised. Login again.' })
  }
}
