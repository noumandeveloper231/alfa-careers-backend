import express from "express";
import userAuth from "../middlewares/userAuth.js";
import {
  createPaymentIntent,
  confirmRecurringSubscription,
  handleWebhook,
  getUserSubscriptions,
  getActiveSubscription,
  cancelSubscription,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-intent", userAuth, createPaymentIntent);
paymentRouter.post("/confirm-recurring", userAuth, confirmRecurringSubscription);
paymentRouter.post("/webhook", handleWebhook);
paymentRouter.get("/subscriptions", userAuth, getUserSubscriptions);
paymentRouter.get("/subscription/active", userAuth, getActiveSubscription);
paymentRouter.delete("/subscription/:subscriptionId", userAuth, cancelSubscription);

export default paymentRouter;