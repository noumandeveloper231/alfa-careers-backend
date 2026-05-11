import mongoose from "mongoose";

const profileViewSchema = new mongoose.Schema({
  viewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  viewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  viewedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ProfileView", profileViewSchema);
