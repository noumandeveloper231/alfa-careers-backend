import express from 'express'
import { addJob, getAllJobs, getApprovedJobs, getCategoryJobs, getCompanyJobs, getCompanyJobsById, getJob, getJobBySlug, getPendingJobs, getSavedJobs, getSponsoredJobs, removeJob, searchJob, updateJob, updateJobStatus } from '../controllers/jobsController.js'
import userAuth from '../middlewares/userAuth.js';

const jobsRouter = express.Router()

jobsRouter.post("/addjob", userAuth, addJob);
jobsRouter.post("/getJob", getJob);
jobsRouter.get('/getjobbyslug/:slug', getJobBySlug)
jobsRouter.get('/getalljobs', getAllJobs);
jobsRouter.get('/getcompanyjobs/:slug', getCompanyJobs);
jobsRouter.get('/getsavedjobs', userAuth, getSavedJobs);
jobsRouter.patch('/updatejobstatus', updateJobStatus);
jobsRouter.get('/getapprovedjobs', getApprovedJobs);
jobsRouter.get('/getpendingjobs', getPendingJobs);
jobsRouter.get('/searchjobs', searchJob);
jobsRouter.get('/searchjobs/:location', searchJob);
jobsRouter.post('/getcategoryjobs', getCategoryJobs);
jobsRouter.get('/getsponsoredjobs', getSponsoredJobs);
jobsRouter.delete('/removejob/:id', removeJob);
jobsRouter.put('/updatejob/:id', userAuth, updateJob);
jobsRouter.get('/getcompanyjobsbyid/:id', getCompanyJobsById);

export default jobsRouter;