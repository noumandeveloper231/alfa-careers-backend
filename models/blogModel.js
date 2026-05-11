import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  excerpt: String,
  coverImage: String,
  category: String,
  tags: Array,
  status: { type: String, enum: ["draft", "published"], default: "published" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);