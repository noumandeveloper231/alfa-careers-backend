import ProfileView from "../models/profileViewModel.js";
import authModel from "../models/authModels.js";
import userProfileModel from "../models/userProfileModel.js";
import recruiterProfileModel from "../models/recruiterProfileModel.js";

// POST /api/profile/:id/view
export const recordProfileView = async (req, res) => {
  try {
    const viewerId = req.user?._id || null; // anonymous if null
    const viewedId = req.params.id; // auth _id of viewed user/recruiter

    // Ignore self-view
    if (viewerId && viewerId.toString() === viewedId) {
      return res.json({ message: "self view ignored" });
    }

    // Check if already viewed in last 24h by this viewer
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingView = await ProfileView.findOne({
      viewerId,
      viewedUserId: viewedId,
      viewedAt: { $gte: lastDay },
    });

    if (!existingView) {
      // Save view event
      await ProfileView.create({ viewerId, viewedUserId: viewedId });

      // Increment cached counter on profile
      const viewedAuth = await authModel.findById(viewedId);
      if (viewedAuth) {
        if (viewedAuth.role === "user") {
          await userProfileModel.findOneAndUpdate(
            { authId: viewedId },
            { $inc: { profileViewsCount: 1 } }
          );
        } else if (viewedAuth.role === "recruiter") {
          await recruiterProfileModel.findOneAndUpdate(
            { authId: viewedId },
            { $inc: { profileViewsCount: 1 } }
          );
        }
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Record Profile View Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/profile/:id/views
export const getProfileViews = async (req, res) => {
  try {
    const { id } = req.params; // auth _id of viewed user/recruiter
    const views = await ProfileView.find({ viewedUserId: id })
      .populate("viewerId", "name email profilePicture role")
      .sort({ viewedAt: -1 })
      .limit(50);

    return res.json({ success: true, views });
  } catch (error) {
    console.error("Get Profile Views Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfileViewsForPeriod = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const periodStr = req.url.split("/")[2]; // e.g. "period-7"
    const period = parseInt(periodStr.split("-")[1]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const views = await ProfileView.aggregate([
      {
        $match: {
          viewedUserId: userId,
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({ success: true, views });
  } catch (err) {
    next(err);
  }
};
