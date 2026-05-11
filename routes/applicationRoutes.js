import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getAllApplications, updateApplcationStatus, getRecruiterApplications } from "../controllers/applicationController.js";

const applicationRouter = express.Router();

applicationRouter.get("/appliedjobs", userAuth, getAllApplications)
applicationRouter.post('/update-status', userAuth, updateApplcationStatus)
applicationRouter.get("/recruiter-applications", userAuth, getRecruiterApplications)

export default applicationRouter;