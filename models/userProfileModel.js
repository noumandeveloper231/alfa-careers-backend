import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  isOnboardingCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  name: { type: String, default: '' },
  lastName: { type: String, default: '' },
  slug: { type: String, default: '' },
  email: { type: String, default: '' },
  profilePicture: { type: String, default: "" },
  savedJobs: { type: Array, default: [] },
  role: { type: String, default: "user" }, // applicant, recruiter
  profileScore: { type: Number, default: 0 },
  headline: { type: String, default: "" },
  phone: { type: String, default: "" },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  address: { type: String, default: "" },
  postal: { type: String, default: "" },
  appliedJobs: { type: Array, default: [] },
  skills: { type: Array, default: [] },
  isBanned: { type: Boolean, default: false },
  currency: { type: String, default: "USD" },
  followersAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followedAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  age: { type: String, enum: ["18-25", "25-30", "30-35", "35-40"], default: "18-25" },

  // 🆕 Resume & extra fields
  resume: { type: String, default: "" },   // file URL (PDF/Doc)
  resumeExt: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  github: { type: String, default: "" },
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },

  // 🆕 Expanded Profile Fields
  coverImage: { type: String, default: "" },
  currentPosition: { type: String, default: "fresh" },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  dob: { type: Date, default: new Date() },
  language: { type: String, default: "" },
  qualification: { type: String, default: "" },
  experienceYears: { type: String, default: "" },
  offeredSalary: { type: Number, default: 30 },
  salaryType: { type: String, enum: ["month", "year", "day"], default: "month" },

  // 🌐 Predefined Social Networks
  linkedin: { type: String, default: "" },
  twitter: { type: String, default: "" },
  facebook: { type: String, default: "" },
  instagram: { type: String, default: "" },
  youtube: { type: String, default: "" },
  tiktok: { type: String, default: "" },

  // 🌐 Custom Social Networks
  customSocialNetworks: [{
    network: { type: String },
    url: { type: String }
  }],
  videoUrl: { type: String, default: "" },

  // 📚 Education
  education: [{
    title: { type: String },
    level: { type: String },
    from: { type: Date },
    to: { type: Date }, // null if present
    description: { type: String }
  }],

  // 💼 Experience
  experience: [{
    jobTitle: { type: String },
    company: { type: String },
    from: { type: Date },
    to: { type: Date }, // null if present
    description: { type: String }
  }],

  // 🚀 Projects
  projects: [{
    title: { type: String },
    link: { type: String },
    description: { type: String },
    images: { type: Array, default: [] }
  }],

  // 🏆 Awards
  awards: [{
    title: { type: String },
    date: { type: Date },
    description: { type: String }
  }],
  profileViewsCount: { type: Number, default: 0 },
  // 📈 Profile Analytics
  profileViews: [{
    date: { type: Date, default: Date.now },
    count: { type: Number, default: 1 }
  }],
}, { timestamps: true });


export default mongoose.model("UserProfile", userProfileSchema);