import express from 'express';
import rateLimit from 'express-rate-limit';
import { addAssistant, banUser, changePassword, changeVisibility, checkAdmin, deleteAccount, deleteUser, employeeProfileRequests, getAssistants, getPendingProfileRequests, isAuthenticated, login, logout, register, resetPasswordWithOTP, sendPasswordResetOTP, unBanUser, updateRecruiterStatus, verifyEmail, verifyPasswordResetOTP } from '../controllers/authController.js';
import userAuth from '../middlewares/userAuth.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRouter = express.Router()

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', logout);
authRouter.get("/is-auth", userAuth, isAuthenticated)
authRouter.get('/check-admin', userAuth, checkAdmin);
authRouter.post('/verify-account', verifyEmail);
authRouter.post('/delete-user', userAuth, deleteUser);
authRouter.post('/change-password', userAuth, changePassword);
authRouter.post('/delete-account', userAuth, deleteAccount);
authRouter.post('/ban-user', userAuth, banUser);
authRouter.post('/unban-user', userAuth, unBanUser);
authRouter.post('/update-employee-status', userAuth, updateRecruiterStatus);
authRouter.post('/employee-profile-request', userAuth, employeeProfileRequests);
authRouter.get('/get-profile-request', userAuth, getPendingProfileRequests);
authRouter.post('/change-visibility', userAuth, changeVisibility);
authRouter.post('/add-assistant', userAuth, addAssistant);
authRouter.get('/get-assistants', userAuth, getAssistants);
authRouter.post('/send-password-reset-otp', sendPasswordResetOTP);
authRouter.post('/verify-password-reset-otp', verifyPasswordResetOTP);
authRouter.post('/reset-password-with-otp', resetPasswordWithOTP);

export default authRouter;