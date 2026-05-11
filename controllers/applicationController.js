import applicationModel from "../models/applicationModel.js";

export const getAllApplications = async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        return res.json({ success: false, message: "Unauthorized" });
    }

    try {
        const applications = await applicationModel.find({ applicant: userId })
            .populate("job", "title company location jobType salary companyProfile")
            .populate("recruiter", "name email")
            .populate("applicant", "name email");

        if (!applications || applications.length === 0) {
            return res.json({ success: false, message: "No Applications Found!" })
        }

        return res.json({ success: true, applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

export const updateApplcationStatus = async (req, res) => {
    const userId = req.user._id; // recruiter id

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { status, applicationId } = req.body;

        if (!status || !applicationId) {
            return res.status(400).json({ success: false, message: "Missing status or application ID" });
        }

        const application = await applicationModel.findById(applicationId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.status = status;
        await application.save();

        return res.json({ success: true, message: `Application ${application.status}`, application });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// Get applications for recruiter
export const getRecruiterApplications = async (req, res) => {
    try {
        const userId = req.user._id;

        const applications = await applicationModel.find({ recruiter: userId })
            .populate("job", "title company location jobType salary")
            .populate("applicant", "name email phone resume profilePicture")
            .sort({ createdAt: -1 });

        return res.json({ success: true, applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}