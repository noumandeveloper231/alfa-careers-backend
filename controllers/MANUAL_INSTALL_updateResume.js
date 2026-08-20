// ============================================================================
// MANUAL INSTALLATION INSTRUCTIONS FOR userController.js
// ============================================================================
//
// 1. ADD THESE IMPORTS AT THE TOP OF userController.js (after line 1):
//    import fs from 'fs';
//    import cloudinary from '../config/cloudinary.js';
//
// 2. REPLACE the existing updateResume function (around line 280-302)
//    with the function below:
// ============================================================================

export const updateResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const userId = req.user._id;
        const baseName = req.file.originalname.split(".")[0];

        // Upload to Cloudinary with resource_type: 'raw' to prevent corruption
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "users",
            resource_type: "raw",  // Critical: prevents PDF corruption
            public_id: `${baseName}_${Date.now()}`,
            format: "pdf"
        });

        // Delete temporary file after upload
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {
            console.error("Error deleting temp file:", e);
        }

        // Update user profile with new resume URL
        const user = await userProfileModel.findOne({ authId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found!" });
        }

        user.resume = result.secure_url;
        user.profileScore = calculateProfileScore(user);
        await user.save();

        res.json({
            success: true,
            message: "Resume updated successfully",
            profile: user,
        });

    } catch (error) {
        // Cleanup temp file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) { }
        }
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
