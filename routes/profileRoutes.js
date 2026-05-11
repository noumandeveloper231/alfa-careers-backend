import express from "express";
import optionalAuth from "../middlewares/optionalAuth.js";
import { recordProfileView, getProfileViews, getProfileViewsForPeriod } from "../controllers/profileViewController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

// Record a profile view (logged-in users or anonymous)
router.post("/:id/view", optionalAuth, recordProfileView);

// Get list of profile views for a user/recruiter (auth id)
router.get("/:id/views", getProfileViews);


// Get profile views data for a user/recruiter (auth id) across 7, 15 and 30 days
router.get("/views/last-7-days", userAuth, getProfileViewsForPeriod);
router.get("/views/last-15-days", userAuth, getProfileViewsForPeriod);
router.get("/views/last-30-days", userAuth, getProfileViewsForPeriod);

export default router;