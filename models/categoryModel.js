import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: "Tag" },
  subcategories: [{ type: String }],
  slug: { type: String, default: ""}
});

const Category = mongoose.model("Category", categorySchema);
export default Category;