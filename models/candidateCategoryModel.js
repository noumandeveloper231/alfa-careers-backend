import mongoose from "mongoose";

const candidateCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, default: "" }
});

const CandidateCategory = mongoose.model("CandidateCategory", candidateCategorySchema);
export default CandidateCategory;
