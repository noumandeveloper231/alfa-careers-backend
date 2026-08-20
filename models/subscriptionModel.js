import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    type: {
      type: String,
      enum: ["one-time", "recurring"],
      default: "one-time",
    },
    status: {
      type: String,
      enum: ["pending", "active", "failed", "cancelled", "expired"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeInvoiceUrl: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentMethod: {
      brand: String,
      last4: String,
      expMonth: Number,
      expYear: Number,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    autoRenewDate: {
      type: Date,
      default: null,
    },
    packageSnapshot: {
      name: String,
      price: Number,
      currency: String,
      jobsToApply: Number,
      wishlistJobs: Number,
      followCompanies: Number,
      companyInJobs: Boolean,
      companyInformation: Boolean,
      jobPostings: Number,
      featuredJobs: Number,
      candidateAccess: Boolean,
      candidatesFollow: Number,
      inviteCandidates: Boolean,
      sendMessages: Boolean,
      printProfiles: Boolean,
      reviewComment: Boolean,
      viewCandidateInfo: Boolean,
      support: String,
      packageType: String,
      features: [String],
      packageAudience: String,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripePaymentIntentId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

const Subscription =
  mongoose.models?.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
