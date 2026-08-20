import mongoose from "mongoose";

const companyCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, default: "" }
});

const CompanyCategory = mongoose.model("CompanyCategory", companyCategorySchema);
export default CompanyCategory;
