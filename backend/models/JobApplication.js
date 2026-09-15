const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    coverLetter: { type: String, required: true },
    resumeUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "shortlisted", "rejected", "hired"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
