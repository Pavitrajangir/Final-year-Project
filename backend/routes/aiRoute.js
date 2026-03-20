import express       from 'express'
import { aiChat }    from '../controllers/aiController.js'

const aiRouter = express.Router()

// POST /api/ai/chat — no auth required (public endpoint)
aiRouter.post('/chat', aiChat)

export default aiRouter
