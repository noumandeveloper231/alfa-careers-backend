import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, default: "" }
});

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
