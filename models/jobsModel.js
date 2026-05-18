import mongoose from "mongoose";

const jobsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    zip: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    slug: { type: String, required: true },

    // Job Type
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "temporary"],
      required: true,
    },

    // Salary
    salaryType: { type: String, enum: ["fixed", "range"], default: "fixed" },
    fixedSalary: { type: Number },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    currency: { type: String, default: "USD" },
    salaryRate: {
      type: String,
      enum: ["Hourly", "Monthly", "Yearly"],
      default: "Monthly",
    },

    // Job Description & Requirements
    responsibilities: { type: [String] },
    qualifications: { type: String, required: true },
    skills: { type: [String], required: true },
    experience: {
      type: String,
      enum: ["Fresh", "1 Year", "2 Years", "3 Years", "4 Years", "5 Years+"],
      required: true,
    },
    careerLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Executive"],
    },

    // Company & employee
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
    },

    // Job category
    category: { type: String, required: true },
    subCategory: { type: String, default: "" },

    // Job Details
    quantity: { type: Number, default: 1 },
    gender: { type: String, enum: ["Male", "Female", "Any"], default: "Any" },
    closingDays: { type: Number },

    // Application Settings
    applicationDeadline: { type: Date, required: true },
    jobApplyType: {
      type: String,
      enum: ["External", "Email", "Internal", "Call"],
      default: "Email",
    },
    externalUrl: { type: String },
    userEmail: { type: String },
    callNumber: { type: String },

    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "userProfile" }],

    // Media
    coverImage: { type: String },
    gallery: { type: [String], default: [] },
    video: { type: String },

    // Status
    approved: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "modified"],
      default: "pending",
    },
    modifiedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional/Legacy but potentially useful
    benefits: { type: [String], default: [] },
  },
  { timestamps: true },
);

const jobsModel = mongoose.models?.Jobs || mongoose.model("Jobs", jobsSchema);
export default jobsModel;
