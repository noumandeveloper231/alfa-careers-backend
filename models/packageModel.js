import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "PKR", "INR", "AED"],
        default: "USD"
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    durationUnit: {
        type: String,
        enum: ["month", "year"],
        default: "month"
    },
    jobPostings: {
        type: Number,
        required: true,
        min: 1
    },
    featuredJobs: {
        type: Number,
        default: 0,
        min: 0
    },
    candidateAccess: {
        type: Boolean,
        default: false
    },
    candidatesFollow: {
        type: Number,
        default: 0,
        min: 0
    },
    inviteCandidates: {
        type: Boolean,
        default: false
    },
    sendMessages: {
        type: Boolean,
        default: false
    },
    printProfiles: {
        type: Boolean,
        default: false
    },
    reviewComment: {
        type: Boolean,
        default: false
    },
    viewCandidateInfo: {
        type: Boolean,
        default: false
    },
    support: {
        type: String,
        enum: ["Limited", "Full"],
        default: "Limited"
    },
    packageType: {
        type: String,
        enum: ["Premium", "Standard", "Free"],
        default: "Standard"
    },
    features: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Package = mongoose.models?.Package || mongoose.model("Package", packageSchema);

export default Package;
