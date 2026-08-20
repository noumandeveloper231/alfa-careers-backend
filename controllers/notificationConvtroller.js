import Notification from "../models/notificationModel.js";

export const sendNotification = async (req, res) => {
    const { user, subject, type } = req.body;  // Renamed 'for' to 'user'

    if (!user || !subject || !type) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        const notification = new Notification({ user, subject, type });

        await notification.save();

        return res.json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotifications = async (req, res) => {
    const userId = req.user._id

    try {
        const notifications = await Notification.find({ user: userId });

        return res.json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
