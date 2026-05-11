import mongoose from "mongoose";

const companyReviewSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruiterProfile", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
    reviewerName: { type: String, required: true },
    reviewerProfilePicture: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    review: { type: String, required: true },
    pros: { type: String, default: "" },
    cons: { type: String, default: "" },
    workLifeBalance: { type: Number, min: 1, max: 5, default: 3 },
    salary: { type: Number, min: 1, max: 5, default: 3 },
    culture: { type: Number, min: 1, max: 5, default: 3 },
    management: { type: Number, min: 1, max: 5, default: 3 },
    careerGrowth: { type: Number, min: 1, max: 5, default: 3 },
    isVerified: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    jobTitle: { type: String, default: "" },
    employmentStatus: { type: String, enum: ["current", "former"], default: "current" },
    workDuration: { type: String, default: "" }, // e.g., "2 years", "6 months"
    isHelpful: { type: Number, default: 0 }, // count of helpful votes
    isReported: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" }
}, { timestamps: true });

// Index for better query performance
companyReviewSchema.index({ companyId: 1, createdAt: -1 });
companyReviewSchema.index({ rating: 1 });

export default mongoose.model("CompanyReview", companyReviewSchema);
