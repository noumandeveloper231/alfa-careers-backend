import Subscription from "../models/subscriptionModel.js";
import Package from "../models/packageModel.js";
import stripe from "../config/stripe.js";
import authModel from "../models/authModels.js";

const generateInvoiceNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const invoiceNumber = `INV-${dateStr}-${random}`;

  const existing = await Subscription.findOne({ invoiceNumber });
  if (existing) {
    return generateInvoiceNumber();
  }
  return invoiceNumber;
};

const calculateEndDate = (startDate, duration, durationUnit) => {
  const start = new Date(startDate);
  if (durationUnit === "year") {
    start.setFullYear(start.getFullYear() + duration);
  } else {
    start.setMonth(start.getMonth() + duration);
  }
  return start;
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { packageId, type } = req.body;
    const userId = req.user._id;

    if (!packageId) {
      return res.status(400).json({ success: false, message: "Package ID is required" });
    }

    if (!type || !["one-time", "recurring"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid payment type" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    if (!pkg.isActive) {
      return res.status(400).json({ success: false, message: "This package is not available" });
    }

    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const amountInCents = Math.round(pkg.price * 100);

    let stripeCustomerId = null;

    if (type === "recurring") {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.email,
          metadata: { userId: userId.toString() },
        });
        stripeCustomerId = customer.id;
      }
    }

    let paymentIntent = null;
    let clientSecret = null;

    if (type === "one-time") {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: pkg.currency.toLowerCase(),
        metadata: {
          userId: userId.toString(),
          packageId: packageId.toString(),
          type,
        },
        description: `Purchase of ${pkg.name} package`,
      });
      clientSecret = paymentIntent.client_secret;
    } else {
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        usage: "off_session",
        metadata: {
          userId: userId.toString(),
          packageId: packageId.toString(),
          type,
        },
      });
      clientSecret = setupIntent.client_secret;
    }

    const invoiceNumber = await generateInvoiceNumber();

    const subscription = new Subscription({
      userId,
      packageId,
      type,
      status: "pending",
      amount: pkg.price,
      currency: pkg.currency,
      stripeCustomerId,
      invoiceNumber,
      packageSnapshot: {
        name: pkg.name,
        price: pkg.price,
        currency: pkg.currency,
        jobsToApply: pkg.jobsToApply,
        wishlistJobs: pkg.wishlistJobs,
        followCompanies: pkg.followCompanies,
        companyInJobs: pkg.companyInJobs,
        companyInformation: pkg.companyInformation,
        jobPostings: pkg.jobPostings,
        featuredJobs: pkg.featuredJobs,
        candidateAccess: pkg.candidateAccess,
        candidatesFollow: pkg.candidatesFollow,
        inviteCandidates: pkg.inviteCandidates,
        sendMessages: pkg.sendMessages,
        printProfiles: pkg.printProfiles,
        reviewComment: pkg.reviewComment,
        viewCandidateInfo: pkg.viewCandidateInfo,
        support: pkg.support,
        packageType: pkg.packageType,
        features: pkg.features || [],
        packageAudience: pkg.packageAudience,
      },
    });

    if (paymentIntent) {
      subscription.stripePaymentIntentId = paymentIntent.id;
    }

    await subscription.save();

    res.json({
      success: true,
      subscriptionId: subscription._id.toString(),
      clientSecret,
      customerId: stripeCustomerId,
    });
  } catch (error) {
    console.error("createPaymentIntent error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmRecurringSubscription = async (req, res) => {
  try {
    const { subscriptionId, paymentMethodId } = req.body;
    const userId = req.user._id;

    if (!subscriptionId || !paymentMethodId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const sub = await Subscription.findOne({ _id: subscriptionId, userId });
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (sub.status !== "pending") {
      return res.status(400).json({ success: false, message: "Subscription is not in pending state" });
    }

    const pkg = await Package.findById(sub.packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: sub.stripeCustomerId,
    });

    await stripe.customers.update(sub.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const product = await stripe.products.create({
      name: `${pkg.name} - ${pkg.packageAudience === "jobSeeker" ? "Job Seeker" : "Employer"}`,
    });

    const price = await stripe.prices.create({
      unit_amount: Math.round(pkg.price * 100),
      currency: pkg.currency.toLowerCase(),
      product: product.id,
    });

    const stripeSub = await stripe.subscriptions.create({
      customer: sub.stripeCustomerId,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId.toString(),
        packageId: sub.packageId.toString(),
        type: "recurring",
        subscriptionId: subscriptionId.toString(),
      },
    });

    sub.stripeSubscriptionId = stripeSub.id;

    if (stripeSub.latest_invoice?.payment_intent) {
      sub.stripePaymentIntentId = stripeSub.latest_invoice.payment_intent.id;
    }

    await sub.save();

    res.json({
      success: true,
      subscriptionId: sub._id.toString(),
      stripeSubscriptionId: stripeSub.id,
    });
  } catch (error) {
    console.error("confirmRecurringSubscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { userId, packageId, type } = paymentIntent.metadata;

        const subscription = await Subscription.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (!subscription) break;

        if (subscription.status === "pending") {
          const paymentMethod = await stripe.paymentMethods.retrieve(
            paymentIntent.payment_method
          );

          subscription.status = "active";
          subscription.startDate = new Date();
          subscription.endDate = null;

          if (paymentMethod.card) {
            subscription.paymentMethod = {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year,
            };
          }

          if (paymentIntent.charges?.data?.[0]?.receipt_url) {
            subscription.receiptUrl = paymentIntent.charges.data[0].receipt_url;
          }

          if (type === "recurring" && paymentIntent.invoice) {
            const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
            subscription.stripeInvoiceUrl = invoice.hosted_invoice_url;
            subscription.autoRenewDate = calculateEndDate(
              new Date(),
              subscription.packageSnapshot.duration,
              subscription.packageSnapshot.durationUnit
            );
          }

          await subscription.save();
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const subscription = await Subscription.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });
        if (subscription) {
          subscription.status = "failed";
          await subscription.save();
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionDocId = invoice.metadata?.subscriptionId;

        if (subscriptionDocId) {
          const subscription = await Subscription.findOne({ _id: subscriptionDocId });
          if (subscription && subscription.status === "active") {
            subscription.stripeInvoiceUrl = invoice.hosted_invoice_url;
            subscription.autoRenewDate = null;
            await subscription.save();
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: stripeSub.id,
        });
        if (subscription) {
          if (stripeSub.status === "canceled") {
            subscription.status = "cancelled";
          } else if (stripeSub.status === "past_due") {
            subscription.status = "failed";
          }
          await subscription.save();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: stripeSub.id,
        });
        if (subscription) {
          subscription.status = "cancelled";
          await subscription.save();
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({ userId })
      .populate("packageId", "name packageType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("getUserSubscriptions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const activeSubscription = await Subscription.findOne({
      userId,
      status: "active",
      endDate: { $gt: now },
    }).populate("packageId", "name packageType");

    res.json({
      success: true,
      activeSubscription,
    });
  } catch (error) {
    console.error("getActiveSubscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ _id: subscriptionId, userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (subscription.type === "recurring" && subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("cancelSubscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};