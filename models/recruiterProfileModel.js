import mongoose from "mongoose";

const recruiterProfileSchema = new mongoose.Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  isOnboardingCompleted: { type: Boolean, default: false },
  slug: { type: String },
  isActive: { type: Boolean, default: false },
  name: { type: String, default: '' },
  tagline: { type: String, default: '' },
  email: { type: String, default: '' },
  company: { type: String, default: '' },
  isCompany: { type: Boolean, default: false },
  companyType: { type: String, default: '' },
  members: { type: String, default: '0-50', enum: ['0-50', '50-100', '100-500', '500-1000', '1000+'] },
  foundedIn: { type: String, default: "" },
  website: { type: String, default: "" },
  role: { type: String, default: "user" },
  profilePicture: { type: String, default: "" },
  banner: { type: String, default: "" },
  city: { type: String, default: "" },
  address: { type: String, default: "" },
  country: { type: String, default: "" },
  state: { type: String, default: "" },
  latitude: { type: Number },
  longitude: { type: Number },
  contactNumber: { type: String, default: "" },
  about: { type: String, default: "" },
  category: { type: String, default: "" },
  companyImages: [{ type: String, default: [] }],
  sentJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],
  savedApplicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  followersAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followedAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isBanned: { type: Boolean, default: false },
  profileScore: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  isAssistant: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  assistantRoles: [
    {
      type: String,
      enum: [
        "blog", // Blog Manager
        "emp-profile-req", // Employee Profile Request Manager
        "employee", // Employee Manager
        "user", // User Manager
        "emp-approval-req", // Employee Profile Requests Managet
        "job-requests",
        "cat-manager"
      ],
      default: ""
    },
  ],

  assistants: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecruiterProfile" }],

  profileViewsCount: { type: Number, default: 0 },

  reviewStatus: { type: String, default: "pending", enum: ["pending", "underReview", "approved", "rejected"] },
}, { timestamps: true });

export default mongoose.model("RecruiterProfile", recruiterProfileSchema);