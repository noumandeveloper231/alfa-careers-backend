import express from "express";
import { 
    weeklyAnalytic,
    getDashboardStats,
    jobAnalytics,
    applicationAnalytics,
    userAnalytics,
    systemAnalytics
} from "../controllers/analyticsController.js";
import userAuth from "../middlewares/userAuth.js";

const analyticRouter = express.Router();

// Dashboard overview
analyticRouter.get('/dashboard-stats', userAuth, getDashboardStats);

// Weekly analytics
analyticRouter.get('/weekly-analytics', userAuth, weeklyAnalytic);

// Specific analytics
analyticRouter.get('/job-analytics', userAuth, jobAnalytics);
analyticRouter.get('/application-analytics', userAuth, applicationAnalytics);
analyticRouter.get('/user-analytics', userAuth, userAnalytics);
analyticRouter.get('/system-analytics', userAuth, systemAnalytics);

export default analyticRouter;