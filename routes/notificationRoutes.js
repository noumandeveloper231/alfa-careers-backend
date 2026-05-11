import express from 'express'
import userAuth from "../middlewares/userAuth.js";
import { getNotifications, sendNotification } from '../controllers/notificationConvtroller.js';

const notificationRouter = express.Router();

notificationRouter.post('/send', userAuth, sendNotification)
notificationRouter.get('/get', userAuth, getNotifications)

export default notificationRouter;