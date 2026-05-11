import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import jobsRouter from "./routes/jobsRouter.js";
import 'dotenv/config'
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRoutes.js";
import { startJobsCron } from "./cron/jobsCron.js";
import analyticRouter from "./routes/analyticRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import blogRouter from "./routes/blogRoutes.js";
import axios from 'axios';
import cron from 'node-cron';
import chatRouter from "./routes/chatBotRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { startStatusCron } from "./cron/recruiterCron.js";
import notificationRouter from "./routes/notificationRoutes.js";
import companyReviewRouter from "./routes/companyReviewRoutes.js";
import profileRouter from "./routes/profileRoutes.js";

const app = express();
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "https://afla-careers-frontend.onrender.com"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

const PORT = process.env.PORT || 5000;

// Lightweight ping route
// app.get('/ping', (req, res) => res.sendStatus(200));

app.get('/', (req, res) => {
    res.send("I am Working");
});

connectDB();
startJobsCron();
startStatusCron();

// Ping backend every 5 minutes to prevent cold start
// const SELF_URL = process.env.SELF_URL || 'http://localhost:5000/ping';

// cron.schedule('*/5 * * * *', async () => {
//     try {
//         await axios.get(SELF_URL);
//         console.log('Pinged self at', new Date().toLocaleTimeString());
//     } catch (err) {
//         console.log('Error pinging self:', err.message);
//     }
// });

// Express
app.get('/download', async (req, res) => {
  const imageUrl = req.query.url
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()

  res.setHeader('Content-Disposition', 'attachment; filename=image.jpg')
  res.send(Buffer.from(buffer))
})


app.use('/api/jobs', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/analytics', analyticRouter);
app.use('/api/blog', blogRouter);
app.use('/api/chat', chatRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter)
app.use('/api/company-reviews', companyReviewRouter)
app.use('/api/profile', profileRouter)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`App Listening on http://0.0.0.0:${PORT}`);
});