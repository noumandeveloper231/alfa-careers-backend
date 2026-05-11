import companyReviewModel from "../models/companyReviewModel.js";
import recruiterProfileModel from "../models/recruiterProfileModel.js";
import userProfileModel from "../models/userProfileModel.js";
import mongoose from "mongoose";

// Get all reviews for a specific company
export const getCompanyReviews = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        if (!companyId) {
            return res.status(400).json({ success: false, message: 'Company ID is required' });
        }

        // Find company by authId first, then get the profile _id
        let company = await recruiterProfileModel.findOne({ authId: companyId });
        if (!company) {
            company = await recruiterProfileModel.findById(companyId);
        }
        
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const actualCompanyId = company._id;

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const reviews = await companyReviewModel
            .find({ companyId: actualCompanyId, status: 'approved' })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('reviewerId', 'name profilePicture');

        const totalReviews = await companyReviewModel.countDocuments({ companyId: actualCompanyId, status: 'approved' });

        // Calculate average ratings
        const ratingStats = await companyReviewModel.aggregate([
            { $match: { companyId: actualCompanyId, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    avgWorkLifeBalance: { $avg: '$workLifeBalance' },
                    avgSalary: { $avg: '$salary' },
                    avgCulture: { $avg: '$culture' },
                    avgManagement: { $avg: '$management' },
                    avgCareerGrowth: { $avg: '$careerGrowth' },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        // Calculate rating distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (ratingStats.length > 0) {
            ratingStats[0].ratingDistribution.forEach(rating => {
                ratingDistribution[rating]++;
            });
        }

        const stats = ratingStats.length > 0 ? {
            ...ratingStats[0],
            ratingDistribution
        } : {
            avgRating: 0,
            avgWorkLifeBalance: 0,
            avgSalary: 0,
            avgCulture: 0,
            avgManagement: 0,
            avgCareerGrowth: 0,
            totalReviews: 0,
            ratingDistribution
        };

        return res.json({
            success: true,
            reviews,
            stats,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews,
                hasNext: page * limit < totalReviews,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching company reviews:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add a new review for a company
export const addCompanyReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyId } = req.params;
        const {
            rating,
            title,
            review,
            pros,
            cons,
            workLifeBalance,
            salary,
            culture,
            management,
            careerGrowth,
            isAnonymous,
            jobTitle,
            employmentStatus,
            workDuration
        } = req.body;

        if (!companyId || !rating || !title || !review) {
            return res.status(400).json({ 
                success: false, 
                message: 'Company ID, rating, title, and review are required' 
            });
        }

        // Find company by authId first, then get the profile _id
        let company = await recruiterProfileModel.findOne({ authId: companyId });
        if (!company) {
            company = await recruiterProfileModel.findById(companyId);
        }
        
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        // Get user details
        const user = await userProfileModel.findOne({ authId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user already reviewed this company
        const existingReview = await companyReviewModel.findOne({
            companyId: company._id,
            reviewerId: user._id
        });

        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already reviewed this company' 
            });
        }

        const newReview = new companyReviewModel({
            companyId: company._id,
            reviewerId: user._id,
            reviewerName: isAnonymous ? 'Anonymous' : user.name,
            reviewerProfilePicture: isAnonymous ? '' : user.profilePicture,
            rating,
            title,
            review,
            pros: pros || '',
            cons: cons || '',
            workLifeBalance: workLifeBalance || 3,
            salary: salary || 3,
            culture: culture || 3,
            management: management || 3,
            careerGrowth: careerGrowth || 3,
            isAnonymous: isAnonymous || false,
            jobTitle: jobTitle || '',
            employmentStatus: employmentStatus || 'current',
            workDuration: workDuration || ''
        });

        await newReview.save();

        return res.json({
            success: true,
            message: 'Review added successfully',
            review: newReview
        });
    } catch (error) {
        console.error('Error adding company review:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update a review (only by the reviewer)
export const updateCompanyReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        const updateData = req.body;

        const user = await userProfileModel.findOne({ authId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const review = await companyReviewModel.findOne({
            _id: reviewId,
            reviewerId: user._id
        });

        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found or you are not authorized to update it' 
            });
        }

        const updatedReview = await companyReviewModel.findByIdAndUpdate(
            reviewId,
            { $set: updateData },
            { new: true }
        );

        return res.json({
            success: true,
            message: 'Review updated successfully',
            review: updatedReview
        });
    } catch (error) {
        console.error('Error updating company review:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a review (only by the reviewer)
export const deleteCompanyReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;

        const user = await userProfileModel.findOne({ authId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const review = await companyReviewModel.findOne({
            _id: reviewId,
            reviewerId: user._id
        });

        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found or you are not authorized to delete it' 
            });
        }

        await companyReviewModel.findByIdAndDelete(reviewId);

        return res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting company review:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await companyReviewModel.findByIdAndUpdate(
            reviewId,
            { $inc: { isHelpful: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        return res.json({
            success: true,
            message: 'Review marked as helpful',
            helpfulCount: review.isHelpful
        });
    } catch (error) {
        console.error('Error marking review as helpful:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get company review statistics
export const getCompanyReviewStats = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ success: false, message: 'Company ID is required' });
        }

        // Find company by authId first, then get the profile _id
        let company = await recruiterProfileModel.findOne({ authId: companyId });
        if (!company) {
            company = await recruiterProfileModel.findById(companyId);
        }
        
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const actualCompanyId = company._id;

        const stats = await companyReviewModel.aggregate([
            { $match: { companyId: actualCompanyId, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    avgWorkLifeBalance: { $avg: '$workLifeBalance' },
                    avgSalary: { $avg: '$salary' },
                    avgCulture: { $avg: '$culture' },
                    avgManagement: { $avg: '$management' },
                    avgCareerGrowth: { $avg: '$careerGrowth' }
                }
            }
        ]);

        const ratingDistribution = await companyReviewModel.aggregate([
            { $match: { companyId: actualCompanyId, status: 'approved' } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach(item => {
            distribution[item._id] = item.count;
        });

        const result = stats.length > 0 ? {
            ...stats[0],
            ratingDistribution: distribution
        } : {
            totalReviews: 0,
            avgRating: 0,
            avgWorkLifeBalance: 0,
            avgSalary: 0,
            avgCulture: 0,
            avgManagement: 0,
            avgCareerGrowth: 0,
            ratingDistribution: distribution
        };

        return res.json({ success: true, stats: result });
    } catch (error) {
        console.error('Error fetching company review stats:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
