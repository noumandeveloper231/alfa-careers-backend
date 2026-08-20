import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
    subject: {type: String, default: "Notification"},
    type: {type: String, default: "Notification"},
}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;