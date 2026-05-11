import express from 'express'
import { chatBot } from '../controllers/chatBotController.js'

const chatRouter = express.Router()

chatRouter.post('/chatbot', chatBot);

export default chatRouter