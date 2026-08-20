import express from 'express';
import {
    getCompanyReviews,
    addCompanyReview,
    updateCompanyReview,
    deleteCompanyReview,
    markReviewHelpful,
    getCompanyReviewStats
} from '../controllers/companyReviewController.js';
import { userAuth } from '../middlewares/userAuth.js';

const companyReviewRouter = express.Router();

// Public routes
companyReviewRouter.get('/:companyId', getCompanyReviews);
companyReviewRouter.get('/:companyId/stats', getCompanyReviewStats);

// Protected routes (require authentication)
companyReviewRouter.post('/:companyId', userAuth, addCompanyReview);
companyReviewRouter.put('/:reviewId', userAuth, updateCompanyReview);
companyReviewRouter.delete('/:reviewId', userAuth, deleteCompanyReview);
companyReviewRouter.post('/:reviewId/helpful', userAuth, markReviewHelpful);

export default companyReviewRouter;
