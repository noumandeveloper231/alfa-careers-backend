import express from 'express'
import { addReview, getRatingAnalytics, getReviews } from '../controllers/reviewController.js'


const reviewRouter = express.Router()

reviewRouter.post('/add-review', addReview);
reviewRouter.get('/get-reviews', getReviews);
reviewRouter.get('/rating-analytics', getRatingAnalytics);

export default reviewRouter;