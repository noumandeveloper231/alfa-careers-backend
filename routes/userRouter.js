import { saveJob } from "../controllers/jobsController.js";
import userAuth from "../middlewares/userAuth.js";
import {
  applyJob,
  checkProfileScore,
  fetchApplicants,
  getUserData,
  updateProfile,
  updateProfilePicture,
  updateResume,
  getAllRecruiters,
  getAllUsers,
  followUnfollowAccount,
  getCompanyDetails,
  updateBanner,
  followedAccountsDetails,
  uploadCompanyImages,
  uploadProjectImages,
  deleteCompanyImage,
  searchCandidate,
  getFollowing,
  getFollowers,
  getCandidate,
  updateCoverImage, getApplicantDashboardStats,
} from "../controllers/userController.js";
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const userRouter = express.Router();

/* ------------------ 🧩 Cloudinary + Multer Config ------------------ */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isResume = file.fieldname === "resume";
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const baseName = file.originalname.split('.')[0];

    // Add extension ONLY for PDF files
    const finalPublicId = `${baseName}_${Date.now()}`;

    return {
      folder: "users",
      resource_type: "image",

      // No format conversion for raw files
      format: fileExt,

      public_id: finalPublicId,

      // Only image transformations
      transformation: [{ width: 800, height: 600, crop: "limit" }],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadResume = multer({ storage: resumeStorage });

/* ------------------ 🔐 Routes ------------------ */

// User data & profile
userRouter.get("/data", userAuth, getUserData);
userRouter.post("/updateprofile", userAuth, updateProfile);
userRouter.get("/checkprofilescore", userAuth, checkProfileScore);
userRouter.get("/dashboard-stats", userAuth, getApplicantDashboardStats);

// File uploads
userRouter.post('/updateresume', userAuth, uploadResume.single('resume'), updateResume);
userRouter.post("/updateprofilepicture", userAuth, upload.single("profilePicture"), updateProfilePicture);
userRouter.post("/updatebanner", userAuth, upload.single("banner"), updateBanner);
userRouter.post("/updatecoverimage", userAuth, upload.single("coverImage"), updateCoverImage);

// Jobs
userRouter.post("/savejob", userAuth, saveJob);
userRouter.post("/applyjob", userAuth, applyJob);
userRouter.get("/fetchapplicants", userAuth, fetchApplicants);
userRouter.get("/getcandidate/:slug", getCandidate);

// Users & recruiters
userRouter.get("/allusers", getAllUsers);
userRouter.get("/allrecruiters", getAllRecruiters);

// Social & company
userRouter.patch("/follow-unfollow-acc/:id", userAuth, followUnfollowAccount);
userRouter.get("/getcompanydetails/:slug", getCompanyDetails);
userRouter.get("/followedaccounts", userAuth, followedAccountsDetails);
userRouter.get("/getFollowing", userAuth, getFollowing);
userRouter.get("/getFollowers", userAuth, getFollowers);

// Company images
userRouter.post("/upload-company-images", userAuth, upload.array("companyImages", 10), uploadCompanyImages);
userRouter.post("/delete-company-image", userAuth, deleteCompanyImage);

// Project images (applicant profile)
userRouter.post("/upload-project-images", userAuth, upload.array("projectImages", 10), uploadProjectImages);

userRouter.post("/search-candidates", searchCandidate);

export default userRouter;