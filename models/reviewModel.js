import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name: {type: String, default: "Anonymous"},
    profilePicture: {type: String, default: ""},
    review: {type: String, default: "", required: true},
    rating: {type: Number, default: 0, required: true},

}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);