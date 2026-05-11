import recruiterProfileModel from "../models/recruiterProfileModel.js";
import userProfileModel from "../models/userProfileModel.js";
import jobsModel from "../models/jobsModel.js";
import applicationModel from "../models/applicationModel.js";
import blogModel from "../models/blogModel.js";
import authModels from "../models/authModels.js";
import Category from "../models/categoryModel.js";

export const weeklyAnalytic = async (req, res) => {
    try {
        const now = new Date();
        const jobResults = [];
        const userResults = [];
        const recruiterResults = [];

        for (let i = 0; i < 7; i++) {
            const start = new Date(now);
            start.setDate(now.getDate() - i);

            const end = new Date(now);
            end.setDate(now.getDate() - (i + 1));

            const count = await jobsModel.countDocuments({
                createdAt: { $gte: end, $lt: start }
            });

            jobResults.push({
                day: end.toISOString().split("T")[0], // yyyy-mm-dd format
                jobs: count
            });
        }

        for (let i = 0; i < 7; i++) {
            const start = new Date(now);
            start.setDate(now.getDate() - i);

            const end = new Date(now);
            end.setDate(now.getDate() - (i + 1));

            const count = await userProfileModel.countDocuments({
                createdAt: { $gte: end, $lt: start }
            });

            userResults.push({
                day: end.toISOString().split("T")[0], // yyyy-mm-dd format
                users: count
            });
        }

        for (let i = 0; i < 7; i++) {
            const start = new Date(now);
            start.setDate(now.getDate() - i);

            const end = new Date(now);
            end.setDate(now.getDate() - (i + 1));

            const count = await recruiterProfileModel.countDocuments({
                createdAt: { $gte: end, $lt: start }
            });

            recruiterResults.push({
                day: end.toISOString().split("T")[0], // yyyy-mm-dd format
                recruiters: count
            });
        }

        // reverse so oldest day comes first
        jobResults.reverse();
        userResults.reverse();
        recruiterResults.reverse();

        return res.json({ success: true, jobs: jobResults, users: userResults, recruiters: recruiterResults });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Dashboard Overview Statistics
export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total counts
        const totalUsers = await userProfileModel.countDocuments();
        const totalRecruiters = await recruiterProfileModel.countDocuments();
        const totalJobs = await jobsModel.countDocuments();
        const totalApplications = await applicationModel.countDocuments();
        const totalBlogs = await blogModel.countDocuments();

        // This month counts
        const usersThisMonth = await userProfileModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const recruitersThisMonth = await recruiterProfileModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const jobsThisMonth = await jobsModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const applicationsThisMonth = await applicationModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Last month counts for comparison
        const usersLastMonth = await userProfileModel.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const recruitersLastMonth = await recruiterProfileModel.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const jobsLastMonth = await jobsModel.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const applicationsLastMonth = await applicationModel.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(1);
        };

        const stats = {
            totalUsers,
            totalRecruiters,
            totalJobs,
            totalApplications,
            totalBlogs,
            growth: {
                users: calculateGrowth(usersThisMonth, usersLastMonth),
                recruiters: calculateGrowth(recruitersThisMonth, recruitersLastMonth),
                jobs: calculateGrowth(jobsThisMonth, jobsLastMonth),
                applications: calculateGrowth(applicationsThisMonth, applicationsLastMonth)
            }
        };

        return res.json({ success: true, stats });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Job Analytics
export const jobAnalytics = async (req, res) => {
    try {
        // Jobs by category
        const jobsByCategory = await jobsModel.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Jobs by location type
        const jobsByLocationType = await jobsModel.aggregate([
            { $group: { _id: "$locationType", count: { $sum: 1 } } }
        ]);

        // Jobs by type
        const jobsByType = await jobsModel.aggregate([
            { $group: { _id: "$jobType", count: { $sum: 1 } } }
        ]);

        // Recent jobs
        const recentJobs = await jobsModel.find()
            .select('title company category createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.json({
            success: true,
            jobsByCategory,
            jobsByLocationType,
            jobsByType,
            recentJobs
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Application Analytics
export const applicationAnalytics = async (req, res) => {
    try {
        // Applications by status
        const applicationsByStatus = await applicationModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Application success rate
        const totalApplications = await applicationModel.countDocuments();
        const hiredApplications = await applicationModel.countDocuments({ status: "hired" });
        const successRate = totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(1) : 0;

        // Recent applications
        const recentApplications = await applicationModel.find()
            .populate('job', 'title company')
            .populate('applicant', 'name')
            .select('status createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.json({
            success: true,
            applicationsByStatus,
            successRate,
            recentApplications
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// User Analytics
export const userAnalytics = async (req, res) => {
    try {
        // Users by role
        const usersByRole = await authModels.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Active users (users who have applied for jobs)
        const activeUsers = await applicationModel.distinct("applicant").then(ids => ids.length);
        const totalUsers = await userProfileModel.countDocuments();
        const activeUserPercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

        // Recent users
        const recentUsers = await userProfileModel.find()
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        return res.json({
            success: true,
            usersByRole,
            activeUsers,
            totalUsers,
            activeUserPercentage,
            recentUsers
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// System Analytics
export const systemAnalytics = async (req, res) => {
    try {
        // Database collection sizes
        const collections = [
            { name: 'Users', count: await userProfileModel.countDocuments() },
            { name: 'Recruiters', count: await recruiterProfileModel.countDocuments() },
            { name: 'Jobs', count: await jobsModel.countDocuments() },
            { name: 'Applications', count: await applicationModel.countDocuments() },
            { name: 'Blogs', count: await blogModel.countDocuments() },
            { name: 'Categories', count: await Category.countDocuments() }
        ];

        // Recent activity (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentActivity = {
            newUsers: await userProfileModel.countDocuments({ createdAt: { $gte: yesterday } }),
            newJobs: await jobsModel.countDocuments({ createdAt: { $gte: yesterday } }),
            newApplications: await applicationModel.countDocuments({ createdAt: { $gte: yesterday } }),
            newBlogs: await blogModel.countDocuments({ createdAt: { $gte: yesterday } })
        };

        return res.json({
            success: true,
            collections,
            recentActivity
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
