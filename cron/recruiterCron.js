import cron from "node-cron";
import recruiterProfileModel from "../models/recruiterProfileModel.js";

export const startStatusCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await recruiterProfileModel.updateMany(
        { profileScore: 100, reviewStatus: "pending" },
        { reviewStatus: "underReview" }
      );
      console.log("Checked 100 score ones ✅");
    } catch (err) {
      console.error("Cron job failed for ProfileScore one ❌", err);
    }
  });
};