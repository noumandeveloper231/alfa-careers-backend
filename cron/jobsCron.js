import cron from "node-cron";
import jobsModel from "../models/jobsModel.js";

export const startJobsCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await jobsModel.updateMany(
        { applicationDeadline: { $lt: new Date() }, isActive: true },
        { $set: { isActive: false } }
      );
      console.log("Expired jobs updated ✅");
    } catch (err) {
      console.error("Cron job failed ❌", err);
    }
  });
};