import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "RecruiterProfile", required: true },
    resume: String,
    feedback: {type: String, default: ""},
    status: { type: String, enum: ["applied", "shortlisted", "rejected", "hired"], default: "applied" },
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);