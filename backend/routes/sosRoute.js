import express      from 'express'
import { sendSOS }  from '../controllers/sosController.js'
import { authUser } from '../middleware/authMiddleware.js'

const sosRouter = express.Router()

// POST /api/sos/send — requires patient login
sosRouter.post('/send', authUser, sendSOS)

export default sosRouter
